"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

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

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-chart-2 text-background",
  POST: "bg-primary text-primary-foreground",
  PUT: "bg-chart-3 text-background",
  PATCH: "bg-chart-3 text-background",
  DELETE: "bg-destructive text-background",
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  )
}

function KeyValueTable({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data)
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">None</p>
  }
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-left text-sm">
        <tbody>
          {entries.map(([key, value], i) => (
            <tr
              key={key}
              className={cn(i % 2 === 1 && "bg-muted/50", "align-top")}
            >
              <td className="w-1/3 break-all px-3 py-1.5 font-mono text-xs font-medium">
                {key}
              </td>
              <td className="break-all px-3 py-1.5 font-mono text-xs text-muted-foreground">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LogEntry({ log }: { log: InteractionLog }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
        aria-expanded={open}
      >
        <span
          className={cn(
            "inline-flex min-w-16 justify-center rounded px-2 py-1 text-xs font-bold",
            METHOD_STYLES[log.method] ?? "bg-muted text-foreground",
          )}
        >
          {log.method}
        </span>
        <span className="flex-1 truncate font-mono text-sm">{log.path}</span>
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {log.ip}
        </span>
        <time className="hidden font-mono text-xs text-muted-foreground md:inline">
          {new Date(log.timestamp).toLocaleString()}
        </time>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Section title="Timestamp">
              <p className="font-mono text-sm">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </Section>
            <Section title="Client IP">
              <p className="font-mono text-sm">{log.ip}</p>
            </Section>
          </div>

          <Section title="URL">
            <p className="break-all font-mono text-sm">{log.url}</p>
          </Section>

          <Section title="Query Parameters">
            <KeyValueTable data={log.query} />
          </Section>

          <Section title="Headers">
            <KeyValueTable data={log.headers} />
          </Section>

          <Section title="Body">
            {log.body ? (
              <pre className="overflow-x-auto rounded-md border border-border bg-muted/50 p-3 font-mono text-xs">
                {log.body}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">Empty</p>
            )}
          </Section>
        </div>
      )}
    </div>
  )
}
