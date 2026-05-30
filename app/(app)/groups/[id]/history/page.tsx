"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useGroup } from "@/lib/hooks/use-groups"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, scoreColor } from "@/lib/utils/format-score"
import type { ScoreMap } from "@/lib/types/app"
import type { CurrencyUnit } from "@/lib/types/wizard"

export default function HistoryPage() {
  const { id } = useParams<{ id: string }>()
  const { data: group } = useGroup(id)
  const { isGroupAdmin } = usePermissions()
  const qc = useQueryClient()
  const [showEUR, setShowEUR] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (!group) return null

  const isAdmin = isGroupAdmin(group.admin_emails)
  const currencyUnit: CurrencyUnit = group.currency_unit === "EUR" ? "EUR" : "centime"

  const sessions = (group.sessions as unknown as {
    id: string; date: string; scores: ScoreMap; created_by: string | null; created_at: string
  }[])?.sort((a, b) => b.date.localeCompare(a.date)) ?? []

  const totalSessions = sessions.length

  const handleDelete = async () => {
    if (!deleteId) return
    const targetId = deleteId

    // Optimistic: remove session from cache immediately
    const prev = qc.getQueryData(["groups", id])
    qc.cancelQueries({ queryKey: ["groups", id] })
    qc.setQueryData<import("@/lib/types/app").GroupWithMeta>(["groups", id], (old) => {
      if (!old) return old
      const remaining = old.sessions.filter((s) => s.id !== targetId)
      return {
        ...old,
        sessions: remaining,
        session_count: remaining.length,
      }
    })
    setDeleteId(null)

    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("sessions").delete().eq("id", targetId)
      if (error) throw error
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["groups", id] }),
        qc.invalidateQueries({ queryKey: ["groups"] }),
      ])
      toast.success("Đã xoá phiên")
    } catch (e: unknown) {
      // Rollback
      qc.setQueryData(["groups", id], prev)
      setDeleteId(targetId)
      toast.error(e instanceof Error ? e.message : "Lỗi khi xoá")
    } finally {
      setDeleting(false)
    }
  }

  if (totalSessions === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "var(--tx3)" }}>
        <div style={{ fontSize: 36, opacity: .5, marginBottom: 10 }}>📋</div>
        <p style={{ fontSize: 14, fontFamily: "var(--fm)" }}>Chưa có phiên nào</p>
      </div>
    )
  }

  const deleteTarget = sessions.find((s) => s.id === deleteId)

  return (
    <div>
      {/* Currency toggle */}
      {currencyUnit === "centime" && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => setShowEUR((v) => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 12px", borderRadius: 20,
              border: "1px solid var(--gl-bd)", background: "var(--gl)",
              cursor: "pointer", fontFamily: "var(--fm)", fontSize: 12,
              fontWeight: 700, color: showEUR ? "var(--ac)" : "var(--tx2)",
              transition: "all var(--dur-f)",
            }}
          >
            {showEUR ? "€ EUR" : "¢ centimes"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-[10px]">
      {sessions.map((sess, i) => (
        <SessionCard
          key={sess.id}
          session={sess}
          members={group.members}
          isAdmin={isAdmin}
          currencyUnit={currencyUnit}
          showEUR={showEUR}
          sessionNumber={totalSessions - i}
          onRequestDelete={() => setDeleteId(sess.id)}
        />
      ))}
      </div>

      {deleteId && deleteTarget && (
        <DeleteModal
          session={deleteTarget}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}

function SessionCard({
  session,
  members,
  isAdmin,
  currencyUnit,
  showEUR,
  sessionNumber,
  onRequestDelete,
}: Readonly<{
  session: { id: string; date: string; scores: ScoreMap; created_by: string | null; created_at: string }
  members: { id: string; name: string; color: string }[]
  isAdmin: boolean
  currencyUnit: CurrencyUnit
  showEUR: boolean
  sessionNumber: number
  onRequestDelete: () => void
}>) {
  const date = new Date(session.date).toLocaleDateString("vi-VN", {
    weekday: "short", day: "numeric", month: "numeric", year: "numeric",
  })

  const time = session.created_at
    ? new Date(session.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : null

  return (
    <div style={{
      background: "var(--gl)",
      backdropFilter: "blur(30px) saturate(180%)",
      WebkitBackdropFilter: "blur(30px) saturate(180%)",
      border: "1px solid var(--gl-bd)", borderRadius: 14,
      overflow: "hidden",
      boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 16px var(--gl-sh)",
    }}>
      {/* Header */}
      <div style={{
        padding: "13px 16px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--gl-bd)", gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--fm)", color: "var(--tx)" }}>
            {date}
          </span>
          {time && (
            <span style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fm)", marginLeft: 8 }}>
              {time}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{
            fontSize: 11, fontFamily: "var(--fm)", fontWeight: 700, color: "var(--tx3)",
            padding: "3px 8px", background: "var(--gl2)",
            border: "1px solid var(--gl-bd)", borderRadius: 20,
          }}>
            #{sessionNumber}
          </span>
          {isAdmin && (
            <button
              type="button"
              onClick={onRequestDelete}
              style={{
                width: 26, height: 26, borderRadius: 8,
                border: "1px solid rgba(220,38,38,.3)", background: "rgba(220,38,38,.08)",
                cursor: "pointer", fontSize: 11, color: "var(--lose)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Scores */}
      <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 9 }}>
        {members.map((m) => {
          const score = session.scores[m.id] ?? 0
          return (
            <div key={m.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px",
              background: "var(--gl2)", border: "1px solid var(--gl-bd)", borderRadius: 14,
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: m.color, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 11, fontWeight: 700,
                color: "white", flexShrink: 0,
              }}>
                {m.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx2)", fontWeight: 500 }}>
                {m.name}
              </span>
              <span style={{ fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700, color: scoreColor(score) }}>
                {formatCurrency(score, currencyUnit, showEUR)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DeleteModal({
  session, deleting, onConfirm, onCancel,
}: Readonly<{
  session: { date: string }
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}>) {
  const date = new Date(session.date).toLocaleDateString("vi-VN", {
    weekday: "short", day: "numeric", month: "numeric", year: "numeric",
  })

  return (
    <>
      <style>{`
        @keyframes delete-modal-in {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes delete-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(7,5,15,.72)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 100px",
        animation: "delete-backdrop-in .2s ease",
      }}>
        <div style={{
          width: "100%", maxWidth: 430,
          background: "var(--gl)", backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid var(--gl-bd)", borderRadius: 22,
          padding: "22px 20px 20px",
          boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 24px 60px rgba(0,0,0,.6)",
          animation: "delete-modal-in .28s cubic-bezier(.34,1.56,.64,1)",
        }}>
          {/* Icon + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, flexShrink: 0,
              background: "rgba(220,38,38,.12)", border: "1px solid rgba(220,38,38,.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
            }}>
              🗑
            </div>
            <div>
              <p style={{ fontFamily: "var(--fb)", fontSize: 16, fontWeight: 800, color: "var(--tx)", marginBottom: 2 }}>
                Xoá phiên này?
              </p>
              <p style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--tx3)" }}>
                {date}
              </p>
            </div>
          </div>

          {/* Warning */}
          <div style={{
            display: "flex", gap: 9, alignItems: "flex-start",
            padding: "10px 13px", borderRadius: 12,
            background: "rgba(220,38,38,.07)", border: "1px solid rgba(220,38,38,.22)",
            marginBottom: 18,
          }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 12, color: "var(--tx2)", fontFamily: "var(--fm)", lineHeight: 1.55 }}>
              Hành động này <b>không thể hoàn tác</b>. Điểm số của phiên sẽ bị xoá vĩnh viễn.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 14,
                border: "1px solid var(--gl-bd)", background: "var(--gl)",
                color: "var(--tx2)", fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer",
              }}
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              style={{
                flex: 2, padding: "13px 0", borderRadius: 14, border: "none",
                background: deleting ? "var(--gl2)" : "linear-gradient(135deg,#dc2626,var(--lose))",
                color: deleting ? "var(--tx3)" : "white",
                fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
                cursor: deleting ? "not-allowed" : "pointer",
                boxShadow: deleting ? "none" : "inset 0 1px 0 0 rgba(255,255,255,.2), 0 4px 16px rgba(220,38,38,.4)",
              }}
            >
              {deleting ? "Đang xoá…" : "🗑 Xoá phiên"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
