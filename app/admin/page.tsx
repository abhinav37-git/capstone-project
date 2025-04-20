"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { Footer } from "@/components/footer"
import { StatsCards } from "@/components/admin/stats-cards"
import { QueryList } from "@/components/admin/query-list"
import { ActiveStudents } from "@/components/admin/active-students"
import { TeacherList } from "@/components/admin/teacher-list"
import { AdminList } from "@/components/admin/admin-list"

export default function AdminPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin')
    }
  })

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <AdminNavbar />
        <main className="flex-1 container py-8">
          <div className="flex items-center justify-center h-full">
            <div>Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Check if user is admin
  if (session?.user?.role !== "ADMIN") {
    redirect('/')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid gap-6">
          <StatsCards />
          <div className="grid gap-6 md:grid-cols-2">
            <ActiveStudents />
            <TeacherList />
          </div>
          <AdminList />
          <QueryList />
        </div>
      </main>
      <Footer />
    </div>
  )
}