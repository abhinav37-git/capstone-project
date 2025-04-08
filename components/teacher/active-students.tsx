"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ActiveStudent {
  id: string
  name: string
  currentModule: string
  lastActive: string
}

export function ActiveStudents() {
  const [students, setStudents] = useState<ActiveStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActiveStudents() {
      try {
        const response = await fetch('/api/teacher/active-students')
        if (!response.ok) throw new Error('Failed to fetch active students')
        const data = await response.json()
        setStudents(data.students)
      } catch (error) {
        console.error('Error fetching active students:', error)
        toast.error('Failed to load active students')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveStudents()
    // Refresh every minute
    const interval = setInterval(fetchActiveStudents, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Students</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border-b last:border-0">
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-muted rounded w-1/6"></div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Students</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {students.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No active students at the moment
            </div>
          ) : (
            students.map((student) => (
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
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}