"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useGroup } from "@/lib/hooks/use-groups"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, scoreColor } from "@/lib/utils/format-score"
import { MEMBER_COLORS } from "@/lib/types/wizard"
import type { ScoreMap } from "@/lib/types/app"
import type { CurrencyUnit } from "@/lib/types/wizard"

const COLORS = MEMBER_COLORS.slice(0, 16)

export default function MembersPage() {
  const { id } = useParams<{ id: string }>()
  const { data: group } = useGroup(id)
  const { isGroupAdmin } = usePermissions()
  const qc = useQueryClient()

  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (!group) return null

  const isAdmin = isGroupAdmin(group.admin_emails)
  const currencyUnit: CurrencyUnit = group.currency_unit === "EUR" ? "EUR" : "centime"
  const sessions = (group.sessions as unknown as { scores: ScoreMap }[]) ?? []

  const totals: Record<string, number> = {}
  for (const sess of sessions) {
    for (const [mid, score] of Object.entries(sess.scores as ScoreMap)) {
      totals[mid] = (totals[mid] ?? 0) + score
    }
  }

  const refresh = () => Promise.all([
    qc.invalidateQueries({ queryKey: ["groups", id] }),
    qc.invalidateQueries({ queryKey: ["groups"] }),
  ])

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error("Nhập tên thành viên"); return }
    setSaving(true)
    try {
      const supabase = createClient()
      const maxPos = group.members.reduce((max, m) => Math.max(max, m.position ?? 0), -1)
      const { error } = await supabase.from("members").insert({
        group_id: id,
        name: newName.trim(),
        color: newColor,
        position: maxPos + 1,
      })
      if (error) throw error
      await refresh()
      setNewName("")
      setNewColor(COLORS[0])
      setAdding(false)
      toast.success("Đã thêm thành viên")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi khi thêm")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (memberId: string) => {
    if (!editName.trim()) { toast.error("Tên không được trống"); return }
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("members")
        .update({ name: editName.trim(), color: editColor })
        .eq("id", memberId)
      if (error) throw error
      await refresh()
      setEditId(null)
      toast.success("Đã cập nhật")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi khi lưu")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("members").delete().eq("id", memberId)
      if (error) throw error
      await refresh()
      setDeleteId(null)
      toast.success("Đã xoá thành viên")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Lỗi khi xoá")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {group.members.map((m) => {
        const isEditing = editId === m.id
        const isConfirmDelete = deleteId === m.id

        if (isEditing) {
          return (
            <div key={m.id} style={{
              background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              border: "1.5px solid var(--ac)", borderRadius: 14,
              padding: "14px 16px",
              boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 14px var(--gl-sh)",
            }}>
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleEdit(m.id) }}
                style={{
                  width: "100%", background: "var(--gl2)", border: "1.5px solid var(--gl-bd)",
                  borderRadius: 10, padding: "9px 12px", color: "var(--tx)",
                  fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700, outline: "none",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    style={{
                      width: 26, height: 26, borderRadius: "50%", background: c,
                      border: editColor === c ? "3px solid white" : "2px solid transparent",
                      cursor: "pointer", padding: 0,
                      boxShadow: editColor === c ? `0 0 0 2px ${c}` : "none",
                      transform: editColor === c ? "scale(1.15)" : "scale(1)",
                      transition: "all var(--dur-f)",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setEditId(null)}
                  style={{
                    flex: 1, padding: "9px 0", borderRadius: 10,
                    border: "1px solid var(--gl-bd)", background: "var(--gl)",
                    color: "var(--tx2)", fontSize: 13, fontWeight: 700,
                    cursor: "pointer", fontFamily: "var(--fb)",
                  }}
                >
                  Huỷ
                </button>
                <button
                  onClick={() => handleEdit(m.id)}
                  disabled={saving}
                  style={{
                    flex: 2, padding: "9px 0", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                    color: "white", fontSize: 13, fontWeight: 700,
                    cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--fb)",
                    opacity: saving ? .7 : 1,
                  }}
                >
                  {saving ? "Đang lưu…" : "Lưu"}
                </button>
              </div>
            </div>
          )
        }

        if (isConfirmDelete) {
          return (
            <div key={m.id} style={{
              background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.3)",
              borderRadius: 14, padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: m.color, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 14, fontWeight: 700, color: "white",
              }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ flex: 1, fontSize: 13, color: "var(--tx2)", fontFamily: "var(--fb)" }}>
                Xoá <b>{m.name}</b>?
              </span>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  padding: "7px 12px", borderRadius: 9,
                  border: "1px solid var(--gl-bd)", background: "var(--gl)",
                  color: "var(--tx2)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}
              >
                Huỷ
              </button>
              <button
                onClick={() => handleDelete(m.id)}
                disabled={deleting}
                style={{
                  padding: "7px 12px", borderRadius: 9, border: "none",
                  background: "linear-gradient(135deg,#dc2626,var(--lose))",
                  color: "white", fontSize: 12, fontWeight: 700,
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? .7 : 1,
                }}
              >
                {deleting ? "…" : "Xoá"}
              </button>
            </div>
          )
        }

        return (
          <div key={m.id} style={{
            background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid var(--gl-bd)", borderRadius: 14,
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
            boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 14px var(--gl-sh)",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: m.color, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, fontWeight: 700, color: "white",
            }}>
              {m.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "var(--fm)", fontWeight: 700, fontSize: 15 }}>{m.name}</p>
              <span style={{
                fontFamily: "var(--fm)", fontSize: 14, fontWeight: 700,
                color: scoreColor(totals[m.id] ?? 0),
              }}>
                {formatCurrency(totals[m.id] ?? 0, currencyUnit)}
              </span>
            </div>
            {isAdmin && (
              <div style={{ display: "flex", gap: 7 }}>
                <button
                  onClick={() => {
                    setEditId(m.id)
                    setEditName(m.name)
                    setEditColor(m.color)
                    setDeleteId(null)
                  }}
                  style={{
                    width: 34, height: 34, borderRadius: 12,
                    border: "1px solid var(--gl-bd)", background: "var(--gl)",
                    backdropFilter: "blur(10px)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15,
                  }}
                >
                  ✏️
                </button>
                <button
                  onClick={() => { setDeleteId(m.id); setEditId(null) }}
                  style={{
                    width: 34, height: 34, borderRadius: 12,
                    border: "1px solid rgba(220,38,38,.3)", background: "rgba(220,38,38,.08)",
                    backdropFilter: "blur(10px)", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15,
                  }}
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Add member form */}
      {isAdmin && adding && (
        <div style={{
          background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1.5px solid var(--ac)", borderRadius: 14,
          padding: "14px 16px", marginBottom: 12,
          boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 14px var(--gl-sh)",
        }}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd() }}
            placeholder="Tên thành viên…"
            style={{
              width: "100%", background: "var(--gl2)", border: "1.5px solid var(--gl-bd)",
              borderRadius: 10, padding: "9px 12px", color: "var(--tx)",
              fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700, outline: "none",
              marginBottom: 10,
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                style={{
                  width: 26, height: 26, borderRadius: "50%", background: c,
                  border: newColor === c ? "3px solid white" : "2px solid transparent",
                  cursor: "pointer", padding: 0,
                  boxShadow: newColor === c ? `0 0 0 2px ${c}` : "none",
                  transform: newColor === c ? "scale(1.15)" : "scale(1)",
                  transition: "all var(--dur-f)",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setAdding(false); setNewName(""); setNewColor(COLORS[0]) }}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                border: "1px solid var(--gl-bd)", background: "var(--gl)",
                color: "var(--tx2)", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "var(--fb)",
              }}
            >
              Huỷ
            </button>
            <button
              onClick={handleAdd}
              disabled={saving}
              style={{
                flex: 2, padding: "9px 0", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                color: "white", fontSize: 13, fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--fb)",
                opacity: saving ? .7 : 1,
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 3px 10px var(--gw)",
              }}
            >
              {saving ? "Đang thêm…" : "✓ Thêm"}
            </button>
          </div>
        </div>
      )}

      {isAdmin && !adding && (
        <button
          onClick={() => { setAdding(true); setEditId(null); setDeleteId(null) }}
          style={{
            width: "100%", padding: "13px",
            border: "1.5px dashed var(--ac)", background: "transparent",
            color: "var(--ac)", fontSize: 14, fontWeight: 700,
            borderRadius: 14, cursor: "pointer", fontFamily: "var(--fb)",
            marginTop: 4, transition: "all var(--dur-f)",
          }}
        >
          + Thêm thành viên
        </button>
      )}
    </div>
  )
}
