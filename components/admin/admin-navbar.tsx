"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Users,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Bell
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"

export function AdminNavbar() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      title: "Students",
      icon: Users,
      href: "/admin/students",
    },
    {
      title: "Queries",
      icon: MessageSquare,
      href: "/admin/queries",
    },
  ]

  // This would come from your backend
  const notifications = [
    {
      id: 1,
      title: "New Query",
      message: "Student Komal Sood has submitted a new query",
      time: "2 minutes ago",
    },
    {
      id: 2,
      title: "New Student Joined",
      message: "A new student has enrolled in IoT course",
      time: "5 minutes ago",
    },
  ]

  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link href="/admin" className="text-2xl font-bold">
            Admin Dashboard
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  asChild
                  className="flex items-center space-x-2"
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Sheet open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
                  >
                    {notifications.length}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Notifications</SheetTitle>
                <SheetDescription>Stay updated with latest activities</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="border-b pb-4">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <LogOut className="h-6 w-6" />
              <span className="sr-only">Logout</span>
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}