import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get enrolled courses for the student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                content: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    // Get progress for all modules
    const progress = await prisma.progress.findMany({
      where: {
        studentId: session.user.id,
      },
    });

    // Transform the data to include progress
    const coursesWithProgress = enrollments.map(enrollment => {
      const course = enrollment.course;
      const modulesWithProgress = course.modules.map(module => {
        const moduleProgress = progress.find(p => p.moduleId === module.id);
        return {
          ...module,
          progress: moduleProgress ? 
            (moduleProgress.status === "COMPLETED" ? 100 : 
             moduleProgress.status === "IN_PROGRESS" ? 50 : 0) : 0
        };
      });

      return {
        ...course,
        modules: modulesWithProgress,
        enrollments: [{ studentId: session.user.id }],
      };
    });

    return NextResponse.json(coursesWithProgress);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrolled courses" },
      { status: 500 }
    );
  }
} 