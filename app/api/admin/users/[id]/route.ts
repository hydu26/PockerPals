import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== "admin") return null
  return user
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireSuperAdmin()
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  if (id === caller.id) return NextResponse.json({ error: "Không thể xoá chính mình" }, { status: 400 })

  const { data: { user }, error: fetchErr } = await supabaseAdmin.auth.admin.getUserById(id)
  if (fetchErr || !user) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 })

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (user.email) {
    const supabase = await createClient()
    await supabase.from("group_admins").delete().eq("email", user.email)
  }

  return NextResponse.json({ ok: true })
}
