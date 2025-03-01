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
    {
      id: "2",
      name: "John Doe",
      email: "john@example.com",
      course: "Blockchain Technology",
      progress: "65%",
      joinedDate: "2024-01-10",
    },
    // Add more sample data as needed
    
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
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: student.progress }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {student.progress}
                        </span>
                      </div>
                    </TableCell>
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