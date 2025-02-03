import { TeacherNavbar } from "@/components/teacher/teacher-navbar"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <TeacherNavbar />
      {children}
    </div>
  )
}