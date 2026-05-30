"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { cn } from "@/lib/utils/cn"

interface PasswordModalProps {
  onVerify: (password: string) => Promise<boolean>
  onClose: () => void
}

export default function PasswordModal({ onVerify, onClose }: Readonly<PasswordModalProps>) {
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const handleSubmit = async () => {
    if (!value) return
    setLoading(true)
    setError(false)
    const ok = await onVerify(value)
    setLoading(false)
    if (ok) {
      toast.success("Đã mở khoá nhóm!")
      onClose()
    } else {
      setError(true)
      setValue("")
      inputRef.current?.focus()
    }
  }

  return createPortal(
    <div
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn .25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--gl)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid var(--gl-bd)",
          borderRadius: 28,
          padding: "28px 24px",
          width: "calc(100% - 28px)",
          maxWidth: 402,
          boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 24px 60px var(--gl-sh)",
          animation: "dialogIn .35s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, lineHeight: 1, marginBottom: 10 }}>🔒</div>
          <div style={{
            fontFamily: "var(--fb)", fontSize: 19, fontWeight: 700,
            letterSpacing: -0.3, color: "var(--tx)",
          }}>
            Nhóm có mật khẩu
          </div>
        </div>

        {/* Input */}
        <label className="label-caps" style={{ display: "block", marginBottom: 8 }}>
          Mật khẩu
        </label>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false) }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Nhập mật khẩu nhóm…"
          className={cn("field-input", error && "field-input-error")}
        />
        {error && (
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--lose)", fontFamily: "var(--fm)" }}>
            ⚠ Mật khẩu không đúng, thử lại
          </p>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 9, marginTop: 20 }}>
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !value}
            className="btn-primary flex-[2]"
          >
            {loading ? "Đang xác nhận…" : "Xác nhận ✓"}
          </button>
        </div>
      </div>
    </div>
  , document.body)
}
