"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"
import type { GroupWithMeta, Chip } from "@/lib/types/app"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { MEMBER_COLORS } from "@/lib/types/wizard"

const CHIP_COLORS = MEMBER_COLORS
function genId() { return Math.random().toString(36).slice(2, 9) }

const lbl: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "1.2px",
  color: "var(--tx3)", marginBottom: 7,
}

const inp: React.CSSProperties = {
  width: "100%", background: "var(--gl2)",
  border: "1.5px solid var(--gl-bd)", borderRadius: 12,
  padding: "11px 13px", color: "var(--tx)", fontFamily: "var(--fb)",
  fontSize: 14, outline: "none", transition: "border-color var(--dur-f)",
}

const card: React.CSSProperties = {
  background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
  WebkitBackdropFilter: "blur(30px) saturate(180%)",
  border: "1px solid var(--gl-bd)", borderRadius: 16,
  padding: "16px 18px", marginBottom: 12,
  boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 14px var(--gl-sh)",
}

export default function SettingsModal({
  group,
  onClose,
}: Readonly<{
  group: GroupWithMeta
  onClose: () => void
}>) {
  const qc = useQueryClient()
  const { isSuperAdmin } = usePermissions()

  const [loanAmount, setLoanAmount] = useState(group.loan_amount ?? 1)
  const [chips, setChips] = useState<Chip[]>(() =>
    Array.isArray(group.chips) ? (group.chips as Chip[]) : []
  )
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [colorPickChip, setColorPickChip] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const updateChip = (id: string, patch: Partial<Chip>) =>
    setChips((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c))

  const addChip = () => {
    const used = new Set(chips.map((c) => c.color))
    const color = CHIP_COLORS.find((c) => !used.has(c)) ?? CHIP_COLORS[0]
    setChips((prev) => [...prev, { id: genId(), name: "Xèng mới", color, value: 1 }])
  }

  const removeChip = (id: string) => setChips((prev) => prev.filter((c) => c.id !== id))

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      let passwordHash: string | undefined
      if (password.trim()) {
        const { data: hash, error: rpcErr } = await supabase
          .rpc("hash_password", { p_password: password.trim() })
        if (rpcErr) throw rpcErr
        passwordHash = hash as string
      }

      const { error: groupErr } = await supabase
        .from("groups")
        .update({
          loan_amount: loanAmount,
          chips: chips as unknown as import("@/lib/types/database").Json,
          ...(passwordHash === undefined ? {} : { password_hash: passwordHash }),
        })
        .eq("id", group.id)
      if (groupErr) throw groupErr

      await qc.invalidateQueries({ queryKey: ["groups", group.id] })
      await qc.invalidateQueries({ queryKey: ["groups"] })
      toast.success("Đã lưu cài đặt")
      onClose()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Có lỗi xảy ra")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("groups").delete().eq("id", group.id)
      if (error) throw error
      await qc.invalidateQueries({ queryKey: ["groups"] })
      toast.success("Đã xoá nhóm")
      globalThis.location.href = "/"
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Không thể xoá")
      setDeleting(false)
    }
  }

  const curChipColor = chips.find((c) => c.id === colorPickChip)?.color

  return createPortal(
    <>
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,.45)",
          backdropFilter: "blur(12px)",
          zIndex: 150,
          animation: "fadeIn .25s ease",
          border: "none", padding: 0, cursor: "default",
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%",
        transform: "translateX(-50%)",
        width: "100%", maxWidth: 430,
        background: "var(--gl)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid var(--gl-bd)",
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        zIndex: 160,
        animation: "slideUp .42s cubic-bezier(.34,1.56,.64,1)",
        boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 -20px 60px var(--gl-sh)",
        maxHeight: "min(96vh, 820px)", display: "flex", flexDirection: "column",
      }}>
        {/* Handle + header */}
        <div style={{ padding: "20px 22px 0", flexShrink: 0 }}>
          <div style={{
            width: 44, height: 5, background: "var(--gl-bd)",
            borderRadius: 3, margin: "0 auto 18px",
          }} />
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", marginBottom: 18,
          }}>
            <h2 style={{
              fontFamily: "var(--fb)", fontSize: 20, fontWeight: 700,
              letterSpacing: "-.3px", color: "var(--tx)",
            }}>
              ⚙️ Cài đặt nhóm
            </h2>
            <button
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 10,
                border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                cursor: "pointer", fontSize: 14, color: "var(--tx2)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 22px" }}>

          {/* Loan amount */}
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
              💸 Giá trị mỗi lần vay
            </p>
            <p style={{ fontSize: 12, color: "var(--tx2)", marginBottom: 12, lineHeight: 1.5 }}>
              Mỗi lần vay/mua xèng bằng số tiền này.
            </p>
            <label htmlFor="loan-amount" style={lbl}>Số tiền (€)</label>
            <input
              id="loan-amount"
              type="number"
              step="0.01"
              min={0}
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number.parseFloat(e.target.value) || 0)}
              style={inp}
            />
          </div>

          {/* Chips */}
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
              🎲 Các loại xèng
            </p>
            <p style={{ fontSize: 12, color: "var(--tx2)", marginBottom: 12, lineHeight: 1.5 }}>
              Màu và giá trị mỗi loại xèng (€ EUR).
            </p>
            {chips.map((c) => (
              <div key={c.id} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--gl2)", border: "1.5px solid var(--gl-bd)",
                borderRadius: 10, padding: "8px 10px", marginBottom: 8,
              }}>
                <button
                  onClick={() => setColorPickChip(c.id)}
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: c.color, border: "2px solid var(--gl-bd)",
                    cursor: "pointer", flexShrink: 0, transition: "transform var(--dur-f)",
                  }}
                />
                <input
                  value={c.name}
                  onChange={(e) => updateChip(c.id, { name: e.target.value })}
                  maxLength={14}
                  style={{
                    flex: 1, background: "transparent", border: "none",
                    color: "var(--tx)", fontFamily: "var(--fb)",
                    fontSize: 13, fontWeight: 600, outline: "none", minWidth: 0,
                  }}
                />
                <input
                  type="number"
                  step="0.01"
                  value={c.value}
                  onChange={(e) => updateChip(c.id, { value: Number.parseFloat(e.target.value) || 0 })}
                  min={0}
                  style={{
                    width: 60, textAlign: "left", background: "var(--gl)",
                    border: "1.5px solid var(--gl-bd)", borderRadius: 8,
                    color: "var(--tx)", fontFamily: "var(--fm)",
                    fontSize: 13, fontWeight: 700, padding: "4px 6px", outline: "none",
                  }}
                />
                <button
                  onClick={() => removeChip(c.id)}
                  style={{
                    width: 26, height: 26, borderRadius: 8,
                    border: "1px solid var(--gl-bd)", background: "transparent",
                    cursor: "pointer", color: "var(--lose)", fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={addChip}
              style={{
                width: "100%", padding: 10,
                border: "1.5px dashed var(--ac)", background: "transparent",
                color: "var(--ac)", fontSize: 13, fontWeight: 700,
                borderRadius: 10, cursor: "pointer", fontFamily: "var(--fb)",
                transition: "all var(--dur-f)",
              }}
            >
              ＋ Thêm loại xèng
            </button>
          </div>

          {/* Color picker popover */}
          {colorPickChip && (
            <div
              role="dialog"
              style={{
                position: "fixed", inset: 0, zIndex: 200,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,.5)", backdropFilter: "blur(10px)",
                cursor: "default",
              }}
              onClick={(e) => { if (e.target === e.currentTarget) setColorPickChip(null) }}
              onKeyDown={(e) => { if (e.key === "Escape") setColorPickChip(null) }}
            >
              <div
                style={{
                  background: "var(--gl)", backdropFilter: "blur(40px) saturate(180%)",
                  WebkitBackdropFilter: "blur(40px) saturate(180%)",
                  border: "1px solid var(--gl-bd)", borderRadius: 22,
                  padding: 22, maxWidth: 280, width: "90%",
                  boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 20px 50px var(--gl-sh)",
                }}
              >
                <div style={{ fontFamily: "var(--fb)", fontSize: 16, fontWeight: 700, marginBottom: 14 }}>
                  Chọn màu
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                  {CHIP_COLORS.map((color) => {
                    const isSelected = color === curChipColor
                    return (
                      <button
                        key={color}
                        onClick={() => {
                          updateChip(colorPickChip, { color })
                          setColorPickChip(null)
                        }}
                        style={{
                          width: "100%", aspectRatio: "1", borderRadius: 12,
                          background: color, cursor: "pointer",
                          border: isSelected ? "3px solid white" : "2px solid transparent",
                          transform: isSelected ? "scale(1.08)" : "scale(1)",
                          transition: "all var(--dur-f)",
                          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3)",
                        }}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Password */}
          <div style={card}>
            <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 7 }}>
              🔑 Mật khẩu nhóm
            </p>
            <p style={{ fontSize: 12, color: "var(--tx2)", marginBottom: 12, lineHeight: 1.5 }}>
              Để trống = giữ nguyên. Nhập giá trị mới để thay đổi.
            </p>
            <label htmlFor="group-password" style={lbl}>Mật khẩu mới</label>
            <input
              id="group-password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Để trống = không đổi"
              style={{ ...inp, fontFamily: "var(--fm)", letterSpacing: 1, fontWeight: 600 }}
            />
          </div>

          {/* Delete group */}
          {isSuperAdmin && (
            <div style={{ marginBottom: 12 }}>
              {deleteConfirm ? (
                <div style={{
                  background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.35)",
                  borderRadius: 16, padding: "18px 16px", textAlign: "center",
                }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--lose)", marginBottom: 6 }}>
                    ⚠️ Xoá nhóm?
                  </p>
                  <p style={{ fontSize: 12, color: "var(--tx3)", marginBottom: 16, lineHeight: 1.5 }}>
                    Toàn bộ lịch sử phiên và điểm số sẽ mất vĩnh viễn.
                  </p>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      style={{
                        flex: 1, padding: 12, borderRadius: 12,
                        border: "1px solid var(--gl-bd)", background: "var(--gl)",
                        color: "var(--tx2)", fontSize: 13, fontWeight: 700,
                        cursor: "pointer", fontFamily: "var(--fb)",
                      }}
                    >
                      Huỷ
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        flex: 2, padding: 12, borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg,#dc2626,var(--lose))",
                        color: "white", fontSize: 13, fontWeight: 700,
                        cursor: deleting ? "not-allowed" : "pointer", fontFamily: "var(--fb)",
                        opacity: deleting ? 0.7 : 1,
                      }}
                    >
                      {deleting ? "Đang xoá…" : "Xoá nhóm"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  style={{
                    width: "100%", padding: 14, borderRadius: 14,
                    background: "rgba(220,38,38,.12)",
                    border: "1px solid rgba(220,38,38,.3)",
                    color: "var(--lose)", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", fontFamily: "var(--fb)",
                    transition: "all var(--dur-f)",
                  }}
                >
                  🗑 Xoá nhóm này
                </button>
              )}
            </div>
          )}
        </div>

        {/* Save button */}
        <div style={{ padding: "16px 22px 20px", flexShrink: 0, borderTop: "1px solid var(--gl-bd)" }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%", padding: 16, border: "none", borderRadius: 22,
              background: saving
                ? "var(--gl2)"
                : "linear-gradient(135deg,var(--ac),var(--ac3))",
              color: saving ? "var(--tx3)" : "white",
              fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--fb)",
              boxShadow: saving ? "none" : "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
              transition: "all var(--dur-f)",
            }}
          >
            {saving ? "Đang lưu…" : "💾 Lưu cài đặt"}
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
