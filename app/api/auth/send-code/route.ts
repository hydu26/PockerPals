import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { supabaseAdmin } from "@/lib/supabase/admin"

const SUPER_ADMIN = "corneille261998@gmail.com"

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

export async function POST(req: NextRequest) {
  const { email } = (await req.json()) as { email: string }
  const normalized = email?.trim().toLowerCase()

  if (!normalized || !normalized.includes("@")) {
    return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 })
  }

  // Check admin access
  const isSuperAdmin = normalized === SUPER_ADMIN.toLowerCase()
  if (!isSuperAdmin) {
    const { data } = await supabaseAdmin
      .from("group_admins")
      .select("email")
      .eq("email", normalized)
      .limit(1)
      .maybeSingle()

    if (!data) {
      return NextResponse.json(
        { error: "Email không có quyền admin" },
        { status: 403 }
      )
    }
  }

  const code = genCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  // Remove old codes, store new one
  await supabaseAdmin.from("login_codes").delete().eq("email", normalized)
  await supabaseAdmin
    .from("login_codes")
    .insert({ email: normalized, code, expires_at: expiresAt })

  console.log(`[Auth] Login code for ${normalized}: ${code}`)

  // Send via Gmail SMTP (App Password)
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
    await transporter.sendMail({
      from: `PokerPals <${process.env.GMAIL_USER}>`,
      to: normalized,
      subject: `Mã đăng nhập PokerPals: ${code}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:400px;margin:0 auto;padding:32px 24px;background:#07050f;color:#e7e3f0;border-radius:16px">
          <div style="font-size:32px;margin-bottom:8px">🃏</div>
          <p style="font-size:14px;color:#8a82a8;margin:0 0 24px">Mã đăng nhập của bạn</p>
          <div style="background:#1a0f2e;border:1px solid rgba(184,159,255,.25);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
            <div style="font-family:'Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:12px;color:#b89fff">${code}</div>
            <div style="font-size:12px;color:#7d748a;margin-top:8px">Hiệu lực 10 phút</div>
          </div>
          <p style="font-size:13px;color:#7d748a;line-height:1.6;margin:0">
            Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email này.
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error("[Auth] Email error:", err)
    return NextResponse.json(
      { error: "Không gửi được email. Kiểm tra GMAIL_USER / GMAIL_APP_PASSWORD." },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
