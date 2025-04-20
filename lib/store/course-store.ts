import { create } from 'zustand'

interface Content {
  id: string
  title: string
  description: string
  type: string
  fileUrl: string
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  progress: number
  content: Content[]
}

export interface Course {
  id: string
  title: string
  description: string
  modules: Module[]
  enrollments: Array<{
    studentId: string
  }>
}

interface CourseStore {
  courses: Course[]
  isLoading: boolean
  error: string | null
  fetchCourses: () => Promise<void>
  fetchAvailableCourses: () => Promise<void>
}

export const useCourseStore = create<CourseStore>()((set) => ({
  courses: [],
  isLoading: false,
  error: null,

  fetchCourses: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/courses/enrolled")
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch courses")
      }
      const data = await response.json()
      set({ courses: data, isLoading: false })
    } catch (error) {
      console.error("Error fetching courses:", error)
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch courses", 
        isLoading: false 
      })
    }
  },

  fetchAvailableCourses: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch("/api/courses/available")
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to fetch available courses")
      }
      const data = await response.json()
      set({ courses: data, isLoading: false })
    } catch (error) {
      console.error("Error fetching available courses:", error)
      set({ 
        error: error instanceof Error ? error.message : "Failed to fetch available courses", 
        isLoading: false 
      })
    }
  },
}))