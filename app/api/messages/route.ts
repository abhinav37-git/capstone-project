import { NextResponse } from 'next/server'
import type { Message } from '@/lib/types'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Message validation schema
const messageSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  senderId: z.string().uuid("Invalid sender ID"),
  receiverId: z.string().uuid("Invalid receiver ID"),
  conversationId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate the message data
    const validationResult = messageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid message data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const messageData = validationResult.data;

    // Save the message to the database
    const message = await prisma.message.create({
      data: {
        content: messageData.content,
        sender: { connect: { id: messageData.senderId } },
        receiver: { connect: { id: messageData.receiverId } },
        conversation: messageData.conversationId 
          ? { connect: { id: messageData.conversationId } }
          : undefined
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    const userId = url.searchParams.get('userId');

    // Build query conditions based on parameters
    const where = {};
    if (conversationId) {
      where.conversationId = conversationId;
    }
    if (userId) {
      where.OR = [
        { senderId: userId },
        { receiverId: userId }
      ];
    }

    // Fetch messages from the database with conditions
    const messages = await prisma.message.findMany({
      where,
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: `Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
