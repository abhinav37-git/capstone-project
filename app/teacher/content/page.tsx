import { ContentUploader } from "@/components/teacher/content-management/content-uploader"
import { CourseSelector } from "@/components/teacher/course-management/course-selector"

export default function ContentManagement() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Content Management</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CourseSelector />
          </div>
          <div className="lg:col-span-2">
            <ContentUploader />
          </div>
        </div>
      </main>
    </div>
  )
}