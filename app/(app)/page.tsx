"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { useGroups } from "@/lib/hooks/use-groups"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { useGroupAccess } from "@/lib/hooks/use-group-access"
import GroupCard from "@/components/groups/group-card"
import PasswordModal from "@/components/shared/password-modal"
import type { GroupWithMeta } from "@/lib/types/app"

function LockedModal({
  group,
  onClose,
}: Readonly<{ group: GroupWithMeta; onClose: () => void }>) {
  const router = useRouter()
  const { verify } = useGroupAccess(group.id, true, false)
  return (
    <PasswordModal
      onVerify={async (pwd) => {
        const ok = await verify(pwd)
        if (ok) router.push(`/groups/${group.id}`)
        return ok
      }}
      onClose={onClose}
    />
  )
}

function GroupCardRow({
  group,
  isMine,
  onLockedClick,
}: Readonly<{
  group: GroupWithMeta
  isMine: boolean
  onLockedClick: (g: GroupWithMeta) => void
}>) {
  const hasPwd = !!group.password_hash
  const { hasAccess } = useGroupAccess(group.id, hasPwd, isMine)
  const router = useRouter()

  return (
    <GroupCard
      group={group}
      isMine={isMine}
      hasAccess={hasAccess}
      onClick={() => {
        if (!hasPwd || hasAccess) router.push(`/groups/${group.id}`)
        else onLockedClick(group)
      }}
    />
  )
}

export default function HomePage() {
  const { data: groups, isLoading, error } = useGroups()
  const { isGroupAdmin, isSuperAdmin } = usePermissions()
  const [lockedGroup, setLockedGroup] = useState<GroupWithMeta | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const sorted = [...(groups ?? [])].sort((a, b) => {
    const aMine = isGroupAdmin(a.admin_emails)
    const bMine = isGroupAdmin(b.admin_emails)
    if (aMine && !bMine) return -1
    if (!aMine && bMine) return 1
    return (b.last_session ?? "").localeCompare(a.last_session ?? "")
  })

  const filtered = searchOpen && searchQuery.trim()
    ? sorted.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : sorted

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchRef.current?.focus(), 50)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchQuery("")
  }

  const iconBtnStyle: React.CSSProperties = {
    width: 34, height: 34, borderRadius: 12, flexShrink: 0,
    border: "1px solid var(--gl-bd)", background: "var(--gl)",
    color: "var(--tx2)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
    transition: "all var(--dur-f)",
  }

  return (
    <div className="animate-fade-up pt-4">
      {/* Header */}
      {searchOpen ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, animation: "fadeIn .18s ease" }}>
          {/* Expanded search input */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            background: "var(--gl)", border: "1.5px solid var(--ac)",
            borderRadius: 22, padding: "7px 14px",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 0 0 3px color-mix(in srgb, var(--ac) 15%, transparent)",
          }}>
            <Search size={13} color="var(--ac)" style={{ flexShrink: 0 }} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Escape" && closeSearch()}
              placeholder="Tìm tên nhóm…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "var(--tx)", fontFamily: "var(--fb)", fontSize: 14, fontWeight: 600,
                minWidth: 0,
              }}
            />
          </div>
          {/* Close button */}
          <button onClick={closeSearch} style={iconBtnStyle} aria-label="Đóng tìm kiếm">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <p className="label-caps" style={{ flex: 1 }}>Nhóm của bạn</p>
          {/* Search icon */}
          <button onClick={openSearch} style={iconBtnStyle} aria-label="Tìm kiếm">
            <Search size={14} />
          </button>
          {/* Tạo nhóm — super admin only */}
          {isSuperAdmin && (
            <button onClick={() => router.push("/groups/new")} className="btn-outline-accent">
              + Tạo nhóm
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--tx3)" }}>
          <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.5 }}>🃏</div>
          <p style={{ fontSize: 13, fontFamily: "var(--fm)" }}>Đang tải…</p>
        </div>
      )}

      {error && (
        <div style={{
          padding: "14px 16px", borderRadius: 14,
          background: "color-mix(in srgb, var(--lose) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--lose) 30%, transparent)",
          color: "var(--lose)", fontSize: 13, fontWeight: 600,
        }}>
          Không tải được danh sách nhóm. Thử lại sau.
        </div>
      )}

      {!isLoading && !error && sorted.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 22px", color: "var(--tx3)" }}>
          <div style={{ fontSize: 46, marginBottom: 12, opacity: 0.6 }}>🃏</div>
          <p style={{ fontSize: 14, fontFamily: "var(--fm)" }}>Chưa có nhóm nào</p>
          {isSuperAdmin && <p style={{ fontSize: 12, marginTop: 6 }}>Nhấn &quot;+ Tạo nhóm&quot; để bắt đầu</p>}
        </div>
      )}

      {/* No search results */}
      {searchOpen && !isLoading && filtered.length === 0 && sorted.length > 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--tx3)" }}>
          <div style={{ fontSize: 28, opacity: .5, marginBottom: 8 }}>🔍</div>
          <p style={{ fontSize: 13, fontFamily: "var(--fm)" }}>Không tìm thấy &ldquo;{searchQuery}&rdquo;</p>
        </div>
      )}

      <div className="flex flex-col gap-[10px]">
        {filtered.map((group) => (
          <GroupCardRow
            key={group.id}
            group={group}
            isMine={isGroupAdmin(group.admin_emails)}
            onLockedClick={setLockedGroup}
          />
        ))}
      </div>

      {lockedGroup && (
        <LockedModal group={lockedGroup} onClose={() => setLockedGroup(null)} />
      )}
    </div>
  )
}
