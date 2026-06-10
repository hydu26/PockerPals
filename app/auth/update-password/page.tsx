"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--gl2)",
  border: "1.5px solid var(--gl-bd)",
  borderRadius: 14,
  padding: "13px 15px",
  color: "var(--tx)",
  fontFamily: "var(--fb)",
  fontSize: 15,
  outline: "none",
  boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
  transition: "border-color var(--dur-f)",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1.2px",
  color: "var(--tx3)",
  marginBottom: 8,
}

export default function UpdatePasswordPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === "light" ? "/logo/logo_light.webp" : "/logo/logo_dark.webp"

  const [password, setPassword]     = useState("")
  const [confirm, setConfirm]       = useState("")
  const [showPwd, setShowPwd]       = useState(false)
  const [showCfm, setShowCfm]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [ready, setReady]           = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth/login")
      } else {
        setReady(true)
      }
    })
  }, [router])

  const handleUpdate = async () => {
    if (password.length < 8) {
      toast.error("Mật khẩu phải ít nhất 8 ký tự")
      return
    }
    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error("Lỗi: " + error.message)
        return
      }
      toast.success("Đã đổi mật khẩu thành công!")
      router.push("/")
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setLoading(false)
    }
  }

  if (!ready) return null

  const pwdMatch   = confirm.length > 0 && password === confirm
  const pwdNoMatch = confirm.length > 0 && password !== confirm

 
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 22px", position: "relative", zIndex: 1,
    }}>
      {/* Brand icon */}
      <Link
        href="/"
        style={{
          marginBottom: 24,
        }}
      >
        <Image
          src={logoSrc}
          alt="Logo" width={64} height={64} style={{ objectFit: "contain" }}
        />
      </Link>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 390,
        background: "var(--gl)",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        border: "1px solid var(--gl-bd)", borderRadius: 28,
        padding: "30px 24px 36px",
        boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 20px 60px var(--gl-sh)",
        animation: "fadeUp .45s cubic-bezier(.16,1,.3,1) both",
      }}>
        <div style={{ width: 44, height: 5, background: "var(--gl-bd)", borderRadius: 3, margin: "0 auto 24px" }} />

        <h1 style={{ fontFamily: "var(--fb)", fontSize: 22, fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>
          Đặt mật khẩu mới
        </h1>
        <p style={{ fontSize: 13, color: "var(--tx3)", marginBottom: 24, lineHeight: 1.6 }}>
          Mật khẩu phải ít nhất 8 ký tự.
        </p>

        {/* New password */}
        <label htmlFor="new-pwd" style={labelStyle}>Mật khẩu mới</label>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            id="new-pwd"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            style={{ ...inputStyle, paddingRight: 44 }}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{
              position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--tx3)", padding: 4, display: "flex",
            }}
            tabIndex={-1}
            aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Confirm password */}
        <label htmlFor="cfm-pwd" style={labelStyle}>Xác nhận mật khẩu</label>
        <div style={{ position: "relative", marginBottom: 6 }}>
          <input
            id="cfm-pwd"
            type={showCfm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
            placeholder="••••••••"
            style={{
              ...inputStyle, paddingRight: 44,
              borderColor: pwdNoMatch ? "var(--lose)" : pwdMatch ? "var(--win)" : undefined,
            }}
          />
          <button
            type="button"
            onClick={() => setShowCfm((v) => !v)}
            style={{
              position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "var(--tx3)", padding: 4, display: "flex",
            }}
            tabIndex={-1}
            aria-label={showCfm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Feedback */}
        <div style={{ height: 20, marginBottom: 14, fontSize: 12, fontFamily: "var(--fm)" }}>
          {pwdNoMatch && <span style={{ color: "var(--lose)" }}>Mật khẩu không khớp</span>}
          {pwdMatch   && <span style={{ color: "var(--win)" }}>✓ Khớp</span>}
        </div>

        <button
          onClick={handleUpdate}
          disabled={loading || !password || !confirm || pwdNoMatch}
          style={{
            width: "100%", padding: "14px", border: "none", borderRadius: 22,
            background: "linear-gradient(135deg,var(--ac),var(--ac3))",
            color: "white", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
            cursor: loading || !password || !confirm || pwdNoMatch ? "not-allowed" : "pointer",
            opacity: loading || !password || !confirm || pwdNoMatch ? 0.6 : 1,
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
            transition: "all var(--dur-f)",
          }}
        >
          {loading ? "Đang lưu…" : "✓ Đặt mật khẩu"}
        </button>
      </div>
    </div>
  )
}
