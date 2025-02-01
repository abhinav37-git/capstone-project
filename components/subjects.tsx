"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

const subjects = [
  { id: "iot", name: "Internet of Things" },
  { id: "blockchain", name: "Blockchain Technology" },
  { id: "ml", name: "Machine Learning" },
  { id: "cloud", name: "Cloud Computing" },
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
      {subjects.map((subject) => (
        <Button
          key={subject.id}
          variant={selectedSubject === subject.id ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => handleSubjectClick(subject.id)}
        >
          {subject.name}
        </Button>
      ))}
    </div>
  )
}

