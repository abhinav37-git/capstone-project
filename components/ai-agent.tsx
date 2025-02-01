"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot } from "lucide-react"

export function AIAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const toggleAgent = () => setIsOpen(!isOpen)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the message to your AI backend
    console.log("Sending message:", message)
    setMessage("")
  }

  return (
    <div className="fixed bottom-4 left-4">
      {isOpen && (
        <div className="bg-background border rounded-lg shadow-lg p-4 mb-2 w-80">
          <div className="mb-4 h-40 overflow-y-auto bg-muted p-2 rounded">
            {/* AI conversation would be displayed here */}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask me anything..." />
            <Button type="submit">Send</Button>
          </form>
        </div>
      )}
      <Button onClick={toggleAgent} className="rounded-full">
        <Bot className="mr-2 h-4 w-4" />
        AI Agent
      </Button>
    </div>
  )
}

