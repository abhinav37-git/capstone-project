"use client"

import { StudentDashboard } from "@/components/student/student-dashboard"
import { AIAgent } from "@/components/ai-agent"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  // This would typically come from a backend API
  // This would typically come from a backend API
  const user = {
    id: "u123",
    name: "Komal Sood",
    email: "komal.sood@example.com",
    studentCourses: [
      {
        course: {
          id: "c1",
          title: "Introduction to Programming",
          description: "Learn the basics of programming with JavaScript and Python",
          image: "/images/course-intro-programming.jpg",
          modules: [
            {
              id: "m1",
              title: "Getting Started with JavaScript",
              description: "Learn about variables, data types, and basic operations",
              order: 1,
              content: "JavaScript content here"
            },
            {
              id: "m2",
              title: "Control Flow",
              description: "Learn about conditionals and loops",
              order: 2,
              content: "Control flow content here"
            },
            {
              id: "m3",
              title: "Functions",
              description: "Learn about defining and using functions",
              order: 3,
              content: "Functions content here"
            }
          ],
          progress: 70
        }
      },
      {
        course: {
          id: "c2",
          title: "Web Development Fundamentals",
          description: "Learn HTML, CSS, and responsive design principles",
          image: "/images/course-web-dev.jpg",
          modules: [
            {
              id: "m4",
              title: "HTML Basics",
              description: "Learn about HTML structure and elements",
              order: 1,
              content: "HTML content here"
            },
            {
              id: "m5",
              title: "CSS Styling",
              description: "Learn about CSS selectors and properties",
              order: 2,
              content: "CSS content here"
            }
          ],
          progress: 40
        }
      }
    ],
    queries: [
      {
        id: "q1",
        title: "How do I create a responsive navigation bar?",
        status: "RESOLVED",
        createdAt: "2023-06-15T10:30:00Z"
      },
      {
        id: "q2",
        title: "I'm having trouble understanding async/await",
        status: "IN_PROGRESS",
        createdAt: "2023-06-18T14:20:00Z"
      },
      {
        id: "q3",
        title: "What's the difference between let and const?",
        status: "OPEN",
        createdAt: "2023-06-20T09:15:00Z"
      }
    ]
  }

  // For the progress bar at the top, we'll derive these values from the new structure
  const completedCourses = user.studentCourses.filter(enrollment => 
    enrollment.course.progress === 100
  ).length
  const totalCourses = user.studentCourses.length
  
  // Count modules
  const totalModules = user.studentCourses.reduce(
    (sum, enrollment) => sum + enrollment.course.modules.length, 
    0
  )
  
  // Estimate completed modules based on progress
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
          <h1 className="text-3xl font-bold mb-4">Welcome back, {user.name}!</h1>
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