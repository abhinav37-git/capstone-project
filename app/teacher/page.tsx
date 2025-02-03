import { TeacherStats } from "@/components/teacher/teacher-stats"
import { RecentUploads } from "@/components/teacher/recent-uploads"
import { ActiveStudents } from "@/components/teacher/active-students"

export default function TeacherDashboard() {
  return (
    <main className="flex-1 container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      <TeacherStats />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <RecentUploads />
        <ActiveStudents />
      </div>
    </main>
  )
}