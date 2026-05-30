"use client"

import type { CSSProperties } from "react"
import GroupTag from "./group-tag"
import type { GroupWithMeta } from "@/lib/types/app"

interface GroupCardProps {
  group: GroupWithMeta
  isMine: boolean
  hasAccess: boolean
  onClick: () => void
}

export default function GroupCard({ group, isMine, hasAccess, onClick }: Readonly<GroupCardProps>) {
  const hasPwd = !!group.password_hash
  const isUnlocked = !hasPwd || hasAccess

  let borderColor = "var(--gl-bd)"
  if (isMine) borderColor = "rgba(255,180,40,.45)"
  else if (isUnlocked && hasPwd) borderColor = "rgba(94,234,147,.45)"

  let boxShadow = "inset 0 1px 0 0 var(--gl-hl), 0 8px 28px var(--gl-sh)"
  if (isMine) boxShadow = "inset 0 1px 0 0 var(--gl-hl), 0 8px 28px var(--gl-sh), 0 0 24px rgba(255,180,40,.18)"
  else if (isUnlocked && hasPwd) boxShadow = "inset 0 1px 0 0 var(--gl-hl), 0 8px 28px var(--gl-sh), 0 0 24px rgba(94,234,147,.16)"

  const cardStyle: CSSProperties = {
    background: "var(--gl)",
    backdropFilter: "blur(30px) saturate(180%)",
    WebkitBackdropFilter: "blur(30px) saturate(180%)",
    border: `1px solid ${borderColor}`,
    borderRadius: 22,
    padding: "16px 22px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    boxShadow,
    transition: "all 0.35s cubic-bezier(.34,1.56,.64,1)",
    width: "100%",
    textAlign: "left",
  }

  const accentBarStyle: CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
    background: isMine
      ? "linear-gradient(180deg,#ffd700,#ff8a00)"
      : "linear-gradient(180deg,#5eea93,#22c55e)",
    boxShadow: isMine
      ? "0 0 12px rgba(255,180,40,.5)"
      : "0 0 12px rgba(94,234,147,.4)",
    pointerEvents: "none",
  }

  const shimmerStyle: CSSProperties = {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: "50%",
    background: "linear-gradient(180deg,var(--gl-hl) 0%,transparent 100%)",
    opacity: 0.35,
    pointerEvents: "none",
    borderRadius: "22px 22px 0 0",
  }

  return (
    <button type="button" onClick={onClick} style={cardStyle}>
      {/* Top shimmer */}
      <div style={shimmerStyle} />

      {/* Left accent bar for mine/unlocked */}
      {(isMine || (isUnlocked && hasPwd)) && <div style={accentBarStyle} />}

      {/* Name row */}
       <span className="font-bold text-lg tracking-tight text-foreground flex-1">
           {group.name}
        </span>
       
      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12}}>
        <GroupTag variant="people">🎮 {group.members.length} người</GroupTag>
        <GroupTag variant="sessions">🎲 {group.session_count} phiên</GroupTag>
        {hasPwd && isUnlocked  && <GroupTag variant="unlocked">🔓 Đã mở khoá</GroupTag>}
        {hasPwd && !isUnlocked && <GroupTag variant="locked">🔒 Khoá</GroupTag>}
      </div>

      {/* Last session */}
      {group.last_session && (
        <p style={{ fontSize: 12, color: "var(--tx3)", fontWeight: 500, marginTop: 12, fontFamily: "var(--fm)" }}>
          Gần nhất: {new Date(group.last_session).toLocaleDateString("vi-VN")}
        </p>
      )}
    </button>
  )
}
