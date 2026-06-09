import { supabaseAdmin, supabaseEmailSender } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== "admin") return null
  return user
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const { data: { user }, error: fetchErr } = await supabaseAdmin.auth.admin.getUserById(id)
  if (fetchErr || !user?.email) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })

  const { error } = await supabaseEmailSender.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/auth/update-password`,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
