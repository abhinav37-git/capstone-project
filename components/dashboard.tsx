"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Subjects } from "@/components/subjects"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const modules = {
  iot: [
    {
      id: "iot-basics",
      title: "IoT Fundamentals",
      content: "Learn the basics of Internet of Things (IoT) and its applications.",
      progress: 75,
    },
    {
      id: "iot-applications",
      title: "IoT Applications",
      content: "Explore practical applications of IoT in various industries.",
      progress: 50,
    },
  ],
  blockchain: [
    {
      id: "blockchain-intro",
      title: "Introduction to Blockchain",
      content: "Understand the core concepts of blockchain technology.",
      progress: 90,
    },
    {
      id: "blockchain-usecases",
      title: "Blockchain Use Cases",
      content: "Explore real-world applications of blockchain beyond cryptocurrencies.",
      progress: 30,
    },
  ],
  ml: [
    {
      id: "ml-basics",
      title: "Machine Learning Basics",
      content: "Learn fundamental machine learning algorithms and techniques.",
      progress: 60,
    },
    {
      id: "ml-deeplearning",
      title: "Deep Learning",
      content: "Introduction to deep learning and neural networks.",
      progress: 40,
    },
  ],
  cloud: [
    {
      id: "cloud-fundamentals",
      title: "Cloud Computing Fundamentals",
      content: "Understand the basics of cloud computing and its services.",
      progress: 80,
    },
    {
      id: "cloud-architecture",
      title: "Cloud Architecture",
      content: "Explore different cloud architectures and best practices.",
      progress: 20,
    },
  ],
}

export function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setExpandedModules([])
    setSearchTerm("")
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const filteredModules = selectedSubject
    ? modules[selectedSubject as keyof typeof modules].filter((module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <motion.div
        className="w-64 bg-muted p-4 overflow-y-auto"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Subjects onSelectSubject={handleSubjectSelect} />
      </motion.div>
      <motion.div
        className="flex-1 p-6 overflow-y-auto"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {selectedSubject ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              {modules[selectedSubject as keyof typeof modules][0].title.split(" ")[0]} Modules
            </h2>
            <div className="mb-4 relative">
              <Input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <AnimatePresence>
              {filteredModules.length > 0 ? (
                <Accordion type="multiple" value={expandedModules} className="w-full">
                  {filteredModules.map((module, index) => (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AccordionItem value={module.id}>
                        <AccordionTrigger onClick={() => toggleModule(module.id)}>{module.title}</AccordionTrigger>
                        <AccordionContent>
                          <p className="mb-2">{module.content}</p>
                          <div className="flex items-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex-grow mr-2">
                                    <Progress value={module.progress} />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Module progress: {module.progress}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span className="text-sm text-muted-foreground">{module.progress}%</span>
                          </div>
                          <Button className="mt-4" variant="outline">
                            Continue Learning
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-center text-muted-foreground">No modules found matching your search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">Select a subject to view its modules</div>
        )}
      </motion.div>
    </div>
  )
}