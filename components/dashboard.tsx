"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Subjects } from "@/components/subjects"

const modules = {
  iot: [
    {
      id: "iot-basics", // More descriptive ID
      title: "IoT Fundamentals", // More consistent title style
      content: "Learn the basics of Internet of Things (IoT) and its applications.",
    },
    {
      id: "iot-applications", // More descriptive ID
      title: "IoT Applications", // More consistent title style
      content: "Explore practical applications of IoT in various industries.",
    },
  ],
  blockchain: [
    {
      id: "blockchain-intro", // More descriptive ID
      title: "Introduction to Blockchain", // More consistent title style
      content: "Understand the core concepts of blockchain technology.",
    },
    {
      id: "blockchain-usecases", // More descriptive ID
      title: "Blockchain Use Cases", // More consistent title style
      content: "Explore real-world applications of blockchain beyond cryptocurrencies.",
    },
  ],
  ml: [
    {
      id: "ml-basics", // More descriptive ID
      title: "Machine Learning Basics", // More consistent title style
      content: "Learn fundamental machine learning algorithms and techniques.",
    },
    {
      id: "ml-deeplearning", // More descriptive ID
      title: "Deep Learning", // More consistent title style
      content: "Introduction to deep learning and neural networks.",
    },
  ],
  cloud: [
    {
      id: "cloud-fundamentals", // More descriptive ID
      title: "Cloud Computing Fundamentals", // More consistent title style
      content: "Understand the basics of cloud computing and its services.",
    },
    {
      id: "cloud-architecture", // More descriptive ID
      title: "Cloud Architecture", // More consistent title style
      content: "Explore different cloud architectures and best practices.",
    },
  ],
};

export function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setExpandedModules([])
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-64 bg-muted p-4 overflow-y-auto">
        <Subjects onSelectSubject={handleSubjectSelect} />
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedSubject ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {modules[selectedSubject as keyof typeof modules][0].title.split(" ")[0]} Modules
            </h2>
            <Accordion type="multiple" value={expandedModules} className="w-full">
              {modules[selectedSubject as keyof typeof modules].map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger onClick={() => toggleModule(module.id)}>{module.title}</AccordionTrigger>
                  <AccordionContent>{module.content}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">Select a subject to view its modules</div>
        )}
      </div>
    </div>
  )
}

