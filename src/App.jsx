import { Button, Card, CardHeader, CardContent, Input, Navbar, NavbarLink } from "@/components/ui"
import { useState } from "react"

const modules = [
  {
    id: 1,
    title: "Module 1: Introduction to AI",
    content: ["Chapter 1: What is AI?", "Chapter 2: History of AI"],
  },
  {
    id: 2,
    title: "Module 2: Machine Learning",
    content: [
      "Chapter 1: Supervised Learning",
      "Chapter 2: Unsupervised Learning",
      "Chapter 3: Reinforcement Learning",
    ],
  },
  {
    id: 3,
    title: "Module 3: Deep Learning",
    content: [
      "Chapter 1: Neural Networks",
      "Chapter 2: Convolutional Neural Networks",
      "Chapter 3: Recurrent Neural Networks",
    ],
  },
]

const Dashboard = () => {
  const [expandedModule, setExpandedModule] = useState(null)

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId)
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar className="mb-6">
        <NavbarLink href="#" className="font-bold text-lg">
          Smart Module
        </NavbarLink>
        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.1H4.75c-1.133 0-1.98-.964-1.98-2.1v-4.286c0-.969.616-1.813 1.5-2.097m16.022 0h-7.988c-.523 0-.96-.74-1.008-1.296M20.25 8.511v-3.872c0-.87-.617-1.591-1.5-1.816m-7.992 0V4.645L12.25 12l7.992-7.355m-7.992 0a3 3 0 10-3 3m3 0a3 3 0 113-3m-3 0H6.02c0 1.604 1.03 3 2.5 3"
              />
            </svg>
          </Button>
        </div>
      </Navbar>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader className="cursor-pointer" onClick={() => toggleModule(module.id)}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{module.title}</h3>
                <span className="text-sm">{expandedModule === module.id ? "▲" : "▼"}</span>
              </div>
            </CardHeader>
            {expandedModule === module.id && (
              <CardContent>
                <ul className="list-disc pl-5 space-y-1">
                  {module.content.map((chapter, index) => (
                    <li key={index}>{chapter}</li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="fixed bottom-4 left-4">
        <Card className="w-64">
          <CardHeader>
            <h3 className="text-lg font-semibold">AI Agent</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Type your question..." />
            <Button className="w-full">Ask</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard