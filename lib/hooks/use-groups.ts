"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { GroupWithMeta } from "@/lib/types/app"

export function useGroups() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ["groups"],
    queryFn: fetchGroups,
  })

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("groups-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "groups" },
        () => qc.invalidateQueries({ queryKey: ["groups"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "members" },
        () => qc.invalidateQueries({ queryKey: ["groups"] }))
      .on("postgres_changes", { event: "*", schema: "public", table: "sessions" },
        () => qc.invalidateQueries({ queryKey: ["groups"] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])

  return query
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ["groups", id],
    queryFn: () => fetchGroup(id),
    enabled: !!id,
  })
}

async function fetchGroups(): Promise<GroupWithMeta[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("groups")
    .select("*, members(*), sessions(id, date), group_admins(email)")
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(toGroupWithMeta)
}

async function fetchGroup(id: string): Promise<GroupWithMeta> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("groups")
    .select("*, members(*), sessions(*), group_admins(email)")
    .eq("id", id)
    .single()
  if (error) throw error
  return toGroupWithMeta(data)
}

function toGroupWithMeta(g: Record<string, unknown>): GroupWithMeta {
  const rawSessions = (g.sessions as GroupWithMeta["sessions"] | null) ?? []
  const admins = (g.group_admins as { email: string }[] | null) ?? []
  return {
    ...(g as GroupWithMeta),
    members: (g.members as GroupWithMeta["members"]) ?? [],
    sessions: rawSessions,
    admin_emails: admins.map((a) => a.email),
    session_count: rawSessions.length,
    last_session: rawSessions.map((s) => s.date).sort().at(-1) ?? null,
  }
}
