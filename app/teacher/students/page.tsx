import { StudentList } from "@/components/teacher/student-management/student-list"
import { EnrollmentEditor } from "@/components/teacher/student-management/enrollment-editor"

export default function StudentManagement() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Student Management</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <StudentList />
          </div>
          <div className="lg:col-span-1">
            <EnrollmentEditor />
          </div>
        </div>
      </main>
    </div>
  )
}