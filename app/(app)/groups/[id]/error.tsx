"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="pt-16 text-center px-6 animate-fade-up">
      <div className="text-5xl mb-4">🃏</div>
      <p className="font-[family-name:var(--fb)] text-base font-bold text-[var(--tx)] mb-2">
        Không tải được nhóm
      </p>
      <p className="text-xs text-[var(--tx3)] font-[family-name:var(--fm)] mb-6">
        {error.message || "Kiểm tra kết nối và thử lại."}
      </p>
      <div className="flex gap-2.5 justify-center">
        <button onClick={() => router.push("/")} className="btn-ghost !py-3 !px-5 !text-sm">
          ← Về trang chủ
        </button>
        <button onClick={reset} className="btn-primary !py-3 !px-5 !text-sm">
          Thử lại
        </button>
      </div>
    </div>
  )
}
