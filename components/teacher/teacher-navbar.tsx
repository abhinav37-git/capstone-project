"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"
import { useState, useEffect } from "react"

export function TeacherNavbar() {
  const pathname = usePathname()
  const [currentPath, setCurrentPath] = useState("")

  useEffect(() => {
    setCurrentPath(pathname || "")
  }, [pathname])

  const navItems = [
    {
      title: "Dashboard",
      href: "/teacher",
    },
    {
      title: "Courses",
      href: "/teacher/courses",
    },
    {
      title: "Content",
      href: "/teacher/content",
    },
    {
      title: "Students",
      href: "/teacher/students",
    },
  ]

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/teacher" className="text-2xl font-bold">
          Teacher Portal
        </Link>
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={currentPath === item.href ? "secondary" : "ghost"}
              asChild
            >
              <Link href={item.href}>{item.title}</Link>
            </Button>
          ))}
          <Button 
            variant="ghost" 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}