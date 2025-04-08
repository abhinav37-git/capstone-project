import { CourseList } from "@/components/teacher/course-management/course-list"
import { CreateCourseDialog } from "@/components/teacher/course-management/create-course-dialog"

export default function CourseManagement() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <CreateCourseDialog />
        </div>
        <CourseList />
      </main>
    </div>
  )
}