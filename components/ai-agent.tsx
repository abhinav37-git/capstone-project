"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AIAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleAgent = () => setIsOpen(!isOpen)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      setMessages([...messages, { sender: "user", text: message }])
      setIsLoading(true)
      const response = await getAIResponse(message)
      setMessages((prevMessages) => [...prevMessages, { sender: "ai", text: response }])
      setMessage("")
      setIsLoading(false)
    }
  }

  const getAIResponse = async (query: string) => {
    const pageData = extractPageData()
    try {
      const response = await fetch("http://localhost:5001/api/ai-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, pageData }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.answer
    } catch (error) {
      console.error("Error fetching AI response:", error)
      return "Sorry, I'm having trouble connecting to the server. Please try again later."
    }
  }

  const extractPageData = () => {
    const user = {
      name: "Komal Sood",
      completedCourses: 2,
      totalCourses: 5,
      completedModules: 8,
      totalModules: 20,
    }
    return JSON.stringify(user)
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {isOpen && (
        <div className="bg-background border rounded-lg shadow-lg p-4 mb-2 w-80 animate-slide-in">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">AI Agent</h2>
            <Button variant="ghost" size="icon" onClick={toggleAgent}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mb-4 h-40 overflow-y-auto bg-muted p-2 rounded">
            {messages.map((msg, index) => (
              <div key={index} className={cn("mb-2", msg.sender === "ai" ? "text-left" : "text-right")}>
                <div
                  className={cn(
                    "inline-block p-2 rounded-lg",
                    msg.sender === "ai" ? "bg-secondary" : "bg-primary text-primary-foreground",
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask me anything..." />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
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