export default function Loading() {
  return (
    <div className="pt-1 animate-fade-up flex flex-col gap-4">
      {/* Section header */}
      <div className="h-3 w-28 rounded-full bg-[var(--gl2)] animate-pulse" />

      {/* Settings cards */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass rounded-[22px] p-5 animate-pulse">
          <div className="h-3.5 w-32 rounded-full bg-[var(--gl2)] mb-4" />
          <div className="h-11 rounded-[14px] bg-[var(--gl2)] mb-3" />
          <div className="h-11 rounded-[14px] bg-[var(--gl2)]" />
        </div>
      ))}
    </div>
  )
}
