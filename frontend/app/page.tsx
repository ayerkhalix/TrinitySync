"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"

export default function Home() {
  const [msg, setMsg] = useState("Loading...")

  useEffect(() => {
    apiFetch("/api/test/")
      .then(data => setMsg(data.message))
      .catch(() => setMsg("Backend not reachable"))
  }, [])

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Anti-Conflict Scheduler</h1>
      <p className="mt-4">{msg}</p>
    </main>
  )
}
