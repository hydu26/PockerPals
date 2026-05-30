import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  const { email, code } = (await req.json()) as {
    email: string
    code: string
  }
  const normalized = email?.trim().toLowerCase()
  const upperCode = code?.trim().toUpperCase()

  if (!normalized || !upperCode || upperCode.length !== 6) {
    return NextResponse.json({ error: "Thiếu thông tin" }, { status: 400 })
  }

  // Verify code
  const { data: record } = await supabaseAdmin
    .from("login_codes")
    .select("id")
    .eq("email", normalized)
    .eq("code", upperCode)
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  if (!record) {
    return NextResponse.json(
      { error: "Mã không đúng hoặc đã hết hạn" },
      { status: 401 }
    )
  }

  // Mark as used
  await supabaseAdmin
    .from("login_codes")
    .update({ used: true })
    .eq("id", record.id)

  // Generate a Supabase magic link token without sending email
  const { data: linkData, error: linkError } =
    await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: normalized,
    })

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error("[Auth] generateLink error:", linkError)
    return NextResponse.json(
      { error: "Lỗi tạo phiên đăng nhập" },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    token_hash: linkData.properties.hashed_token,
  })
}
