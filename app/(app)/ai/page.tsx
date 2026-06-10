"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { toast } from "sonner"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { CardBackDisplay, CardSlot } from "@/components/shared/playing-card"

// ── Card constants ─────────────────────────────────────────────────
const SUITS = ["♥", "♦", "♣", "♠"] as const
const RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"] as const

// ── Poker evaluation engine ────────────────────────────────────────
const RANK_MAP: Record<string, number> = {
  "2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10,"J":11,"Q":12,"K":13,"A":14,
}
const ALL_DECK: string[] = []
for (const s of ["♥","♦","♣","♠"])
  for (const r of ["A","K","Q","J","10","9","8","7","6","5","4","3","2"])
    ALL_DECK.push(`${s} ${r}`)

function parseRank(card: string): [number, string] {
  const sp = card.indexOf(" ")
  return [RANK_MAP[card.slice(sp + 1)], card.slice(0, sp)]
}

function score5(c: [number, string][]): number {
  const rs = c.map(x => x[0]).sort((a, b) => b - a)
  const suits = c.map(x => x[1])
  const flush = suits.every(s => s === suits[0])
  const freq = new Map<number, number>()
  for (const r of rs) freq.set(r, (freq.get(r) ?? 0) + 1)
  const groups = [...freq.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])
  const cnts = groups.map(g => g[1])
  let tb = 0, p = 4
  for (const [r, cnt] of groups) for (let i = 0; i < cnt; i++) tb += r * 15 ** p--
  const u = [...new Set(rs)].sort((a, b) => b - a)
  let str = false, hi = 0
  for (let i = 0; i + 4 < u.length + 1; i++) {
    if (u[i] - u[i + 4] === 4) { str = true; hi = u[i]; break }
  }
  if (!str && u[0] === 14 && u.includes(2) && u.includes(3) && u.includes(4) && u.includes(5)) {
    str = true; hi = 5
  }
  if (flush && str) return 8e6 + hi
  if (cnts[0] === 4) return 7e6 + tb
  if (cnts[0] === 3 && cnts[1] >= 2) return 6e6 + tb
  if (flush) return 5e6 + tb
  if (str) return 4e6 + hi
  if (cnts[0] === 3) return 3e6 + tb
  if (cnts[0] === 2 && cnts[1] === 2) return 2e6 + tb
  if (cnts[0] === 2) return 1e6 + tb
  return tb
}

function bestScore(cards: [number, string][]): number {
  if (cards.length <= 4) return 0
  if (cards.length === 5) return score5(cards)
  let best = 0
  const n = cards.length
  for (let a = 0; a < n-4; a++)
  for (let b = a+1; b < n-3; b++)
  for (let c = b+1; c < n-2; c++)
  for (let d = c+1; d < n-1; d++)
  for (let e = d+1; e < n; e++) {
    const s = score5([cards[a],cards[b],cards[c],cards[d],cards[e]])
    if (s > best) best = s
  }
  return best
}

type CalcResult = { win: number; tie: number; outs: number; remaining: number }

function getHandName(score: number): { emoji: string; en: string; vn: string } {
  if (score >= 8e6 + 14) return { emoji: "🌈", en: "Royal Flush",       vn: "Sảnh hoàng gia" }
  if (score >= 8e6)      return { emoji: "🔥", en: "Straight Flush",    vn: "Sảnh thùng" }
  if (score >= 7e6)      return { emoji: "💎", en: "Four of a Kind",    vn: "Tứ quý" }
  if (score >= 6e6)      return { emoji: "🏰", en: "Full House",        vn: "Cù lũ" }
  if (score >= 5e6)      return { emoji: "🌊", en: "Flush",             vn: "Thùng" }
  if (score >= 4e6)      return { emoji: "📏", en: "Straight",          vn: "Sảnh" }
  if (score >= 3e6)      return { emoji: "🎯", en: "Three of a Kind",   vn: "Sám cô" }
  if (score >= 2e6)      return { emoji: "✌️", en: "Two Pair",           vn: "Đôi đôi" }
  if (score >= 1e6)      return { emoji: "👫", en: "One Pair",           vn: "Đôi" }
  return                        { emoji: "🃏", en: "High Card",          vn: "Lá cao" }
}

type HandInfo = { emoji: string; en: string; vn: string }
type ImprovementResult = {
  current: HandInfo
  target: HandInfo
  outs: number
  remaining: number
}

function getImprovement(hand: string[], board: string[]): ImprovementResult {
  const myP = hand.map(parseRank)
  const boardP = board.map(parseRank)
  const knownSet = new Set([...hand, ...board])
  const deck = ALL_DECK.filter(c => !knownSet.has(c))
  const curScore = bestScore([...myP, ...boardP])
  let outs = 0
  let bestTarget = curScore
  for (const c of deck) {
    const s = bestScore([...myP, ...boardP, parseRank(c)])
    if (s > curScore) { outs++; if (s > bestTarget) bestTarget = s }
  }
  return { current: getHandName(curScore), target: getHandName(bestTarget), outs, remaining: deck.length }
}

function runMonteCarlo(hand: string[], board: string[], numPlayers = 7, iters = 8000): CalcResult {
  const opponents = numPlayers - 1
  const knownSet = new Set([...hand, ...board])
  const deck = ALL_DECK.filter(c => !knownSet.has(c))
  const boardNeeded = 5 - board.length
  const myP = hand.map(parseRank)
  const boardP = board.map(parseRank)
  let wins = 0, ties = 0

  for (let i = 0; i < iters; i++) {
    const d = [...deck]
    const need = boardNeeded + opponents * 2
    for (let j = 0; j < need; j++) {
      const k = j + Math.floor(Math.random() * (d.length - j))
      ;[d[j], d[k]] = [d[k], d[j]]
    }
    const simBoard = [...boardP, ...d.slice(0, boardNeeded).map(parseRank)]
    const myScore = bestScore([...myP, ...simBoard])
    let maxOpp = 0
    for (let o = 0; o < opponents; o++) {
      const s = bestScore([...d.slice(boardNeeded + o * 2, boardNeeded + o * 2 + 2).map(parseRank), ...simBoard])
      if (s > maxOpp) maxOpp = s
    }
    if (myScore > maxOpp) wins++
    else if (myScore === maxOpp) ties++
  }

  let outs = 0
  if (board.length >= 3 && board.length < 5) {
    const cur = bestScore([...myP, ...boardP])
    for (const c of deck) {
      if (bestScore([...myP, ...boardP, parseRank(c)]) > cur) outs++
    }
  }

  return { win: (wins / iters) * 100, tie: (ties / iters) * 100, outs, remaining: deck.length }
}

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
  | { kind: "support-hand"; slot: 0 | 1 }
  | { kind: "support-board"; idx: number }

// ── Card back settings ──────────────────────────────────────────────
type CardBackId = "chelsea" | "arsenal" | "liverpool" | "mu" | "madrid" | "barca"

const CARD_BACKS: ReadonlyArray<{
  readonly id: CardBackId
  readonly label: string
  readonly color: string
  readonly image: string
}> = [
  { id: "chelsea",   label: "Chelsea",          color: "#034694",  image: "/card-backs/chelsea.webp" },
  { id: "arsenal",   label: "Arsenal",          color: "#EF0107",  image: "/card-backs/arsenal.webp" },
  { id: "liverpool", label: "Liverpool",        color: "#c8102E",  image: "/card-backs/liverpool.webp" },
  { id: "mu",        label: "Manchester United",color: "#DA291C",  image: "/card-backs/mu.webp" },
  { id: "madrid",    label: "Real Madrid",      color: "#fefefe",  image: "/card-backs/madrid.webp" },
  { id: "barca",     label: "Barcelona",        color: "#edbb00",  image: "/card-backs/barca.webp" },
]

const CARD_BACK_KEY = "pb_card_back"

function CardSettingsModal({ current, onChange, onClose }: Readonly<{
  current: CardBackId
  onChange: (id: CardBackId) => void
  onClose: () => void
}>) {
  return (
    <>
      <style>{`
        @keyframes settings-in {
          from { opacity: 0; transform: scale(.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "var(--overlay)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
        }}
        onClick={onClose}
      >
        <div
          style={{
            width: "100%", maxWidth: 340,
            maxHeight: "calc(100dvh - 32px)",
            background: "var(--picker-bg)",
            border: "1px solid var(--gl-bd)",
            borderRadius: 24, overflow: "hidden",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(0,0,0,.7)",
            animation: "settings-in .22s cubic-bezier(.34,1.4,.64,1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{
            padding: "16px 18px 14px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--gl-bd)",
          }}>
            <div>
              <p style={{ fontFamily: "var(--fb)", fontSize: 16, fontWeight: 800, color: "var(--tx)", margin: 0 }}>
                Bộ bài
              </p>
              <p style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fm)", margin: "2px 0 0" }}>
                Màu mặt sau lá bài
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 11,
                border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                color: "var(--tx2)", fontSize: 15, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>

          <div style={{
            flex: 1, minHeight: 0, overflowY: "auto",
            padding: "14px 16px 20px",
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14,
          }}>
            {CARD_BACKS.map((opt) => {
              const selected = current === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { onChange(opt.id); onClose() }}
                  style={{
                    background: "none", border: "none",
                    cursor: "pointer", padding: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  }}
                >
                  <div style={{
                    width: "100%", aspectRatio: "63/88",
                    background: opt.color, borderRadius: 16,
                    position: "relative", overflow: "hidden",
                    border: selected ? "2.5px solid var(--ac)" : "1.5px solid rgba(255,255,255,.1)",
                    boxShadow: selected
                      ? "0 0 0 3px var(--ac), 0 6px 18px rgba(0,0,0,.5)"
                      : "0 3px 10px rgba(0,0,0,.45)",
                    transition: "all .2s",
                    "--card-back-image": `url('${opt.image}')`,
                  } as React.CSSProperties}>
                    <CardBackDisplay />
                    {selected && (
                      <span style={{
                        position: "absolute", bottom: 8, right: 8,
                        width: 20, height: 20, borderRadius: 10,
                        background: "var(--ac)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: "#0a0514",
                      }}>✓</span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontFamily: "var(--fm)",
                    color: selected ? "var(--tx)" : "var(--tx3)",
                    fontWeight: selected ? 700 : 400,
                    textAlign: "center",
                  }}>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Helpers ────────────────────────────────────────────────────────
function allUsedCards(
  board: (string | null)[],
  players: Player[],
  supportHand: (string | null)[],
  supportBoard: (string | null)[],
): Set<string> {
  const used = new Set<string>()
  board.forEach((c) => { if (c) used.add(c) })
  players.forEach((p) => p.cards.forEach((c) => { if (c) used.add(c) }))
  supportHand.forEach((c) => { if (c) used.add(c) })
  supportBoard.forEach((c) => { if (c) used.add(c) })
  return used
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
        @keyframes picker-in {
          from { opacity: 0; transform: scale(.94); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "var(--overlay)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}>
        <div style={{
          width: "100%", maxWidth: 430,
          background: "var(--picker-bg)",
          border: "1px solid var(--gl-bd)",
          borderRadius: 24,
          maxHeight: "calc(100dvh - 32px)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,.7)",
          animation: "picker-in .22s cubic-bezier(.34,1.4,.64,1)",
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 18px 13px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: "1px solid var(--gl-bd)",
            flexShrink: 0,
          }}>
            <div>
              <p style={{ fontFamily: "var(--fb)", fontSize: 16, fontWeight: 800, color: "var(--tx)", margin: 0 }}>
                Chọn lá bài
              </p>
              <p style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fm)", margin: "2px 0 0" }}>
                {used.size > 0 ? `${used.size} lá đã dùng` : "Deck đầy đủ"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 34, height: 34, borderRadius: 11,
                border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                color: "var(--tx2)", fontSize: 15, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>

          {/* 4 suit sections, each with a 7-column grid → 2 rows of 7+6 cards, no horizontal scroll */}
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "8px 10px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
            {SUITS.map((suit) => {
              const red = suit === "♥" || suit === "♦"
              const usedInSuit = RANKS.filter((r) => used.has(`${suit} ${r}`)).length
              return (
                <div key={suit}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 18, lineHeight: 1, color: red ? "#d92020" : "var(--tx2)" }}>{suit}</span>
                    {usedInSuit > 0 && (
                      <span style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
                        {usedInSuit}/13
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 5 }}>
                    {RANKS.map((rank) => {
                      const card = `${suit} ${rank}`
                      const isUsed = used.has(card)
                      return (
                        <button
                          key={card}
                          type="button"
                          disabled={isUsed}
                          onClick={() => { onPick(card); onClose() }}
                          style={{
                            aspectRatio: "63/88",
                            borderRadius: 10,
                            border: isUsed
                              ? "1px solid rgba(255,255,255,.06)"
                              : `1px solid ${red ? "rgba(217,32,32,.15)" : "rgba(0,0,0,.1)"}`,
                            background: isUsed ? "rgba(255,255,255,.04)" : "#fafafa",
                            cursor: isUsed ? "not-allowed" : "pointer",
                            display: "flex", flexDirection: "column",
                            alignItems: "flex-start", justifyContent: "space-between",
                            padding: "5px 6px",
                            boxShadow: isUsed ? "none" : "0 2px 6px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.9)",
                            opacity: isUsed ? 0.28 : 1,
                            transition: "opacity var(--dur-f)",
                            fontFamily: "var(--fm)",
                          }}
                        >
                          <span style={{
                            fontSize: 16, fontWeight: 800, lineHeight: 1,
                            color: red ? "#d92020" : "#1a1a1a",
                          }}>{rank}</span>
                          <span style={{
                            fontSize: 18, lineHeight: 1,
                            color: red ? "#d92020" : "#1a1a1a",
                          }}>{suit}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
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
  const isLoggedIn = Boolean(email)

  const [tab, setTab] = useState<"arbiter" | "support">("support")

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

  // Support
  const [supportHand, setSupportHand] = useState<[string | null, string | null]>([null, null])
  const [supportBoard, setSupportBoard] = useState<(string | null)[]>([null, null, null, null, null])
  const [numPlayers, setNumPlayers] = useState(7)
  const [calcResult, setCalcResult] = useState<CalcResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Card back settings
  const [cardBack, setCardBack] = useState<CardBackId>("chelsea")
  const [cardBackLoaded, setCardBackLoaded] = useState(false)
  const [cardSettingsOpen, setCardSettingsOpen] = useState(false)

  // Scan
  const scanInputRef = useRef<HTMLInputElement>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80)
    }
  }, [result])

  useEffect(() => {
    const hand = supportHand.filter(Boolean) as string[]
    const board = supportBoard.filter(Boolean) as string[]
    const bc = board.length
    const shouldCalc = hand.length === 2 && (bc === 0 || bc === 3 || bc === 4 || bc === 5)
    const id1 = setTimeout(() => setCalculating(shouldCalc), 220)
    const id2 = setTimeout(() => {
      setCalcResult(shouldCalc ? runMonteCarlo(hand, board, numPlayers) : null)
      setCalculating(false)
    }, 260)
    return () => { clearTimeout(id1); clearTimeout(id2) }
  }, [supportHand, supportBoard, numPlayers])

  useEffect(() => {
    const saved = localStorage.getItem(CARD_BACK_KEY) as CardBackId | null
    if (saved && CARD_BACKS.some(b => b.id === saved)) setCardBack(saved as CardBackId)
    setCardBackLoaded(true)
  }, [])

  useEffect(() => {
    const opt = CARD_BACKS.find(b => b.id === cardBack)
    if (!opt) return
    document.documentElement.style.setProperty("--card-back", opt.color)
    document.documentElement.style.setProperty("--card-back-image", `url('${opt.image}')`)
    if (cardBackLoaded) localStorage.setItem(CARD_BACK_KEY, cardBack)
  }, [cardBack, cardBackLoaded])

  const resetArbiter = () => {
    setBoard([null, null, null, null, null])
    setPlayers([makePlayer("Người 1"), makePlayer("Người 2")])
    setResult("")
    setPickerTarget(null)
    setArbErrors([])
  }

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanning(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const res = await fetch("/api/scan-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json() as { board?: string[]; players?: string[][]; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? `Lỗi ${res.status}`)

      const board_ = data.board ?? []
      const players_ = data.players ?? []
      const newBoard: (string | null)[] = [null, null, null, null, null]
      board_.slice(0, 5).forEach((c, i) => { newBoard[i] = c })
      setBoard(newBoard)
      const newPlayers = players_.map((cards, i) => ({
        id: crypto.randomUUID(),
        name: `Người ${i + 1}`,
        cards: [cards[0] ?? null, cards[1] ?? null] as [string | null, string | null],
      }))
      while (newPlayers.length < 2) newPlayers.push(makePlayer(`Người ${newPlayers.length + 1}`))
      setPlayers(newPlayers)
      setResult("")
      setArbErrors([])
      toast.success(`Đã quét: ${board_.length} bài chung · ${players_.length} người chơi`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Không quét được ảnh")
    } finally {
      setScanning(false)
      if (scanInputRef.current) scanInputRef.current.value = ""
    }
  }

  const resetSupport = () => {
    setSupportHand([null, null])
    setSupportBoard([null, null, null, null, null])
  }

  const pickCard = (card: string) => {
    if (!pickerTarget) return
    if (pickerTarget.kind === "board") {
      const i = pickerTarget.idx
      setBoard((prev) => { const next = [...prev]; next[i] = card; return next })
    } else if (pickerTarget.kind === "player") {
      const { idx, slot } = pickerTarget
      setPlayers((prev) => {
        const next = [...prev]
        const p: Player = { ...next[idx], cards: [...next[idx].cards] as [string | null, string | null] }
        p.cards[slot] = card
        next[idx] = p
        return next
      })
    } else if (pickerTarget.kind === "support-hand") {
      const slot = pickerTarget.slot
      setSupportHand((prev) => { const next = [...prev] as [string | null, string | null]; next[slot] = card; return next })
    } else if (pickerTarget.kind === "support-board") {
      const i = pickerTarget.idx
      setSupportBoard((prev) => { const next = [...prev]; next[i] = card; return next })
    }
  }

  const updatePlayerName = (idx: number, name: string) => {
    setPlayers((prev) => { const next = [...prev]; next[idx] = { ...next[idx], name }; return next })
  }

  const removePlayer = (idx: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== idx))
  }

  const buildPrompt = (): string => {
    const boardStr = board.filter(Boolean).join(" ")
    const playersStr = players
      .map((p) => `- ${p.name}: ${p.cards.filter(Boolean).join(" ")}`)
      .join("\n")
    return `Texas Hold'em — phân xử nhanh.

Board: ${boardStr}
${playersStr}

Trả lời ngắn gọn theo đúng 3 phần sau, không thêm gì khác:

**Bộ bài tốt nhất**
Mỗi người: tên — tên bộ bài (5 lá cụ thể).

**So sánh**
1–2 câu so sánh trực tiếp tại sao bộ này thắng bộ kia.

**Kết luận**
Người thắng: [tên]. (Hoặc: Hòa — chia đôi pot.)`
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

  const used = allUsedCards(board, players, supportHand, supportBoard)
  const hasResult = streaming || Boolean(result)
  const suppHandCards = supportHand.filter(Boolean) as string[]
  const suppBoardCards = supportBoard.filter(Boolean) as string[]
  const suppBoardCount = suppBoardCards.length
  const suppHandReady = suppHandCards.length === 2
  const suppBoardWaiting = suppHandReady && (suppBoardCount === 1 || suppBoardCount === 2)

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
      <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fb)", color: "var(--tx)", marginBottom: 4 }}>
            AI Cộng Sự
          </h1>
          <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
            Tính xác suất · Phán xử tranh chấp
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCardSettingsOpen(true)}
          style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0, marginTop: 2,
            border: "1px solid var(--gl-bd)", background: "var(--gl)",
            color: "var(--tx2)", fontSize: 17, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background var(--dur-f)",
          }}
          title="Chọn bộ bài"
        >🃏</button>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", background: "var(--gl2)", borderRadius: 14,
        padding: 4, marginBottom: 20, gap: 4,
        border: "1px solid var(--gl-bd)",
      }}>
        {(["support", "arbiter"] as const).map((t) => {
          const active = tab === t
          const label = t === "arbiter" ? "⚖️ Phán xử" : "🎯 Hỗ trợ"
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
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Hỗ trợ Tab ── */}
      {tab === "support" && (
        <div>
          {/* Hand */}
          <div style={{
            background: "var(--gl)", backdropFilter: "blur(20px)",
            border: "1px solid var(--gl-bd)", borderRadius: 16,
            padding: "15px", marginBottom: 12,
            boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: "1px" }}>
                🤲 Bài trên tay
              </p>
             <button
                type="button"
                onClick={resetSupport}
                style={{
                  padding: "5px 12px", borderRadius: 8,
                  border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                  color: "var(--tx3)", fontFamily: "var(--fb)", fontSize: 11,
                  fontWeight: 700, cursor: "pointer",
                }}
              >
                🔄 Ván mới
              </button>
            </div>
           
            <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center" }}>
              {([0, 1] as const).map((slot) => (
                <CardSlot
                  key={slot}
                  width={84}
                  size="large"
                  card={supportHand[slot]}
                  onClick={() => setPickerTarget({ kind: "support-hand", slot })}
                  onClear={() => setSupportHand(prev => { const next = [...prev] as [string|null, string|null]; next[slot] = null; return next })}
                />
              ))}
            </div>
          </div>

          {/* Board */}
          <div style={{
            background: "var(--gl)", backdropFilter: "blur(20px)",
            border: "1px solid var(--gl-bd)", borderRadius: 16,
            padding: "15px", marginBottom: 12,
            boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
          }}>
            <p style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: "1px" }}>
              🃏 Bài trên bàn
            </p>

            <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
              {supportBoard.map((card, i) => (
                <CardSlot
                  key={BOARD_LABELS[i]}
                  card={card}
                  onClick={() => setPickerTarget({ kind: "support-board", idx: i })}
                  onClear={() => setSupportBoard(prev => { const next = [...prev]; next[i] = null; return next })}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{
            background: "var(--gl)", backdropFilter: "blur(20px)",
            border: "1px solid var(--gl-bd)", borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: "1px" }}>
                📊 Thống kê
              </p>
              <button
                type="button"
                onClick={() => setShowInfo(true)}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                  color: "var(--tx3)", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--fm)", lineHeight: 1,
                }}
              >
                i
              </button>
            </div>

            {/* Player count stepper */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderRadius: 10, marginBottom: 12,
              background: "var(--gl2)", border: "1px solid var(--gl-bd)",
            }}>
              <p style={{ fontFamily: "var(--fm)", fontSize: 12, color: "var(--tx2)", fontWeight: 600 }}>
                Người còn trong ván
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setNumPlayers(n => Math.max(2, n - 1))}
                  style={{
                    width: 26, height: 26, borderRadius: 8,
                    border: "1px solid var(--gl-bd)", background: "var(--gl)",
                    color: "var(--tx2)", fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}
                >−</button>
                <span style={{ fontFamily: "var(--fm)", fontSize: 14, fontWeight: 800, color: "var(--tx)", minWidth: 16, textAlign: "center" }}>
                  {numPlayers}
                </span>
                <button
                  type="button"
                  onClick={() => setNumPlayers(n => Math.min(10, n + 1))}
                  style={{
                    width: 26, height: 26, borderRadius: 8,
                    border: "1px solid var(--gl-bd)", background: "var(--gl)",
                    color: "var(--tx2)", fontSize: 16, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}
                >+</button>
              </div>
            </div>

            {/* Win rate — full width */}
            <div style={{
              marginTop: 14, padding: "14px 16px", borderRadius: 14,
              background: "var(--gl2)", border: "1px solid var(--gl-bd)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontFamily: "var(--fb)" }}>
                  Tỉ lệ thắng
                </p>
                {suppBoardWaiting ? (
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--fm)", color: "var(--tx3)", lineHeight: 1.3, paddingTop: 2 }}>
                    Đợi đủ Flop ({3 - suppBoardCount} lá)
                  </p>
                ) : calculating ? (
                  <div style={{ display: "flex", gap: 5, paddingTop: 2 }}>
                    {[0,1,2].map((i) => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: "50%", background: "var(--ac)",
                        animation: `dot-pulse 1.1s ease-in-out ${i * 0.22}s infinite`,
                      }} />
                    ))}
                  </div>
                ) : calcResult ? (
                  <p style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--fm)", color: calcResult.win >= 50 ? "var(--win)" : "var(--lose)", lineHeight: 1 }}>
                    {calcResult.win.toFixed(1)}%
                  </p>
                ) : (
                  <p style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--fm)", color: "var(--tx3)" }}>—</p>
                )}
              </div>
              {calcResult && !calculating && (
                <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)", fontWeight: 600 }}>
                  Hòa {calcResult.tie.toFixed(1)}%
                </p>
              )}
            </div>

            {/* Bộ bài & Liên kết — full width */}
            <div style={{
              marginTop: 10, padding: "14px 16px", borderRadius: 14,
              background: "var(--gl2)", border: "1px solid var(--gl-bd)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: "var(--fb)" }}>
                Bộ bài
              </p>
              {suppBoardWaiting ? (
                <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--fm)", color: "var(--tx3)" }}>—</p>
              ) : calculating ? (
                <div style={{ display: "flex", gap: 5, paddingBottom: 2 }}>
                  {[0,1,2].map((i) => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: "50%", background: "var(--ac)",
                      animation: `dot-pulse 1.1s ease-in-out ${i * 0.22}s infinite`,
                    }} />
                  ))}
                </div>
              ) : (() => {
                const hand = supportHand.filter(Boolean) as string[]
                const brd  = supportBoard.filter(Boolean) as string[]
                if (hand.length < 2 || brd.length < 3) {
                  return <p style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--fm)", color: "var(--tx3)" }}>—</p>
                }
                const imp = getImprovement(hand, brd)
                if (brd.length >= 5) {
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 26 }}>{imp.current.emoji}</span>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--fm)", color: "var(--tx)", lineHeight: 1 }}>{imp.current.vn}</p>
                        <p style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fm)", marginTop: 2 }}>Vòng cuối · {imp.current.en}</p>
                      </div>
                    </div>
                  )
                }
                if (imp.outs === 0) {
                  return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 26 }}>{imp.current.emoji}</span>
                      <div>
                        <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--fm)", color: "var(--tx)", lineHeight: 1 }}>{imp.current.vn}</p>
                        <p style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fm)", marginTop: 2 }}>Không thể cải thiện thêm</p>
                      </div>
                    </div>
                  )
                }
                const pct = (imp.outs / imp.remaining) * 100
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    {/* Current hand */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 22, lineHeight: 1, marginBottom: 3 }}>{imp.current.emoji}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, fontFamily: "var(--fm)", color: "var(--tx2)", lineHeight: 1 }}>{imp.current.vn}</p>
                      <p style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "var(--fm)", marginTop: 2 }}>Hiện tại</p>
                    </div>
                    {/* Center: arrow + percentage */}
                    <div style={{ textAlign: "center", padding: "0 12px" }}>
                      <p style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fm)", color: "var(--ac)", lineHeight: 1 }}>
                        {pct.toFixed(1)}%
                      </p>
                      <p style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "var(--fm)", marginTop: 3 }}>→</p>
                    </div>
                    {/* Target hand */}
                    <div style={{ flex: 1, textAlign: "right" }}>
                      <p style={{ fontSize: 22, lineHeight: 1, marginBottom: 3 }}>{imp.target.emoji}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, fontFamily: "var(--fm)", color: "var(--tx)", lineHeight: 1 }}>{imp.target.vn}</p>
                      <p style={{ fontSize: 10, color: "var(--tx3)", fontFamily: "var(--fm)", marginTop: 2 }}>Mục tiêu</p>
                    </div>
                  </div>
                )
              })()}
            </div>

            {(suppBoardWaiting || !suppHandReady) && !calculating && (
              <p style={{ fontSize: 11, color: "var(--tx3)", fontFamily: "var(--fm)", marginTop: 10, textAlign: "center", opacity: 0.7 }}>
                {suppBoardWaiting
                  ? `Cần thêm ${3 - suppBoardCount} lá Flop để tính toán`
                  : "Nhập đủ 2 lá trên tay để bắt đầu tính toán"}
              </p>
            )}
          </div>

          {/* Info modal */}
          {showInfo && createPortal(
            <div
              role="dialog"
              style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "var(--overlay)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "24px 16px",
                overflowY: "auto",
              }}
              onClick={() => setShowInfo(false)}
            >
              <div
                style={{
                  width: "100%", maxWidth: 400,
                  background: "var(--picker-bg)",
                  border: "1px solid var(--gl-bd)",
                  borderRadius: 22,
                  padding: "22px 20px 24px",
                  boxShadow: "0 24px 60px rgba(0,0,0,.6)",
                  animation: "result-appear .22s ease both",
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <p style={{ fontFamily: "var(--fb)", fontSize: 16, fontWeight: 800, color: "var(--tx)" }}>
                    ℹ️ Phương pháp tính toán
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowInfo(false)}
                    style={{
                      width: 32, height: 32, borderRadius: 10,
                      border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                      color: "var(--tx2)", fontSize: 14, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >✕</button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    {
                      title: "Monte Carlo Simulation",
                      body: "Mỗi lượt giả lập là một ván đầy đủ theo số người chơi bạn chọn. Ví dụ 7 người: bạn đấu với 6 đối thủ — mỗi người được phát 2 lá ngẫu nhiên từ bộ bài còn lại, board còn thiếu cũng được rút ngẫu nhiên. Bạn thắng khi bộ bài của bạn là tốt nhất trong tất cả. Sau 8.000 lượt, tỉ lệ thắng = số lượt bạn thắng / 8.000.",
                    },
                    {
                      title: "Độ chính xác",
                      body: "±1–2% (khoảng tin cậy 95%). Sai số giảm dần khi board nhiều lá hơn vì số biến ẩn ít hơn.",
                    },
                    {
                      title: "Tỉ lệ thắng",
                      body: "% vòng bạn thắng đối thủ ngẫu nhiên duy nhất (heads-up). Không tính đến số người chơi thực tế tại bàn.",
                    },
                    {
                      title: "Tỉ lệ liên kết (Outs)",
                      body: "Số lá còn trong bộ bài mà nếu ra sẽ cải thiện bộ bài của bạn, tính theo % tổng bài còn lại. Chỉ hiển thị từ Flop đến Turn.",
                    },
                  ].map((s) => (
                    <div key={s.title} style={{
                      padding: "12px 14px", borderRadius: 12,
                      background: "var(--gl2)", border: "1px solid var(--gl-bd)",
                    }}>
                      <p style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, color: "var(--ac)", marginBottom: 5 }}>
                        {s.title}
                      </p>
                      <p style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx2)", lineHeight: 1.65 }}>
                        {s.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      )}

      {/* ── Phán xử Tab ── */}
      {tab === "arbiter" && !isLoggedIn && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 16, padding: "52px 24px",
          background: "var(--gl)", backdropFilter: "blur(20px)",
          border: "1px solid var(--gl-bd)", borderRadius: 20,
          boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
          textAlign: "center",
        }}>
          <span style={{ fontSize: 48 }}>🔒</span>
          <div>
            <p style={{ fontFamily: "var(--fb)", fontSize: 16, fontWeight: 800, color: "var(--tx)", marginBottom: 6 }}>
              Cần đăng nhập
            </p>
            <p style={{ fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx3)", lineHeight: 1.6 }}>
              Tính năng Phán xử chỉ dành cho<br />người dùng đã đăng nhập.
            </p>
          </div>
        </div>
      )}

      {tab === "arbiter" && isLoggedIn && (
        <div>
          {/* Hidden file input for camera scan */}
          <input
            ref={scanInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleScanFile}
          />

          {/* Board */}
          <div style={{
            background: "var(--gl)", backdropFilter: "blur(20px)",
            border: "1px solid var(--gl-bd)", borderRadius: 16,
            padding: "15px", marginBottom: 12,
            boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontFamily: "var(--fb)", fontSize: 12, fontWeight: 700, color: "var(--tx3)", textTransform: "uppercase", letterSpacing: "1px" }}>
                🃏 Bài trên bàn
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => scanInputRef.current?.click()}
                  disabled={scanning}
                  style={{
                    padding: "5px 11px", borderRadius: 8,
                    border: "1px solid var(--ac)", background: "transparent",
                    color: scanning ? "var(--tx3)" : "var(--ac)", fontFamily: "var(--fb)", fontSize: 11,
                    fontWeight: 700, cursor: scanning ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  {scanning ? (
                    <>
                      {[0,1,2].map((i) => (
                        <div key={i} style={{
                          width: 5, height: 5, borderRadius: "50%", background: "var(--tx3)",
                          animation: `dot-pulse 1.1s ease-in-out ${i * 0.22}s infinite`,
                        }} />
                      ))}
                    </>
                  ) : "📷 Quét bài"}
                </button>
                <button
                  type="button"
                  onClick={resetArbiter}
                  style={{
                    padding: "5px 12px", borderRadius: 8,
                    border: "1px solid var(--gl-bd)", background: "var(--gl2)",
                    color: "var(--tx3)", fontFamily: "var(--fb)", fontSize: 11,
                    fontWeight: 700, cursor: "pointer",
                  }}
                >
                  🔄 Ván mới
                </button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 14 }}>
              {board.map((card, i) => (
                <CardSlot
                  key={BOARD_LABELS[i]}
                  card={card}
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
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <CardSlot
                  width={84}
                  card={player.cards[0]}
                  size="large"
                  disabled={hasResult}
                  onClick={() => { if (!hasResult) setPickerTarget({ kind: "player", idx: pi, slot: 0 }) }}
                />
                <CardSlot
                  width={84}
                  card={player.cards[1]}
                  size="large"
                  disabled={hasResult}
                  onClick={() => { if (!hasResult) setPickerTarget({ kind: "player", idx: pi, slot: 1 }) }}
                />
              </div>
            </div>
          ))}

          {/* Add player */}
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

          {/* Loading */}
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

          {/* Result */}
          {result && (
            <div ref={resultRef} style={{ marginTop: 20, animation: "result-appear .4s ease both" }}>
              <div style={{
                textAlign: "center", padding: "28px 20px 22px",
                background: "var(--gl)", backdropFilter: "blur(20px)",
                border: "1px solid var(--gl-bd)", borderRadius: 20,
                boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 8px 30px var(--gl-sh)",
                marginBottom: 12, position: "relative", overflow: "hidden",
              }}>
                {["✦", "✧", "✦"].map((star, i) => (
                  <span key={star + i} aria-hidden style={{
                    position: "absolute",
                    top: `${18 + i * 20}%`,
                    left: i === 0 ? "8%" : i === 1 ? "88%" : "14%",
                    fontSize: 14 + i * 4, color: "var(--ac2)",
                    animation: `star-pop .6s cubic-bezier(.34,1.56,.64,1) ${i * 0.12}s both`,
                  }}>
                    {star}
                  </span>
                ))}
                <div style={{
                  fontSize: 60, marginBottom: 10, display: "inline-block",
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

              <button
                type="button"
                onClick={resetArbiter}
                style={{
                  width: "100%", padding: "15px 0", borderRadius: 16, border: "none",
                  background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                  color: "white", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 22px var(--gw)",
                }}
              >
                🎲 Trận mới
              </button>
            </div>
          )}

        </div>
      )}

      {/* Card picker — portal to body so it sits above TopBar (z-10) and BottomNav (z-50) */}
      {pickerTarget && createPortal(
        <CardPicker
          used={used}
          onPick={pickCard}
          onClose={() => setPickerTarget(null)}
        />,
        document.body,
      )}
      {cardSettingsOpen && createPortal(
        <CardSettingsModal
          current={cardBack}
          onChange={setCardBack}
          onClose={() => setCardSettingsOpen(false)}
        />,
        document.body,
      )}
    </div>
  )
}
