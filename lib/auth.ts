import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import prisma from "./prisma";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password || !credentials?.role) {
            throw new Error("Missing required fields");
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true,
              studentId: true,
              isApproved: true,
            },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          const isCorrectPassword = await compare(
            credentials.password,
            user.password
          );

          if (!isCorrectPassword) {
            throw new Error("Invalid credentials");
          }

          // Verify role matches using Role enum
          const requestedRole = credentials.role.toUpperCase() as Role;
          if (user.role !== requestedRole) {
            throw new Error("Invalid role for this user");
          }

          // For students, verify they are approved
          if (user.role === Role.STUDENT && !user.isApproved) {
            throw new Error("Account not approved yet");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || "",
            role: user.role,
            studentId: user.studentId || undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name || "";
        session.user.email = token.email || "";
        session.user.role = token.role as Role;
        if (token.studentId) {
          session.user.studentId = token.studentId;
        }
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        if (user.studentId) {
          token.studentId = user.studentId;
        }
      }

      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 