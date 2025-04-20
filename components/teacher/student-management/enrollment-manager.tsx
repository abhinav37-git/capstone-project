"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useCourseStore } from "@/lib/store/course-store"
import { Checkbox } from "@/components/ui/checkbox"

interface EnrollmentManagerProps {
  studentId: string
  initialEnrollments: Array<{
    courseId: string
    course: {
      id: string
      title: string
    }
  }>
}

export function EnrollmentManager({ studentId, initialEnrollments }: EnrollmentManagerProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>(
    initialEnrollments.map(e => e.courseId)
  )
  const [isLoading, setIsLoading] = useState(false)
  
  const courses = useCourseStore((state) => state.courses)
  const fetchAvailableCourses = useCourseStore((state) => state.fetchAvailableCourses)

  useEffect(() => {
    fetchAvailableCourses()
  }, [fetchAvailableCourses])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/students/enrollments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          courseIds: selectedCourses,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update enrollments')
      }

      toast.success('Enrollments updated successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update enrollments')
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
        <CardTitle>Manage Course Enrollments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedCourses.map((courseId) => {
                const course = courses.find(c => c.id === courseId)
                return course ? (
                  <Badge key={courseId} variant="secondary" className="flex items-center gap-1">
                    {course.title}
                    <button
                      type="button"
                      onClick={() => toggleCourse(courseId)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ) : null
              })}
            </div>
            <Command className="border rounded-md">
              <CommandInput placeholder="Search courses..." />
              <CommandEmpty>No courses found.</CommandEmpty>
              <CommandGroup>
                {courses?.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center px-2 py-1.5"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                        id={`course-${course.id}`}
                        className="cursor-pointer"
                      />
                      <label
                        htmlFor={`course-${course.id}`}
                        className="flex-grow cursor-pointer"
                      >
                        {course.title}
                      </label>
                    </div>
                  </div>
                ))}
              </CommandGroup>
            </Command>
          </div>
          <Button 
            onClick={handleSave} 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 