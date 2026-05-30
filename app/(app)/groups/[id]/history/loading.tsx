export default function Loading() {
  return (
    <div className="pt-1 animate-fade-up">
      {/* Stats bar */}
      <div className="h-[52px] rounded-[14px] bg-[var(--gl2)] animate-pulse mb-4" />

      {/* Session cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-[14px] p-4 mb-3 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-3.5 w-24 rounded-full bg-[var(--gl2)]" />
            <div className="h-3 w-16 rounded-full bg-[var(--gl2)]" />
          </div>
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[var(--gl2)] shrink-0" />
                <div className="h-3 w-20 rounded-full bg-[var(--gl2)] flex-1" />
                <div className="h-3.5 w-14 rounded-full bg-[var(--gl2)]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
