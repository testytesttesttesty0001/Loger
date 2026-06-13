"use client"

import useSWR from "swr"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogEntry } from "@/components/log-entry"
import { RefreshCw, Trash2, Radio } from "lucide-react"

type InteractionLog = {
  id: string
  timestamp: string
  ip: string
  method: string
  url: string
  path: string
  query: Record<string, string>
  headers: Record<string, string>
  body: string | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function LogViewer() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [clearing, setClearing] = useState(false)

  const { data, isLoading, mutate } = useSWR<{
    count: number
    logs: InteractionLog[]
  }>("/api/logs", fetcher, {
    refreshInterval: autoRefresh ? 3000 : 0,
  })

  const logs = data?.logs ?? []

  async function clearLogs() {
    if (!confirm("Clear all captured interactions? This cannot be undone.")) return
    setClearing(true)
    try {
      await fetch("/api/logs", { method: "DELETE" })
      await mutate()
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            HTTP Interaction Logger
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Captures every request to any path. Send traffic to{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              /
            </code>{" "}
            or any sub-path and it appears here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh((v) => !v)}
          >
            <Radio className="mr-1.5 size-4" />
            {autoRefresh ? "Live" : "Paused"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-1.5 size-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            disabled={clearing || logs.length === 0}
          >
            <Trash2 className="mr-1.5 size-4" />
            Clear
          </Button>
        </div>
      </header>

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "Loading..."
            : `${data?.count ?? 0} interaction${(data?.count ?? 0) === 1 ? "" : "s"} captured`}
        </p>
      </div>

      {!isLoading && logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium">No interactions yet</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
            Send an HTTP request to this deployment&apos;s root or any path, then
            watch it show up here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {logs.map((log) => (
            <li key={log.id}>
              <LogEntry log={log} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
