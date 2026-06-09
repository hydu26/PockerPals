import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database"

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

// Client dùng để gửi email — flowType: 'implicit' để link không cần PKCE verifier
// (nếu dùng PKCE, verifier chỉ tồn tại ở browser của người gọi, user khác device sẽ bị "link expired")
export const supabaseEmailSender = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { flowType: "implicit", autoRefreshToken: false, persistSession: false } },
)
