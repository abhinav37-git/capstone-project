"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Subjects } from "@/components/subjects"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Search, Mail, Phone, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"

const modules = {
  iot: [
    {
      id: "iot-basics",
      title: "IoT Fundamentals",
      content:
        "Learn the basics of Internet of Things (IoT) and its applications. This module covers the fundamental concepts of IoT, including sensors, actuators, connectivity, and data processing. You'll explore real-world examples and understand how IoT is transforming various industries.",
      progress: 75,
    },
    {
      id: "iot-applications",
      title: "IoT Applications",
      content:
        "Explore practical applications of IoT in various industries. This module delves into specific use cases of IoT in sectors such as healthcare, agriculture, smart cities, and manufacturing. You'll learn about the challenges and opportunities in implementing IoT solutions and gain insights into future trends.",
      progress: 50,
    },
  ],
  blockchain: [
    {
      id: "blockchain-intro",
      title: "Introduction to Blockchain",
      content:
        "Understand the core concepts of blockchain technology. This module introduces you to the fundamental principles of blockchain, including distributed ledgers, consensus mechanisms, and cryptographic hashing. You'll learn about the history of blockchain and its potential to revolutionize various industries.",
      progress: 90,
    },
    {
      id: "blockchain-usecases",
      title: "Blockchain Use Cases",
      content:
        "Explore real-world applications of blockchain beyond cryptocurrencies. This module covers diverse use cases of blockchain technology in fields such as supply chain management, healthcare, voting systems, and decentralized finance (DeFi). You'll analyze case studies and understand the benefits and challenges of implementing blockchain solutions.",
      progress: 30,
    },
  ],
  ml: [
    {
      id: "ml-basics",
      title: "Machine Learning Basics",
      content:
        "Learn fundamental machine learning algorithms and techniques. This module provides an introduction to key concepts in machine learning, including supervised and unsupervised learning, feature engineering, and model evaluation. You'll work with popular algorithms such as linear regression, decision trees, and k-means clustering.",
      progress: 60,
    },
    {
      id: "ml-deeplearning",
      title: "Deep Learning",
      content:
        "Introduction to deep learning and neural networks. This module explores the foundations of deep learning, including artificial neural networks, convolutional neural networks (CNNs), and recurrent neural networks (RNNs). You'll learn about training techniques, optimization algorithms, and applications in image and speech recognition.",
      progress: 40,
    },
  ],
  cloud: [
    {
      id: "cloud-fundamentals",
      title: "Cloud Computing Fundamentals",
      content:
        "Understand the basics of cloud computing and its services. This module covers the essential concepts of cloud computing, including service models (IaaS, PaaS, SaaS), deployment models, and key players in the cloud industry. You'll learn about the benefits and challenges of migrating to the cloud and best practices for cloud adoption.",
      progress: 80,
    },
    {
      id: "cloud-architecture",
      title: "Cloud Architecture",
      content:
        "Explore different cloud architectures and best practices. This module delves into various cloud architecture patterns, including microservices, serverless computing, and hybrid cloud solutions. You'll learn about scalability, reliability, and security considerations in cloud architecture design, as well as tools and techniques for managing cloud infrastructure.",
      progress: 20,
    },
  ],
}

export function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId)
    setExpandedModules([])
    setSearchTerm("")
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => (prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]))
  }

  const filteredModules = selectedSubject
    ? modules[selectedSubject as keyof typeof modules].filter((module) =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 overflow-hidden">
        <motion.div
          className="w-64 bg-muted p-4 overflow-y-auto"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Subjects onSelectSubject={handleSubjectSelect} />
        </motion.div>
        <motion.div
          className="flex-1 p-6 overflow-y-auto"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {selectedSubject ? (
            <div>
              <h2 className="text-3xl font-semibold mb-6">
                {modules[selectedSubject as keyof typeof modules][0].title.split(" ")[0]} Modules
              </h2>
              <div className="mb-6 relative">
                <Input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-2 text-lg"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <AnimatePresence>
                {filteredModules.length > 0 ? (
                  <Accordion type="multiple" value={expandedModules} className="w-full space-y-4">
                    {filteredModules.map((module, index) => (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <AccordionItem value={module.id} className="border rounded-lg overflow-hidden">
                          <AccordionTrigger
                            onClick={() => toggleModule(module.id)}
                            className="px-4 py-3 hover:bg-muted/50"
                          >
                            <h3 className="text-xl font-medium">{module.title}</h3>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-3">
                            <div className="max-h-60 overflow-y-auto pr-2">
                              <p className="mb-4 text-base leading-relaxed">{module.content}</p>
                            </div>
                            <div className="flex items-center mb-4 mt-4">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex-grow mr-4">
                                      <Progress value={module.progress} className="h-2" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Module progress: {module.progress}%</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <span className="text-sm font-medium">{module.progress}% Complete</span>
                            </div>
                            <Button className="w-full" variant="outline">
                              Continue Learning
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      </motion.div>
                    ))}
                  </Accordion>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-center text-muted-foreground text-lg">No modules found matching your search.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center text-muted-foreground text-xl">Select a subject to view its modules</div>
          )}
        </motion.div>
      </div>
      <footer className="bg-muted mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">About Smart Module Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Smart Module Dashboard is an innovative online learning platform offering cutting-edge courses in IoT,
                Blockchain, Machine Learning, and Cloud Computing. Our mission is to empower learners with the skills
                needed for the digital future.
              </p>
              <Button variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">
                    Courses
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-sm text-muted-foreground hover:text-primary">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <a href="mailto:info@smartmodule.com" className="text-sm text-muted-foreground hover:text-primary">
                    info@smartmodule.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary">
                    +1 (234) 567-890
                  </a>
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm text-muted-foreground">123 Learning St, Education City, 12345</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">&copy; 2023 Smart Module Dashboard. All rights reserved.</p>
            <div className="mt-4 sm:mt-0">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary mr-4">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}