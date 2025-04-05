import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/route";

// TypeScript interfaces
interface ModuleUpdate {
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  position?: number;
  isPublished?: boolean;
  courseId?: string;
}

// Zod schemas
const moduleUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  position: z.number().int().positive().optional(),
  isPublished: z.boolean().optional(),
  courseId: z.string().uuid().optional(),
});

const progressSchema = z.object({
  isCompleted: z.boolean(),
});

// Authorization helper
async function isAuthorized(userId: string, moduleId: string): Promise<boolean> {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { createdById: true } } },
  });
  return module?.course?.createdById === userId;
}

// GET handler
export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        resources: true,
        course: { select: { id: true, title: true, createdById: true } },
      },
    });
    
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    
    const isCreator = module.course.createdById === userId;
    if (!module.isPublished && !isCreator) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    // Track progress for enrolled students
    const isEnrolled = await prisma.userEnrollment.findFirst({
      where: { userId, courseId: module.courseId },
    });
    
    if (isEnrolled && module.isPublished) {
      await prisma.moduleProgress.upsert({
        where: { userId_moduleId: { userId, moduleId } },
        update: { lastAccessed: new Date() },
        create: { userId, moduleId, lastAccessed: new Date(), isCompleted: false },
      });
    }
    
    const progress = await prisma.moduleProgress.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });
    
    return NextResponse.json({ ...module, progress: progress || null, isCreator });
  } catch (error) {
    console.error("Error fetching module:", error);
    return NextResponse.json(
      { error: `Failed to fetch module: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// PATCH handler
export async function PATCH(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    if (!(await isAuthorized(userId, moduleId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await req.json();
    const validationResult = moduleUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const updateData: ModuleUpdate = validationResult.data;
    
    // Handle course change permission
    if (updateData.courseId) {
      const course = await prisma.course.findUnique({
        where: { id: updateData.courseId },
      });
      
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      
      if (course.createdById !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    
    // Handle position changes
    if (updateData.position !== undefined) {
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        select: { courseId: true, position: true },
      });
      
      if (!module) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
      
      const targetCourseId = updateData.courseId || module.courseId;
      const moduleCount = await prisma.module.count({ where: { courseId: targetCourseId } });
      updateData.position = Math.min(Math.max(1, updateData.position), moduleCount);
      
      // Update other module positions
      await handlePositionChanges(moduleId, module.courseId, targetCourseId, module.position, updateData.position);
    }
    
    // Update the module
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: updateData,
      include: {
        resources: true,
        course: { select: { id: true, title: true } },
      },
    });
    
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: `Failed to update module: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    if (!(await isAuthorized(userId, moduleId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true, position: true },
    });
    
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    
    // Transaction to delete module and update related data
    await prisma.$transaction([
      prisma.moduleProgress.deleteMany({ where: { moduleId } }),
      prisma.resource.updateMany({ where: { moduleId }, data: { moduleId: null } }),
      prisma.module.delete({ where: { id: moduleId } }),
      prisma.module.updateMany({
        where: {
          courseId: module.courseId,
          position: { gt: module.position },
        },
        data: { position: { decrement: 1 } },
      }),
    ]);
    
    return NextResponse.json({ message: "Module deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { error: `Failed to delete module: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// PUT handler for progress tracking
export async function PUT(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { moduleId } = params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await req.json();
    
    const validationResult = progressSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { isCompleted } = validationResult.data;
    
    // Verify module and enrollment
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { courseId: true, isPublished: true },
    });
    
    if (!module) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }
    
    if (!module.isPublished) {
      return NextResponse.json(
        { error: "Cannot mark unpublished module as completed" }, 
        { status: 400 }
      );
    }
    
    const enrollment = await prisma.userEnrollment.findFirst({
      where: { userId, courseId: module.courseId },
    });
    
    if (!enrollment) {
      return NextResponse.json(
        { error: "You must be enrolled in this course" },
        { status: 403 }
      );
    }
    
    // Update progress
    const progress = await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId, moduleId } },
      update: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessed: new Date(),
      },
      create: {
        userId,
        moduleId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessed: new Date(),
      },
    });
    
    // Check course completion
    if (isCompleted) {
      await updateCourseCompletion(userId, module.courseId);
    }
    
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: `Failed to update progress: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// Helper functions
async function handlePositionChanges(
  moduleId: string,
  currentCourseId: string,
  targetCourseId: string,
  currentPosition: number,
  newPosition: number
) {
  if (targetCourseId === currentCourseId) {
    // Moving within same course
    if (newPosition > currentPosition) {
      await prisma.module.updateMany({
        where: {
          courseId: targetCourseId,
          position: { gt: currentPosition, lte: newPosition },
        },
        data: { position: { decrement: 1 } },
      });
    } else {
      await prisma.module.updateMany({
        where: {
          courseId: targetCourseId,
          position: { gte: newPosition, lt: currentPosition },
        },
        data: { position: { increment: 1 } },
      });
    }
  } else {
    // Moving to different course
    await prisma.module.updateMany({
      where: {
        courseId: targetCourseId,
        position: { gte: newPosition },
      },
      data: { position: { increment: 1 } },
    });
    
    await prisma.module.updateMany({
      where: {
        courseId: currentCourseId,
        position: { gt: currentPosition },
      },
      data: { position: { decrement: 1 } },
    });
  }
}

async function updateCourseCompletion(userId: string, courseId: string) {
  const publishedModules = await prisma.module.findMany({
    where: { courseId, isPublished: true },
    select: { id: true },
  });
  
  const completedModules = await prisma.moduleProgress.findMany({
    where: {
      userId,
      moduleId: { in: publishedModules.map(m => m.id) },
      isCompleted: true,
    },
  });
  
  const allCompleted = completedModules.length === publishedModules.length;
  
  if (allCompleted) {
    await prisma.courseProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId, courseId, completed: true, completedAt: new Date() },
    });
  }
}
