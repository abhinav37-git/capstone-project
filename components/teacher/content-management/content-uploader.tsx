"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUpload } from "./file-upload"
import { TextEditor } from "./text-editor"
import { useCourseStore } from "@/lib/store/course-store"
import { toast } from "sonner"

export function ContentUploader({ courseId }: { courseId: string }) {
  const addModule = useCourseStore((state) => state.addModule)
  
  const handleContentSubmit = (content: { title: string; content: string }) => {
    const newModule = {
      id: crypto.randomUUID(),
      title: content.title,
      content: content.content,
      progress: 0,
      resources: [],
    }
    
    addModule(courseId, newModule)
    toast.success("Module added successfully")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Course Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Content</TabsTrigger>
            <TabsTrigger value="files">Files (PPT/PDF)</TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <TextEditor onSubmit={handleContentSubmit} />
          </TabsContent>

          <TabsContent value="files">
            <FileUpload courseId={courseId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}