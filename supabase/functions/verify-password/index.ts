import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { group_id, password } = await req.json()

    if (!group_id || typeof password !== "string") {
      return new Response(
        JSON.stringify({ error: "group_id và password là bắt buộc" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }

    // Service role client — bypasses RLS, can call check_group_password
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    const { data, error } = await supabase.rpc("check_group_password", {
      p_group_id: group_id,
      p_password: password,
    })

    if (error) throw error

    return new Response(
      JSON.stringify({ ok: data === true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
