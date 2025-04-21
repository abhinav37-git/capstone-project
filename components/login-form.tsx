"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Role } from "@prisma/client"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
})

interface LoginFormProps {
  role: string;
  callbackUrl?: string;
}

export function LoginForm({ role, callbackUrl = '/dashboard' }: LoginFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        role: role.toUpperCase(),
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        console.error("Login error:", result.error)
        if (result.error === "Invalid role for this user") {
          toast.error("You don't have permission to access this section")
        } else if (result.error === "Account not approved yet") {
          toast.error("Your account is pending approval")
        } else if (result.error === "Missing required fields") {
          toast.error("Please fill in all required fields")
        } else {
          toast.error("Invalid email or password")
        }
        return
      }

      if (!result?.ok) {
        toast.error("Failed to sign in")
        return
      }

      toast.success("Logged in successfully")
      
      // Use the provided callback URL or determine based on role
      if (result.url) {
        router.push(result.url)
      } else {
        // Fallback to role-based routing
        const userRole = role.toUpperCase() as Role
        switch(userRole) {
          case Role.ADMIN:
            router.push('/admin')
            break
          case Role.TEACHER:
            router.push('/teacher')
            break
          case Role.STUDENT:
            router.push('/dashboard')
            break
          default:
            router.push('/dashboard')
        }
      }
      
      router.refresh()
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your email" 
                  type="email"
                  autoComplete="email"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
      </form>
    </Form>
  )
}