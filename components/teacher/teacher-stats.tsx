"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, FileText, Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Stats {
  totalStudents: number
  activeCourses: number
  totalContent: number
  recentUploads: number
}

export function TeacherStats() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    activeCourses: 0,
    totalContent: 0,
    recentUploads: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/teacher/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
        toast.error('Failed to load statistics')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statsData = [
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      icon: Users,
      description: "Enrolled students"
    },
    {
      title: "Active Courses",
      value: stats.activeCourses.toString(),
      icon: BookOpen,
      description: "Currently running courses"
    },
    {
      title: "Total Content",
      value: stats.totalContent.toString(),
      icon: FileText,
      description: "Uploaded materials"
    },
    {
      title: "Recent Uploads",
      value: stats.recentUploads.toString(),
      icon: Upload,
      description: "Last 7 days"
    }
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center p-6">
              <div className="animate-pulse flex space-x-4">
                <div className="h-6 w-6 bg-primary/10 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statsData.map((stat, index) => (
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