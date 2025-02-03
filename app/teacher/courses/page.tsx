import { CourseList } from "@/components/teacher/course-management/course-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function CourseManagement() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Course Management</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add New Course
          </Button>
        </div>
        <CourseList />
      </main>
    </div>
  )
}