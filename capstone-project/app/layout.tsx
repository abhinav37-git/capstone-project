import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type React from "react" // Added import for React

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Module Dashboard",
  description: "A dashboard for smart classroom teaching",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Smart Module Dashboard</h1>
            <Button variant="ghost" size="icon">
              <MessageCircle className="h-6 w-6" />
              <span className="sr-only">Admin Support</span>
            </Button>
          </header>
          <main className="flex-grow">{children}</main>
        </div>
      </body>
    </html>
  )
}

