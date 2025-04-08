"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { AddTeacherDialog } from "./add-teacher-dialog"
import { EditTeacherDialog } from "./edit-teacher-dialog"
import { toast } from "sonner"

interface Teacher {
  id: string
  name: string
  email: string
  createdAt: string
  courses: {
    id: string
    title: string
    description: string
    createdAt: string
    enrollments: {
      id: string
    }[]
  }[]
}

export function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchTeachers = async () => {
    try {
      const response = await fetch("/api/teachers")
      if (!response.ok) {
        throw new Error("Failed to fetch teachers")
      }
      const data = await response.json()
      setTeachers(data)
    } catch (error) {
      console.error("Error fetching teachers:", error)
      toast.error("Failed to fetch teachers")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  const handleDelete = async (teacherId: string) => {
    if (!confirm("Are you sure you want to delete this teacher?")) {
      return
    }

    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete teacher")
      }

      toast.success("Teacher deleted successfully")
      fetchTeachers()
    } catch (error) {
      console.error("Error deleting teacher:", error)
      toast.error(`Failed to delete teacher: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teachers</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Add Teacher</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Courses</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.name}</TableCell>
              <TableCell>{teacher.email}</TableCell>
              <TableCell>{teacher.courses.length}</TableCell>
              <TableCell>
                {teacher.courses.reduce(
                  (total, course) => total + course.enrollments.length,
                  0
                )}
              </TableCell>
              <TableCell>
                {format(new Date(teacher.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTeacher(teacher)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(teacher.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AddTeacherDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={fetchTeachers}
      />

      {editingTeacher && (
        <EditTeacherDialog
          teacher={editingTeacher}
          open={!!editingTeacher}
          onOpenChange={(open) => !open && setEditingTeacher(null)}
          onSuccess={fetchTeachers}
        />
      )}
    </div>
  )
} 