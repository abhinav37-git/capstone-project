"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Github, Twitter, Mail } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const links = {
    resources: [
      { title: "Documentation", href: "#" },
      { title: "Help Center", href: "#" },
      { title: "Privacy Policy", href: "#" },
      { title: "Terms of Service", href: "#" },
    ],
    social: [
      { icon: Github, href: "#", label: "GitHub" },
      { icon: Twitter, href: "#", label: "Twitter" },
      { icon: Mail, href: "#", label: "Email" },
    ],
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Link href="/dashboard" className="text-2xl font-bold">
              Smart Module
            </Link>
            <p className="mt-2 text-sm text-primary-foreground/70">
              Empowering education through smart learning solutions.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="mt-4 space-y-2">
              {links.resources.map((link) => (
                <Button key={link.title} variant="link" asChild className="p-0 h-auto text-primary-foreground/70 hover:text-primary-foreground">
                  <Link href={link.href}>{link.title}</Link>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="mt-4 flex space-x-4">
              {links.social.map((social) => (
                <Button key={social.label} variant="ghost" size="icon" asChild className="hover:text-primary-foreground/70">
                  <Link href={social.href}>
                    <social.icon className="h-5 w-5" />
                    <span className="sr-only">{social.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-8 bg-primary-foreground/20" />
        
        <div className="text-center text-sm text-primary-foreground/70">
          <p>© {currentYear} Smart Module. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}