"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { EnrollmentManager } from "./enrollment-manager"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, XCircle } from "lucide-react"

interface Student {
  id: string
  name: string
  email: string
  isApproved: boolean
  enrolledCourses: Array<{
    id: string
    title: string
  }>
  progress: number
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      } else {
        throw new Error('Failed to fetch students')
      }
    } catch (error) {
      console.error('Error fetching students:', error)
      toast.error('Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleApproveStudent = async (studentId: string) => {
    try {
      const response = await fetch('/api/teacher/students/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      })

      if (response.ok) {
        toast.success('Student approved successfully')
        fetchStudents() // Refresh the list
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve student')
      }
    } catch (error) {
      console.error('Error approving student:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to approve student')
    }
  }

  const handleManageEnrollments = (student: Student) => {
    setSelectedStudent(student)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">Loading students...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled Courses</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  {student.isApproved ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Approved</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-yellow-600">
                      <XCircle className="h-4 w-4" />
                      <span>Pending</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {student.enrolledCourses.map(course => course.title).join(", ")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={student.progress} className="w-[60%]" />
                    <span className="text-sm text-muted-foreground">
                      {student.progress}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!student.isApproved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveStudent(student.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Approve
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleManageEnrollments(student)}
                        >
                          Manage Courses
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Manage Courses for {student.name}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <EnrollmentManager
                            studentId={student.id}
                            initialEnrollments={student.enrolledCourses.map(course => ({
                              courseId: course.id,
                              course: {
                                id: course.id,
                                title: course.title
                              }
                            }))}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}