import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, FileText, Upload } from "lucide-react"

export function TeacherStats() {
  const stats = [
    {
      title: "Total Students",
      value: "45",
      icon: Users,
      description: "Enrolled students"
    },
    {
      title: "Active Courses",
      value: "4",
      icon: BookOpen,
      description: "Currently running courses"
    },
    {
      title: "Total Content",
      value: "24",
      icon: FileText,
      description: "Uploaded materials"
    },
    {
      title: "Recent Uploads",
      value: "8",
      icon: Upload,
      description: "Last 7 days"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center justify-center p-2 bg-primary/10 rounded-lg">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}