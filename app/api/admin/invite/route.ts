import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

type InviteResult =
  | { email: string; status: "invited" }
  | { email: string; status: "exists" }
  | { email: string; status: "error"; message: string }

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { emails } = (await request.json()) as { emails: string[] }
  if (!Array.isArray(emails) || emails.length === 0) {
    return NextResponse.json({ results: [] })
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const redirectTo = `${siteUrl}/auth/callback?next=/auth/update-password`

  const results: InviteResult[] = []

  for (const email of emails) {
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo })
    console.log("[invite]", email, "data:", data?.user?.id ?? null, "error:", error?.message ?? null)
    if (!error && data?.user) {
      results.push({ email, status: "invited" })
    } else if (error?.message.toLowerCase().includes("already")) {
      results.push({ email, status: "exists" })
    } else {
      results.push({ email, status: "error", message: error?.message ?? "no user returned" })
    }
  }

  return NextResponse.json({ results })
}
