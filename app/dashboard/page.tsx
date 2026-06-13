import { LogViewer } from "@/components/log-viewer"

export const metadata = {
  title: "HTTP Interaction Logger",
  description: "View captured HTTP interactions",
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <LogViewer />
    </main>
  )
}
