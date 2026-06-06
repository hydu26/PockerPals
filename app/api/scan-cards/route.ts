import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VALID_SUITS = ["♥", "♦", "♣", "♠"]
const VALID_RANKS = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"]

function normalizeCard(raw: string): string | null {
  if (!raw || typeof raw !== "string") return null
  const s = raw.trim()

  const suitMap: Record<string, string> = {
    "♥": "♥", "H": "♥", "h": "♥",
    "♦": "♦", "D": "♦", "d": "♦",
    "♣": "♣", "C": "♣", "c": "♣",
    "♠": "♠", "S": "♠", "s": "♠",
  }
  const rankMap: Record<string, string> = {
    "A": "A", "a": "A",
    "K": "K", "k": "K",
    "Q": "Q", "q": "Q",
    "J": "J", "j": "J",
    "T": "10", "t": "10", "10": "10",
    "9": "9", "8": "8", "7": "7", "6": "6",
    "5": "5", "4": "4", "3": "3", "2": "2",
  }

  // Format "♥ A" or "♥A"
  const m1 = s.match(/^([♥♦♣♠HhDdCcSs])\s*([AaKkQqJjTt]|10|[2-9])$/)
  if (m1) {
    const suit = suitMap[m1[1]]
    const rank = rankMap[m1[2]]
    if (suit && rank) return `${suit} ${rank}`
  }

  // Format "A♥" or "A ♥"
  const m2 = s.match(/^([AaKkQqJjTt]|10|[2-9])\s*([♥♦♣♠HhDdCcSs])$/)
  if (m2) {
    const rank = rankMap[m2[1]]
    const suit = suitMap[m2[2]]
    if (suit && rank) return `${suit} ${rank}`
  }

  return null
}

function validateCards(arr: unknown): string[] {
  if (!Array.isArray(arr)) return []
  return arr
    .map((c) => normalizeCard(String(c)))
    .filter((c): c is string => c !== null)
    .filter((c) => {
      const [suit, rank] = c.split(" ")
      return VALID_SUITS.includes(suit) && VALID_RANKS.includes(rank)
    })
}

const PROMPT = `You are a playing card scanner. In the image, cards are arranged vertically:
- Row 1: community board (up to 5 cards)
- Row 2, 3, 4... : each player's hole cards (2 cards each)

Return ONLY a JSON object, nothing else:
{
  "board": ["♥ A", "♦ K", "♣ 10", "♠ J", "♥ Q"],
  "players": [
    ["♦ 7", "♣ 8"],
    ["♥ 2", "♠ 5"]
  ]
}

Card format rules:
- Suits: ♥ ♦ ♣ ♠
- Ranks: A K Q J 10 9 8 7 6 5 4 3 2
- Format: "SUIT RANK" with a space (e.g. "♥ A", "♦ 10", "♣ K")
- Skip any card you cannot read clearly
- players array length = number of player rows detected (can be 1 to 9)
- Return valid JSON only, no explanation`

export async function POST(req: NextRequest) {
  try {
    const { image } = (await req.json()) as { image: string }
    if (!image) return Response.json({ error: "Missing image" }, { status: 400 })

    const mimeMatch = image.match(/^data:([^;]+);base64,/)
    const rawMime = mimeMatch?.[1] ?? "image/jpeg"
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const mediaType = (allowedMimes.includes(rawMime) ? rawMime : "image/jpeg") as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp"
    const base64 = image.replace(/^data:[^;]+;base64,/, "")

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    })

    const text = response.content[0]?.type === "text" ? response.content[0].text : ""
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")

    const raw = JSON.parse(jsonMatch[0]) as { board?: unknown; players?: unknown }
    const board = validateCards(raw.board)
    const players = Array.isArray(raw.players)
      ? (raw.players as unknown[]).map((row) => validateCards(row))
      : []

    return Response.json({ board, players })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("[/api/scan-cards]", message)
    return Response.json({ error: message }, { status: 500 })
  }
}
