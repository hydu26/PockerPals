export default function Loading() {
  return (
    <div className="pt-1 animate-fade-up">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass rounded-[14px] p-4 mb-2.5 flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-[var(--gl2)] shrink-0" />
          <div className="flex-1">
            <div className="h-3.5 w-24 rounded-full bg-[var(--gl2)] mb-2" />
            <div className="h-3 w-14 rounded-full bg-[var(--gl2)]" />
          </div>
          <div className="w-7 h-7 rounded-[10px] bg-[var(--gl2)]" />
        </div>
      ))}
    </div>
  )
}
