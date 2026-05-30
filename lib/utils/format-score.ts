import type { CurrencyUnit } from "@/lib/types/wizard"

export function formatScore(score: number): string {
  if (score === 0) return "0"
  const abs = Math.abs(score).toLocaleString("vi-VN")
  return score > 0 ? `+${abs}` : `-${abs}`
}

export function formatCurrency(score: number, unit: CurrencyUnit, showEUR = false): string {
  const prefix = score > 0 ? "+" : ""
  if (unit === "EUR") return `${prefix}${score}€`
  if (showEUR) return `${prefix}${(score / 100).toFixed(2)}€`
  return `${prefix}${score}c`
}

export function scoreColor(score: number): string {
  if (score > 0) return "var(--win)"
  if (score < 0) return "var(--lose)"
  return "var(--tx)"
}
