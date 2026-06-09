"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { usePermissions } from "@/lib/hooks/use-permissions"

type AdminUser = {
  id: string
  email: string
  role: "admin" | "leader" | null
  created_at: string
  last_sign_in_at: string | null
}

type Group = { id: string; name: string }
type GroupAdmin = { group_id: string; email: string }

const card: React.CSSProperties = {
  background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
  WebkitBackdropFilter: "blur(30px) saturate(180%)",
  border: "1px solid var(--gl-bd)", borderRadius: 16,
  padding: "16px 18px", marginBottom: 12,
  boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 14px var(--gl-sh)",
}

const inp: React.CSSProperties = {
  width: "100%", background: "var(--gl2)",
  border: "1.5px solid var(--gl-bd)", borderRadius: 12,
  padding: "11px 13px", color: "var(--tx)", fontFamily: "var(--fb)",
  fontSize: 14, outline: "none",
}

function roleBadge(role: "admin" | "leader" | null) {
  if (role === "admin") return { label: "Super Admin", bg: "linear-gradient(135deg,var(--ac),var(--ac3))", color: "white" }
  if (role === "leader") return { label: "Leader", bg: "rgba(251,191,36,.18)", color: "#fbbf24" }
  return { label: "—", bg: "var(--gl2)", color: "var(--tx3)" }
}

function timeAgo(iso: string | null) {
  if (!iso) return "Chưa đăng nhập"
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return "Hôm nay"
  if (d === 1) return "Hôm qua"
  if (d < 30) return `${d} ngày trước`
  if (d < 365) return `${Math.floor(d / 30)} tháng trước`
  return `${Math.floor(d / 365)} năm trước`
}

function GroupAdminPicker({ groupId, available, isOpen, addingTo, onToggle, onAdd }: Readonly<{
  groupId: string
  available: AdminUser[]
  isOpen: boolean
  addingTo: string | null
  onToggle: () => void
  onAdd: (email: string) => void
}>) {
  const count = available.length
  const addLabel = count > 0 ? `＋ Thêm admin (${count})` : "＋ Thêm admin"
  const label = isOpen ? "Đóng ✕" : addLabel

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%", padding: "9px 0", borderRadius: 11,
          border: isOpen ? "1.5px solid var(--ac)" : "1.5px dashed var(--gl-bd)",
          background: isOpen ? "rgba(var(--ac-rgb),.08)" : "transparent",
          color: isOpen ? "var(--ac)" : "var(--tx3)",
          fontFamily: "var(--fb)", fontSize: 13, fontWeight: 700,
          cursor: "pointer", transition: "all var(--dur-f)",
        }}
      >
        {label}
      </button>

      {isOpen && (
        <div style={{
          marginTop: 6, borderRadius: 12, overflow: "hidden",
          border: "1px solid var(--gl-bd)", background: "var(--gl2)",
        }}>
          {count === 0 ? (
            <p style={{ padding: "12px 14px", fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
              Tất cả tài khoản đã là admin nhóm này
            </p>
          ) : (
            available.map((u) => {
              const key = `${groupId}:${u.email}`
              const isAdding = addingTo === key
              const badge = roleBadge(u.role)
              return (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => onAdd(u.email)}
                  disabled={isAdding}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: 10, padding: "10px 14px",
                    border: "none", borderBottom: "1px solid var(--gl-bd)",
                    background: "transparent", cursor: isAdding ? "not-allowed" : "pointer",
                    transition: "background var(--dur-f)", textAlign: "left",
                    opacity: isAdding ? 0.5 : 1,
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14,
                  }}>
                    👤
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 600, color: "var(--tx)",
                      fontFamily: "var(--fm)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {u.email}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fb)" }}>
                      {badge.label}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, color: isAdding ? "var(--tx3)" : "var(--ac)", fontWeight: 700 }}>
                    {isAdding ? "…" : "＋"}
                  </span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const { isSuperAdmin } = usePermissions()

  const [tab, setTab] = useState<"users" | "groups">("users")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [groupAdmins, setGroupAdmins] = useState<GroupAdmin[]>([])
  const [loading, setLoading] = useState(true)

  // Create user form
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<"leader" | "admin">("leader")
  const [creating, setCreating] = useState(false)

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Reset password
  const [sendingReset, setSendingReset] = useState<string | null>(null)

  // Group tab: dropdown picker per group
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [removingKey, setRemovingKey] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, groupsRes, adminsRes] = await Promise.all([
        fetch("/api/admin/users"),
        createClient().from("groups").select("id, name").order("name"),
        createClient().from("group_admins").select("group_id, email"),
      ])

      if (usersRes.ok) {
        const { users: u } = await usersRes.json() as { users: AdminUser[] }
        setUsers(u)
      }
      if (!groupsRes.error) setGroups(groupsRes.data ?? [])
      if (!adminsRes.error) setGroupAdmins(adminsRes.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSuperAdmin) return
    const id = setTimeout(() => loadData(), 0)
    return () => clearTimeout(id)
  }, [isSuperAdmin, loadData])

  const handleCreate = async () => {
    if (!newEmail.includes("@")) { toast.error("Email không hợp lệ"); return }
    const email = newEmail.trim().toLowerCase()
    setCreating(true)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      })
      const data = await res.json() as { error?: string; id?: string; email?: string }
      if (!res.ok) { toast.error(data.error ?? "Lỗi tạo tài khoản"); return }

      toast.success(`Đã tạo tài khoản và gửi email đặt mật khẩu đến ${email}`)
      setNewEmail("")
      setNewRole("leader")
      setShowCreate(false)
      await loadData()
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      const data = await res.json() as { error?: string }
      if (!res.ok) { toast.error(data.error ?? "Lỗi xoá"); return }
      toast.success("Đã xoá tài khoản")
      setConfirmDelete(null)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setDeleting(false)
    }
  }

  const handleResetPassword = async (id: string, email: string) => {
    setSendingReset(id)
    try {
      const res = await fetch(`/api/admin/users/${id}/reset`, { method: "POST" })
      const data = await res.json() as { error?: string }
      if (!res.ok) { toast.error(data.error ?? "Lỗi gửi email"); return }
      toast.success(`Đã gửi email đặt lại mật khẩu đến ${email}`)
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setSendingReset(null)
    }
  }

  const handleAddToGroup = async (groupId: string, email: string) => {
    setAddingTo(`${groupId}:${email}`)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("group_admins").insert({ group_id: groupId, email })
      if (error) { toast.error(error.message); return }
      setGroupAdmins((prev) => [...prev, { group_id: groupId, email }])
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setAddingTo(null)
    }
  }

  const handleRemoveFromGroup = async (groupId: string, email: string) => {
    const key = `${groupId}:${email}`
    setRemovingKey(key)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("group_admins").delete()
        .eq("group_id", groupId).eq("email", email)
      if (error) { toast.error(error.message); return }
      setGroupAdmins((prev) => prev.filter((a) => !(a.group_id === groupId && a.email === email)))
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setRemovingKey(null)
    }
  }

  if (!isSuperAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <p style={{ fontFamily: "var(--fb)", fontSize: 16, color: "var(--tx3)" }}>
          Không có quyền truy cập
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fb)", color: "var(--tx)", marginBottom: 4 }}>
          Quản lý hệ thống
        </h1>
        <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
          Tài khoản · Phân quyền · Nhóm
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 18,
        background: "var(--gl2)", borderRadius: 14, padding: 5,
        border: "1px solid var(--gl-bd)",
      }}>
        {(["users", "groups"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 10, border: "none",
              fontFamily: "var(--fb)", fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all var(--dur-f)",
              background: tab === t ? "linear-gradient(135deg,var(--ac),var(--ac3))" : "transparent",
              color: tab === t ? "white" : "var(--tx3)",
              boxShadow: tab === t ? "inset 0 1px 0 0 rgba(255,255,255,.3), 0 3px 10px var(--gw)" : "none",
            }}
          >
            {t === "users" ? "👤 Tài khoản" : "🏠 Nhóm"}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--tx3)", fontSize: 22 }}>
          <span style={{ animation: "pulse 1.5s ease infinite", display: "inline-block" }}>⏳</span>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {!loading && tab === "users" && (
        <div>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            style={{
              width: "100%", padding: "13px 0", borderRadius: 14, border: "none", marginBottom: 14,
              background: "linear-gradient(135deg,var(--ac),var(--ac3))",
              color: "white", fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
              cursor: "pointer",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 4px 14px var(--gw)",
            }}
          >
            ＋ Tạo tài khoản
          </button>

          {users.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--tx3)", padding: "30px 0", fontFamily: "var(--fm)" }}>
              Chưa có tài khoản nào
            </p>
          )}

          {users.map((u) => {
            const badge = roleBadge(u.role)
            const isConfirming = confirmDelete === u.id
            return (
              <div key={u.id} style={card}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
                  }}>
                    👤
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "var(--fm)", fontSize: 13, fontWeight: 600,
                      color: "var(--tx)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {u.email}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, fontFamily: "var(--fb)",
                        padding: "2px 8px", borderRadius: 20,
                        background: badge.bg, color: badge.color,
                      }}>
                        {badge.label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
                        {timeAgo(u.last_sign_in_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {isConfirming ? (
                  <div style={{
                    marginTop: 12, padding: "11px 13px", borderRadius: 11,
                    background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)",
                  }}>
                    <p style={{ fontSize: 12, color: "var(--lose)", marginBottom: 9, fontFamily: "var(--fm)", fontWeight: 600 }}>
                      Xoá tài khoản {u.email}?
                    </p>
                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 9,
                          border: "1px solid var(--gl-bd)", background: "var(--gl)",
                          color: "var(--tx2)", fontFamily: "var(--fb)", fontSize: 12,
                          fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        Huỷ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting}
                        style={{
                          flex: 2, padding: "8px 0", borderRadius: 9, border: "none",
                          background: "linear-gradient(135deg,#dc2626,var(--lose))",
                          color: "white", fontFamily: "var(--fb)", fontSize: 12,
                          fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer",
                          opacity: deleting ? 0.7 : 1,
                        }}
                      >
                        {deleting ? "Đang xoá…" : "Xác nhận xoá"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 7, marginTop: 12 }}>
                    <button
                      type="button"
                      onClick={() => handleResetPassword(u.id, u.email)}
                      disabled={sendingReset === u.id}
                      style={{
                        flex: 1, padding: "8px 0", borderRadius: 10,
                        border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                        color: "var(--tx2)", fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700,
                        cursor: sendingReset === u.id ? "not-allowed" : "pointer",
                        opacity: sendingReset === u.id ? 0.5 : 1,
                      }}
                    >
                      {sendingReset === u.id ? "Đang gửi…" : "📨 Đặt lại mật khẩu"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(u.id)}
                      style={{
                        padding: "8px 14px", borderRadius: 10,
                        border: "1px solid rgba(220,38,38,.3)",
                        background: "rgba(220,38,38,.08)",
                        color: "var(--lose)", fontFamily: "var(--fb)", fontSize: 12,
                        fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── GROUPS TAB ── */}
      {!loading && tab === "groups" && (
        <div>
          {groups.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--tx3)", padding: "30px 0", fontFamily: "var(--fm)" }}>
              Chưa có nhóm nào
            </p>
          )}

          {groups.map((g) => {
            const admins = groupAdmins.filter((a) => a.group_id === g.id)
            return (
              <div key={g.id} style={card}>
                <p style={{
                  fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
                  color: "var(--tx)", marginBottom: 12,
                }}>
                  🏠 {g.name}
                </p>

                {/* Admin chips */}
                {admins.length === 0 && (
                  <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)", marginBottom: 10 }}>
                    Chưa có admin
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: admins.length > 0 ? 12 : 0 }}>
                  {admins.map((a) => {
                    const key = `${g.id}:${a.email}`
                    return (
                      <div key={a.email} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: "var(--gl2)", border: "1px solid var(--gl-bd)",
                        borderRadius: 20, padding: "4px 10px 4px 12px",
                        fontSize: 12, fontFamily: "var(--fm)", color: "var(--tx2)",
                      }}>
                        {a.email}
                        <button
                          type="button"
                          onClick={() => handleRemoveFromGroup(g.id, a.email)}
                          disabled={removingKey === key}
                          style={{
                            width: 18, height: 18, borderRadius: 6, border: "none",
                            background: "var(--gl-bd)", color: "var(--tx3)",
                            fontSize: 9, fontWeight: 800, cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            opacity: removingKey === key ? 0.4 : 1,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  })}
                </div>

                {/* Add admin — dropdown từ danh sách users */}
                <GroupAdminPicker
                  groupId={g.id}
                  available={users.filter((u) => !groupAdmins.some((a) => a.group_id === g.id && a.email === u.email))}
                  isOpen={openDropdown === g.id}
                  addingTo={addingTo}
                  onToggle={() => setOpenDropdown(openDropdown === g.id ? null : g.id)}
                  onAdd={(email) => handleAddToGroup(g.id, email)}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* ── Create user bottom sheet ── */}
      {showCreate && createPortal(
        <>
          <button
            type="button"
            onClick={() => setShowCreate(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
              backdropFilter: "blur(12px)", zIndex: 150,
              border: "none", padding: 0, cursor: "default",
              animation: "fadeIn .25s ease",
            }}
          />
          <div style={{
            position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: "100%", maxWidth: 430,
            background: "var(--gl)", backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
            border: "1px solid var(--gl-bd)",
            borderTopLeftRadius: 30, borderTopRightRadius: 30,
            zIndex: 160, padding: "20px 22px 36px",
            animation: "slideUp .42s cubic-bezier(.34,1.56,.64,1)",
            boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 -20px 60px var(--gl-sh)",
          }}>
            <div style={{ width: 44, height: 5, background: "var(--gl-bd)", borderRadius: 3, margin: "0 auto 20px" }} />
            <h2 style={{ fontFamily: "var(--fb)", fontSize: 18, fontWeight: 700, marginBottom: 20, color: "var(--tx)" }}>
              Tạo tài khoản mới
            </h2>

            <label htmlFor="new-email" style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--tx3)", marginBottom: 7 }}>
              Email
            </label>
            <input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="email@example.com"
              autoFocus
              style={{ ...inp, marginBottom: 16 }}
            />

            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.2px", color: "var(--tx3)", marginBottom: 10 }}>
              Vai trò
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {(["leader", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setNewRole(r)}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 11,
                    border: newRole === r ? "none" : "1px solid var(--gl-bd)",
                    background: newRole === r ? "linear-gradient(135deg,var(--ac),var(--ac3))" : "var(--gl2)",
                    color: newRole === r ? "white" : "var(--tx2)",
                    fontFamily: "var(--fb)", fontSize: 13, fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: newRole === r ? "inset 0 1px 0 rgba(255,255,255,.3)" : "none",
                  }}
                >
                  {r === "leader" ? "Leader" : "Super Admin"}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)", marginBottom: 20, lineHeight: 1.55 }}>
              Tài khoản sẽ được tạo ngay. Dùng <strong style={{ color: "var(--tx2)" }}>Đặt lại mật khẩu</strong> để gửi email cho người dùng đặt mật khẩu.
            </p>

            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !newEmail.includes("@")}
              style={{
                width: "100%", padding: 15, border: "none", borderRadius: 22,
                background: creating || !newEmail.includes("@")
                  ? "var(--gl2)"
                  : "linear-gradient(135deg,var(--ac),var(--ac3))",
                color: creating || !newEmail.includes("@") ? "var(--tx3)" : "white",
                fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
                cursor: creating || !newEmail.includes("@") ? "not-allowed" : "pointer",
                boxShadow: creating || !newEmail.includes("@") ? "none" : "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
              }}
            >
              {creating ? "Đang tạo…" : "Tạo tài khoản"}
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}
