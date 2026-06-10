export default function Loading() {
  return (
    <div className="pt-2 flex flex-col gap-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-28 rounded-full bg-[var(--gl2)]" />
          <div className="h-3 w-44 rounded-full bg-[var(--gl2)]" />
        </div>
        <div className="w-9 h-9 rounded-[12px] bg-[var(--gl2)]" />
      </div>

      {/* Tab bar */}
      <div className="h-11 rounded-[14px] bg-[var(--gl2)]" />

      {/* Hand cards row */}
      <div className="flex gap-3 justify-center">
        {[0, 1].map(i => (
          <div key={i} className="w-[84px] bg-[var(--gl2)] rounded-[14px]" style={{ aspectRatio: "63/88" }} />
        ))}
      </div>

      {/* Board cards row */}
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 bg-[var(--gl2)] rounded-[14px]" style={{ aspectRatio: "63/88" }} />
        ))}
      </div>

      {/* Result block */}
      <div className="h-24 rounded-[18px] bg-[var(--gl2)]" />

      {/* CTA button */}
      <div className="h-14 rounded-[18px] bg-[var(--gl2)]" />
    </div>
  )
}
