import { Dashboard } from "@/components/dashboard"
import { AIAgent } from "@/components/ai-agent"
import { Progress } from "@/components/ui/progress"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  // This would typically come from a backend API
  const user = {
    name: "Komal Sood",
    completedCourses: 2,
    totalCourses: 5,
    completedModules: 8,
    totalModules: 20,
  }

  const progress = (user.completedModules / user.totalModules) * 100

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
                {user.completedCourses} / {user.totalCourses}
              </p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">Completed Modules</h2>
              <p className="text-2xl">
                {user.completedModules} / {user.totalModules}
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
          <Dashboard />
        </div>
        <AIAgent />
      </div>
      <Footer />
    </>
  )
}