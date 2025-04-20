"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDownIcon, CheckIcon, ClockIcon, AlertCircleIcon } from "lucide-react"

type QueryStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED"

interface QueryResponse {
  id: string
  message: string
  createdAt: string
  user: {
    id: string
    name: string
    role: string
  }
}

interface Query {
  id: string
  title: string
  message: string
  status: QueryStatus
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
  course?: {
    id: string
    title: string
  }
  responses: QueryResponse[]
}

export function AdminQueries() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"ALL" | QueryStatus>("ALL")

  const fetchQueries = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/queries")
      
      if (!response.ok) {
        throw new Error("Failed to fetch queries")
      }
      
      const data = await response.json()
      setQueries(data.queries)
    } catch (err) {
      console.error("Error fetching queries:", err)
      setError("Failed to load queries. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [])

  const handleViewQuery = (query: Query) => {
    setSelectedQuery(query)
    setDialogOpen(true)
    setResponseMessage("")
  }

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircleIcon size={12} />
            <span>Open</span>
          </Badge>
        )
      case "IN_PROGRESS":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <ClockIcon size={12} />
            <span>In Progress</span>
          </Badge>
        )
      case "RESOLVED":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckIcon size={12} />
            <span>Resolved</span>
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSendResponse = async () => {
    if (!selectedQuery || !responseMessage.trim()) return
    
    setSubmitting(true)
    
    try {
      const response = await fetch(`/api/queries/${selectedQuery.id}/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: responseMessage }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to send response")
      }
      
      const data = await response.json()
      
      // Update the queries state with the new response
      setQueries(prevQueries => 
        prevQueries.map(query => 
          query.id === selectedQuery.id
            ? {
                ...query,
                responses: [...query.responses, data.response],
                status: query.status === "OPEN" ? "IN_PROGRESS" : query.status
              }
            : query
        )
      )
      
      // Update the selected query
      setSelectedQuery(prev => {
        if (!prev) return null
        return {
          ...prev,
          responses: [...prev.responses, data.response],
          status: prev.status === "OPEN" ? "IN_PROGRESS" : prev.status
        }
      })
      
      setResponseMessage("")
      toast({
        title: "Response sent",
        description: "Your response has been sent successfully.",
      })
    } catch (err) {
      console.error("Error sending response:", err)
      toast({
        title: "Error",
        description: "Failed to send your response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (queryId: string, newStatus: QueryStatus) => {
    try {
      const response = await fetch(`/api/queries/${queryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update query status")
      }
      
      // Update the queries state
      setQueries(prevQueries => 
        prevQueries.map(query => 
          query.id === queryId
            ? { ...query, status: newStatus }
            : query
        )
      )
      
      // Update the selected query if it's the one being updated
      if (selectedQuery && selectedQuery.id === queryId) {
        setSelectedQuery({ ...selectedQuery, status: newStatus })
      }
      
      toast({
        title: "Status updated",
        description: `Query status has been updated to ${newStatus.toLowerCase().replace('_', ' ')}.`,
      })
    } catch (err) {
      console.error("Error updating status:", err)
      toast({
        title: "Error",
        description: "Failed to update query status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredQueries = activeTab === "ALL" 
    ? queries 
    : queries.filter(query => query.status === activeTab)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Queries</CardTitle>
          <CardDescription>Loading query data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Queries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p>{error}</p>
            <Button onClick={fetchQueries} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statusCounts = queries.reduce(
    (acc, query) => {
      acc[query.status]++
      return acc
    },
    { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 } as Record<QueryStatus, number>
  )

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Queries Dashboard</CardTitle>
            <CardDescription>View, respond to, and manage all student queries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertCircleIcon className="mr-2 h-4 w-4 text-destructive" />
                    Open Queries
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{statusCounts.OPEN}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <ClockIcon className="mr-2 h-4 w-4 text-blue-500" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{statusCounts.IN_PROGRESS}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                    Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="text-2xl font-bold">{statusCounts.RESOLVED}</div>
                </CardContent>
              </Card>
            </div>

            <Tabs 
              defaultValue="ALL" 
              value={activeTab} 
              onValueChange={(value) => setActiveTab(value as "ALL" | QueryStatus)}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="ALL">
                  All Queries ({queries.length})
                </TabsTrigger>
                <TabsTrigger value="OPEN">
                  Open ({statusCounts.OPEN})
                </TabsTrigger>
                <TabsTrigger value="IN_PROGRESS">
                  In Progress ({statusCounts.IN_PROGRESS})
                </TabsTrigger>
                <TabsTrigger value="RESOLVED">
                  Resolved ({statusCounts.RESOLVED})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredQueries.length === 0 ? (
                  <div className="text-center py-10 bg-muted/50 rounded-md">
                    <p className="text-muted-foreground">No queries found in this category.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Responses</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQueries.map((query) => (
                        <TableRow key={query.id}>
                          <TableCell className="font-medium">{query.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                {query.user.image && (
                                  <AvatarImage src={query.user.image} alt={query.user.name} />
                                )}
                                <AvatarFallback>{query.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{query.user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(query.status)}</TableCell>
                          <TableCell>
                            {formatDate(query.createdAt)}
                          </TableCell>
                          <TableCell>{query.responses.length}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewQuery(query)}
                              >
                                View Details
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ChevronDownIcon className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleViewQuery(query)}
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                  <DropdownMenuItem 
                                    disabled={query.status === "OPEN"}
                                    onClick={() => handleUpdateStatus(query.id, "OPEN")}
                                  >
                                    Mark as Open
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    disabled={query.status === "IN_PROGRESS"}
                                    onClick={() => handleUpdateStatus(query.id, "IN_PROGRESS")}
                                  >
                                    Mark as In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    disabled={query.status === "RESOLVED"}
                                    onClick={() => handleUpdateStatus(query.id, "RESOLVED")}
                                  >
                                    Mark as Resolved
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  )
}


