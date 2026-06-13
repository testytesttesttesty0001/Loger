import { NextResponse } from "next/server"
import { redis, LOGS_KEY, type InteractionLog } from "@/lib/redis"

export const dynamic = "force-dynamic"

// GET /api/logs -> all captured interactions as JSON (newest first).
export async function GET() {
  const raw = await redis.lrange(LOGS_KEY, 0, -1)
  const logs: InteractionLog[] = raw.map((entry) =>
    typeof entry === "string" ? JSON.parse(entry) : (entry as InteractionLog),
  )

  return NextResponse.json(
    { count: logs.length, logs },
    { headers: { "cache-control": "no-store" } },
  )
}

// DELETE /api/logs -> clear all captured interactions.
export async function DELETE() {
  await redis.del(LOGS_KEY)
  return NextResponse.json({ ok: true, message: "Logs cleared" })
}
