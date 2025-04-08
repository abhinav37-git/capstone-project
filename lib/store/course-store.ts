import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Module {
  id: string
  title: string
  content: string
  resources?: {
    type: string
    url: string
    title: string
  }[]
}

export interface Course {
  id: string
  title: string
  description: string
  modules?: Module[]
  enrolledStudents?: string[]
}

interface CourseStore {
  courses: Course[]
  isLoading: boolean
  error: string | null
  fetchCourses: () => Promise<void>
  addCourse: (course: { title: string; description: string }) => Promise<void>
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<void>
  addModule: (courseId: string, module: Module) => Promise<void>
  enrollStudent: (courseId: string, studentId: string) => Promise<void>
  updateProgress: (courseId: string, studentId: string, progress: number) => Promise<void>
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      courses: [],
      isLoading: false,
      error: null,

      fetchCourses: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/courses")
          if (!response.ok) throw new Error("Failed to fetch courses")
          const data = await response.json()
          set({ courses: data, isLoading: false })
        } catch (error) {
          set({ error: "Failed to fetch courses", isLoading: false })
        }
      },

      addCourse: async (course) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/courses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(course),
          })
          if (!response.ok) throw new Error("Failed to add course")
          const newCourse = await response.json()
          set((state) => ({
            courses: [...state.courses, newCourse],
            isLoading: false,
          }))
        } catch (error) {
          set({ error: "Failed to add course", isLoading: false })
          throw error
        }
      },

      updateCourse: async (courseId, updates) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/courses/${courseId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })
          if (!response.ok) throw new Error("Failed to update course")
          const updatedCourse = await response.json()
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId ? updatedCourse : course
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({ error: "Failed to update course", isLoading: false })
        }
      },

      addModule: async (courseId, module) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/courses/${courseId}/modules`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(module),
          })
          if (!response.ok) throw new Error("Failed to add module")
          const updatedCourse = await response.json()
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId ? updatedCourse : course
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({ error: "Failed to add module", isLoading: false })
        }
      },

      enrollStudent: async (courseId, studentId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/courses/${courseId}/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: studentId }),
          })
          if (!response.ok) throw new Error("Failed to enroll student")
          const updatedCourse = await response.json()
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId ? updatedCourse : course
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({ error: "Failed to enroll student", isLoading: false })
        }
      },

      updateProgress: async (courseId, studentId, progress) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/courses/${courseId}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: studentId, progress }),
          })
          if (!response.ok) throw new Error("Failed to update progress")
          const updatedCourse = await response.json()
          set((state) => ({
            courses: state.courses.map((course) =>
              course.id === courseId ? updatedCourse : course
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({ error: "Failed to update progress", isLoading: false })
        }
      },
    }),
    {
      name: 'course-store',
    }
  )
)