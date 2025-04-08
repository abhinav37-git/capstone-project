"use client"

import { AdminNavbar } from "@/components/admin/admin-navbar"
import { Footer } from "@/components/footer"
import { StatsCards } from "@/components/admin/stats-cards"
import { QueryList } from "@/components/admin/query-list"
import { ActiveStudents } from "@/components/admin/active-students"
import { TeacherList } from "@/components/admin/teacher-list"

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="space-y-8">
          <StatsCards />
          <TeacherList />
          <ActiveStudents />
          <QueryList />
        </div>
      </main>
      <Footer />
    </div>
  )
}