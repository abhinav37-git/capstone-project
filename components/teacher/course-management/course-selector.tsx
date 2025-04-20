"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"
import { useCourseStore } from "@/lib/store/course-store"

export function CourseSelector({ 
  selectedCourse, 
  onCourseChange 
}: { 
  selectedCourse: string; 
  onCourseChange: (courseId: string) => void 
}) {
  const courses = useCourseStore((state) => state.courses)
  const fetchCourses = useCourseStore((state) => state.fetchCourses)

  useEffect(() => {
    // Only fetch courses if we don't have any
    if (courses.length === 0) {
      fetchCourses()
    }
  }, []) // Remove fetchCourses from dependencies

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Course</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedCourse} onValueChange={onCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}