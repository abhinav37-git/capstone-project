"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function FileUpload() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle file upload logic here
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
        />
        <p className="text-sm text-muted-foreground">
          Supported formats: PDF, PPT, PPTX, DOC, DOCX, JPG, PNG
        </p>
      </div>

      <Button type="submit" className="w-full">
        Upload Content
      </Button>
    </form>
  )
}