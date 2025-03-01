"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, Send, X, Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Resizable } from "@/components/ui/resizable"
import { cn } from "@/lib/utils"

const suggestions = [
  "How do I start with IoT basics?",
  "What are the prerequisites for blockchain?",
  "Can you explain machine learning concepts?",
  "How to track my course progress?",
  "What are the best practices for IoT security?",
  "How to implement smart contracts?",
]

export function AIAgent() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<
    { type: "user" | "bot"; content: string; inferredQuery?: string }[]
  >([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 384, height: 512 })
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages]);

  // Dynamically adjust height based on content
  useEffect(() => {
    if (contentRef.current && !isMinimized) {
      const contentHeight = contentRef.current.scrollHeight;
      const minHeight = 200;
      const maxHeight = 600;
      const padding = 120; // Space for header, input, etc.
      const newHeight = Math.min(Math.max(contentHeight + padding, minHeight), maxHeight);
      setWindowSize((prev) => ({ ...prev, height: newHeight }));
    }
  }, [messages, isMinimized]);

  // ... (toggleAgent, handleSendMessage, handleKeyPress, getAIResponse, extractPageData unchanged) ...

  const toggleAgent = () => {
    setIsOpen(!isOpen)
    setInputValue("")
    setMessages([])
    setIsMinimized(false)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { type: "user" as const, content: inputValue }
    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const { inferredQuery, response } = await getAIResponse(inputValue)
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: response, inferredQuery },
      ])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: "Sorry, something went wrong. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getAIResponse = async (query: string) => {
    const pageData = extractPageData()
    try {
      const response = await fetch("http://localhost:5001/api/ai-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, pageData }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData?.message || response.statusText}`)
      }

      const data = await response.json() // Assuming API returns JSON now
      // Mock structure; adjust based on your API
      return {
      
        response: data.response || "Here's my response to your query.",
      }
    } catch (error) {
      console.error("Error fetching AI response:", error)
      throw error
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

  const handleResize = (width: number, height: number) => {
    setWindowSize({ width, height })
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end space-y-4">
      {isOpen && (
        <Resizable
          minWidth={300}
          minHeight={200}
          maxWidth={800}
          maxHeight={600}
          defaultWidth={windowSize.width}
          defaultHeight={windowSize.height}
          onResize={handleResize}
        >
          <Card className="flex flex-col shadow-lg h-full w-full">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleMinimize}>
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleAgent}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                  <div ref={contentRef}>
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

                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}
                        >
                          <div
                            className={cn(
                              "max-w-[80%] p-3 rounded-lg",
                              message.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground",
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.inferredQuery && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                {message.inferredQuery}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSendMessage()
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading}>
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </Resizable>
      )}

      <Button onClick={toggleAgent} className="rounded-full">
        <Bot className="mr-2 h-4 w-4" />
        AI Agent
      </Button>
    </div>
  )
}