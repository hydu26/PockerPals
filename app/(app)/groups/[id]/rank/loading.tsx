export default function Loading() {
  return (
    <div className="pt-1 animate-fade-up">
      {/* Podium top 3 */}
      <div className="flex items-end justify-center gap-3 mb-6 h-[120px]">
        <div className="w-[90px] h-[80px] rounded-[14px] bg-[var(--gl2)] animate-pulse" />
        <div className="w-[90px] h-[110px] rounded-[14px] bg-[var(--gl2)] animate-pulse" />
        <div className="w-[90px] h-[70px] rounded-[14px] bg-[var(--gl2)] animate-pulse" />
      </div>

      {/* Rank rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass rounded-[14px] p-4 mb-2.5 flex items-center gap-3 animate-pulse">
          <div className="w-7 h-7 rounded-full bg-[var(--gl2)] shrink-0" />
          <div className="w-8 h-8 rounded-full bg-[var(--gl2)] shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 w-20 rounded-full bg-[var(--gl2)] mb-1.5" />
            <div className="h-3 w-14 rounded-full bg-[var(--gl2)]" />
          </div>
          <div className="h-4 w-16 rounded-full bg-[var(--gl2)]" />
        </div>
      ))}
    </div>
  )
}
