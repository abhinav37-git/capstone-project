"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { LoginSelection } from "@/components/login-selection"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (session) {
    // Redirect based on user role
    switch (session.user.role) {
      case "ADMIN":
        redirect("/admin")
      case "TEACHER":
        redirect("/teacher")
      default:
        redirect("/dashboard")
    }
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <LoginSelection />
    </div>
  )
}

