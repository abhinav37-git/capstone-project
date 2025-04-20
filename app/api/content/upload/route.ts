import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "TEACHER") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !courseId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    // Create course-specific directory
    const courseDir = join(UPLOAD_DIR, courseId)
    if (!existsSync(courseDir)) {
      mkdirSync(courseDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`
    const filepath = join(courseDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Get the latest module order
    const latestModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const nextOrder = (latestModule?.order || 0) + 1

    // Create module and content in database
    const newModule = await prisma.module.create({
      data: {
        title,
        description: description || '',
        order: nextOrder,
        courseId,
        content: {
          create: {
            title: file.name,
            description: description || '',
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type.includes('presentation') ? 'presentation' : 'document',
            fileUrl: `/uploads/${courseId}/${filename}`
          }
        }
      },
      include: {
        content: true
      }
    })

    return NextResponse.json({
      module: newModule,
      file: {
        title: file.name,
        url: `/uploads/${courseId}/${filename}`,
        type: file.type
      }
    })
  } catch (error) {
    console.error("[CONTENT_UPLOAD]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 