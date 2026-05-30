"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string }
  reset: () => void
}>) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="pt-16 text-center px-6 animate-fade-up">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="font-[family-name:var(--fb)] text-base font-bold text-[var(--tx)] mb-2">
        Đã xảy ra lỗi
      </p>
      <p className="text-xs text-[var(--tx3)] font-[family-name:var(--fm)] mb-6">
        {error.message || "Không thể tải trang. Vui lòng thử lại."}
      </p>
      <button onClick={reset} className="btn-primary">
        Thử lại
      </button>
    </div>
  )
}
