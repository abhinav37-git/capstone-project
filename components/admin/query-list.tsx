"use client"

import Link from "next/link" // Add this import
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Query {
  id: string
  studentName: string
  message: string
  timestamp: string
  status: 'pending' | 'resolved'
}

export function QueryList({ showFullList = false }) {
  // This would typically come from an API
  const queries: Query[] = [
    {
      id: "1",
      studentName: "Komal Sood",
      message: "Having trouble accessing IoT module",
      timestamp: "5 minutes ago",
      status: 'pending'
    },
    // Add more sample data
  ]

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
          {queries.map((query) => (
            <div key={query.id} className="p-4 border-b last:border-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{query.studentName}</p>
                  <p className="text-sm text-muted-foreground">{query.message}</p>
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
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}