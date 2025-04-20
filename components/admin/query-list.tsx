"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface Query {
  id: string
  studentName: string
  message: string
  timestamp: string
  status: 'pending' | 'resolved'
  courseName: string
}

export function QueryList({ showFullList = false }) {
  const [queries, setQueries] = useState<Query[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchQueries() {
      try {
        const response = await fetch("/api/admin/queries")
        if (!response.ok) {
          throw new Error("Failed to fetch queries")
        }
        const data = await response.json()
        setQueries(data)
      } catch (error) {
        console.error("Error fetching queries:", error)
        toast.error("Failed to load queries")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQueries()
    // Refresh data every minute
    const interval = setInterval(fetchQueries, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Queries</CardTitle>
          {!showFullList && (
            <Button variant="link" asChild>
              <Link href="/admin/queries">View All</Link>
            </Button>
          )}
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Student Queries</CardTitle>
        {!showFullList && (
          <Button variant="link" asChild>
            <Link href="/admin/queries">View All</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {queries.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              No queries at the moment
            </div>
          ) : (
            queries.map((query) => (
              <div key={query.id} className="p-4 border-b last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{query.studentName}</p>
                    <p className="text-sm text-muted-foreground">{query.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Course: {query.courseName}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    query.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {query.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {query.timestamp}
                </p>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}