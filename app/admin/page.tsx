import { AdminNavbar } from "@/components/admin/admin-navbar"
import { Footer } from "@/components/footer"
import { StatsCards } from "@/components/admin/stats-cards"
import { QueryList } from "@/components/admin/query-list"
import { ActiveStudents } from "@/components/admin/active-students"

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Overview</h1>
        <StatsCards />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <QueryList />
          <ActiveStudents />
        </div>
      </main>
      <Footer />
    </div>
  )
}