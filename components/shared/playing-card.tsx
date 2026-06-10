"use client"

// Reusable playing card components.
// PlayingCard: pure face-up display (rules page)
// CardSlot: interactive slot with face-down empty state (AI page)
// Standard poker card ratio: 63:88

import type { CSSProperties } from "react"

const RED_SUITS = new Set(["♥", "♦"])

function parseCard(card: string) {
  const idx = card.indexOf(" ")
  return { suit: card.slice(0, idx), rank: card.slice(idx + 1) }
}


// ── PlayingCard ────────────────────────────────────────────────────────────────
// Pure face-up display. Rank top-left, suit bottom-left. Standard 63:88 poker ratio.
// size="sm" → 38px wide (rules page inline)
// size="md" → 54px wide (standalone display)
export function PlayingCard({
  rank,
  suit,
  size = "sm",
}: Readonly<{ rank: string; suit: string; size?: "sm" | "md" }>) {
  const red = RED_SUITS.has(suit)
  const s = size === "sm"
    ? { w: 38, pad: 4, rankSz: 16, suitSz: 17, r: 10 }
    : { w: 54, pad: 6, rankSz: 22, suitSz: 24, r: 13 }

  return (
    <div style={{
      width: s.w,
      aspectRatio: "63/88",
      position: "relative",
      flexShrink: 0,
      display: "inline-block",
      background: "#fafafa",
      borderRadius: s.r,
      border: "1px solid rgba(0,0,0,.1)",
      boxShadow: "0 2px 8px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.9)",
      color: red ? "#d92020" : "#1a1a1a",
      fontFamily: "var(--fm)",
    }}>
      <span style={{
        position: "absolute", top: s.pad, left: s.pad + 1,
        fontSize: s.rankSz, fontWeight: 800, lineHeight: 1,
      }}>{rank}</span>
      <span style={{
        position: "absolute", bottom: s.pad, left: s.pad + 1,
        fontSize: s.suitSz, lineHeight: 1,
      }}>{suit}</span>
    </div>
  )
}

function CardFaceUp({ rank, suit, red, contenu_size }: Readonly<{ rank: string; suit: string; red: boolean, contenu_size: { rankSz: number; suitSz: number } }>) {
  const color = red ? "#d92020" : "#1a1a1a"
  return (
    <>
      <span style={{ fontFamily: "var(--fm)", fontSize: contenu_size.rankSz, fontWeight: 800, color, lineHeight: 1 }}>{rank}</span>
      <span style={{ fontFamily: "var(--fm)", fontSize: contenu_size.suitSz, color, lineHeight: 1 }}>{suit}</span>
    </>
  )
}

// Renders the card back logo image centered on the card's background color.
// Reads --card-back-image (url or none) from the nearest CSS ancestor.
export function CardBackDisplay() {
  return (
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "var(--card-back-image, none)",
      backgroundSize: "78% auto",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }} />
  )
}

function CardFaceDown({ label }: Readonly<{ label?: string }>) {
  return (
    <>
      <CardBackDisplay />
      {label && (
        <span style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, letterSpacing: "0.3px",
          color: "rgba(255,255,255,.7)", fontFamily: "var(--fm)",
        }}>{label}</span>
      )}
    </>
  )
}

// ── CardSlot ───────────────────────────────────────────────────────────────────
// Interactive slot: shows face-up card or face-down (empty) state.
// Standard 63:88 poker card ratio. Pass `width` for fixed-size hand cards;
// omit for board rows where flex: 1 fills the available space naturally.
export function CardSlot({
  card,
  label,
  size = "medium",
  onClick,
  onClear,
  disabled,
  width,
}: Readonly<{
  card: string | null
  label?: string
  size?: "medium" | "large"
  onClick: () => void
  onClear?: () => void
  disabled?: boolean
  width?: number
}>) {
  const parsed = card ? parseCard(card) : null
  const red = parsed ? RED_SUITS.has(parsed.suit) : false

  const wrapperStyle: CSSProperties = width
    ? { position: "relative", width, flexShrink: 0 }
    : { flex: 1, minWidth: 0, position: "relative" }

  const boxShadow = card
    ? "0 2px 10px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.9)"
    : "0 2px 8px rgba(0,0,0,.3)"

  const contenu_size = size === "medium" ? { rankSz: 20, suitSz: 24 } : { rankSz: 28, suitSz: 34 }

  return (
    <div style={wrapperStyle}>
      {card && onClear && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClear() }}
          style={{
            position: "absolute", top: 5, right: 5, zIndex: 1,
            width: 18, height: 18, borderRadius: 6,
            background: "rgba(0,0,0,.38)", border: "none",
            color: "#fff", fontSize: 9, fontWeight: 800,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}
        >✕</button>
      )}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        style={{
          width: "100%", aspectRatio: "63/88", borderRadius: 14, 
          border: size === "medium" ? "4px solid #fefefe" : "6px solid #fefefe",
          background: card ? "#fafafa" : "var(--card-back)",
          display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "space-between",
          padding: card ? size === "medium"? "7px": "10px" : 0,
          position: "relative", overflow: "hidden",
          cursor: disabled ? "default" : "pointer",
          boxShadow, transition: "all var(--dur-f)",
          opacity: disabled && !card ? 0.5 : 1,
        }}
      >
        {parsed
          ? <CardFaceUp rank={parsed.rank} suit={parsed.suit} red={red} contenu_size={contenu_size} />
          : <CardFaceDown label={label} />
        }
      </button>
    </div>
  )
}
