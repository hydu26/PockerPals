import type { Chip } from "@/lib/types/app"

interface ChipInputProps {
  chips: Chip[]
  quantities: Record<string, number>
  loans: number
  loanAmount: number
  onChange: (chipId: string, qty: number) => void
  onLoansChange: (loans: number) => void
}

export default function ChipInput({
  chips,
  quantities,
  loans,
  loanAmount,
  onChange,
  onLoansChange,
}: Readonly<ChipInputProps>) {
  return (
    <div>
      {/* Chip grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 9, marginBottom: 12,
      }}>
        {chips.map((chip) => (
          <div key={chip.id} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--gl2)", border: "1.5px solid var(--gl-bd)",
            borderRadius: 10, padding: "7px 10px",
          }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              background: chip.color, flexShrink: 0,
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3)",
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 11, fontWeight: 700, color: "var(--tx)",
                letterSpacing: "-.1px", whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {chip.name}
              </p>
              <p style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
                {chip.value}€
              </p>
            </div>
            <input
              type="number"
              min={0}
              value={quantities[chip.id] ?? 0}
              onChange={(e) => onChange(chip.id, Number(e.target.value) || 0)}
              style={{
                width: 48, textAlign: "center",
                background: "transparent", border: "none",
                color: "var(--tx)", fontFamily: "var(--fm)",
                fontSize: 14, fontWeight: 700, outline: "none", padding: 2,
              }}
            />
          </div>
        ))}
      </div>

      {/* Loans row */}
      {loanAmount > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          paddingTop: 10, borderTop: "1px dashed var(--gl-bd)", marginTop: 4,
        }}>
          <span style={{
            flex: 1, fontSize: 13, fontWeight: 600,
            color: "var(--tx2)", display: "flex", alignItems: "center", gap: 6,
          }}>
            💸 Vay ({loanAmount}€/lần)
          </span>
          <input
            type="number"
            min={0}
            value={loans}
            onChange={(e) => onLoansChange(Number(e.target.value) || 0)}
            style={{
              width: 56, textAlign: "center",
              background: "var(--gl2)", border: "1.5px solid var(--gl-bd)",
              borderRadius: 10, color: "var(--tx)", fontFamily: "var(--fm)",
              fontSize: 14, fontWeight: 700, outline: "none", padding: "6px",
            }}
          />
        </div>
      )}
    </div>
  )
}
