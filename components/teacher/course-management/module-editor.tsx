"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function ModuleEditor() {
  const [moduleTitle, setModuleTitle] = useState("")
  const [moduleContent, setModuleContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle module creation/editing logic
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="moduleTitle">Module Title</Label>
            <Input
              id="moduleTitle"
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder="Enter module title"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="moduleContent">Content</Label>
            <Textarea
              id="moduleContent"
              value={moduleContent}
              onChange={(e) => setModuleContent(e.target.value)}
              placeholder="Enter module content"
              className="min-h-[200px]"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Module
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}