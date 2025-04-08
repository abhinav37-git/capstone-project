"use client"

import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { useState } from "react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "student"

  // Don't allow signup for teachers
  const showSignupOption = role !== "teacher"

  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          {isLogin ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : "Sign Up"}
        </h1>
        {isLogin ? <LoginForm role={role} /> : <SignupForm role={role} />}
        {showSignupOption && (
          <p className="text-center mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className="text-primary ml-2 underline" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        )}
        {!showSignupOption && !isLogin && (
          <p className="text-center mt-4">
            <span className="text-muted-foreground">Teachers must be added by an administrator.</span>
            <button className="text-primary ml-2 underline" onClick={() => setIsLogin(true)}>
              Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

