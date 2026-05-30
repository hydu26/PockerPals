import type { CSSProperties } from "react"

type TagVariant = "owner" | "people" | "sessions" | "locked" | "unlocked"

const base: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: 0.1,
  lineHeight: 1.4,
  border: "1px solid var(--gl-bd)",
  fontFamily: "var(--fm)",
  whiteSpace: "nowrap",
  background: "var(--gl2)",
  color: "var(--tx2)",
}

const variantStyle: Record<TagVariant, CSSProperties> = {
  owner: {
    background: "linear-gradient(135deg,#ffd700,#ff8a00)",
    color: "#1a0900",
    borderColor: "rgba(255,180,40,.6)",
    fontWeight: 800,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.4), 0 2px 8px rgba(255,180,40,.3)",
  },
  people: {
    background: "linear-gradient(135deg,rgba(125,211,252,.18),rgba(125,211,252,.06))",
    borderColor: "rgba(125,211,252,.4)",
    color: "#5ec0e6",
  },
  sessions: {
    background: "linear-gradient(135deg,rgba(94,234,147,.18),rgba(94,234,147,.06))",
    borderColor: "rgba(94,234,147,.4)",
    color: "var(--win)",
  },
  locked: {
    background: "linear-gradient(135deg,rgba(251,146,60,.2),rgba(251,146,60,.07))",
    borderColor: "rgba(251,146,60,.45)",
    color: "#f97316",
  },
  unlocked: {
    background: "linear-gradient(135deg,rgba(94,234,147,.18),rgba(94,234,147,.06))",
    borderColor: "rgba(94,234,147,.45)",
    color: "var(--win)",
  },
}

export default function GroupTag({
  variant,
  children,
}: Readonly<{ variant: TagVariant; children: React.ReactNode }>) {
  return <span style={{ ...base, ...variantStyle[variant] }}>{children}</span>
}
