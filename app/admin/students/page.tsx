import { AdminNavbar } from "@/components/admin/admin-navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function StudentsPage() {
  // This would come from your backend
  const students = [
    {
      id: "1",
      name: "Komal Sood",
      email: "komal@example.com",
      course: "IoT Fundamentals",
      progress: "40%",
      joinedDate: "2024-01-15",
    },
    // Add more sample data
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Students</h1>
        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Joined Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.progress}</TableCell>
                    <TableCell>{student.joinedDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}