"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useCourseStore } from "@/lib/store/course-store"
import { Checkbox } from "@/components/ui/checkbox"

export function EnrollmentEditor() {
  const [studentId, setStudentId] = useState("")
  const [email, setEmail] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const { courses, fetchCourses } = useCourseStore()

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !email || selectedCourses.length === 0) {
      toast.error('Please fill in all fields and select at least one course')
      return
    }

    setIsLoading(true)
    try {
      // First, pre-register the student with their email
      const preRegisterResponse = await fetch('/api/students/pre-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          email,
        }),
      })

      if (!preRegisterResponse.ok) {
        const error = await preRegisterResponse.json()
        throw new Error(error.error || 'Failed to pre-register student')
      }

      // Then enroll them in all selected courses
      for (const courseId of selectedCourses) {
        const enrollResponse = await fetch(`/api/courses/${courseId}/students`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: studentId,
            email: email 
          }),
        })

        if (!enrollResponse.ok) {
          const error = await enrollResponse.json()
          throw new Error(error.error || 'Failed to enroll student in all courses')
        }
      }

      toast.success('Student pre-registered and enrolled successfully')
      setStudentId("")
      setEmail("")
      setSelectedCourses([])
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(current => 
      current.includes(courseId)
        ? current.filter(id => id !== courseId)
        : [...current, courseId]
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-register & Enroll Student</CardTitle>
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
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Student Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter student email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label>Selected Courses</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedCourses.map((courseId) => {
                const course = courses.find(c => c.id === courseId)
                return (
                  <Badge key={courseId} variant="secondary" className="flex items-center gap-1">
                    {course?.title}
                    <button
                      type="button"
                      onClick={(e) => toggleCourse(courseId)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>
            <div className="border rounded-md">
              <div className="p-2">
                <Input
                  placeholder="Search courses..."
                  className="h-8 w-full bg-transparent px-2"
                  type="search"
                />
              </div>
              <div className="max-h-[200px] overflow-auto">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center space-x-2 p-2 hover:bg-accent cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault()
                      toggleCourse(course.id)
                    }}
                  >
                    <Checkbox
                      checked={selectedCourses.includes(course.id)}
                      onCheckedChange={() => toggleCourse(course.id)}
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    />
                    <span>{course.title}</span>
                  </div>
                ))}
                {courses.length === 0 && (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    No courses found
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Pre-register & Enroll Student"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}