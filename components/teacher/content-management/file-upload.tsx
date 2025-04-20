"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useCourseStore } from "@/lib/store/course-store"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Module } from "@/lib/store/course-store"

interface FileUploadProps {
  courseId: string
}

export function FileUpload({ courseId }: FileUploadProps) {
  const [files, setFiles] = useState<FileList | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const addModule = useCourseStore((state) => state.addModule)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) {
      toast.error("Please select at least one file")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)
        formData.append('courseId', courseId)
        formData.append('title', title || file.name)
        formData.append('description', description)

        const response = await fetch('/api/content/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await response.json()
        
        // Add the uploaded file as a module
        const newModule: Module = {
          id: crypto.randomUUID(),
          title: data.file.title,
          content: data.file.description || '',
          progress: 0,
          resources: [{
            type: 'pdf' as const,
            url: data.file.url,
            title: data.file.title
          }]
        }
        
        addModule(courseId, newModule)
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100)
      }

      toast.success("Files uploaded successfully")
      // Reset form
      setFiles(null)
      setTitle("")
      setDescription("")
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload files')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Content Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter content title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter content description"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="files">Upload Files</Label>
        <Input
          id="files"
          type="file"
          onChange={(e) => setFiles(e.target.files)}
          accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
          multiple
          required
          disabled={isUploading}
        />
        <p className="text-sm text-muted-foreground">
          Supported formats: PDF, PPT, PPTX, DOC, DOCX, JPG, PNG
        </p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center text-muted-foreground">
            Uploading... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Content"}
      </Button>
    </form>
  )
}