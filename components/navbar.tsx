"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Home, Moon, Sun, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"
import { signOut } from "next-auth/react"
import { toast } from "sonner"

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const pathname = usePathname()

  // Only run on client side
  useEffect(() => {
    setMounted(true)
    const isDark = localStorage.getItem("darkMode") === "true"
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle("dark")
    localStorage.setItem("darkMode", (!isDarkMode).toString())
  }

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/login" })
      toast.success("Signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  const commonProblems = [
    { title: "How to reset password?", solution: "Go to login page and click on 'Forgot Password'" },
    { title: "Can't access a course", solution: "Ensure you're enrolled in the course and try refreshing the page" },
    { title: "Video not playing", solution: "Check your internet connection and try a different browser" },
  ]

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  return (
    <motion.nav
      className="bg-primary text-primary-foreground p-4 flex justify-between items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href="/dashboard" className="text-2xl font-bold hover:text-accent transition-colors duration-200">
        Smart Module
      </Link>
      <div className="flex items-center space-x-4">
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-secondary transition-colors duration-200">
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Common Problems</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Common Problems</SheetTitle>
              <SheetDescription>Here are solutions to some common issues you might face:</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              {commonProblems.map((problem, index) => (
                <motion.div
                  key={index}
                  className="border-b pb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="font-medium">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground">{problem.solution}</p>
                </motion.div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        {pathname !== "/dashboard" && (
          <Button variant="ghost" size="icon" asChild className="hover:bg-secondary transition-colors duration-200">
            <Link href="/dashboard">
              <Home className="h-6 w-6" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="hover:bg-secondary transition-colors duration-200"
        >
          {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
          <span className="sr-only">Toggle Dark Mode</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="hover:bg-secondary transition-colors duration-200"
        >
          <LogOut className="h-6 w-6" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>
    </motion.nav>
  )
}