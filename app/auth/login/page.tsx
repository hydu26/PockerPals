"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

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

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authError = searchParams.get("error") === "auth"
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [forgotMode, setForgotMode]   = useState(false)
  const [resetSent, setResetSent]     = useState(false)

  /* ── Sign in ── */
  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !password) return
    setLoading(true)
    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      })
      if (error) {
        toast.error("Email hoặc mật khẩu không đúng")
        return
      }

      // Admin check: app_metadata.role phải là 'admin' hoặc 'leader'
      // Nếu không có role, kiểm tra thêm group_admins (fallback cho leader chưa có role)
      const userEmail = data.user.email?.toLowerCase() ?? ""
      const metaRole = data.user.app_metadata?.role as string | undefined

      if (metaRole !== "admin" && metaRole !== "leader") {
        const { data: adminRow } = await supabase
          .from("group_admins")
          .select("email")
          .eq("email", userEmail)
          .limit(1)
          .maybeSingle()

        if (!adminRow) {
          await supabase.auth.signOut()
          toast.error("Tài khoản không có quyền admin")
          return
        }
      }

      toast.success("Đăng nhập thành công!")
      router.push("/")
      router.refresh()
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setLoading(false)
    }
  }

  /* ── Forgot password ── */
  const handleForgotPassword = async () => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) { toast.error("Nhập email trước"); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })
      if (error) { toast.error("Lỗi: " + error.message); return }
      setResetSent(true)
    } catch {
      toast.error("Lỗi kết nối")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px 22px", position: "relative", zIndex: 1,
    }}>
      {/* Brand */}
      <Link href="/" style={{
        width: 52, height: 52, borderRadius: 16,
        background: "linear-gradient(135deg,var(--ac),var(--ac3))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26,
        boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
        marginBottom: 32,
      }}>🃏</Link>

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
        <div style={{
          width: 44, height: 5, background: "var(--gl-bd)",
          borderRadius: 3, margin: "0 auto 24px",
        }} />

        {authError && (
          <div style={{
            background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.3)",
            borderRadius: 12, padding: "12px 14px", marginBottom: 20,
            fontSize: 13, color: "var(--lose)", lineHeight: 1.55, fontFamily: "var(--fm)",
          }}>
            ⚠️ Link đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập hoặc nhờ admin gửi lại lời mời.
          </div>
        )}

        {/* ── Forgot password sent ── */}
        {resetSent ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📨</div>
              <h1 style={{ fontFamily: "var(--fb)", fontSize: 20, fontWeight: 700, color: "var(--tx)", marginBottom: 8 }}>
                Kiểm tra email
              </h1>
              <p style={{ fontSize: 13, color: "var(--tx3)", lineHeight: 1.65, fontFamily: "var(--fm)" }}>
                Đã gửi link đặt lại mật khẩu đến{" "}
                <span style={{ color: "var(--ac)" }}>{email}</span>.
                <br />Kiểm tra cả mục Spam.
              </p>
            </div>
            <button
              onClick={() => { setResetSent(false); setForgotMode(false) }}
              style={{
                width: "100%", padding: "13px", border: "1px solid var(--gl-bd)",
                borderRadius: 22, background: "var(--gl)", color: "var(--tx2)",
                fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700, cursor: "pointer",
              }}
            >
              ← Quay lại đăng nhập
            </button>
          </>

        /* ── Forgot password form ── */
        ) : forgotMode ? (
          <>
            <h1 style={{ fontFamily: "var(--fb)", fontSize: 22, fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>
              Quên mật khẩu
            </h1>
            <p style={{ fontSize: 13, color: "var(--tx3)", marginBottom: 20, lineHeight: 1.6 }}>
              Nhập email admin — link đặt lại mật khẩu sẽ được gửi.
            </p>

            <label htmlFor="forgot-email" style={labelStyle}>Email</label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
              placeholder="ten@example.com"
              autoFocus
              style={{ ...inputStyle, marginBottom: 16 }}
            />

            <button
              onClick={handleForgotPassword}
              disabled={loading || !email.trim()}
              style={{
                width: "100%", padding: "14px", border: "none", borderRadius: 22,
                background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                color: "white", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
                cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                opacity: loading || !email.trim() ? 0.6 : 1,
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
                marginBottom: 10,
              }}
            >
              {loading ? "Đang gửi…" : "Gửi link đặt lại 📨"}
            </button>

            <button
              onClick={() => setForgotMode(false)}
              style={{
                width: "100%", padding: "11px", border: "1px solid var(--gl-bd)",
                borderRadius: 22, background: "var(--gl)", color: "var(--tx2)",
                fontFamily: "var(--fb)", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              ← Quay lại
            </button>
          </>

        /* ── Login form ── */
        ) : (
          <>
            <h1 style={{ fontFamily: "var(--fb)", fontSize: 22, fontWeight: 700, marginBottom: 6, color: "var(--tx)" }}>
              Đăng nhập
            </h1>
            <p style={{ fontSize: 13, color: "var(--tx3)", marginBottom: 20, lineHeight: 1.6 }}>
              Dành cho admin nhóm. Người xem không cần đăng nhập.
            </p>

            {/* Email */}
            <label htmlFor="login-email" style={labelStyle}>Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="ten@example.com"
              autoFocus
              style={{ ...inputStyle, marginBottom: 14 }}
            />

            {/* Password */}
            <label htmlFor="login-pwd" style={labelStyle}>Mật khẩu</label>
            <div style={{ position: "relative", marginBottom: 6 }}>
              <input
                id="login-pwd"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
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

            {/* Forgot password link */}
            <div style={{ textAlign: "right", marginBottom: 18 }}>
              <button
                type="button"
                onClick={() => setForgotMode(true)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)",
                  padding: 0,
                }}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading || !email.trim() || !password}
              style={{
                width: "100%", padding: "14px", border: "none", borderRadius: 22,
                background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                color: "white", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
                cursor: loading || !email.trim() || !password ? "not-allowed" : "pointer",
                opacity: loading || !email.trim() || !password ? 0.6 : 1,
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
                transition: "all var(--dur-f)",
              }}
            >
              {loading ? "Đang xác thực…" : "Đăng nhập →"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
