import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

// Service role client — never exposed to browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { group_id, password } = await req.json()

    if (!group_id || typeof password !== "string") {
      return NextResponse.json({ error: "group_id và password là bắt buộc" }, { status: 400 })
    }

    const { data, error } = await supabase.rpc("check_group_password", {
      p_group_id: group_id,
      p_password: password,
    })

    if (error) throw error

    return NextResponse.json({ ok: data === true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
