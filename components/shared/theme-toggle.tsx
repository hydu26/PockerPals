"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <div style={{ width: 94, height: 46 }} />

  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        padding: 4,
        background: "var(--gl)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--gl-bd)",
        borderRadius: 30,
        boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 14px var(--gl-sh)",
      }}
    >
      {(["dark", "light"] as const).map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          style={{
            minWidth: 38,
            padding: "7px 11px",
            borderRadius: 24,
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "var(--fb)",
            transition: "all var(--dur-f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
            background: theme === t
              ? "linear-gradient(135deg, var(--ac), var(--ac3))"
              : "transparent",
            color: theme === t ? "#fff" : "var(--tx2)",
            boxShadow: theme === t
              ? "inset 0 1px 0 0 rgba(255,255,255,.3), 0 3px 12px var(--gw)"
              : "none",
          }}
          aria-label={t === "dark" ? "Tối" : "Sáng"}
        >
          {t === "dark" ? "♠" : "♥"}
        </button>
      ))}
    </div>
  )
}
