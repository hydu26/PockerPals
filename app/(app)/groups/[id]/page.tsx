"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useGroup } from "@/lib/hooks/use-groups"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import ScoreRow from "@/components/score/score-row"
import type { Chip, GroupWithMeta, ScoreMap } from "@/lib/types/app"
import type { CurrencyUnit } from "@/lib/types/wizard"
import { formatCurrency, scoreColor } from "@/lib/utils/format-score"

export default function ScorePage() {
  const { id } = useParams<{ id: string }>()
  const { data: group } = useGroup(id)
  const { isGroupAdmin, email } = usePermissions()
  const qc = useQueryClient()
  const [scores, setScores] = useState<ScoreMap>({})
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [phase, setPhase] = useState<"confirm" | "success">("confirm")

  if (!group) return null

  const chips = (group.chips as unknown as Chip[]) ?? []
  const isAdmin = isGroupAdmin(group.admin_emails)
  const currencyUnit: CurrencyUnit = group.currency_unit === "EUR" ? "EUR" : "centime"
  const total = Object.values(scores).reduce((a, b) => a + b, 0)

  const openConfirm = () => {
    setPhase("confirm")
    setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const todayDate = new Date().toISOString().split("T")[0]
    const optimisticId = crypto.randomUUID()

    // Snapshot + optimistic update
    const prev = qc.getQueryData<GroupWithMeta>(["groups", id])
    qc.cancelQueries({ queryKey: ["groups", id] })
    qc.setQueryData<GroupWithMeta>(["groups", id], (old) => {
      if (!old) return old
      const newSession = {
        id: optimisticId, group_id: id, date: todayDate,
        scores, created_by: email ?? null, created_at: new Date().toISOString(),
      }
      return {
        ...old,
        sessions: [...old.sessions, newSession as GroupWithMeta["sessions"][number]],
        session_count: old.session_count + 1,
        last_session: todayDate > (old.last_session ?? "") ? todayDate : old.last_session,
      }
    })

    // Show success immediately
    setScores({})
    setPhase("success")
    setSaving(false)

    // Fire & confirm in background
    const supabase = createClient()
    const { error } = await supabase.from("sessions").insert({
      group_id: id, date: todayDate, scores, created_by: email,
    })

    if (error) {
      // Rollback optimistic update
      qc.setQueryData(["groups", id], prev)
      setPhase("confirm")
      toast.error("Lưu thất bại: " + error.message)
    } else {
      qc.invalidateQueries({ queryKey: ["groups", id] })
      qc.invalidateQueries({ queryKey: ["groups"] })
    }
  }

  return (
    <div>
      {/* Balance hint */}
      <div style={{
        fontSize: 12, color: "var(--tx3)", marginBottom: group.members?.length ? 16 : 0,
        padding: "11px 15px", background: "var(--gl)",
        border: "1px solid var(--gl-bd)", borderRadius: 14,
        lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start",
        boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
      }}>
        <span style={{ fontSize: 14, flexShrink: 0, opacity: .8 }}>💡</span>
        <span>
          Tổng nhập:{" "}
          <b style={{ fontFamily: "var(--fm)", color: total === 0 ? "var(--win)" : "var(--lose)" }}>
            {total === 0 ? "✓ Cân bằng" : formatCurrency(total, currencyUnit)}
          </b>
        </span>
      </div>

      <div className="flex flex-col gap-[10px]">
      {group.members.map((m) => (
        <ScoreRow
          key={m.id}
          member={m}
          chips={chips}
          loanAmount={group.loan_amount}
          currencyUnit={currencyUnit}
          value={scores[m.id] ?? 0}
          onChange={(v) => setScores((prev) => ({ ...prev, [m.id]: v }))}
        />
      ))}
      </div>

      {isAdmin ? (
        <button
          onClick={openConfirm}
          disabled={saving}
          style={{
            width: "100%", padding: 18, border: "none", borderRadius: 22,
            background: "linear-gradient(135deg,var(--ac),var(--ac3))",
            color: "white", fontSize: 16, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? .7 : 1,
            fontFamily: "var(--fb)",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 8px 26px var(--gw)",
            transition: "all var(--dur-f)", letterSpacing: "-.2px", marginTop: 14,
          }}
        >
          💾 Lưu phiên
        </button>
      ) : (
        <div style={{
          padding: "11px 14px", background: "var(--gl2)",
          border: "1px solid var(--gl-bd)", borderRadius: 13,
          fontSize: 12, color: "var(--tx2)", marginTop: 14,
          display: "flex", alignItems: "center", gap: 9,
        }}>
          <span>👁</span>
          Chỉ admin nhóm mới có thể lưu điểm
        </div>
      )}

      {showModal && (
        <SaveModal
          phase={phase}
          scores={scores}
          members={group.members}
          currencyUnit={currencyUnit}
          saving={saving}
          onConfirm={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

const CONFETTI = ["🎲", "🃏", "♠️", "♥️", "🎉", "✨", "🎊", "💫"]

function SaveModal({
  phase, scores, members, currencyUnit, saving, onConfirm, onClose,
}: Readonly<{
  phase: "confirm" | "success"
  scores: ScoreMap
  members: { id: string; name: string; color: string }[]
  currencyUnit: CurrencyUnit
  saving: boolean
  onConfirm: () => void
  onClose: () => void
}>) {

   const total = Object.values(scores).reduce((a, b) => a + b, 0)

  return (
    <>
      <style>{`
        @keyframes modal-slide-in {
          from { opacity: 0; transform: translateY(32px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes success-pop {
          0%   { opacity: 0; transform: scale(0.6) translateY(20px); }
          65%  { transform: scale(1.06) translateY(-4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes hero-bounce {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50%       { transform: translateY(-14px) rotate(5deg); }
        }
        @keyframes confetti-fly {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: translateY(70px) rotate(540deg) scale(0.4); }
        }
        @keyframes backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(7,5,15,.72)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 100px",
        animation: "backdrop-in .2s ease",
      }}>
        {phase === "confirm" ? (
          /* ── Confirm card ── */
          <div style={{
            width: "100%", maxWidth: 430,
            background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid var(--gl-bd)", borderRadius: 22,
            padding: "22px 20px 20px",
            boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 24px 60px rgba(0,0,0,.6)",
            animation: "modal-slide-in .28s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <p style={{
              fontFamily: "var(--fb)", fontSize: 17, fontWeight: 800,
              color: "var(--tx)", marginBottom: 16,
            }}>
              💾 Xác nhận lưu phiên
            </p>

            <div style={{
        fontSize: 12, color: "var(--tx3)", marginBottom: 16,
        padding: "11px 15px", background: "var(--gl)",
        border: "1px solid var(--gl-bd)", borderRadius: 14,
        lineHeight: 1.5, display: "flex", gap: 9, alignItems: "flex-start",
        boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
      }}>
        <span style={{ fontSize: 14, flexShrink: 0, opacity: .8 }}>💡</span>
        <span>
          Tổng nhập:{" "}
          <b style={{ fontFamily: "var(--fm)", color: total === 0 ? "var(--win)" : "var(--lose)" }}>
            {total === 0 ? "✓ Cân bằng" : formatCurrency(total, currencyUnit)}
          </b>
        </span>
      </div>

            {/* Score preview */}
            <div style={{
              background: "var(--gl2)", border: "1px solid var(--gl-bd)",
              borderRadius: 14, padding: "12px 14px", marginBottom: 14,
              display: "flex", flexDirection: "column", gap: 9,
            }}>
              {members.map((m) => {
                const score = scores[m.id] ?? 0
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: m.color, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white",
                    }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ flex: 1, fontFamily: "var(--fb)", fontSize: 14, fontWeight: 600, color: "var(--tx2)" }}>
                      {m.name}
                    </span>
                    <span style={{ fontFamily: "var(--fm)", fontSize: 15, fontWeight: 700, color: scoreColor(score) }}>
                      {formatCurrency(score, currencyUnit)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Warning */}
            <div style={{
              display: "flex", gap: 9, alignItems: "flex-start",
              padding: "10px 13px", borderRadius: 12,
              background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.25)",
              marginBottom: 18,
            }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: 12, color: "var(--tx2)", fontFamily: "var(--fm)", lineHeight: 1.55 }}>
                Phiên đã lưu <b>không thể chỉnh sửa</b>. Kiểm tra kỹ trước khi xác nhận.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "13px 0", borderRadius: 14,
                  border: "1px solid var(--gl-bd)", background: "var(--gl)",
                  color: "var(--tx2)", fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Huỷ
              </button>
              <button
                onClick={onConfirm}
                disabled={saving}
                style={{
                  flex: 2, padding: "13px 0", borderRadius: 14, border: "none",
                  background: saving ? "var(--gl2)" : "linear-gradient(135deg,var(--ac),var(--ac3))",
                  color: saving ? "var(--tx3)" : "white",
                  fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: saving ? "none" : "inset 0 1px 0 0 rgba(255,255,255,.3), 0 4px 16px var(--gw)",
                }}
              >
                {saving ? "Đang lưu…" : "✓ Xác nhận lưu"}
              </button>
            </div>
          </div>
        ) : (
          /* ── Success card ── */
          <div style={{
            width: "100%", maxWidth: 430,
            background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
            WebkitBackdropFilter: "blur(30px) saturate(180%)",
            border: "1px solid var(--gl-bd)", borderRadius: 22,
            padding: "32px 20px 24px",
            boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 24px 60px rgba(0,0,0,.6)",
            textAlign: "center",
            animation: "success-pop .4s cubic-bezier(.34,1.56,.64,1)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Confetti pieces */}
            {CONFETTI.map((emoji, i) => (
              <span key={emoji} aria-hidden style={{
                position: "absolute",
                top: `${10 + (i % 3) * 15}%`,
                left: `${8 + i * 11}%`,
                fontSize: 18 + (i % 3) * 4,
                animation: `confetti-fly ${1.2 + i * 0.18}s ease-out ${i * 0.1}s both`,
                pointerEvents: "none", userSelect: "none",
              }}>
                {emoji}
              </span>
            ))}

            {/* Hero emoji */}
            <div style={{
              fontSize: 64, marginBottom: 16,
              animation: "hero-bounce 1.8s ease-in-out infinite",
              display: "inline-block",
            }}>
              🎉
            </div>

            <p style={{
              fontFamily: "var(--fb)", fontSize: 22, fontWeight: 800,
              color: "var(--win)", marginBottom: 8,
            }}>
              Đã lưu phiên!
            </p>

            <p style={{
              fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx2)",
              lineHeight: 1.65, marginBottom: 28, padding: "0 8px",
            }}>
              Cảm ơn bạn đã lưu phiên hôm nay 🃏<br />
              Hẹn gặp lại ở bàn bài lần tới!
            </p>

            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                color: "white", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
                cursor: "pointer",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
              }}
            >
              ✓ Đóng
            </button>
          </div>
        )}
      </div>
    </>
  )
}
