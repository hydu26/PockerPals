"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SettingsRedirect() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  useEffect(() => {
    router.replace(`/groups/${id}`)
  }, [id, router])
  return null
}
