import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"

export function CourseList() {
  const courses = [
    {
      id: "1",
      name: "IoT Fundamentals",
      modules: 5,
      students: 25,
      lastUpdated: "2024-02-15",
    },
    {
      id: "2",
      name: "Blockchain Technology",
      modules: 4,
      students: 18,
      lastUpdated: "2024-02-14",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course List</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.name}</TableCell>
                <TableCell>{course.modules}</TableCell>
                <TableCell>{course.students}</TableCell>
                <TableCell>{course.lastUpdated}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
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