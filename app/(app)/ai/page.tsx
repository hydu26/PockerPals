"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { usePermissions } from "@/lib/hooks/use-permissions"

// ── Card constants ─────────────────────────────────────────────────
const SUITS = ["♠", "♥", "♦", "♣"] as const
const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"] as const

// ── FAQ data ───────────────────────────────────────────────────────
const FAQS = [
  {
    id: "hands",
    q: "Thứ bậc bộ bài từ mạnh đến yếu?",
    a: `Royal Flush — A K Q J 10 cùng chất
Straight Flush — 5 lá liên tiếp cùng chất
Four of a Kind — tứ quý
Full House — ba cùng + một đôi
Flush — 5 lá cùng chất (không liên tiếp)
Straight — 5 lá liên tiếp (khác chất)
Three of a Kind — ba cùng
Two Pair — hai đôi
One Pair — một đôi
High Card — bài cao nhất`,
  },
  {
    id: "tiebreak",
    q: "Khi 2 người cùng bộ bài, ai thắng?",
    a: "So sánh lá cao nhất trong bộ bài. Nếu vẫn bằng, so lá kicker (các lá còn lại theo thứ tự từ cao xuống thấp). Nếu hoàn toàn bằng nhau → chia đôi pot.",
  },
  {
    id: "allin",
    q: "Luật all-in hoạt động thế nào?",
    a: "Người all-in chỉ có thể thắng phần pot mà họ đã đóng góp (main pot). Phần tiền bet thêm của những người khác tạo thành side pot riêng — người all-in không tham gia vào side pot đó.",
  },
  {
    id: "blinds",
    q: "Small blind và Big blind là gì?",
    a: "Small blind (SB) là người ngồi bên trái dealer, đặt cược bắt buộc bằng một nửa big blind. Big blind (BB) ngồi bên trái SB, đặt cược bắt buộc bằng mức tối thiểu của ván.",
  },
  {
    id: "community",
    q: "Bài chung (community cards) dùng thế nào?",
    a: "Mỗi người chơi kết hợp 2 lá bài trên tay với tối đa 5 lá bài chung để tạo ra bộ 5 lá tốt nhất. Bạn có thể dùng 0, 1, hoặc 2 lá trên tay.",
  },
  {
    id: "check",
    q: "Khi nào có thể check?",
    a: "Có thể check khi chưa có ai bet trong vòng đó (hoặc bạn là BB và không ai raise pre-flop). Nếu đã có người bet trước, bạn phải call, raise, hoặc fold.",
  },
  {
    id: "dealer",
    q: "Dealer button di chuyển thế nào?",
    a: "Dealer button di chuyển sang trái (chiều kim đồng hồ) sau mỗi ván. SB và BB cũng dịch chuyển theo chiều đó.",
  },
  {
    id: "showdown",
    q: "Showdown diễn ra khi nào?",
    a: "Showdown xảy ra khi còn ít nhất 2 người sau river và hoàn tất vòng bet cuối. Người last aggressor (bet/raise cuối cùng) phải show bài trước. Người khác có thể muck (úp bài) nếu thua.",
  },
]

// ── Loading messages ───────────────────────────────────────────────
const LOADING_MSGS = [
  "Sẽ có người thắng, đợi tôi một tí...",
  "Đang xem xét từng lá bài...",
  "Tra cứu luật Texas Hold'em...",
  "Đang phân tích tình huống...",
  "Sắp có phán quyết rồi...",
  "Hãy để AI phân xử công bằng...",
]

// ── Types ──────────────────────────────────────────────────────────
type Player = { id: string; name: string; cards: [string | null, string | null] }
type PickerTarget =
  | { kind: "board"; idx: number }
  | { kind: "player"; idx: number; slot: 0 | 1 }
type SavedArbitration = {
  id: string
  timestamp: number
  board: (string | null)[]
  players: Player[]
  result: string
}

const HISTORY_KEY = "poker_ai_history"

function loadHistory(): SavedArbitration[] {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]")
  } catch { return [] }
}

function saveHistory(list: SavedArbitration[]) {
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

// ── Helpers ────────────────────────────────────────────────────────
function cardIsRed(card: string) {
  return card.includes("♥") || card.includes("♦")
}

function allUsedCards(board: (string | null)[], players: Player[]): Set<string> {
  const used = new Set<string>()
  board.forEach((c) => { if (c) used.add(c) })
  players.forEach((p) => p.cards.forEach((c) => { if (c) used.add(c) }))
  return used
}

// ── CardSlot ───────────────────────────────────────────────────────
function CardSlot({ card, label, onClick, disabled }: Readonly<{
  card: string | null; label?: string; onClick: () => void; disabled?: boolean
}>) {
  let cardBorder = `1.5px dashed var(--gl-bd)`
  if (card) cardBorder = cardIsRed(card) ? "1.5px solid rgba(239,68,68,.45)" : "1.5px solid var(--gl-bd)"

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1, minWidth: 0, height: 62, borderRadius: 10,
        border: cardBorder,
        background: card ? "var(--gl)" : "var(--card-empty)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "default" : "pointer", padding: 0, gap: 2,
        boxShadow: card ? "inset 0 1px 0 0 var(--gl-hl)" : "none",
        transition: "all var(--dur-f)",
        opacity: disabled && !card ? 0.5 : 1,
      }}
    >
      {card ? (
        <span style={{
          fontFamily: "var(--fm)", fontSize: 14, fontWeight: 800,
          color: cardIsRed(card) ? "#ef4444" : "var(--tx)", lineHeight: 1,
        }}>
          {card}
        </span>
      ) : (
        <>
          {label && (
            <span style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
              {label}
            </span>
          )}
          <span style={{ fontSize: 18, color: "var(--tx3)", lineHeight: 1, opacity: 0.6 }}>+</span>
        </>
      )}
    </button>
  )
}

// ── CardPicker ─────────────────────────────────────────────────────
function CardPicker({ used, onPick, onClose }: Readonly<{
  used: Set<string>
  onPick: (card: string) => void
  onClose: () => void
}>) {
  return (
    <>
      <style>{`
        @keyframes picker-up {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Solid backdrop — avoids iOS Safari backdropFilter z-index bug with the bottom nav */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "var(--overlay)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        WebkitTransform: "translateZ(0)", transform: "translateZ(0)",
      }}>
        <div style={{
          width: "100%", maxWidth: 430,
          background: "var(--picker-bg)",
          borderTop: "1px solid var(--gl-bd)",
          borderRadius: "22px 22px 0 0",
          maxHeight: "88vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -20px 60px rgba(0,0,0,.7)",
          animation: "picker-up .28s cubic-bezier(.34,1.56,.64,1)",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 18px 13px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--gl-bd)",
            flexShrink: 0,
          }}>
            <p style={{ fontFamily: "var(--fb)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
              Chọn lá bài
            </p>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 11,
                border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                color: "var(--tx2)", fontSize: 15, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Suit headers */}
          <div style={{
            display: "flex", gap: 8, padding: "10px 14px 4px",
            flexShrink: 0,
          }}>
            {SUITS.map((suit) => {
              const red = suit === "♥" || suit === "♦"
              return (
                <div key={suit} style={{
                  flex: 1, textAlign: "center",
                  fontSize: 20, color: red ? "#ef4444" : "var(--tx)",
                  fontWeight: 700,
                }}>
                  {suit}
                </div>
              )
            })}
          </div>

          {/* Card grid — 4 suits as columns × 13 ranks as rows */}
          <div style={{
            overflowY: "auto", padding: "6px 14px 100px",
            display: "flex", flexDirection: "column", gap: 7,
          }}>
            {RANKS.map((rank) => (
              <div key={rank} style={{ display: "flex", gap: 8 }}>
                {SUITS.map((suit) => {
                  const card = `${rank}${suit}`
                  const isUsed = used.has(card)
                  const red = suit === "♥" || suit === "♦"
                  let cardColor = "var(--tx)"
                  if (isUsed) cardColor = "var(--tx3)"
                  else if (red) cardColor = "#ef4444"
                  return (
                    <button
                      key={card}
                      type="button"
                      disabled={isUsed}
                      onClick={() => { onPick(card); onClose() }}
                      style={{
                        flex: 1, height: 54, borderRadius: 12, border: "none",
                        background: isUsed ? "var(--card-empty)" : "var(--gl2)",
                        color: cardColor,
                        fontFamily: "var(--fm)", fontSize: 15, fontWeight: 800,
                        cursor: isUsed ? "not-allowed" : "pointer",
                        transition: "background var(--dur-f)",
                        textDecoration: isUsed ? "line-through" : "none",
                        boxShadow: isUsed ? "none" : "inset 0 1px 0 0 var(--gl-hl)",
                        opacity: isUsed ? 0.4 : 1,
                      }}
                    >
                      {rank}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main page ──────────────────────────────────────────────────────
const BOARD_LABELS = ["F1", "F2", "F3", "T", "R"]

function makePlayer(name: string): Player {
  return { id: crypto.randomUUID(), name, cards: [null, null] }
}

export default function AIPage() {
  const { email } = usePermissions()
  const isAdmin = Boolean(email)

  const [tab, setTab] = useState<"faq" | "arbiter" | "history">("faq")
  const [history, setHistory] = useState<SavedArbitration[]>(() => loadHistory())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // FAQ
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(new Set())

  // Arbiter
  const [board, setBoard] = useState<(string | null)[]>([null, null, null, null, null])
  const [players, setPlayers] = useState<Player[]>([
    makePlayer("Người 1"),
    makePlayer("Người 2"),
  ])
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null)
  const [streaming, setStreaming] = useState(false)
  const [result, setResult] = useState("")
  const [loadingIdx, setLoadingIdx] = useState(0)
  const [arbErrors, setArbErrors] = useState<string[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
    }
  }, [result])

  const toggleFaq = (id: string) =>
    setOpenFaqs((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })

  const saveArbitration = () => {
    const entry: SavedArbitration = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      board: [...board],
      players: players.map((p) => ({ ...p, cards: [...p.cards] as [string | null, string | null] })),
      result,
    }
    const next = [entry, ...history]
    setHistory(next)
    saveHistory(next)
  }

  const deleteArbitration = (id: string) => {
    const next = history.filter((h) => h.id !== id)
    setHistory(next)
    saveHistory(next)
    setExpandedIds((prev) => { const s = new Set(prev); s.delete(id); return s })
  }

  const toggleExpanded = (id: string) =>
    setExpandedIds((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id); else s.add(id)
      return s
    })

  const resetArbiter = () => {
    setBoard([null, null, null, null, null])
    setPlayers([makePlayer("Người 1"), makePlayer("Người 2")])
    setResult("")
    setPickerTarget(null)
    setArbErrors([])
  }

  const pickCard = (card: string) => {
    if (!pickerTarget) return
    if (pickerTarget.kind === "board") {
      const boardIdx = pickerTarget.idx
      setBoard((prev) => { const next = [...prev]; next[boardIdx] = card; return next })
    } else {
      const { idx, slot } = pickerTarget
      setPlayers((prev) => {
        const next = [...prev]
        const p: Player = { ...next[idx], cards: [next[idx].cards[0], next[idx].cards[1]] }
        p.cards[slot] = card
        next[idx] = p
        return next
      })
    }
  }

  const updatePlayerName = (idx: number, name: string) => {
    setPlayers((prev) => { const next = [...prev]; next[idx] = { ...next[idx], name }; return next })
  }

  const removePlayer = (idx: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== idx))
  }

  const buildPrompt = (): string => {
    const boardStr = board.map((c, i) => c ?? `?(${BOARD_LABELS[i]})`).join(" ")
    const playersStr = players
      .map((p) => `- ${p.name}: [${p.cards.map((c) => c ?? "?").join(", ")}]`)
      .join("\n")
    return `Phân xử ván Texas Hold'em sau:\n\nBoard: ${boardStr}\n\nNgười chơi:\n${playersStr}\n\nAi thắng? Giải thích chi tiết tại sao.`
  }

  const handleArbiter = async () => {
    const errs: string[] = []
    if (board.filter(Boolean).length < 3)
      errs.push("Cần ít nhất 3 lá bài chung (Flop)")
    players.forEach((p, i) => {
      if (!p.cards[0] || !p.cards[1]) {
        const name = p.name || `Người ${i + 1}`
        errs.push(`${name} chưa có đủ 2 lá bài`)
      }
    })
    if (errs.length > 0) { setArbErrors(errs); return }
    setArbErrors([])
    setResult("")
    setStreaming(true)
    setLoadingIdx(0)
    let idx = 0
    intervalRef.current = setInterval(() => {
      idx = (idx + 1) % LOADING_MSGS.length
      setLoadingIdx(idx)
    }, 1800)

    try {
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: buildPrompt() }] }),
      })
      const data: { text?: string; error?: string } = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? `Lỗi ${res.status}`)
      setResult(data.text?.trim() || "Không có phản hồi từ AI.")
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi không xác định"
      setResult(`⚠ Có lỗi: ${msg}`)
    } finally {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      setStreaming(false)
    }
  }

  const used = allUsedCards(board, players)
  const hasResult = streaming || Boolean(result)

  return (
    <div>
      <style>{`
        @keyframes spin-card {
          0%   { transform: rotateY(0deg) scale(1); }
          50%  { transform: rotateY(180deg) scale(1.1); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        @keyframes dot-pulse {
          0%, 100% { opacity: .3; transform: scale(0.8); }
          50%       { opacity: 1;  transform: scale(1.2); }
        }
        @keyframes msg-swap {
          0%   { opacity: 0; transform: translateY(10px); }
          12%  { opacity: 1; transform: translateY(0); }
          88%  { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        @keyframes trophy-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          40%       { transform: translateY(-12px) scale(1.08); }
          60%       { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes result-appear {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes star-pop {
          0%   { opacity: 0; transform: scale(0) rotate(-20deg); }
          60%  { opacity: 1; transform: scale(1.15) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fb)", color: "var(--tx)", marginBottom: 4 }}>
          AI Phân xử
        </h1>
        <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
          🤖 Claude · Texas Hold&apos;em · Phân xử tranh chấp
        </p>
      </div>

      {/* Tab bar — admin only */}
      {isAdmin && (
        <div style={{
          display: "flex", background: "var(--gl2)", borderRadius: 14,
          padding: 4, marginBottom: 20, gap: 4,
          border: "1px solid var(--gl-bd)",
        }}>
          {(["faq", "arbiter", "history"] as const).map((t) => {
            const active = tab === t
            const label = t === "faq" ? "❓ FAQs" : t === "arbiter" ? "⚖️ Phân xử" : "📜 Lịch sử"
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "9px 4px", borderRadius: 11, border: "none",
                  background: active ? "linear-gradient(135deg,var(--ac),var(--ac3))" : "transparent",
                  color: active ? "white" : "var(--tx3)",
                  fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", transition: "all var(--dur-f)",
                  boxShadow: active ? "0 2px 10px var(--gw)" : "none",
                  position: "relative",
                }}
              >
                {label}
                {t === "history" && history.length > 0 && (
                  <span style={{
                    position: "absolute", top: 4, right: 6,
                    background: active ? "rgba(255,255,255,.35)" : "var(--ac)",
                    color: "white", fontSize: 9, fontWeight: 800,
                    borderRadius: 10, padding: "1px 5px", lineHeight: 1.6,
                  }}>
                    {history.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── FAQ Tab ── */}
      {(tab === "faq" || !isAdmin) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {!isAdmin && (
            <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)", marginBottom: 8, textAlign: "center" }}>
              Chọn câu hỏi để xem luật chơi
            </p>
          )}
          {FAQS.map((faq) => {
            const open = openFaqs.has(faq.id)
            return (
              <div key={faq.id} style={{
                background: "var(--gl)", backdropFilter: "blur(20px)",
                border: `1px solid ${open ? "var(--ac)" : "var(--gl-bd)"}`,
                borderRadius: 14, overflow: "hidden",
                boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
                transition: "border-color var(--dur-f)",
              }}>
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    width: "100%", padding: "14px 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "transparent", border: "none",
                    cursor: "pointer", gap: 12, textAlign: "left",
                  }}
                >
                  <span style={{ fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700, color: "var(--tx)", flex: 1 }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: 11, color: "var(--tx3)", flexShrink: 0,
                    display: "inline-block",
                    transform: open ? "rotate(180deg)" : "none",
                    transition: "transform var(--dur-f)",
                  }}>▼</span>
                </button>
                {open && (
                  <div style={{
                    borderTop: "1px solid var(--gl-bd)",
                    padding: "12px 16px 14px",
                    fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx2)",
                    lineHeight: 1.75, whiteSpace: "pre-line",
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Lịch sử Tab ── */}
      {isAdmin && tab === "history" && (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "52px 0", color: "var(--tx3)" }}>
              <div style={{ fontSize: 36, opacity: .4, marginBottom: 10 }}>📜</div>
              <p style={{ fontSize: 14, fontFamily: "var(--fm)" }}>Chưa có phiên nào được lưu</p>
              <p style={{ fontSize: 12, fontFamily: "var(--fm)", marginTop: 4, opacity: .6 }}>
                Phân xử xong → nhấn 💾 Lưu
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <p style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--tx3)" }}>
                  {history.length} phiên · phiên hiện tại
                </p>
                <button
                  type="button"
                  onClick={() => { setHistory([]); saveHistory([]) }}
                  style={{
                    padding: "5px 12px", borderRadius: 10, border: "1px solid rgba(220,38,38,.3)",
                    background: "rgba(220,38,38,.07)", color: "var(--lose)",
                    fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Xoá tất cả
                </button>
              </div>

              {history.map((entry, idx) => {
                const expanded = expandedIds.has(entry.id)
                const time = new Date(entry.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
                const boardCards = entry.board.filter(Boolean) as string[]
                return (
                  <div key={entry.id} style={{
                    background: "var(--gl)", backdropFilter: "blur(20px)",
                    border: "1px solid var(--gl-bd)", borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
                  }}>
                    {/* Header row */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      padding: "11px 12px 11px 16px", gap: 8,
                    }}>
                      {/* Expand toggle — takes up most of the row */}
                      <button
                        type="button"
                        onClick={() => toggleExpanded(entry.id)}
                        style={{
                          flex: 1, minWidth: 0, background: "transparent",
                          border: "none", cursor: "pointer", display: "flex",
                          alignItems: "center", gap: 8, textAlign: "left", padding: 0,
                        }}
                      >
                        <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--tx3)", flexShrink: 0 }}>
                          #{history.length - idx}
                        </span>
                        <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap", minWidth: 0 }}>
                          {boardCards.map((c) => (
                            <span key={c} style={{
                              fontFamily: "var(--fm)", fontSize: 12, fontWeight: 800,
                              color: cardIsRed(c) ? "#ef4444" : "var(--tx)",
                              background: "var(--gl2)", border: "1px solid var(--gl-bd)",
                              borderRadius: 6, padding: "2px 6px",
                            }}>
                              {c}
                            </span>
                          ))}
                          <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--tx3)", alignSelf: "center" }}>
                            vs {entry.players.map((p) => p.name).join(", ")}
                          </span>
                        </div>
                        <span style={{ fontFamily: "var(--fm)", fontSize: 11, color: "var(--tx3)", flexShrink: 0 }}>
                          {time}
                        </span>
                        <span style={{
                          fontSize: 10, color: "var(--tx3)", flexShrink: 0,
                          display: "inline-block",
                          transform: expanded ? "rotate(180deg)" : "none",
                          transition: "transform var(--dur-f)",
                        }}>▼</span>
                      </button>

                      {/* Delete X — always visible in header */}
                      <button
                        type="button"
                        onClick={() => deleteArbitration(entry.id)}
                        style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          border: "1px solid rgba(220,38,38,.3)", background: "rgba(220,38,38,.08)",
                          color: "var(--lose)", fontSize: 13, cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* Expanded detail */}
                    {expanded && (
                      <div style={{ borderTop: "1px solid var(--gl-bd)", padding: "14px 16px" }}>
                        {/* Players + cards */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                          {entry.players.map((p) => (
                            <div key={p.id} style={{
                              display: "flex", alignItems: "center", gap: 6,
                              background: "var(--gl2)", border: "1px solid var(--gl-bd)",
                              borderRadius: 10, padding: "6px 10px",
                            }}>
                              <span style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, color: "var(--tx2)" }}>
                                {p.name}
                              </span>
                              {p.cards.map((c, ci) => c ? (
                                <span key={ci} style={{
                                  fontFamily: "var(--fm)", fontSize: 13, fontWeight: 800,
                                  color: cardIsRed(c) ? "#ef4444" : "var(--tx)",
                                }}>
                                  {c}
                                </span>
                              ) : null)}
                            </div>
                          ))}
                        </div>

                        {/* Result */}
                        <div style={{
                          background: "color-mix(in srgb, var(--ac) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--ac) 20%, transparent)",
                          borderRadius: 12, padding: "12px 14px", marginBottom: 12,
                          fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx2)",
                        }}>
                          <style>{`
                            .md-hist-${entry.id.slice(0,8)} p { line-height: 1.75; margin-bottom: 6px; }
                            .md-hist-${entry.id.slice(0,8)} strong { color: var(--tx); font-weight: 700; }
                            .md-hist-${entry.id.slice(0,8)} h1,.md-hist-${entry.id.slice(0,8)} h2 { font-family: var(--fb); font-weight: 800; font-size: 14px; color: var(--tx); margin: 10px 0 4px; }
                            .md-hist-${entry.id.slice(0,8)} ul { padding-left: 0; list-style: none; margin: 4px 0; }
                            .md-hist-${entry.id.slice(0,8)} ul li::before { content: "·"; color: var(--ac); font-weight: 700; margin-right: 6px; }
                            .md-hist-${entry.id.slice(0,8)} table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 6px 0; }
                            .md-hist-${entry.id.slice(0,8)} th { padding: 5px 8px; background: color-mix(in srgb, var(--ac) 10%, transparent); font-family: var(--fb); font-size: 10px; font-weight: 700; color: var(--tx3); text-align: left; border-bottom: 1px solid var(--gl-bd); }
                            .md-hist-${entry.id.slice(0,8)} td { padding: 5px 8px; border-bottom: 1px solid var(--gl-xs); }
                          `}</style>
                          <div className={`md-hist-${entry.id.slice(0,8)}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{entry.result}</ReactMarkdown>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ── AI Phân xử Tab ── */}
      {isAdmin && tab === "arbiter" && (
        <div>
          {/* Board */}
          <div style={{
            background: "var(--gl)", backdropFilter: "blur(20px)",
            border: "1px solid var(--gl-bd)", borderRadius: 16,
            padding: "15px", marginBottom: 12,
            boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
          }}>
            <p style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, color: "var(--tx3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "1px" }}>
              🃏 Bài chung — Board
            </p>
            <div style={{ display: "flex", gap: 7 }}>
              {board.map((card, i) => (
                <CardSlot
                  key={BOARD_LABELS[i]}
                  card={card}
                  label={BOARD_LABELS[i]}
                  disabled={hasResult}
                  onClick={() => { if (!hasResult) setPickerTarget({ kind: "board", idx: i }) }}
                />
              ))}
            </div>
          </div>

          {/* Players */}
          {players.map((player, pi) => (
            <div key={player.id} style={{
              background: "var(--gl)", backdropFilter: "blur(20px)",
              border: "1px solid var(--gl-bd)", borderRadius: 16,
              padding: "13px 14px", marginBottom: 10,
              boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <input
                  value={player.name}
                  onChange={(e) => updatePlayerName(pi, e.target.value)}
                  disabled={hasResult}
                  style={{
                    flex: 1, background: "var(--gl2)", border: "1px solid var(--gl-bd)",
                    borderRadius: 9, padding: "7px 11px", color: "var(--tx)",
                    fontFamily: "var(--fb)", fontSize: 13, fontWeight: 700, outline: "none",
                    opacity: hasResult ? 0.7 : 1,
                  }}
                />
                {players.length > 2 && !hasResult && (
                  <button
                    type="button"
                    onClick={() => removePlayer(pi)}
                    style={{
                      width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                      border: "1px solid rgba(220,38,38,.3)", background: "rgba(220,38,38,.08)",
                      color: "var(--lose)", fontSize: 13, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <CardSlot
                  card={player.cards[0]}
                  label="Lá 1"
                  disabled={hasResult}
                  onClick={() => { if (!hasResult) setPickerTarget({ kind: "player", idx: pi, slot: 0 }) }}
                />
                <CardSlot
                  card={player.cards[1]}
                  label="Lá 2"
                  disabled={hasResult}
                  onClick={() => { if (!hasResult) setPickerTarget({ kind: "player", idx: pi, slot: 1 }) }}
                />
              </div>
            </div>
          ))}

          {/* Add player — hidden when loading/result */}
          {players.length < 6 && !hasResult && (
            <button
              type="button"
              onClick={() => setPlayers((prev) => [...prev, makePlayer(`Người ${prev.length + 1}`)])}
              style={{
                width: "100%", padding: "11px",
                border: "1.5px dashed var(--gl-bd)", background: "transparent",
                color: "var(--tx3)", fontSize: 13, fontWeight: 700,
                borderRadius: 14, cursor: "pointer", fontFamily: "var(--fb)",
                marginBottom: 14, transition: "all var(--dur-f)",
              }}
            >
              + Thêm người chơi
            </button>
          )}

          {/* Validation errors + Phán quyết button */}
          {!hasResult && (
            <>
              {arbErrors.length > 0 && (
                <div style={{
                  marginBottom: 12, padding: "10px 14px",
                  background: "rgba(220,38,38,.08)", border: "1px solid rgba(220,38,38,.25)",
                  borderRadius: 12,
                }}>
                  {arbErrors.map((e) => (
                    <p key={e} style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--lose)", lineHeight: 1.6 }}>
                      ⚠ {e}
                    </p>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleArbiter}
                style={{
                  width: "100%", padding: "16px 0", borderRadius: 18, border: "none",
                  background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                  color: "white", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 22px var(--gw)",
                }}
              >
                ⚖ Phán quyết
              </button>
            </>
          )}

          {/* ── Inline loading ── */}
          {streaming && !result && (
            <div style={{
              marginTop: 20, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 20, padding: "36px 24px",
              background: "var(--gl)", backdropFilter: "blur(20px)",
              border: "1px solid var(--gl-bd)", borderRadius: 20,
              boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
            }}>
              <div style={{ fontSize: 56, animation: "spin-card 1.6s ease-in-out infinite" }}>
                🃏
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                {["d0", "d1", "d2"].map((dotId, i) => (
                  <div key={dotId} style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: "var(--ac)",
                    animation: `dot-pulse 1.1s ease-in-out ${i * 0.22}s infinite`,
                  }} />
                ))}
              </div>
              <p key={loadingIdx} style={{
                fontFamily: "var(--fm)", fontSize: 14, color: "var(--tx2)",
                textAlign: "center", lineHeight: 1.65,
                animation: "msg-swap 1.8s ease-in-out",
              }}>
                {LOADING_MSGS[loadingIdx]}
              </p>
            </div>
          )}

          {/* ── Inline result ── */}
          {result && (
            <div ref={resultRef} style={{ marginTop: 20, animation: "result-appear .4s ease both" }}>
              {/* Winner header */}
              <div style={{
                textAlign: "center", padding: "28px 20px 22px",
                background: "var(--gl)", backdropFilter: "blur(20px)",
                border: "1px solid var(--gl-bd)", borderRadius: 20,
                boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 8px 30px var(--gl-sh)",
                marginBottom: 12, position: "relative", overflow: "hidden",
              }}>
                {/* Decorative stars */}
                {["✦", "✧", "✦"].map((star, i) => (
                  <span key={star + i} aria-hidden style={{
                    position: "absolute",
                    top: `${18 + i * 20}%`,
                    left: i === 0 ? "8%" : i === 1 ? "88%" : "14%",
                    fontSize: 14 + i * 4,
                    color: "var(--ac2)",
                    animation: `star-pop .6s cubic-bezier(.34,1.56,.64,1) ${i * 0.12}s both`,
                  }}>
                    {star}
                  </span>
                ))}
                <div style={{
                  fontSize: 60, marginBottom: 10,
                  display: "inline-block",
                  animation: "trophy-bounce 2.2s ease-in-out infinite",
                }}>
                  🏆
                </div>
                <p style={{
                  fontFamily: "var(--fb)", fontSize: 18, fontWeight: 800,
                  color: "var(--win)", letterSpacing: "-.3px",
                }}>
                  Phán quyết
                </p>
              </div>

              {/* Result text */}
              <div style={{
                background: "var(--gl)", backdropFilter: "blur(20px)",
                border: "1px solid var(--gl-bd)", borderRadius: 16,
                padding: "18px", marginBottom: 14,
                boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
                fontFamily: "var(--fm)", fontSize: 14, color: "var(--tx2)",
              }}>
                <style>{`
                  .md-result p { line-height: 1.85; margin-bottom: 8px; }
                  .md-result h1,.md-result h2 { font-family: var(--fb); font-weight: 800; font-size: 15px; color: var(--tx); margin: 14px 0 5px; }
                  .md-result h3 { font-family: var(--fb); font-weight: 700; font-size: 14px; color: var(--tx2); margin: 10px 0 4px; }
                  .md-result strong { color: var(--tx); font-weight: 700; }
                  .md-result em { font-style: italic; color: var(--tx2); }
                  .md-result ul { padding-left: 0; margin: 6px 0; list-style: none; }
                  .md-result ol { padding-left: 18px; margin: 6px 0; }
                  .md-result li { line-height: 1.85; margin-bottom: 4px; }
                  .md-result ul li::before { content: "·"; color: var(--ac); font-weight: 700; margin-right: 8px; }
                  .md-result hr { border: none; border-top: 1px solid var(--gl-bd); margin: 10px 0; }
                  .md-result table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
                  .md-result th { padding: 7px 10px; background: color-mix(in srgb, var(--ac) 8%, transparent); color: var(--tx3); font-family: var(--fb); font-size: 11px; font-weight: 700; text-align: left; border-bottom: 1px solid var(--gl-bd); text-transform: uppercase; letter-spacing: .5px; }
                  .md-result td { padding: 7px 10px; border-bottom: 1px solid var(--gl-xs); color: var(--tx2); }
                  .md-result tr:last-child td { border-bottom: none; }
                  .md-result code { font-family: var(--fm); background: var(--gl2); padding: 1px 5px; border-radius: 4px; font-size: 13px; }
                  .md-result blockquote { border-left: 3px solid var(--ac); margin: 8px 0; padding: 4px 12px; color: var(--tx3); }
                `}</style>
                <div className="md-result">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              </div>

              {/* Save + Reset */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => { saveArbitration(); setTab("history") }}
                  style={{
                    flex: 1, padding: "14px 0", borderRadius: 16,
                    border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                    color: "var(--tx2)", fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
                    cursor: "pointer", boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
                  }}
                >
                  💾 Lưu
                </button>
                <button
                  type="button"
                  onClick={resetArbiter}
                  style={{
                    flex: 2, padding: "14px 0", borderRadius: 16, border: "none",
                    background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                    color: "white", fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 22px var(--gw)",
                  }}
                >
                  🎲 Trận mới
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card picker */}
      {pickerTarget && (
        <CardPicker
          used={used}
          onPick={pickCard}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  )
}
