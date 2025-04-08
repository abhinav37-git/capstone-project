"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Image, Presentation } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Upload {
  id: string
  title: string
  type: string
  createdAt: string
}

export function RecentUploads() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchUploads() {
      try {
        const response = await fetch('/api/teacher/recent-uploads')
        if (!response.ok) throw new Error('Failed to fetch uploads')
        const data = await response.json()
        setUploads(data.uploads)
      } catch (error) {
        console.error('Error fetching uploads:', error)
        toast.error('Failed to load recent uploads')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUploads()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'presentation':
        return <Presentation className="h-4 w-4" />
      case 'image':
        return <Image className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="text-center">Loading uploads...</div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {uploads.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No recent uploads
            </div>
          ) : (
            uploads.map((upload) => (
              <div key={upload.id} className="flex items-center p-4 border-b last:border-0">
                {getIcon(upload.type)}
                <div className="ml-4 flex-1">
                  <p className="font-medium">{upload.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(upload.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}