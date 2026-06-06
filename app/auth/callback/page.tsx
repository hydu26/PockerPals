"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

function AuthCallbackInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/"

    async function handle() {
      // PKCE flow: password reset, email confirmation → code in query param
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) { router.replace(next); return }
      }

      // Implicit flow: invite link → tokens in hash fragment (#access_token=...&refresh_token=...)
      const hash = globalThis.location.hash
      if (hash) {
        const params = new URLSearchParams(hash.slice(1))
        const accessToken = params.get("access_token")
        const refreshToken = params.get("refresh_token")
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (!error) { router.replace(next); return }
        }
      }

      router.replace("/auth/login?error=auth")
    }

    handle()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontSize: 32, opacity: 0.4, animation: "pulse 1.5s ease infinite" }}>🃏</div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackInner />
    </Suspense>
  )
}
