"use client"

import { useTheme } from "next-themes"
import ThemeToggle from "./theme-toggle"
import LoginButton from "./login-button"
import Link from "next/link"
import Image from "next/image"

export default function TopBar() {
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === "light" ? "/logo/logo_light.webp" : "/logo/logo_dark.webp"

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
      >
        <Image
          src={logoSrc}
          alt="Logo" width={44} height={44} style={{ objectFit: "contain" }}
        />
      </Link>

      {/* Right: theme toggle + login */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ThemeToggle />
        <LoginButton />
      </div>
    </header>
  )
}
