export default function Loading() {
  return (
    <div className="pt-2 animate-fade-up">
      {/* Tab bar skeleton */}
      <div className="flex gap-1 mb-5 glass-sm rounded-[14px] p-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-1 h-8 rounded-[10px] bg-[var(--gl2)] animate-pulse" />
        ))}
      </div>

      {/* Member rows skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass rounded-[14px] p-4 mb-2.5 flex items-center gap-3 animate-pulse">
          <div className="w-9 h-9 rounded-full bg-[var(--gl2)] shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 w-24 rounded-full bg-[var(--gl2)] mb-2" />
            <div className="h-3 w-16 rounded-full bg-[var(--gl2)]" />
          </div>
          <div className="h-8 w-24 rounded-[10px] bg-[var(--gl2)]" />
        </div>
      ))}
    </div>
  )
}
