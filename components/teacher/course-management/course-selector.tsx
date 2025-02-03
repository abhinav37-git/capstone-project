"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function CourseSelector() {
  const [selectedCourse, setSelectedCourse] = useState("")

  const courses = [
    { id: "1", name: "IoT Fundamentals" },
    { id: "2", name: "Blockchain Basics" },
    { id: "3", name: "Machine Learning 101" }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Course</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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