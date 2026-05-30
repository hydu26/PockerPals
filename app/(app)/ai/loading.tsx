export default function Loading() {
  return (
    <div className="pt-2 animate-fade-up flex flex-col h-[calc(100vh-180px)]">
      {/* Chat bubbles */}
      <div className="flex-1 flex flex-col gap-3 pb-4">
        {/* AI bubble */}
        <div className="flex gap-2.5 items-end max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-[var(--gl2)] shrink-0 animate-pulse" />
          <div className="glass rounded-[18px] rounded-bl-[6px] p-3.5 animate-pulse">
            <div className="h-3 w-48 rounded-full bg-[var(--gl2)] mb-2" />
            <div className="h-3 w-36 rounded-full bg-[var(--gl2)]" />
          </div>
        </div>

        {/* User bubble */}
        <div className="flex gap-2.5 items-end max-w-[85%] self-end">
          <div className="glass rounded-[18px] rounded-br-[6px] p-3.5 animate-pulse bg-[var(--gl2)]">
            <div className="h-3 w-32 rounded-full bg-[var(--gl2)]" />
          </div>
        </div>

        {/* AI bubble 2 */}
        <div className="flex gap-2.5 items-end max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-[var(--gl2)] shrink-0 animate-pulse" />
          <div className="glass rounded-[18px] rounded-bl-[6px] p-3.5 animate-pulse">
            <div className="h-3 w-52 rounded-full bg-[var(--gl2)] mb-2" />
            <div className="h-3 w-40 rounded-full bg-[var(--gl2)] mb-2" />
            <div className="h-3 w-28 rounded-full bg-[var(--gl2)]" />
          </div>
        </div>
      </div>

      {/* Input skeleton */}
      <div className="h-[52px] rounded-[22px] bg-[var(--gl2)] animate-pulse" />
    </div>
  )
}
