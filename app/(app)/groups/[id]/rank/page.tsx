"use client"

import { useParams } from "next/navigation"
import { useGroup } from "@/lib/hooks/use-groups"
import { formatCurrency, scoreColor } from "@/lib/utils/format-score"
import type { ScoreMap } from "@/lib/types/app"

export default function RankPage() {
  const { id } = useParams<{ id: string }>()
  const { data: group } = useGroup(id)

  if (!group) return null

  const sessions = (group.sessions as unknown as { scores: ScoreMap }[]) ?? []

  const totals: Record<string, number> = {}
  for (const m of group.members) totals[m.id] = 0
  for (const sess of sessions) {
    for (const [mid, score] of Object.entries(sess.scores as ScoreMap)) {
      totals[mid] = (totals[mid] ?? 0) + score
    }
  }

  const ranked = [...group.members].sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0))
  const sessionCount = sessions.length

  if (ranked.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0", color: "var(--tx3)" }}>
        <div style={{ fontSize: 36, opacity: .5, marginBottom: 10 }}>🏆</div>
        <p style={{ fontSize: 14, fontFamily: "var(--fm)" }}>Chưa có dữ liệu</p>
      </div>
    )
  }

  const top3 = ranked.slice(0, 3)
  const rest = ranked.slice(3)

  return (
    <div>
      {/* Podium */}
      {top3.length >= 2 && (
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "center", gap: 11,
          padding: "28px 0", position: "relative",
        }}>
          <Podium member={top3[1]} score={totals[top3[1].id] ?? 0} rank={2} />
          <Podium member={top3[0]} score={totals[top3[0].id] ?? 0} rank={1} />
          {top3[2] && <Podium member={top3[2]} score={totals[top3[2].id] ?? 0} rank={3} />}
        </div>
      )}

      {/* Rest */}
      <div className="flex flex-col gap-[10px]">
      {rest.map((m, i) => (
        <div key={m.id} style={{
          background: "var(--gl)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid var(--gl-bd)", borderRadius: 14,
          padding: "15px 18px",
          display: "flex", alignItems: "center", gap: 13,
          boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 14px var(--gl-sh)",
        }}>
          <span style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx3)", width: 24, fontWeight: 600 }}>
            {i + 4}
          </span>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: m.color, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 15, fontWeight: 700, color: "white",
          }}>
            {m.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "var(--fm)", fontWeight: 700, fontSize: 15 }}>{m.name}</p>
            <p style={{ fontSize: 12, color: "var(--tx3)", marginTop: 2 }}>{sessionCount} phiên</p>
          </div>
          <span style={{ fontFamily: "var(--fm)", fontSize: 16, fontWeight: 700, color: scoreColor(totals[m.id] ?? 0) }}>
            {formatCurrency(totals[m.id] ?? 0)}
          </span>
        </div>
      ))}</div>
    </div>
  )
}

function Podium({
  member, score, rank,
}: Readonly<{
  member: { name: string; color: string }
  score: number
  rank: 1 | 2 | 3
}>) {
  const podiumSize   = byRank(rank, 66, 54, 48)
  const podiumHeight = byRank(rank, 62, 45, 32)
  const podiumBorder = byRank(rank, "3px solid gold", "3px solid silver", "3px solid #cd7f32")
  const podiumFs     = byRank(rank, 22, 19, 16)

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, position: "relative" }}>
      {rank === 1 && (
        <span style={{ position: "absolute", top: -28, fontSize: 22, animation: "float 2s ease-in-out infinite" }}>
          👑
        </span>
      )}
      <div style={{
        width: podiumSize, height: podiumSize, borderRadius: "50%",
        background: member.color, display: "flex", alignItems: "center",
        justifyContent: "center", fontWeight: 700, color: "white",
        fontSize: podiumFs, border: podiumBorder,
        boxShadow: rank === 1 ? "0 0 24px rgba(255,215,0,.55)" : undefined,
      }}>
        {member.name.charAt(0).toUpperCase()}
      </div>
      <span style={{ fontFamily: "var(--fm)", fontSize: 13, fontWeight: 700, textAlign: "center", maxWidth: 70 }}>
        {member.name}
      </span>
      <span style={{ fontFamily: "var(--fm)", fontSize: 16, fontWeight: 700, color: scoreColor(score) }}>
        {formatCurrency(score)}
      </span>
      <div style={{
        background: "var(--gl)", backdropFilter: "blur(20px)",
        border: "1px solid var(--gl-bd)", borderBottom: "none",
        borderRadius: "11px 11px 0 0", width: 72,
        height: podiumHeight, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontWeight: 800, fontSize: 20, color: "var(--tx3)",
      }}>
        {rank}
      </div>
    </div>
  )
}

function byRank<T>(rank: 1 | 2 | 3, first: T, second: T, third: T): T {
  if (rank === 1) return first
  if (rank === 2) return second
  return third
}
