"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, ChevronRight, FileText, Video } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CourseContentViewerProps {
  course: {
    id: string
    title: string
    description: string
    modules: Array<{
      id: string
      title: string
      description: string
      content: Array<{
        id: string
        title: string
        description: string
        type: string
        fileUrl: string
      }>
      progress: number
    }>
  }
  onModuleComplete: (moduleId: string) => void
}

export function CourseContentViewer({ course, onModuleComplete }: CourseContentViewerProps) {
  const [selectedModule, setSelectedModule] = useState(course.modules[0])
  const [selectedContent, setSelectedContent] = useState(
    course.modules[0]?.content[0] || null
  )

  return (
    <div className="flex h-full gap-4">
      <div className="w-1/3">
        <ScrollArea className="h-[calc(80vh-4rem)]">
          <div className="pr-4">
            <h3 className="mb-4 text-lg font-semibold">{course.title}</h3>
            {course.modules.map((module) => (
              <Card
                key={module.id}
                className={cn(
                  "mb-4 cursor-pointer transition-colors hover:bg-accent",
                  selectedModule?.id === module.id && "bg-accent"
                )}
                onClick={() => {
                  setSelectedModule(module)
                  setSelectedContent(module.content[0] || null)
                }}
              >
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      {module.title}
                      {module.progress === 100 && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="flex-1">
        <ScrollArea className="h-[calc(80vh-4rem)]">
          {selectedModule && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedModule.title}</h3>
                <Button
                  variant="outline"
                  onClick={() => onModuleComplete(selectedModule.id)}
                  disabled={selectedModule.progress === 100}
                >
                  {selectedModule.progress === 100 ? "Completed" : "Mark as Complete"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedModule.description}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {selectedModule.content.map((content) => (
                  <Card
                    key={content.id}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-accent",
                      selectedContent?.id === content.id && "bg-accent"
                    )}
                    onClick={() => setSelectedContent(content)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {content.type === "video" ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        {content.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground">
                        {content.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {selectedContent && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>{selectedContent.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedContent.type === "video" ? (
                      <video
                        src={selectedContent.fileUrl}
                        controls
                        className="w-full"
                      />
                    ) : (
                      <iframe
                        src={selectedContent.fileUrl}
                        className="h-[500px] w-full"
                      />
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
} 