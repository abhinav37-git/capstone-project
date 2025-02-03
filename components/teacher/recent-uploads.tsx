import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Image, Presentation } from "lucide-react" // Fixed import

export function RecentUploads() {
  const uploads = [
    {
      id: "1",
      title: "IoT Basics Presentation",
      type: "presentation",
      date: "2 hours ago"
    },
    {
      id: "2",
      title: "Blockchain Diagram",
      type: "image",
      date: "5 hours ago"
    },
    {
      id: "3",
      title: "ML Course Notes",
      type: "document",
      date: "1 day ago"
    }
  ]

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {uploads.map((upload) => (
            <div key={upload.id} className="flex items-center p-4 border-b last:border-0">
              {getIcon(upload.type)}
              <div className="ml-4 flex-1">
                <p className="font-medium">{upload.title}</p>
                <p className="text-sm text-muted-foreground">{upload.date}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}