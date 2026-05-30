"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useParams } from "next/navigation"
import { useGroup } from "@/lib/hooks/use-groups"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { useGroupAccess } from "@/lib/hooks/use-group-access"
import { useAuthStore } from "@/lib/stores/auth-store"
import PasswordModal from "@/components/shared/password-modal"
import SettingsModal from "@/components/groups/settings-modal"

const TABS = [
  { label: "Nhập",       icon: "📝", href: "" },
  { label: "Lịch sử",   icon: "📋", href: "/history" },
  { label: "Xếp hạng",  icon: "🏆", href: "/rank" },
  { label: "Thành viên", icon: "👥", href: "/members" },
] as const

const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 11,
  border: "1px solid var(--gl-bd)", background: "var(--gl)",
  backdropFilter: "blur(20px) saturate(180%)",
  cursor: "pointer", display: "flex", alignItems: "center",
  justifyContent: "center", fontSize: 15, color: "var(--tx)",
  boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
  transition: "all var(--dur-f)",
}

export default function GroupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { id } = useParams<{ id: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const { data: group, isLoading } = useGroup(id)
  const { isGroupAdmin } = usePermissions()
  const { user } = useAuthStore()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const isAdmin = group ? isGroupAdmin(group.admin_emails) : false
  const hasPwd = !!group?.password_hash
  const { hasAccess, checking, verify } = useGroupAccess(id, hasPwd, isAdmin)

  const base = `/groups/${id}`
  const activeHref = TABS.find((t) => pathname === base + t.href)?.href ?? ""

  // Redirect non-admins away from the score-entry tab (direct URL access)
  useEffect(() => {
    if (!isLoading && !checking && group && !isAdmin && pathname === base) {
      router.replace(base + "/history")
    }
  }, [isLoading, checking, group, isAdmin, pathname, base, router])

  // Hide the "Nhập" score-entry tab for regular users
  const visibleTabs = TABS.filter((t) => isAdmin || t.href !== "")

  // Keep showing loader while a tab redirect is pending to avoid content flash
  const pendingRedirect = !isLoading && !checking && !!group && !isAdmin && pathname === base

  if (isLoading || checking || pendingRedirect) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--tx3)" }}>
        <div style={{ fontSize: 28, opacity: .5 }}>🃏</div>
        <p style={{ fontSize: 13, fontFamily: "var(--fm)", marginTop: 10 }}>Đang tải…</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: "var(--tx3)" }}>
        <p style={{ fontSize: 14 }}>Không tìm thấy nhóm</p>
      </div>
    )
  }

  if (hasPwd && !hasAccess) {
    return (
      <PasswordModal
        onVerify={verify}
        onClose={() => router.push("/")}
      />
    )
  }

  return (
    <div style={{ animation: "fadeUp .45s cubic-bezier(.16,1,.3,1) both" }}>
      {/* Back + group name + action buttons */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
          <button
            onClick={() => router.push("/")}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 14, fontWeight: 600, color: "var(--tx2)",
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 0 4px", fontFamily: "var(--fb)",
              transition: "color var(--dur-f)",
            }}
          >
            ← Trang chủ
          </button>

          {isAdmin && (
            <button
              onClick={() => setSettingsOpen(true)}
              style={{ ...iconBtn, marginTop: 4 }}
              title="Cài đặt"
            >
              ⚙️
            </button>
          )}
        </div>

        <h1 style={{
          fontFamily: "var(--fb)", fontSize: 22, fontWeight: 700,
          letterSpacing: "-.4px", color: "var(--tx)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {group.name}
        </h1>
      </div>

      {/* Tab row */}
      <div style={{
        display: "flex", gap: 3,
        background: "var(--gl)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--gl-bd)",
        borderRadius: 18, padding: 6, marginBottom: 16,
        boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 4px 16px var(--gl-sh)",
      }}>
        {visibleTabs.map((tab) => {
          const active = activeHref === tab.href
          return (
            <button
              key={tab.href}
              onClick={() => router.push(base + tab.href)}
              style={{
                flex: 1, minWidth: 0,
                padding: "9px 4px",
                border: "none", borderRadius: 13,
                fontSize: 11, fontWeight: 700,
                fontFamily: "var(--fb)",
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 3, lineHeight: 1.2,
                transition: "all var(--dur-f)",
                background: active
                  ? "linear-gradient(135deg,var(--ac),var(--ac3))"
                  : "transparent",
                color: active ? "#fff" : "var(--tx2)",
                boxShadow: active
                  ? "inset 0 1px 0 0 rgba(255,255,255,.3), 0 3px 12px var(--gw)"
                  : "none",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {children}

      {settingsOpen && (
        <SettingsModal
          group={group}
          userEmail={user?.email ?? null}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  )
}
