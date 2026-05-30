"use client"

import { useState, useEffect } from "react"
import { getCachedPassword, cacheGroupPassword } from "@/lib/utils/encode-password"

export function useGroupAccess(groupId: string, hasPwd: boolean, isAdmin: boolean) {
  const [asyncAccess, setAsyncAccess] = useState(false)
  // true only when there's a cached password pending async verification
  const [asyncChecking, setAsyncChecking] = useState(
    () => hasPwd && !isAdmin && Boolean(getCachedPassword(groupId))
  )

  // Derived — no setState needed when hasPwd/isAdmin changes
  const hasAccess = !hasPwd || isAdmin || asyncAccess
  const checking = hasPwd && !isAdmin && asyncChecking

  useEffect(() => {
    if (!hasPwd || isAdmin) return
    const cached = getCachedPassword(groupId)
    if (!cached) return
    // Verify cached password with Edge Function
    callVerify(groupId, cached).then((ok) => {
      setAsyncAccess(ok)
      setAsyncChecking(false)
    })
  }, [groupId, hasPwd, isAdmin])

  const verify = async (password: string): Promise<boolean> => {
    const ok = await callVerify(groupId, password)
    if (ok) {
      cacheGroupPassword(groupId, password)
      setAsyncAccess(true)
    }
    return ok
  }

  return { hasAccess, checking, verify }
}

async function callVerify(groupId: string, password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/verify-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ group_id: groupId, password }),
    })
    const data = await res.json()
    return data?.ok === true
  } catch {
    return false
  }
}
