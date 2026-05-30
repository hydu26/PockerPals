export default function Loading() {
  return (
    <div className="pt-4 animate-fade-up">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="h-3 w-28 rounded-full bg-[var(--gl2)] animate-pulse" />
        <div className="h-8 w-24 rounded-[30px] bg-[var(--gl2)] animate-pulse" />
      </div>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-[22px] p-[22px] mb-3.5 animate-pulse">
          <div className="h-5 w-3/4 rounded-full bg-[var(--gl2)] mb-3" />
          <div className="flex gap-1.5">
            <div className="h-6 w-20 rounded-[20px] bg-[var(--gl2)]" />
            <div className="h-6 w-20 rounded-[20px] bg-[var(--gl2)]" />
          </div>
        </div>
      ))}
    </div>
  )
}
