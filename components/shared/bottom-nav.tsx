"use client"

import { useRouter, usePathname } from "next/navigation"
import type { CSSProperties } from "react"
import { usePermissions } from "@/lib/hooks/use-permissions"

const BASE_ITEMS = [
  { icon: "🏠", label: "Nhóm",      href: "/" },
  { icon: "🤖", label: "Cộng Sự",   href: "/ai" },
  { icon: "📖", label: "Luật chơi", href: "/rules" },
]

const ADMIN_ITEM = { icon: "⚙️", label: "Admin", href: "/admin" }

export default function BottomNav() {
  const router      = useRouter()
  const pathname    = usePathname()
  const { isSuperAdmin } = usePermissions()

  const NAV_ITEMS = isSuperAdmin ? [...BASE_ITEMS, ADMIN_ITEM] : BASE_ITEMS

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  const navStyle: CSSProperties = {
    position: "fixed",
    bottom: 14,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 28px)",
    maxWidth: 402,
    background: "var(--gl)",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    border: "1px solid var(--gl-bd)",
    borderRadius: 30,
    display: "flex",
    zIndex: 50,
    padding: 6,
    gap: 3,
    boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 12px 36px var(--gl-sh)",
  }

  return (
    <nav style={navStyle}>
      {NAV_ITEMS.map(({ icon, label, href }) => {
        const active = isActive(href)
        const btnStyle: CSSProperties = {
          flex: 1,
          padding: "11px 6px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          border: "none",
          borderRadius: 24,
          cursor: "pointer",
          fontFamily: "var(--fb)",
          transition: "all var(--dur-f)",
          background: active ? "linear-gradient(135deg, var(--ac), var(--ac3))" : "transparent",
          color: active ? "#fff" : "var(--tx3)",
          boxShadow: active ? "inset 0 1px 0 0 rgba(255,255,255,.3), 0 4px 14px var(--gw)" : "none",
        }
        return (
          <button key={href} onClick={() => router.push(href)} style={btnStyle}>
            <span style={{ fontSize: 20, lineHeight: 1, transition: "transform var(--dur-f)", transform: active ? "scale(1.12)" : "scale(1)" }}>
              {icon}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: -0.1, lineHeight: 1 }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
