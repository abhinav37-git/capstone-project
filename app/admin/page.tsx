"use client"

import { AdminNavbar } from "@/components/admin/admin-navbar"
import { Footer } from "@/components/footer"
import { StatsCards } from "@/components/admin/stats-cards"
import { QueryList } from "@/components/admin/query-list"
import { ActiveStudents } from "@/components/admin/active-students"
import { TeacherList } from "@/components/admin/teacher-list"
import { AdminList } from "@/components/admin/admin-list"

export default function AdminPage() {
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