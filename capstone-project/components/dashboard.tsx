"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const modules = [
  {
    id: "module1",
    title: "Introduction to IoT",
    content: "Learn the basics of Internet of Things (IoT) and its applications.",
  },
  {
    id: "module2",
    title: "Difference between IoT and Cloud",
    content: "Understand how to manage IoT devices and cloud services effectively.",
  },
  {
    id: "module3",
    title: "Applications of IoT",
    content: "Explore various applications of IoT in different industries.",
  },
]

export function Dashboard() {
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Course Modules</h2>
      <Accordion type="multiple" value={expandedModules} className="w-full">
        {modules.map((module) => (
          <AccordionItem key={module.id} value={module.id}>
            <AccordionTrigger onClick={() => toggleModule(module.id)}>{module.title}</AccordionTrigger>
            <AccordionContent>{module.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

