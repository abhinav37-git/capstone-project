"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Laptop, Database, Brain, Cloud } from "lucide-react"

const subjects = [
  { id: "iot", name: "Internet of Things", icon: Laptop },
  { id: "blockchain", name: "Blockchain Technology", icon: Database },
  { id: "ml", name: "Machine Learning", icon: Brain },
  { id: "cloud", name: "Cloud Computing", icon: Cloud },
]

export function Subjects({ onSelectSubject }: { onSelectSubject: (subjectId: string) => void }) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubject(subjectId)
    onSelectSubject(subjectId)
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold mb-4">Enrolled Subjects</h2>
      {subjects.map((subject, index) => (
        <motion.div
          key={subject.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            variant={selectedSubject === subject.id ? "secondary" : "ghost"}
            className="w-full justify-start transition-all duration-200 hover:translate-x-1 group"
            onClick={() => handleSubjectClick(subject.id)}
          >
            <subject.icon className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
            <span className="group-hover:text-primary transition-colors">{subject.name}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  )
}