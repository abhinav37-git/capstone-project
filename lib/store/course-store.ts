import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Module {
  id: string
  title: string
  content: string
  progress: number
  resources: {
    type: 'pdf' | 'video' | 'text'
    url: string
    title: string
  }[]
}

export interface Course {
  id: string
  name: string
  modules: Module[]
  students: string[]
  lastUpdated: string
}

interface CourseStore {
  courses: Course[]
  addCourse: (course: Course) => void
  updateCourse: (courseId: string, updates: Partial<Course>) => void
  addModule: (courseId: string, module: Module) => void
  updateModule: (courseId: string, moduleId: string, updates: Partial<Module>) => void
  enrollStudent: (courseId: string, studentId: string) => void
  updateProgress: (courseId: string, moduleId: string, studentId: string, progress: number) => void
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set) => ({
      courses: [],
      addCourse: (course) =>
        set((state) => ({ courses: [...state.courses, course] })),
      updateCourse: (courseId, updates) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId ? { ...course, ...updates } : course
          ),
        })),
      addModule: (courseId, module) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? { ...course, modules: [...course.modules, module] }
              : course
          ),
        })),
      updateModule: (courseId, moduleId, updates) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map((mod) =>
                    mod.id === moduleId ? { ...mod, ...updates } : mod
                  ),
                }
              : course
          ),
        })),
      enrollStudent: (courseId, studentId) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? { ...course, students: [...course.students, studentId] }
              : course
          ),
        })),
      updateProgress: (courseId, moduleId, studentId, progress) =>
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  modules: course.modules.map((mod) =>
                    mod.id === moduleId
                      ? { ...mod, progress }
                      : mod
                  ),
                }
              : course
          ),
        })),
    }),
    {
      name: 'course-storage',
    }
  )
)