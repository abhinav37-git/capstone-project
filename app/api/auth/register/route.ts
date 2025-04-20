import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validationResult.data;

    // Check if user with the same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // For students, verify pre-registration
    if (role === "STUDENT") {
      const preRegistration = await prisma.preRegistration.findFirst({
        where: { email },
      });

      if (!preRegistration) {
        return NextResponse.json(
          { error: "Student email not pre-registered by a teacher" },
          { status: 403 }
        );
      }
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        studentId: role === "STUDENT" ? (await prisma.preRegistration.findFirst({ where: { email } }))?.studentId : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If this is a student, delete the pre-registration record
    if (role === "STUDENT") {
      await prisma.preRegistration.deleteMany({
        where: { email },
      });
    }

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
} 