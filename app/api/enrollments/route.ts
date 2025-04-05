import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

// TypeScript types
type EnrollmentStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "DROPPED";

// Zod schemas
const enrollmentSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "DROPPED"]).optional(),
  userId: z.string().uuid("Invalid user ID").optional(),
});

const updateSchema = z.object({
  enrollmentId: z.string().uuid("Invalid enrollment ID"),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED", "DROPPED"]),
});

// Helper functions
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

// GET handler
export async function GET(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const url = new URL(req.url);
    
    // Parse query params
    const status = url.searchParams.get("status") as EnrollmentStatus | null;
    const courseId = url.searchParams.get("courseId");
    let targetUserId = url.searchParams.get("userId");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const page = parseInt(url.searchParams.get("page") || "1");
    
    // Authorization check for viewing others' enrollments
    const adminUser = await isAdmin(userId);
    if (targetUserId && targetUserId !== userId && !adminUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Default to current user if not specified
    if (!targetUserId) {
      targetUserId = userId;
    }
    
    // Build query filter
    const where: any = { userId: targetUserId };
    if (status) where.status = status;
    if (courseId) where.courseId = courseId;
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalCount = await prisma.userEnrollment.count({ where });
    
    // Fetch enrollments
    const enrollments = await prisma.userEnrollment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            isPublished: true,
            createdBy: {
              select: { id: true, name: true },
            },
            _count: {
              select: {
                modules: { where: { isPublished: true } },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
      skip,
      take: limit,
    });
    
    // Add progress information
    const enrollmentsWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const completedModules = await prisma.moduleProgress.count({
          where: {
            userId: enrollment.userId,
            module: {
              courseId: enrollment.courseId,
              isPublished: true,
            },
            isCompleted: true,
          },
        });
        
        const totalModules = enrollment.course._count.modules;
        const progressPercentage = totalModules > 0 
          ? Math.round((completedModules / totalModules) * 100) 
          : 0;
        
        return {
          ...enrollment,
          progress: {
            completedModules,
            totalModules,
            percentage: progressPercentage,
          },
        };
      })
    );
    
    return NextResponse.json({
      enrollments: enrollmentsWithProgress,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: `Failed to fetch enrollments: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await req.json();
    
    // Validation
    const validationResult = enrollmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { courseId, status } = validationResult.data;
    let targetUserId = userId;
    
    // Handle admin enrolling another user
    if (validationResult.data.userId) {
      if (!(await isAdmin(userId))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      targetUserId = validationResult.data.userId;
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }
    
    // Verify course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        prerequisites: true,
        _count: { select: { enrollments: true } },
      },
    });
    
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    // Check if course is published
    const adminUser = await isAdmin(userId);
    const isCreator = course.createdById === userId;
    if (!course.isPublished && !adminUser && !isCreator) {
      return NextResponse.json({ error: "Course is not published" }, { status: 400 });
    }
    
    // Check for existing enrollment
    const existingEnrollment = await prisma.userEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: targetUserId,
          courseId,
        },
      },
    });
    
    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled", enrollment: existingEnrollment },
        { status: 409 }
      );
    }
    
    // Check enrollment capacity
    if (course.capacity && course._count.enrollments >= course.capacity) {
      return NextResponse.json({ error: "Course capacity reached" }, { status: 400 });
    }
    
    // Check prerequisites (skip for admins)
    if (course.prerequisites.length > 0 && !adminUser) {
      const prerequisiteIds = course.prerequisites.map(p => p.prerequisiteId);
      
      const completedPrerequisites = await prisma.userEnrollment.count({
        where: {
          userId: targetUserId,
          courseId: { in: prerequisiteIds },
          status: "COMPLETED",
        },
      });
      
      if (completedPrerequisites < prerequisiteIds.length) {
        const incompletePrerequisites = await prisma.course.findMany({
          where: {
            id: {
              in: prerequisiteIds,
            },
            NOT: {
              enrollments: {
                some: {
                  userId: targetUserId,
                  status: "COMPLETED",
                },
              },
            },
          },
          select: { id: true, title: true },
        });
        
        return NextResponse.json(
          { error: "Prerequisites not completed", incompletePrerequisites },
          { status: 400 }
        );
      }
    }
    
    // Create enrollment
    const enrollment = await prisma.userEnrollment.create({
      data: {
        userId: targetUserId,
        courseId,
        status: status || "ACTIVE",
        enrolledAt: new Date(),
      },
      include: {
        course: {
          select: {
            title: true,
            modules: {
              where: { isPublished: true },
              select: { id: true },
              orderBy: { position: "asc" },
            },
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });
    
    // Initialize course progress
    await prisma.courseProgress.create({
      data: {
        userId: targetUserId,
        courseId,
        completed: false,
      },
    });
    
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { error: `Failed to create enrollment: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// PATCH handler
export async function PATCH(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await req.json();
    
    // Validation
    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { enrollmentId, status } = validationResult.data;
    
    // Get enrollment and check authorization
    const enrollment = await prisma.userEnrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: { select: { createdById: true } },
      },
    });
    
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    
    // Check permissions
    const isOwnEnrollment = enrollment.userId === userId;
    const adminUser = await isAdmin(userId);
    const isCourseCreator = enrollment.course.createdById === userId;
    
    if (!isOwnEnrollment && !adminUser && !isCourseCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Regular users can only drop, not mark as completed
    if (isOwnEnrollment && !adminUser && !isCourseCreator && status === "COMPLETED") {
      return NextResponse.json(
        { error: "Only admins or course creators can mark as completed" },
        { status: 403 }
      );
    }
    
    // Update enrollment
    const updatedEnrollment = await prisma.userEnrollment.update({
      where: { id: enrollmentId },
      data: { status },
      include: {
        course: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } },
      },
    });
    
    // If marked as completed, update course progress
    if (status === "COMPLETED") {
      await prisma.courseProgress.upsert({
        where: {
          userId_courseId: {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
        create: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          completed: true,
          completedAt: new Date(),
        },
      });
    }
    
    return NextResponse.json(updatedEnrollment);
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json(
      { error: `Failed to update enrollment: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
