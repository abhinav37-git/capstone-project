import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Student {
  id: string
  name: string
  currentModule: string
  lastActive: string
}

export function ActiveStudents() {
  // This would typically come from an API
  const activeStudents: Student[] = [
    {
      id: "1",
      name: "Komal Sood",
      currentModule: "IoT Fundamentals",
      lastActive: "2 minutes ago"
    },
    // Add more sample data
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Students</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {activeStudents.map((student) => (
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