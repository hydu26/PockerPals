"use client";

import { useState } from "react";

/* Mini playing card */
function Card({
  rank,
  suit,
  red,
}: Readonly<{ rank: string; suit: string; red?: boolean }>) {
  return (
    <span
      style={{
        width: 30,
        height: 42,
        background: "#fafafa",
        borderRadius: 6,
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--fm)",
        fontWeight: 800,
        lineHeight: 1.05,
        boxShadow:
          "0 2px 6px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.7)",
        border: "1px solid rgba(0,0,0,.12)",
        color: red ? "#d92020" : "#1a1a1a",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 800 }}>{rank}</span>
      <span style={{ fontSize: 13 }}>{suit}</span>
    </span>
  );
}

function Plus() {
  return (
    <span
      style={{
        fontSize: 15,
        color: "var(--tx3)",
        fontWeight: 700,
        padding: "0 2px",
        alignSelf: "center",
      }}
    >
      +
    </span>
  );
}

type HandData = {
  rank: number;
  emoji: string;
  en: string;
  vn: string;
  cards: React.ReactNode;
  desc: React.ReactNode;
  rare: string;
};

const HANDS: HandData[] = [
  {
    rank: 1,
    emoji: "🌈",
    en: "Royal Flush",
    vn: "Sảnh hoàng gia · Sảnh thùng tối thượng",
    cards: (
      <>
        <Card rank="10" suit="♠" />
        <Card rank="J" suit="♠" />
        <Card rank="Q" suit="♠" />
        <Card rank="K" suit="♠" />
        <Card rank="A" suit="♠" />
      </>
    ),
    desc: (
      <>
        10, J, Q, K, A <b>cùng chất</b>. Tay bài tối thượng — không gì đánh bại.
        Cả đời chơi có thể không gặp lần nào.
      </>
    ),
    rare: "⭐ Xác suất 1 / 649,740",
  },
  {
    rank: 2,
    emoji: "🔥",
    en: "Straight Flush",
    vn: "Sảnh thùng",
    cards: (
      <>
        <Card rank="5" suit="♥" red />
        <Card rank="6" suit="♥" red />
        <Card rank="7" suit="♥" red />
        <Card rank="8" suit="♥" red />
        <Card rank="9" suit="♥" red />
      </>
    ),
    desc: (
      <>
        5 lá <b>liên tiếp cùng chất</b> (không phải A-K-Q-J-10 — đó là Royal
        Flush). Gần như cầm chắc thắng.
      </>
    ),
    rare: "🔥 1 / 72,193",
  },
  {
    rank: 3,
    emoji: "💎",
    en: "Four of a Kind",
    vn: "Tứ quý",
    cards: (
      <>
        <Card rank="K" suit="♠" />
        <Card rank="K" suit="♥" red />
        <Card rank="K" suit="♦" red />
        <Card rank="K" suit="♣" />
        <Plus />
        <Card rank="5" suit="♣" />
      </>
    ),
    desc: (
      <>
        <b>4 lá cùng số</b> + 1 lá kicker. So sánh: tứ quý số lớn thắng. Cùng tứ
        quý → so kicker.
      </>
    ),
    rare: "💎 1 / 4,165",
  },
  {
    rank: 4,
    emoji: "🏰",
    en: "Full House",
    vn: "Cù lũ · Bộ ba + đôi",
    cards: (
      <>
        <Card rank="J" suit="♥" red />
        <Card rank="J" suit="♦" red />
        <Card rank="J" suit="♠" />
        <Plus />
        <Card rank="9" suit="♣" />
        <Card rank="9" suit="♥" red />
      </>
    ),
    desc: (
      <>
        <b>1 sám + 1 đôi</b>. So sánh: sám lớn hơn quyết định. Còn gọi là
        &ldquo;Jacks full of nines&rdquo;.
      </>
    ),
    rare: "🏰 1 / 694",
  },
  {
    rank: 5,
    emoji: "🌊",
    en: "Flush",
    vn: "Thùng",
    cards: (
      <>
        <Card rank="A" suit="♦" red />
        <Card rank="J" suit="♦" red />
        <Card rank="8" suit="♦" red />
        <Card rank="6" suit="♦" red />
        <Card rank="2" suit="♦" red />
      </>
    ),
    desc: (
      <>
        <b>5 lá cùng chất</b>, không cần liên tiếp. So sánh: lá cao nhất thắng
        (ở đây là Át).
      </>
    ),
    rare: "🌊 1 / 509",
  },
  {
    rank: 6,
    emoji: "📏",
    en: "Straight",
    vn: "Sảnh",
    cards: (
      <>
        <Card rank="5" suit="♠" />
        <Card rank="6" suit="♥" red />
        <Card rank="7" suit="♦" red />
        <Card rank="8" suit="♣" />
        <Card rank="9" suit="♠" />
      </>
    ),
    desc: (
      <>
        <b>5 lá liên tiếp</b>, khác chất. A có thể là cao (A-K-Q-J-10) hoặc thấp
        (A-2-3-4-5 — gọi là &ldquo;wheel&rdquo;).
      </>
    ),
    rare: "📏 1 / 255",
  },
  {
    rank: 7,
    emoji: "🎯",
    en: "Three of a Kind",
    vn: "Sám cô · Bộ ba",
    cards: (
      <>
        <Card rank="Q" suit="♠" />
        <Card rank="Q" suit="♥" red />
        <Card rank="Q" suit="♦" red />
        <Plus />
        <Card rank="K" suit="♣" />
        <Card rank="7" suit="♥" red />
      </>
    ),
    desc: (
      <>
        <b>3 lá cùng số</b> + 2 kicker khác nhau. &ldquo;Set&rdquo; = 1 đôi tay
        + 1 lá ngoài; &ldquo;Trips&rdquo; = 1 lá tay + 1 đôi ngoài.
      </>
    ),
    rare: "🎯 1 / 47",
  },
  {
    rank: 8,
    emoji: "✌️",
    en: "Two Pair",
    vn: "Đôi đôi · Hai cặp",
    cards: (
      <>
        <Card rank="A" suit="♠" />
        <Card rank="A" suit="♥" red />
        <Plus />
        <Card rank="8" suit="♦" red />
        <Card rank="8" suit="♣" />
        <Plus />
        <Card rank="K" suit="♥" red />
      </>
    ),
    desc: (
      <>
        <b>2 cặp đôi khác nhau</b> + 1 kicker. So đôi lớn trước, rồi đôi nhỏ,
        cuối cùng so kicker.
      </>
    ),
    rare: "✌️ 1 / 21",
  },
  {
    rank: 9,
    emoji: "👫",
    en: "One Pair",
    vn: "Đôi · Cặp đôi",
    cards: (
      <>
        <Card rank="10" suit="♠" />
        <Card rank="10" suit="♥" red />
        <Plus />
        <Card rank="A" suit="♦" red />
        <Card rank="K" suit="♣" />
        <Card rank="5" suit="♠" />
      </>
    ),
    desc: (
      <>
        <b>2 lá cùng số</b> + 3 kicker. Đôi lớn thắng đôi nhỏ; cùng đôi → so lần
        lượt kicker từ cao xuống thấp.
      </>
    ),
    rare: "👫 1 / 2.4 — gần 42% bạn được tay này",
  },
  {
    rank: 10,
    emoji: "🃏",
    en: "High Card",
    vn: "Lá cao · Mậu thầu",
    cards: (
      <>
        <Card rank="A" suit="♦" red />
        <Card rank="J" suit="♥" red />
        <Card rank="9" suit="♣" />
        <Card rank="6" suit="♠" />
        <Card rank="3" suit="♥" red />
      </>
    ),
    desc: (
      <>
        Không có tổ hợp nào. So lá cao nhất → nếu bằng, so lá tiếp theo.
        &ldquo;Ace high&rdquo; thường gặp nhất.
      </>
    ),
    rare: "🃏 ~50% — bạn hay rơi vào đây",
  },
];

function HandCard({ hand }: Readonly<{ hand: HandData }>) {
  const isTop = hand.rank === 1;
  const isSecond = hand.rank === 2;

  let accentBg = "linear-gradient(90deg,var(--ac),var(--ac3))";
  if (isTop) accentBg = "linear-gradient(90deg,#ffd700,#ff8a00)";
  else if (isSecond) accentBg = "linear-gradient(90deg,#ff5e3a,#ff9500)";

  let accentOpacity = 0.55;
  if (isTop) accentOpacity = 1;
  else if (isSecond) accentOpacity = 0.85;

  return (
    <div
      style={{
        background: "var(--gl)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: isTop
          ? "1px solid rgba(255,215,0,.5)"
          : "1px solid var(--gl-bd)",
        borderRadius: 16,
        padding: "14px 16px",
        boxShadow: isTop
          ? "inset 0 1px 0 0 var(--gl-hl), 0 4px 16px var(--gl-sh), 0 0 24px rgba(255,215,0,.18)"
          : "inset 0 1px 0 0 var(--gl-hl), 0 3px 12px var(--gl-sh)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: isTop ? 4 : 3,
          background: accentBg,
          opacity: accentOpacity,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: "var(--fm)",
            fontSize: 11,
            fontWeight: isTop ? 900 : 800,
            padding: "3px 9px",
            background: isTop
              ? "linear-gradient(135deg,#ffd700,#ff8a00)"
              : "var(--gl2)",
            border: isTop
              ? "1px solid rgba(255,140,0,.6)"
              : "1px solid var(--gl-bd)",
            borderRadius: 9,
            color: isTop ? "#1a0900" : "var(--tx2)",
            letterSpacing: ".3px",
            flexShrink: 0,
            lineHeight: 1.2,
          }}
        >
          #{hand.rank}
        </span>
        <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }}>
          {hand.emoji}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--fb)",
              fontWeight: 800,
              fontSize: 14,
              color: "var(--tx)",
              letterSpacing: "-.2px",
            }}
          >
            {hand.en}
          </div>
          <div
            style={{
              fontFamily: "var(--fm)",
              fontSize: 11,
              color: "var(--tx3)",
              marginTop: 1,
              letterSpacing: ".2px",
            }}
          >
            {hand.vn}
          </div>
        </div>
      </div>

      {/* Card visual */}
      <div
        style={{
          display: "flex",
          gap: 5,
          margin: "8px 0 12px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {hand.cards}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 13,
          color: "var(--tx2)",
          lineHeight: 1.6,
          marginBottom: 8,
        }}
      >
        {hand.desc}
      </div>

      {/* Probability badge */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11,
          color: "var(--tx)",
          fontFamily: "var(--fm)",
          background: "var(--gl2)",
          border: "1px solid var(--gl-bd)",
          padding: "4px 10px",
          borderRadius: 14,
          fontWeight: 700,
        }}
      >
        {hand.rare}
      </span>
    </div>
  );
}

type AccSection = {
  id: string;
  icon: string;
  title: string;
  defaultOpen?: boolean;
  content: React.ReactNode;
};

const ACCORDS: AccSection[] = [
  {
    id: "hands",
    icon: "🃏",
    title: "Thứ bậc bộ bài (mạnh → yếu)",
    defaultOpen: true,
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {HANDS.map((h) => (
          <HandCard key={h.rank} hand={h} />
        ))}
      </div>
    ),
  },
  {
    id: "goal",
    icon: "🎯",
    title: "Mục tiêu",
    content: (
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "var(--tx2)",
          lineHeight: 1.8,
        }}
      >
        Mỗi người nhận 2 lá bài riêng, dùng chung 5 lá trên bàn để tạo bộ 5 lá
        mạnh nhất.
      </p>
    ),
  },

  {
    id: "flow",
    icon: "🔄",
    title: "Diễn biến một ván",
    content: (
      <div style={{ fontSize: 13, color: "var(--tx2)", lineHeight: 1.8 }}>
        {[
          ["Pre-flop", "Nhận 2 lá riêng. SB & BB đặt cược bắt buộc."],
          ["Flop", "3 lá chung lật."],
          ["Turn", "Lá chung thứ 4."],
          ["River", "Lá chung thứ 5."],
          ["Showdown", "Lật bài — bộ 5 lá mạnh nhất thắng."],
        ].map(([name, desc]) => (
          <div key={name} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "var(--fm)",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--ac)",
                minWidth: 70,
                flexShrink: 0,
              }}
            >
              {name}
            </span>
            <span>{desc}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "actions",
    icon: "💰",
    title: "Hành động đặt cược",
    content: (
      <div>
        {[
          ["Check", "Không bet thêm."],
          ["Bet", "Đặt cược đầu tiên."],
          ["Call", "Theo đúng mức cược."],
          ["Raise", "Tăng cược."],
          ["Fold", "Bỏ bài."],
          ["All-in", "Đẩy hết chip."],
        ].map(([name, desc]) => (
          <div
            key={name}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid var(--gl-bd)",
            }}
          >
            <span
              style={{
                minWidth: 58,
                padding: "3px 9px",
                borderRadius: 8,
                background: "var(--gl2)",
                border: "1px solid var(--gl-bd)",
                fontFamily: "var(--fm)",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--ac)",
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              {name}
            </span>
            <span style={{ fontSize: 13, color: "var(--tx2)" }}>{desc}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function RulesPage() {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["hands"]));
  const toggle = (id: string) =>
    setOpenIds((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <div>
       {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fb)", color: "var(--tx)", marginBottom: 4 }}>
          Luật chơi
        </h1>
          <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
          Tóm tắt nhanh các quy tắc cơ bản của poker.
        </p>
      </div>
      {/* Accordions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACCORDS.map((sec) => {
          const open = openIds.has(sec.id);
          return (
            <div
              key={sec.id}
              style={{
                background: "var(--gl)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: open ? "1px solid var(--ac)" : "1px solid var(--gl-bd)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow:
                  "inset 0 1px 0 0 var(--gl-hl), 0 3px 12px var(--gl-sh)",
                transition: "border-color var(--dur-f)",
              }}
            >
              <button
                onClick={() => toggle(sec.id)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "var(--fb)",
                    color: "var(--tx)",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{sec.icon}</span>
                  {sec.title}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: open ? "var(--ac)" : "var(--tx3)",
                    fontWeight: 600,
                    transition: "transform var(--dur-f)",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    display: "inline-block",
                  }}
                >
                  ▾
                </span>
              </button>

              {open && (
                <div style={{ padding: "0 16px 16px" }}>{sec.content}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
