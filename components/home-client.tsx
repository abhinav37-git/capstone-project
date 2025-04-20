"use client"

import { LoginSelection } from "@/components/login-selection"

export default function HomeClientPage() {
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <LoginSelection />
    </div>
  )
}

