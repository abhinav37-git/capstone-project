import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/")
  }

  // Fetch user with approval status
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isApproved: true,
      name: true,
      studentId: true,
      enrollments: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
            }
          }
        }
      }
    }
  })

  if (!user?.isApproved) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Your account is pending approval from a teacher. Please check back later.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.name}</h1>
      <div className="grid gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
          {user.enrollments.length > 0 ? (
            <div className="grid gap-4">
              {user.enrollments.map((enrollment) => (
                <div key={enrollment.course.id} className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium">{enrollment.course.title}</h3>
                  <p className="text-gray-600 mt-1">{enrollment.course.description}</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-800">
                    Continue Learning
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">You are not enrolled in any courses yet.</p>
          )}
        </div>
      </div>
    </div>
  )
} 