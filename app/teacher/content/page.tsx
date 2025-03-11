"use client"

import { ContentUploader } from "@/components/teacher/content-management/content-uploader"
import { CourseSelector } from "@/components/teacher/course-management/course-selector"
import { useState } from "react"

export default function ContentManagement() {
  const [selectedCourseId, setSelectedCourseId] = useState("")
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Content Management</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <CourseSelector 
              selectedCourse={selectedCourseId} 
              onCourseChange={setSelectedCourseId} 
            />
          </div>
          <div className="lg:col-span-2">
            {selectedCourseId ? (
              <ContentUploader courseId={selectedCourseId} />
            ) : (
              <div className="h-full flex items-center justify-center p-6 border rounded-lg">
                <p className="text-muted-foreground">Please select a course to upload content</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}