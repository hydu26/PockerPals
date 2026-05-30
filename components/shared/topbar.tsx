"use client"

import ThemeToggle from "./theme-toggle"
import LoginButton from "./login-button"
import Link from "next/link"

export default function TopBar() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "26px 22px 20px",
        background: "transparent",
        gap: 10,
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Brand icon only */}
       <Link
        href="/"
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "linear-gradient(135deg, var(--ac), var(--ac3))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          boxShadow:
            "inset 0 1px 0 0 rgba(255,255,255,.3), 0 4px 14px var(--gw)",
          color: "#fff",
        }}
      >
        🃏
      </Link>

      {/* Right: theme toggle + login */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ThemeToggle />
        <LoginButton />
      </div>
    </header>
  )
}
