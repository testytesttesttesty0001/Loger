import { Redis } from "@upstash/redis"

// Reads KV_REST_API_URL and KV_REST_API_TOKEN from the environment.
export const redis = Redis.fromEnv()

// Key under which all interaction logs are stored (newest first).
export const LOGS_KEY = "http-logger:interactions"

// Cap the number of stored logs to keep memory/storage bounded.
export const MAX_LOGS = 1000

export type InteractionLog = {
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
