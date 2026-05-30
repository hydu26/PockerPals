import { useState } from "react"
import type { WizardDraft, WizardChip } from "@/lib/types/wizard"
import { MEMBER_COLORS } from "@/lib/types/wizard"
import { inputStyle } from "./step-basic"

const CHIP_COLORS = MEMBER_COLORS.slice(0, 10)

export default function StepChips({
  draft,
  onChange,
}: Readonly<{ draft: WizardDraft; onChange: (d: Partial<WizardDraft>) => void }>) {
  const [pickerIdx, setPickerIdx] = useState<number | null>(null)
  const unit = draft.currency_unit === "centime" ? "c" : "€"

  const updateChip = (idx: number, patch: Partial<WizardChip>) => {
    const next = draft.chips.map((c, i) => i === idx ? { ...c, ...patch } : c)
    onChange({ chips: next })
  }

  const addChip = () => {
    onChange({
      chips: [...draft.chips, {
        id: `c${Date.now()}`, name: "Mới", color: "#94a3b8", value: 10,
      }],
    })
  }

  const removeChip = (idx: number) => {
    onChange({ chips: draft.chips.filter((_, i) => i !== idx) })
  }

  return (
    <div>
      {/* Currency unit */}
      <p style={lbl}>Đơn vị tiền tệ</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {(["centime", "EUR"] as const).map((u) => {
          const active = draft.currency_unit === u
          return (
            <button
              key={u}
              onClick={() => onChange({ currency_unit: u })}
              style={{
                flex: 1, padding: "12px 10px", borderRadius: 12, cursor: "pointer",
                border: active ? "2px solid var(--ac)" : "1.5px solid var(--gl-bd)",
                background: active
                  ? "linear-gradient(135deg,rgba(184,159,255,.18),rgba(245,179,255,.1))"
                  : "var(--gl2)",
                color: active ? "var(--ac)" : "var(--tx2)",
                fontFamily: "var(--fm)", fontWeight: 700, fontSize: 13,
                transition: "all var(--dur-f)",
                boxShadow: active ? "0 0 0 3px var(--gw)" : "none",
              }}
            >
              {u === "centime" ? "¢ Centimes" : "€ EUR"}
            </button>
          )
        })}
      </div>

      {/* Loan amount */}
      <label htmlFor="wizard-loan" style={lbl}>Tiền vay mỗi lần</label>
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          id="wizard-loan"
          type="number"
          min={0}
          value={draft.loan_amount}
          onChange={(e) => onChange({ loan_amount: Number(e.target.value) || 0 })}
          style={{ ...inputStyle, fontFamily: "var(--fm)", fontWeight: 700, paddingRight: 36 }}
        />
        <span style={{
          position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
          fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)", pointerEvents: "none",
        }}>
          {unit}
        </span>
      </div>

      {/* Chip list */}
      <p style={lbl}>Loại xèng</p>
      {draft.chips.map((chip, idx) => (
        <div key={chip.id} style={{
          display: "flex", alignItems: "center", gap: 9,
          background: "var(--gl2)", border: "1px solid var(--gl-bd)",
          borderRadius: 12, padding: "10px 13px", marginBottom: 9, position: "relative",
        }}>
          {/* Color dot */}
          <button
            type="button"
            aria-label="Chọn màu"
            onClick={() => setPickerIdx(pickerIdx === idx ? null : idx)}
            style={{
              width: 22, height: 22, borderRadius: "50%",
              background: chip.color, cursor: "pointer",
              border: "2px solid var(--gl-bd)", flexShrink: 0,
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3)",
              padding: 0,
            }}
          />

          {/* Color picker dropdown */}
          {pickerIdx === idx && (
            <div style={{
              position: "absolute", top: "100%", left: 0, zIndex: 10,
              background: "var(--bg-a)", border: "1px solid var(--gl-bd)",
              borderRadius: 14, padding: 12, marginTop: 4,
              display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8,
              boxShadow: "0 8px 28px var(--gl-sh)",
            }}>
              {CHIP_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() => { updateChip(idx, { color: c }); setPickerIdx(null) }}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: c, cursor: "pointer", padding: 0,
                    border: chip.color === c ? "2px solid var(--tx)" : "2px solid transparent",
                    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3)",
                  }}
                />
              ))}
            </div>
          )}

          <input
            value={chip.name}
            onChange={(e) => updateChip(idx, { name: e.target.value })}
            placeholder="Tên xèng"
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "var(--tx)", fontFamily: "var(--fb)",
              fontSize: 14, fontWeight: 600, outline: "none", padding: "3px",
            }}
          />
          <input
            type="number"
            min={0}
            value={chip.value}
            onChange={(e) => updateChip(idx, { value: Number(e.target.value) || 0 })}
            style={{
              width: 80, textAlign: "center",
              background: "var(--gl)", border: "1.5px solid var(--gl-bd)",
              borderRadius: 9, color: "var(--tx)", fontFamily: "var(--fm)",
              fontSize: 13, fontWeight: 700, padding: "5px 7px", outline: "none",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--tx3)", minWidth: 8 }}>{unit}</span>
          <button
            onClick={() => removeChip(idx)}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: "1px solid var(--gl-bd)", background: "var(--gl)",
              cursor: "pointer", color: "var(--lose)", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={addChip}
        style={{
          width: "100%", padding: 11,
          border: "1.5px dashed var(--ac)", background: "transparent",
          color: "var(--ac)", fontSize: 13, fontWeight: 700,
          borderRadius: 12, cursor: "pointer", fontFamily: "var(--fb)",
          marginTop: 4, transition: "all var(--dur-f)",
        }}
      >
        + Thêm loại xèng
      </button>
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "1.2px",
  color: "var(--tx3)", marginBottom: 8, margin: "0 0 8px",
}
