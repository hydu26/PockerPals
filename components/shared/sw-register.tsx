"use client"

import { useEffect } from "react"

export default function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {/* silently ignore — SW is enhancement only */})
    }
  }, [])

  return null
}
