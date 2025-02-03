import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export function ActiveStudents() {
  const students = [
    {
      id: "1",
      name: "Komal Sood",
      currentModule: "IoT Fundamentals",
      lastActive: "2 minutes ago"
    },
    {
      id: "2",
      name: "John Doe",
      currentModule: "Blockchain Basics",
      lastActive: "5 minutes ago"
    },
    {
      id: "3",
      name: "Jane Smith",
      currentModule: "ML Introduction",
      lastActive: "15 minutes ago"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Students</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {students.map((student) => (
            <div key={student.id} className="p-4 border-b last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current Module: {student.currentModule}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {student.lastActive}
                </span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}