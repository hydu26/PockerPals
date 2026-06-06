"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import type { CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth-store"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { cn } from "@/lib/utils/cn"

export default function LoginButton() {
  const { user, loading, signOut } = useAuthStore()
  const { isSuperAdmin } = usePermissions()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    if (user) setOpen(true)
    else router.push("/auth/login")
  }

  const handleSignOut = () => {
    setOpen(false)
    signOut()
  }

  if (loading) return <div className="w-[38px] h-[38px]" />

  const roleLabel = isSuperAdmin ? "👑 Super Admin" : "⭐ Group Admin"
  const roleStyle: CSSProperties = isSuperAdmin
    ? { background: "linear-gradient(135deg,#ffd700,#ff8a00)", color: "#1a0900", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3),0 2px 8px rgba(255,180,40,.4)" }
    : { background: "linear-gradient(135deg,var(--ac),var(--ac3))", color: "#fff", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3),0 2px 8px var(--gw)" }

  return (
    <>
      <button
        onClick={handleClick}
        title={user ? `${user.email}` : "Đăng nhập"}
        className={cn(
          "icon-btn",
          isSuperAdmin ? "icon-btn-admin" : user ? "icon-btn-user" : "icon-btn-gl"
        )}
      >
        {user ? isSuperAdmin ? "👑" : "⭐" : "🔐"}
      </button>

      {open && createPortal(
        <div
          onClick={() => setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
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
          {/* Centered dialog */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--gl)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid var(--gl-bd)",
              borderRadius: 28,
              padding: "30px 24px",
              width: "calc(100% - 28px)",
              maxWidth: 402,
              boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 24px 60px var(--gl-sh)",
              textAlign: "center",
              animation: "dialogIn .35s cubic-bezier(.34,1.56,.64,1)",
            }}
          >
            {/* Avatar */}
            <div style={{ fontSize: 46, marginBottom: 14 }}>
              {isSuperAdmin ? "👑" : "⭐"}
            </div>

            {/* Email */}
            <div style={{
              fontFamily: "var(--fb)", fontSize: 18, fontWeight: 700,
              marginBottom: 10, letterSpacing: -0.3, color: "var(--tx)",
              overflowWrap: "break-word",
            }}>
              {user?.email}
            </div>

            {/* Role badge */}
            <div style={{ marginBottom: 24 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "6px 13px", borderRadius: 14,
                fontSize: 12, fontWeight: 700, letterSpacing: 0.3, lineHeight: 1,
                ...roleStyle,
              }}>
                {roleLabel}
              </span>
            </div>

            {/* Buttons */}
            <button
              type="button"
              onClick={() => { setOpen(false); router.push("/auth/update-password") }}
              className="btn-ghost"
              style={{ width: "100%", padding: 13, borderRadius: "var(--r)", fontSize: 14, marginBottom: 8 }}
            >
              🔑 Đổi mật khẩu
            </button>
            <div style={{ display: "flex", gap: 9 }}>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost"
                style={{ flex: 1, padding: 14, borderRadius: "var(--r)", fontSize: 15 }}
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  flex: 2, padding: 14, border: "none", borderRadius: "var(--r)",
                  background: "linear-gradient(135deg,#dc2626,var(--lose))",
                  color: "white", fontFamily: "var(--fb)", fontSize: 15, fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3),0 6px 20px rgba(220,38,38,.4)",
                }}
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  )
}
