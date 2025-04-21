import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import HomeClientPage from "@/components/home-client"

// This is a server component that handles initial redirect
export default async function Home() {
  // Server-side session check
  const session = await getServerSession(authOptions)
  
  // If the user is authenticated, redirect based on role
  if (session) {
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin")
      case "TEACHER":
        redirect("/teacher")
      default:
        redirect("/dashboard")
    }
  }
  
  // If not authenticated, render the client component
  return <HomeClientPage />
}
