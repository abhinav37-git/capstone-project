"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(true)
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const role = searchParams.get("role") || "student"

  useEffect(() => {
    if (role === "admin") {
      fetch("/api/admin/check")
        .then((res) => res.json())
        .then((data) => setHasAdmin(data.hasAdmin))
        .catch((error) => console.error("Error checking admin status:", error))
    }
  }, [role])

  const showSignupOption = role !== "admin" || (role === "admin" && hasAdmin === false)

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

