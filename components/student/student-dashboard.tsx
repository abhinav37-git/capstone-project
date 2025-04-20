"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { useCourseStore } from "@/lib/store/course-store"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
}

interface StudentDashboardProps {
  user: User
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const { courses, isLoading, error, fetchCourses } = useCourseStore()
  const [activeTab, setActiveTab] = useState("courses")

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  // Filter courses that the student is enrolled in
  const enrolledCourses = courses.filter((course) =>
    course.enrollments.some(enrollment => enrollment.studentId === user.id)
  )

  const totalCourses = enrolledCourses.length
  const completedCourses = enrolledCourses.filter(course => 
    course.modules.every(module => module.progress === 100)
  ).length

  const totalModules = enrolledCourses.reduce(
    (acc, course) => acc + course.modules.length,
    0
  )
  const completedModules = enrolledCourses.reduce(
    (acc, course) => acc + course.modules.filter(m => m.progress === 100).length,
    0
  )

  const overallProgress = totalModules > 0 
    ? Math.round((completedModules / totalModules) * 100) 
    : 0

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    toast.error(error)
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCourses} / {totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedModules} / {totalModules}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-2">{overallProgress}% complete</p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="modules">Current Modules</TabsTrigger>
        </TabsList>
        <TabsContent value="courses">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {Math.round(
                          (course.modules.filter((m) => m.progress === 100).length /
                            course.modules.length) *
                            100
                        )}%
                      </span>
                    </div>
                    <Progress
                      value={
                        (course.modules.filter((m) => m.progress === 100).length /
                          course.modules.length) *
                        100
                      }
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="modules">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) =>
              course.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {course.title}
                    </p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

