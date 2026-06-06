"use client"

import { useAuthStore } from "@/lib/stores/auth-store"

export function usePermissions() {
  const { user, role } = useAuthStore()
  const email = user?.email?.toLowerCase() ?? null
  const isSuperAdmin = role === "admin"
  const isLeader     = role === "leader"

  return {
    email,
    role,
    isSuperAdmin,
    isLeader,
    isGroupAdmin: (adminEmails: string[]) =>
      !!email && (isSuperAdmin || adminEmails.map((e) => e.toLowerCase()).includes(email)),
    canEdit: (adminEmails: string[]) =>
      !!email && (isSuperAdmin || adminEmails.map((e) => e.toLowerCase()).includes(email)),
    canDelete: () => isSuperAdmin,
  }
}
