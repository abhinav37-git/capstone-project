import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

export function StudentList() {
  const students = [
    {
      id: "1",
      name: "Komal Sood",
      email: "komal@example.com",
      enrolledCourses: ["IoT Fundamentals", "Blockchain"],
      progress: 65,
    },
    // Add more students
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Students</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Enrolled Courses</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.enrolledCourses.join(", ")}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Progress value={student.progress} />
                    <p className="text-xs text-muted-foreground">
                      {student.progress}% complete
                    </p>
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