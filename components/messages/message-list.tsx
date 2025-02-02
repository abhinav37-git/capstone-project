import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  content: string
  sender: string
  timestamp: string
  isRead: boolean
}

export function MessageList() {
  // This would typically come from an API
  const messages: Message[] = [
    {
      id: "1",
      content: "How do I reset my password?",
      sender: "Komal Sood",
      timestamp: "5 minutes ago",
      isRead: false
    },
    // Add more sample messages
  ]

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.isRead ? 'bg-muted' : 'bg-primary/5'
            }`}
          >
            <div className="flex justify-between items-start">
              <p className="font-medium">{message.sender}</p>
              <span className="text-xs text-muted-foreground">
                {message.timestamp}
              </span>
            </div>
            <p className="text-sm mt-1">{message.content}</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}