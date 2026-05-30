"use client"

import { create } from "zustand"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

const SUPER_ADMIN = "corneille261998@gmail.com"

type AuthStore = {
  user: User | null
  isSuperAdmin: boolean
  loading: boolean
  init: () => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isSuperAdmin: false,
  loading: true,

  init: () => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      set({
        user,
        isSuperAdmin: user?.email === SUPER_ADMIN,
        loading: false,
      })
    })

    supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null
      set({ user: u, isSuperAdmin: u?.email === SUPER_ADMIN })
    })
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, isSuperAdmin: false })
  },
}))
