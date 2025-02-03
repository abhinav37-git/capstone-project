import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Image, Presentation } from "lucide-react" // Fixed import

interface ContentPreviewProps {
  type: 'presentation' | 'document' | 'image' | 'text'
  title: string
  content: string
  fileUrl?: string
}

export function ContentPreview({ type, title, content, fileUrl }: ContentPreviewProps) {
  const getIcon = () => {
    switch (type) {
      case 'presentation':
        return <Presentation className="h-6 w-6" />
      case 'image':
        return <Image className="h-6 w-6" />
      default:
        return <FileText className="h-6 w-6" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {type === 'image' && fileUrl ? (
          <img src={fileUrl} alt={title} className="max-w-full h-auto" />
        ) : (
          <div className="prose max-w-none">
            {content}
          </div>
        )}
      </CardContent>
    </Card>
  )
}