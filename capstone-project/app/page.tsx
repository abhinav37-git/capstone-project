import { Dashboard } from "@/components/dashboard"
import { AIAgent } from "@/components/ai-agent"

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Dashboard />
      <AIAgent />
    </div>
  )
}

