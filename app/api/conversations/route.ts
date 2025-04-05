import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { authOptions } from "../auth/[...nextauth]/route";

// Define TypeScript interfaces
interface ConversationParticipant {
  userId: string;
  role?: string;
}

interface ConversationData {
  title?: string;
  participants: ConversationParticipant[];
  firstMessage?: string;
  type?: "DIRECT" | "GROUP";
}

// Zod schema for validating request data
const participantSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
});

const conversationSchema = z.object({
  title: z.string().min(1).optional(),
  participants: z.array(participantSchema).min(1, "At least one participant is required"),
  firstMessage: z.string().min(1).optional(),
  type: z.enum(["DIRECT", "GROUP"]).default("DIRECT"),
});

// GET handler to fetch conversations for the current user
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    
    // Query parameters
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const includeMessages = url.searchParams.get("includeMessages") === "true";
    
    // Build the query
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        messages: includeMessages ? {
          orderBy: {
            createdAt: "desc"
          },
          take: limit,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        } : false
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: `Failed to fetch conversations: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// POST handler to create a new conversation
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // Validate the request body
    const validationResult = conversationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const conversationData: ConversationData = validationResult.data;

    // Ensure the current user is included in the participants
    const currentUserIncluded = conversationData.participants.some(
      participant => participant.userId === userId
    );

    if (!currentUserIncluded) {
      conversationData.participants.push({ userId, role: "ADMIN" });
    }

    // For direct messages between two users, check if conversation already exists
    if (conversationData.type === "DIRECT" && conversationData.participants.length === 2) {
      const otherUserId = conversationData.participants.find(p => p.userId !== userId)?.userId;
      
      if (otherUserId) {
        const existingConversation = await prisma.conversation.findFirst({
          where: {
            type: "DIRECT",
            AND: [
              { participants: { some: { userId } } },
              { participants: { some: { userId: otherUserId } } }
            ],
            participants: {
              every: {
                userId: {
                  in: [userId, otherUserId]
                }
              }
            }
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              }
            }
          }
        });

        if (existingConversation) {
          // If first message was provided, add it to the existing conversation
          if (conversationData.firstMessage) {
            await prisma.message.create({
              data: {
                content: conversationData.firstMessage,
                senderId: userId,
                conversationId: existingConversation.id
              }
            });

            // Update the conversation's updatedAt
            await prisma.conversation.update({
              where: { id: existingConversation.id },
              data: { updatedAt: new Date() }
            });
          }

          return NextResponse.json(
            { ...existingConversation, alreadyExists: true }, 
            { status: 200 }
          );
        }
      }
    }

    // Create a new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: conversationData.title || null,
        type: conversationData.type,
        participants: {
          create: conversationData.participants.map(participant => ({
            userId: participant.userId,
            role: participant.role || "MEMBER"
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    });

    // If a first message was provided, create it
    if (conversationData.firstMessage) {
      await prisma.message.create({
        data: {
          content: conversationData.firstMessage,
          senderId: userId,
          conversationId: conversation.id
        }
      });
    }

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: `Failed to create conversation: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
