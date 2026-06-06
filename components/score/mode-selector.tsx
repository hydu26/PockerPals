type Mode = "chip" | "cash" | "simple"

const MODES: { id: Mode; icon: string; label: string }[] = [
  { id: "simple", icon: "📝", label: "Số" },
  { id: "cash",   icon: "💵", label: "Tiền" },
  { id: "chip",   icon: "🎲", label: "Xèng" },
]

export default function ModeSelector({
  value,
  onChange,
}: Readonly<{ value: Mode; onChange: (m: Mode) => void }>) {
  return (
    <div style={{
      marginTop: 12, display: "flex", gap: 6,
      background: "var(--gl2)", border: "1px solid var(--gl-bd)",
      borderRadius: 12, padding: 4,
    }}>
      {MODES.map((m) => {
        const active = value === m.id
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              flex: 1, padding: "8px 4px", border: "none",
              background: active
                ? "linear-gradient(135deg,var(--ac),var(--ac3))"
                : "transparent",
              cursor: "pointer", borderRadius: 9,
              fontSize: 11, fontWeight: 700,
              fontFamily: "var(--fb)", color: active ? "#fff" : "var(--tx2)",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 2,
              boxShadow: active
                ? "inset 0 1px 0 0 rgba(255,255,255,.3), 0 2px 8px var(--gw)"
                : "none",
              transition: "all var(--dur-f)",
            }}
          >
            <span style={{ fontSize: 14 }}>{m.icon}</span>
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

export type { Mode }
