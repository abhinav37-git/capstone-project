import { AdminNavbar } from "@/components/admin/admin-navbar"
import { Footer } from "@/components/footer"
import { QueryList } from "@/components/admin/query-list"

export default function QueriesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Student Queries</h1>
        <QueryList showFullList />
      </main>
      <Footer />
    </div>
  )
}