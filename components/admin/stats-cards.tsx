import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, MessageSquare } from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      title: "Total Students",
      value: "150",
      icon: Users,
      description: "Active students in the platform"
    },
    {
      title: "Active Courses",
      value: "4",
      icon: BookOpen,
      description: "Currently running courses"
    },
    {
      title: "Pending Queries",
      value: "12",
      icon: MessageSquare,
      description: "Queries waiting for response"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
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