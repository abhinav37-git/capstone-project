"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function EnrollmentEditor() {
  const [studentId, setStudentId] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")

  const courses = [
    { id: "1", name: "IoT Fundamentals" },
    { id: "2", name: "Blockchain Basics" },
    { id: "3", name: "Machine Learning 101" }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle enrollment logic
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enroll Student</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
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
          </div>
          <Button type="submit" className="w-full">
            Enroll Student
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}