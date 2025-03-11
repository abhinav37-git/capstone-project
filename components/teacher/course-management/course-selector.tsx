"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useCourseStore } from "@/lib/store/course-store"
export function CourseSelector({ 
  selectedCourse, 
  onCourseChange 
}: { 
  selectedCourse: string; 
  onCourseChange: (courseId: string) => void 
}) {
  const courses = useCourseStore((state) => state.courses)
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
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}