export default function Loading() {
  return (
    <div className="pt-2 animate-fade-up flex flex-col gap-4">
      <div className="h-3 w-36 rounded-full bg-[var(--gl2)] animate-pulse" />
      {[80, 60, 90, 50, 70].map((w, i) => (
        <div key={i} className="glass rounded-[18px] p-5 animate-pulse">
          <div className="h-4 w-28 rounded-full bg-[var(--gl2)] mb-3" />
          <div className={`h-3 w-[${w}%] rounded-full bg-[var(--gl2)] mb-2`} />
          <div className="h-3 w-3/4 rounded-full bg-[var(--gl2)]" />
        </div>
      ))}
    </div>
  )
}
