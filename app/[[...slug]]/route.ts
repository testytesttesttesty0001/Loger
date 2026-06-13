import { type NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { redis, LOGS_KEY, MAX_LOGS, type InteractionLog } from "@/lib/redis"

// Capture every HTTP method.
export const dynamic = "force-dynamic"

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "unknown"
}

async function readBody(req: NextRequest): Promise<string | null> {
  try {
    const text = await req.text()
    return text.length > 0 ? text : null
  } catch {
    return null
  }
}

async function handle(req: NextRequest) {
  const url = new URL(req.url)

  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key] = value
  })

  const query: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    query[key] = value
  })

  const log: InteractionLog = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ip: getClientIp(req),
    method: req.method,
    url: req.url,
    path: url.pathname,
    query,
    headers,
    body: await readBody(req),
  }

  // Store newest-first, then trim to the maximum allowed.
  await redis.lpush(LOGS_KEY, JSON.stringify(log))
  await redis.ltrim(LOGS_KEY, 0, MAX_LOGS - 1)

  return new NextResponse("OK", {
    status: 200,
    headers: { "content-type": "text/plain" },
  })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const HEAD = handle
export const OPTIONS = handle
