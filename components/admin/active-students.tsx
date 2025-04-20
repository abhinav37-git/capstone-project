"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  currentModule: string
  lastActive: string
  progress: number
}

export function ActiveStudents() {
  const [activeStudents, setActiveStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchActiveStudents() {
      try {
        const response = await fetch("/api/admin/active-students")
        if (!response.ok) {
          throw new Error("Failed to fetch active students")
        }
        const data = await response.json()
        setActiveStudents(data)
      } catch (error) {
        console.error("Error fetching active students:", error)
        toast.error("Failed to load active students")
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveStudents()
    // Refresh data every 30 seconds
    const interval = setInterval(fetchActiveStudents, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
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
        <ScrollArea className="h-[400px]">
          {activeStudents.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No active students at the moment
            </div>
          ) : (
            activeStudents.map((student) => (
              <div key={student.id} className="p-4 border-b last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current Module: {student.currentModule}
                    </p>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Progress: {student.progress}%
                      </p>
                    </div>
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