"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StudentQueryForm } from "./student-query-form"
import { StudentQueries } from "./student-queries"

interface Module {
  id: string
  title: string
  description: string
  order: number
  content: string
}

interface Course {
  id: string
  title: string
  description: string
  image?: string
  modules: Module[]
  progress: number
}

interface User {
  id: string
  name: string
  email: string
  studentCourses: {
    course: Course
  }[]
  queries: {
    id: string
    title: string
    status: "OPEN" | "IN_PROGRESS" | "RESOLVED"
    createdAt: string
  }[]
}

interface StudentDashboardProps {
  user: User
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("courses")
  
  // Calculate some dashboard metrics
  const totalCourses = user.studentCourses.length
  const totalModules = user.studentCourses.reduce(
    (sum, enrollment) => sum + enrollment.course.modules.length, 
    0
  )
  const openQueries = user.queries.filter(q => q.status === "OPEN").length

  // Calculate overall progress across all courses
  const calculateOverallProgress = () => {
    if (totalCourses === 0) return 0
    
    const totalProgress = user.studentCourses.reduce(
      (sum, enrollment) => sum + enrollment.course.progress, 
      0
    )
    return Math.round(totalProgress / totalCourses)
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Dashboard summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Enrolled Courses
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Modules
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateOverallProgress()}%
            </div>
            <Progress className="mt-2" value={calculateOverallProgress()} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Queries
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openQueries}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="modules">Current Modules</TabsTrigger>
          <TabsTrigger value="queries">My Queries</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Enrolled Courses</h2>
          {user.studentCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">You are not enrolled in any courses yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.studentCourses.map((enrollment) => (
                <Card key={enrollment.course.id} className="overflow-hidden">
                  {enrollment.course.image && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={enrollment.course.image} 
                        alt={enrollment.course.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{enrollment.course.title}</CardTitle>
                    <CardDescription>
                      {enrollment.course.modules.length} modules available
                    </CardDescription>
                    <Progress value={enrollment.course.progress || 0} className="mt-2" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {enrollment.course.description}
                    </p>
                    <a
                      href={`/dashboard/courses/${enrollment.course.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Continue Learning →
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Current Modules</h2>
          {totalModules === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No modules are available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {user.studentCourses.map((enrollment) => (
                <Card key={enrollment.course.id}>
                  <CardHeader>
                    <CardTitle>{enrollment.course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {enrollment.course.modules.map((module) => (
                        <div 
                          key={module.id} 
                          className="p-3 border rounded-lg flex justify-between items-center"
                        >
                          <div>
                            <h3 className="font-medium">{module.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {module.description}
                            </p>
                          </div>
                          <a
                            href={`/dashboard/courses/${enrollment.course.id}/modules/${module.id}`}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Study →
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Queries Tab */}
        <TabsContent value="queries" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold mb-4">Submit a Query</h2>
              <StudentQueryForm />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">Query History</h2>
              <StudentQueries />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

