import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import type React from "react"
import { Toaster } from "sonner" // Import Toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Module Dashboard",
  description: "A dashboard for offline classroom teaching",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}> {/* Use inter.className */}
        <div className="min-h-screen flex flex-col"> {/* Keep the flex column */}
          {children}
        </div>
        <Toaster /> {/* Move Toaster inside the body */}
      </body>
    </html>
  )
}