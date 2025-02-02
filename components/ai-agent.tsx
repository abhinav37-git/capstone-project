"use client"

import { useState } from "react"
import { Bot, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AIAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<{ type: 'user' | 'bot', content: string }[]>([])

  const suggestions = [
    "How do I start with IoT basics?",
    "What are the prerequisites for blockchain?",
    "Can you explain machine learning concepts?",
    "How to track my course progress?",
    "What are the best practices for IoT security?",
    "How to implement smart contracts?",
  ]

  const toggleAgent = () => {
    setIsOpen(!isOpen)
    setInputValue("")
  }

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { type: 'user', content: inputValue }])
      setInputValue("")
      // Here you would typically handle the AI response
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-4">
      {isOpen && (
        <Card className="w-96 h-[32rem] flex flex-col shadow-lg">
          {/* Header */}
          <div className="p-4 border-b flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>

          {/* Main Content Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 && !inputValue && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Suggested questions:</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors"
                    onClick={() => setInputValue(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {/* Chat Messages */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <Button onClick={toggleAgent} className="rounded-full">
        <Bot className="mr-2 h-4 w-4" />
        AI Agent
      </Button>
    </div>
  )
}