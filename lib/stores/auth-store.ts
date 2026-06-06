"use client"

import { create } from "zustand"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

export type UserRole = "admin" | "leader" | null

type AuthStore = {
  user: User | null
  role: UserRole
  loading: boolean
  init: () => void
  signOut: () => Promise<void>
}

function resolveRole(user: User | null): UserRole {
  if (!user) return null
  const r = user.app_metadata?.role
  if (r === "admin") return "admin"
  if (r === "leader") return "leader"
  return null
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  role: null,
  loading: true,

  init: () => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      set({ user, role: resolveRole(user), loading: false })
    })

    supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      set({ user: u, role: resolveRole(u) })
    })
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, role: null })
  },
}))
