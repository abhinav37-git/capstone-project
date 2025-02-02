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
      { icon: Github, href: "https://github.com/Komallsood/capstone-project/", label: "GitHub" },
      { icon: Twitter, href: "#", label: "Twitter" },
      { icon: Mail, href: "#", label: "Email" },
    ],
  }

  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Smart Module</h3>
            <p className="text-base text-primary-foreground/70">
              Empowering education through smart learning solutions.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="flex flex-col space-y-3">
              {links.resources.map((link) => (
                <Link 
                  key={link.title} 
                  href={link.href}
                  className="text-base text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="flex space-x-4">
              {links.social.map((social) => (
                <Button key={social.label} variant="ghost" size="icon" asChild>
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
        
        <div className="text-center text-base text-primary-foreground/70">
          <p>© {currentYear} Smart Module. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}