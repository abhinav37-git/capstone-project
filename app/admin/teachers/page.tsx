import { AdminNavbar } from "@/components/admin/admin-navbar"
import { Footer } from "@/components/footer"
import { TeacherList } from "@/components/admin/teacher-list"
import { AddTeacherDialog } from "@/components/admin/add-teacher-dialog"

export default function TeachersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1 container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Teachers</h1>
          <AddTeacherDialog />
        </div>
        <TeacherList />
      </main>
      <Footer />
    </div>
  )
} 