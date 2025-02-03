"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function TeacherNavbar() {
  const pathname = usePathname()

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
              variant={pathname === item.href ? "secondary" : "ghost"}
              asChild
            >
              <Link href={item.href}>{item.title}</Link>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
}