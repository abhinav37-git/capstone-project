"use client"

import { StudentDashboard } from "@/components/student/student-dashboard"
import { AIAgent } from "@/components/ai-agent"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface User {
  id: string
  name: string
  email: string
  studentCourses: {
    course: {
      id: string
      title: string
      description: string
      image?: string
      modules: {
        id: string
        title: string
        description: string
        order: number
        content: string
      }[]
      progress: number
    }
  }[]
  queries: {
    id: string
    title: string
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
    createdAt: string
  }[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`)
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
      setLoading(false)
    }

    fetchUserData()
  }, [session])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to access your dashboard.</p>
      </div>
    )
  }

  // Calculate progress metrics
  const completedCourses = user.studentCourses.filter(enrollment => 
    enrollment.course.progress === 100
  ).length
  const totalCourses = user.studentCourses.length
  
  const totalModules = user.studentCourses.reduce(
    (sum, enrollment) => sum + enrollment.course.modules.length, 
    0
  )
  
  const completedModules = user.studentCourses.reduce(
    (sum, enrollment) => sum + Math.floor((enrollment.course.modules.length * enrollment.course.progress) / 100), 
    0
  )
  
  const progress = (completedModules / totalModules) * 100

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="p-6 bg-muted">
          <h1 className="text-3xl font-bold mb-4">Welcome back, {session.user.name}!</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-card p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Completed Courses</h2>
              <p className="text-2xl">
                {completedCourses} / {totalCourses}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Completed Modules</h2>
              <p className="text-2xl">
                {completedModules} / {totalModules}
              </p>
            </div>
          </div>
          <div className="bg-card p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Overall Progress</h2>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">{progress.toFixed(1)}% complete</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <StudentDashboard user={user} />
        </div>
        <AIAgent />
      </div>
      <Footer />
    </>
  )
}