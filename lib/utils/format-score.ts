export function formatScore(score: number): string {
  if (score === 0) return "0"
  const abs = Math.abs(score).toLocaleString("vi-VN")
  return score > 0 ? `+${abs}` : `-${abs}`
}

export function formatCurrency(score: number): string {
  if (score === 0) return "0,00€"
  const abs = Math.abs(score).toFixed(2).replace(".", ",")
  return score > 0 ? `+${abs}€` : `-${abs}€`
}

export function scoreColor(score: number): string {
  if (score > 0) return "var(--win)"
  if (score < 0) return "var(--lose)"
  return "var(--tx)"
}
