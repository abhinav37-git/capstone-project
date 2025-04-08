"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const navItems = [
  {
    title: "Overview",
    href: "/admin",
  },
  {
    title: "Teachers",
    href: "/admin/teachers",
  },
  {
    title: "Students",
    href: "/admin/students",
  },
  {
    title: "Queries",
    href: "/admin/queries",
  },
]

export function AdminNavbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-8">
          <Link href="/admin" className="font-bold">
            Admin Portal
          </Link>
        </div>
        <div className="flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}