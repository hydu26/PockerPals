"use client";

import { useState } from "react";
import { PlayingCard } from "@/components/shared/playing-card";

const FAQS = [
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
  {
    id: "kicker",
    q: "Kicker là gì?",
    a: "Kicker là lá bài không thuộc bộ chính (đôi, sám...) dùng để phân định thắng thua khi 2 người cùng bộ. Ví dụ: cả 2 có đôi A, người có kicker K thắng người có kicker Q.",
  },
]


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
        <PlayingCard rank="10" suit="♠" />
        <PlayingCard rank="J" suit="♠" />
        <PlayingCard rank="Q" suit="♠" />
        <PlayingCard rank="K" suit="♠" />
        <PlayingCard rank="A" suit="♠" />
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
        <PlayingCard rank="5" suit="♥" />
        <PlayingCard rank="6" suit="♥" />
        <PlayingCard rank="7" suit="♥" />
        <PlayingCard rank="8" suit="♥" />
        <PlayingCard rank="9" suit="♥" />
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
        <PlayingCard rank="K" suit="♠" />
        <PlayingCard rank="K" suit="♥" />
        <PlayingCard rank="K" suit="♦" />
        <PlayingCard rank="K" suit="♣" />
        <Plus />
        <PlayingCard rank="5" suit="♣" />
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
        <PlayingCard rank="J" suit="♥" />
        <PlayingCard rank="J" suit="♦" />
        <PlayingCard rank="J" suit="♠" />
        <Plus />
        <PlayingCard rank="9" suit="♣" />
        <PlayingCard rank="9" suit="♥" />
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
        <PlayingCard rank="A" suit="♦" />
        <PlayingCard rank="J" suit="♦" />
        <PlayingCard rank="8" suit="♦" />
        <PlayingCard rank="6" suit="♦" />
        <PlayingCard rank="2" suit="♦" />
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
        <PlayingCard rank="5" suit="♠" />
        <PlayingCard rank="6" suit="♥" />
        <PlayingCard rank="7" suit="♦" />
        <PlayingCard rank="8" suit="♣" />
        <PlayingCard rank="9" suit="♠" />
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
        <PlayingCard rank="Q" suit="♠" />
        <PlayingCard rank="Q" suit="♥" />
        <PlayingCard rank="Q" suit="♦" />
        <Plus />
        <PlayingCard rank="K" suit="♣" />
        <PlayingCard rank="7" suit="♥" />
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
        <PlayingCard rank="A" suit="♠" />
        <PlayingCard rank="A" suit="♥" />
        <Plus />
        <PlayingCard rank="8" suit="♦" />
        <PlayingCard rank="8" suit="♣" />
        <Plus />
        <PlayingCard rank="K" suit="♥" />
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
        <PlayingCard rank="10" suit="♠" />
        <PlayingCard rank="10" suit="♥" />
        <Plus />
        <PlayingCard rank="A" suit="♦" />
        <PlayingCard rank="K" suit="♣" />
        <PlayingCard rank="5" suit="♠" />
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
        <PlayingCard rank="A" suit="♦" />
        <PlayingCard rank="J" suit="♥" />
        <PlayingCard rank="9" suit="♣" />
        <PlayingCard rank="6" suit="♠" />
        <PlayingCard rank="3" suit="♥" />
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
  const [tab, setTab] = useState<"rules" | "faqs">("rules");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(["hands"]));
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setOpenIds((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const toggleFaq = (id: string) =>
    setOpenFaqs((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--fb)", color: "var(--tx)", marginBottom: 4 }}>
          Cẩm nang Poker
        </h1>
        <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
          Thứ bậc bài · Luật cơ bản · Câu hỏi thường gặp
        </p>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", background: "var(--gl2)", borderRadius: 14,
        padding: 4, marginBottom: 20, gap: 4,
        border: "1px solid var(--gl-bd)",
      }}>
        {(["rules", "faqs"] as const).map((t) => {
          const active = tab === t;
          const label = t === "rules" ? "📖 Luật chơi" : "❓ FAQs";
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
          );
        })}
      </div>

      {/* ── FAQs Tab ── */}
      {tab === "faqs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq) => {
            const open = openFaqs.has(faq.id);
            return (
              <div key={faq.id} style={{
                background: "var(--gl)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: `1px solid ${open ? "var(--ac)" : "var(--gl-bd)"}`,
                borderRadius: 16, overflow: "hidden",
                boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 3px 12px var(--gl-sh)",
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
                    fontSize: 13, color: open ? "var(--ac)" : "var(--tx3)", fontWeight: 600,
                    transition: "transform var(--dur-f)", transform: open ? "rotate(180deg)" : "rotate(0deg)",
                    display: "inline-block",
                  }}>▾</span>
                </button>
                {open && (
                  <div style={{
                    borderTop: "1px solid var(--gl-bd)",
                    padding: "12px 16px 14px",
                    fontFamily: "var(--fm)", fontSize: 13, color: "var(--tx2)",
                    lineHeight: 1.75,
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Luật chơi Tab ── */}
      {tab === "rules" && (
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
      )}
    </div>
    );
}
