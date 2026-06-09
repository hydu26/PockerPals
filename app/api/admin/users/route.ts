import { supabaseAdmin, supabaseEmailSender } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== "admin") return null
  return user
}

export async function GET() {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 500 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      role: (u.app_metadata?.role ?? null) as "admin" | "leader" | null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    })),
  })
}

export async function POST(req: Request) {
  if (!await requireSuperAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { email, role } = (await req.json()) as { email: string; role: "admin" | "leader" }

  if (!email?.includes("@")) return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 })
  if (!["admin", "leader"].includes(role)) return NextResponse.json({ error: "Role không hợp lệ" }, { status: 400 })

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    email_confirm: true,
    app_metadata: { role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseEmailSender.auth.resetPasswordForEmail(data.user.email ?? "", {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback?next=/auth/update-password`,
  })

  return NextResponse.json({ id: data.user.id, email: data.user.email })
}
