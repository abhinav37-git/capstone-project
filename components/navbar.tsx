"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Home } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const pathname = usePathname()

  const commonProblems = [
    { title: "How to reset password?", solution: "Go to login page and click on 'Forgot Password'" },
    { title: "Can't access a course", solution: "Ensure you're enrolled in the course and try refreshing the page" },
    { title: "Video not playing", solution: "Check your internet connection and try a different browser" },
  ]

  return (
    <nav className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
      <Link href="/dashboard" className="text-2xl font-bold">
        Smart Module
      </Link>
      <div className="flex items-center space-x-4">
        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
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
                <div key={index} className="border-b pb-2">
                  <h3 className="font-medium">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground">{problem.solution}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        {pathname !== "/dashboard" && (
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <Home className="h-6 w-6" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}

