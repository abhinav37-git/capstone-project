import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export function LoginSelection() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome to Smart Module Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button asChild>
          <Link href="/login?role=student">Student Login</Link>
        </Button>
        <Button asChild>
          <Link href="/login?role=teacher">Teacher Login</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login?role=admin">Admin Login</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

