"use client"

import { useState } from "react"
import ModeSelector, { type Mode } from "./mode-selector"
import ChipInput from "./chip-input"
import { formatCurrency, scoreColor } from "@/lib/utils/format-score"
import type { Member, Chip } from "@/lib/types/app"

interface ScoreRowProps {
  member: Member
  chips: Chip[]
  loanAmount: number
  value: number
  onChange: (score: number) => void
}

const parseDecimal = (v: string) => {
  const parsed = parseFloat(v.replace(",", "."))
  return isNaN(parsed) ? 0 : parsed
}

export default function ScoreRow({ member, chips, loanAmount, value, onChange }: Readonly<ScoreRowProps>) {
  const [mode, setMode] = useState<Mode>("simple")
  const [chipQty, setChipQty] = useState<Record<string, number>>({})
  const [loans, setLoans] = useState(0)
  const [cashAmount, setCashAmount] = useState("")
  const [simpleRaw, setSimpleRaw] = useState("")

  const calcChipTotal = (qty: Record<string, number>, l: number) => {
    const chipSum = chips.reduce((acc, c) => acc + (qty[c.id] ?? 0) * c.value, 0)
    return chipSum - l * loanAmount
  }

  const handleChipChange = (chipId: string, qty: number) => {
    const next = { ...chipQty, [chipId]: qty }
    setChipQty(next)
    onChange(calcChipTotal(next, loans))
  }

  const handleLoansChange = (l: number) => {
    setLoans(l)
    if (mode === "chip") onChange(calcChipTotal(chipQty, l))
    else if (mode === "cash") onChange(parseDecimal(cashAmount) - l * loanAmount)
  }

  const handleCashChange = (v: string) => {
    setCashAmount(v)
    onChange(parseDecimal(v) - loans * loanAmount)
  }

  const handleSimpleChange = (v: string) => {
    setSimpleRaw(v)
    onChange(parseDecimal(v))
  }

  const initials = member.name.charAt(0).toUpperCase()

  return (
    <div style={{
      background: "var(--gl)",
      backdropFilter: "blur(30px) saturate(180%)",
      WebkitBackdropFilter: "blur(30px) saturate(180%)",
      border: "1px solid var(--gl-bd)", borderRadius: 14,
      padding: "16px 18px",
      boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 16px var(--gl-sh)",
      transition: "border-color var(--dur-f)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: member.color, display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 17, fontWeight: 700, color: "white",
          boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 3px 10px rgba(0,0,0,.15)",
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--fm)", fontWeight: 700, fontSize: 15 }}>
            {member.name}
          </p>
          <span style={{
            fontFamily: "var(--fm)", fontSize: 17, fontWeight: 700,
            color: scoreColor(value),
          }}>
            {formatCurrency(value)}
          </span>
        </div>
      </div>

      {/* Mode selector */}
      <ModeSelector value={mode} onChange={setMode} />

      {/* Input body */}
      <div style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--gl-bd)" }}>
        {mode === "chip" && (
          <ChipInput
            chips={chips}
            quantities={chipQty}
            loans={loans}
            loanAmount={loanAmount}
            onChange={handleChipChange}
            onLoansChange={handleLoansChange}
          />
        )}

        {mode === "cash" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label className="label-caps" style={{ display: "block", marginBottom: 5 }}>
                  Tiền mặt (€)
                </label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => handleCashChange(e.target.value)}
                  placeholder="0,00"
                  style={{
                    width: "100%", background: "var(--gl2)",
                    border: "1.5px solid var(--gl-bd)", borderRadius: 10,
                    color: "var(--tx)", fontFamily: "var(--fm)",
                    fontSize: 14, fontWeight: 700,
                    padding: "9px 11px", outline: "none", textAlign: "center",
                    transition: "border-color var(--dur-f)",
                  }}
                />
              </div>
              {loanAmount > 0 && (
                <div>
                  <label className="label-caps" style={{ display: "block", marginBottom: 5 }}>Vay</label>
                  <input
                    type="number"
                    min={0}
                    value={loans}
                    onChange={(e) => handleLoansChange(Number(e.target.value) || 0)}
                    style={{
                      width: "100%", background: "var(--gl2)",
                      border: "1.5px solid var(--gl-bd)", borderRadius: 10,
                      color: "var(--tx)", fontFamily: "var(--fm)",
                      fontSize: 14, fontWeight: 700,
                      padding: "9px 11px", outline: "none", textAlign: "center",
                    }}
                  />
                </div>
              )}
            </div>
            <div style={{
              marginTop: 12, fontSize: 12, color: "var(--tx3)",
              textAlign: "right", fontFamily: "var(--fm)",
              padding: "8px 12px", background: "var(--gl2)",
              borderRadius: 10, border: "1px solid var(--gl-bd)",
            }}>
              Tổng: <b style={{ fontSize: 16, color: scoreColor(value) }}>{formatCurrency(value)}</b>
            </div>
          </div>
        )}

        {mode === "simple" && (
          <div>
            <label className="label-caps" style={{ display: "block", marginBottom: 5 }}>
              Giá trị (€)
            </label>
            <input
              type="number"
              value={simpleRaw}
              onChange={(e) => handleSimpleChange(e.target.value)}
              placeholder="0,00"
              style={{
                width: "100%", background: "var(--gl2)",
                border: "1.5px solid var(--gl-bd)", borderRadius: 10,
                color: scoreColor(value), fontFamily: "var(--fm)",
                fontSize: 18, fontWeight: 700,
                padding: "9px 11px", outline: "none", textAlign: "center",
                transition: "border-color var(--dur-f)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
