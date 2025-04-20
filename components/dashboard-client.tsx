"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Session } from "next-auth"
import { Button } from "@/components/ui/button"

// Define extended session type to match server component
type ExtendedSession = Session & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  }
}
// Import your actual components - you might need to adjust these paths
// If they don't exist, create placeholders
const StudentDashboard = ({ user }: { user: any }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Your Courses</h2>
    {user.studentCourses.length === 0 ? (
      <p>You are not enrolled in any courses yet.</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {user.studentCourses.map((enrollment: any) => (
          <div key={enrollment.course.id} className="bg-card p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">{enrollment.course.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{enrollment.course.description}</p>
            <Progress value={enrollment.course.progress} className="mb-2" />
            <p className="text-xs">{enrollment.course.progress}% complete</p>
          </div>
        ))}
      </div>
    )}
  </div>
)

const AIAgent = () => (
  <div className="p-4 bg-muted-foreground/10">
    <h3 className="text-lg font-semibold">AI Learning Assistant</h3>
    <p>Ask questions about your courses</p>
  </div>
)

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

export default function DashboardClient({ session }: { session: ExtendedSession }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserData() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`)
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText || 'Failed to fetch user data'}`)
          }
          const userData = await response.json()
          setUser(userData)
        } catch (error) {
          console.error('Error fetching user data:', error)
          setError(error instanceof Error ? error.message : 'Failed to load user data')
        }
      } else {
        setError('User ID is missing from session')
      }
      setLoading(false)
    }

    fetchUserData()
  }, [session])

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600">{error}</p>
          <div className="mt-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mr-2"
            >
              Retry
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="ghost"
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // No user data state
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-6 max-w-md">
          <h2 className="text-xl font-semibold text-amber-700 mb-2">User Profile Not Found</h2>
          <p className="text-amber-600">We couldn't find your profile information.</p>
          <div className="mt-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
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
  
  const progress = totalModules === 0 ? 0 : (completedModules / totalModules) * 100

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
