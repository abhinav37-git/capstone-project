import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex-1 container mx-auto p-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p>Could not find the requested resource</p>
        <Button asChild>
          <Link href="/teacher">Return to Dashboard</Link>
        </Button>
      </div>
    </main>
  )
}