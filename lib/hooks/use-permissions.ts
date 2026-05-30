"use client"

import { useAuthStore } from "@/lib/stores/auth-store"

const SUPER_ADMIN = "corneille261998@gmail.com"

export function usePermissions() {
  const { user } = useAuthStore()
  const email = user?.email ?? null
  const isSuperAdmin = email === SUPER_ADMIN

  return {
    email,
    isSuperAdmin,
    isGroupAdmin: (adminEmails: string[]) =>
      !!email && (isSuperAdmin || adminEmails.includes(email)),
    canEdit: (adminEmails: string[]) =>
      !!email && (isSuperAdmin || adminEmails.includes(email)),
    canDelete: () => isSuperAdmin,
  }
}
