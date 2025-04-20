"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"

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
  responses: QueryResponse[]
  course?: {
    id: string
    title: string
  }
}

export function StudentQueryHistory() {
  const [queries, setQueries] = useState<Query[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const response = await fetch("/api/queries")
        
        if (!response.ok) {
          throw new Error("Failed to fetch queries")
        }
        
        const data = await response.json()
        setQueries(data.queries)
      } catch (err) {
        console.error("Error fetching queries:", err)
        setError("Failed to load your queries. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchQueries()
  }, [])

  const handleViewQuery = (query: Query) => {
    setSelectedQuery(query)
    setDialogOpen(true)
  }

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">Open</Badge>
      case "IN_PROGRESS":
        return <Badge variant="warning">In Progress</Badge>
      case "RESOLVED":
        return <Badge variant="success">Resolved</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Query History</CardTitle>
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
          <CardTitle>Your Query History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Query History</CardTitle>
          <CardDescription>View all your past queries and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {queries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You haven't submitted any queries yet.</p>
              <Button className="mt-4" variant="outline" asChild>
                <a href="/dashboard/queries/new">Submit Your First Query</a>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.map((query) => (
                  <TableRow key={query.id}>
                    <TableCell className="font-medium">{query.title}</TableCell>
                    <TableCell>{getStatusBadge(query.status)}</TableCell>
                    <TableCell>{formatDate(query.createdAt)}</TableCell>
                    <TableCell>{query.responses.length}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewQuery(query)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedQuery && (
          <DialogContent className="max-w-md sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedQuery.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2">
                Submitted on {formatDate(selectedQuery.createdAt)}
                {selectedQuery.course && <span>• Course: {selectedQuery.course.title}</span>}
                <span className="ml-auto">{getStatusBadge(selectedQuery.status)}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <div className="bg-muted p-4 rounded-md">
                <p className="whitespace-pre-wrap">{selectedQuery.message}</p>
              </div>

              {selectedQuery.responses.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="font-medium">Conversation</h4>
                  {selectedQuery.responses.map((response) => (
                    <div 
                      key={response.id} 
                      className={`p-4 rounded-lg ${
                        response.user.role === "ADMIN" 
                          ? "bg-blue-50 ml-4 border border-blue-100" 
                          : "bg-gray-50 mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {response.user.name}
                          {response.user.role === "ADMIN" && <span className="text-xs ml-2 text-blue-600">(Staff)</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(response.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{response.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <p className="text-muted-foreground">
                    No responses yet. We'll notify you when a staff member responds.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

