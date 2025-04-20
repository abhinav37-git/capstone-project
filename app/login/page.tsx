"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { toast } from "sonner"

function LoginContent() {
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [canCreateAdmin, setCanCreateAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const role = searchParams.get("role") || "student"

  useEffect(() => {
    if (role === "admin") {
      setIsLoading(true)
      fetch("/api/admin/check")
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to check admin status")
          }
          return res.json()
        })
        .then((data) => {
          setHasAdmin(data.hasAdmin)
          setCanCreateAdmin(data.canCreateAdmin)
        })
        .catch((error) => {
          console.error("Error checking admin status:", error)
          toast.error("Failed to check admin status. Please try again.")
        })
        .finally(() => setIsLoading(false))
    }
  }, [role])

  const showSignupOption = role !== "admin" || (role === "admin" && canCreateAdmin)

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking admin status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : "Sign Up"}
        </h1>
        {isLogin ? (
          <LoginForm role={role} />
        ) : (
          showSignupOption ? (
            <SignupForm role={role} />
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              Admin accounts can only be created by existing administrators.
              Please contact your system administrator for access.
            </div>
          )
        )}
        {showSignupOption && (
          <p className="text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              className="text-primary ml-2 underline" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

