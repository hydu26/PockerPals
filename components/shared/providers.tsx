"use client"

import { useEffect, useRef } from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { useAuthStore } from "@/lib/stores/auth-store"

function AuthInitializer() {
  const init = useAuthStore((s) => s.init)
  const ran = useRef(false)
  useEffect(() => {
    if (!ran.current) {
      ran.current = true
      init()
    }
  }, [init])
  return null
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      themes={["dark", "light"]}
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthInitializer />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "var(--gl)",
              backdropFilter: "blur(30px) saturate(180%)",
              border: "1px solid var(--ac)",
              color: "var(--tx)",
              fontFamily: "var(--fb)",
              fontWeight: 600,
              fontSize: "14px",
              borderRadius: "30px",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
