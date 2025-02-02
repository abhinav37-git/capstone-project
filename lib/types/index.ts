export interface Message {
    id: string
    senderId: string
    senderName: string
    content: string
    timestamp: Date
    isRead: boolean
  }
  
  export interface Query {
    id: string
    studentId: string
    studentName: string
    subject: string
    message: string
    status: 'pending' | 'resolved'
    timestamp: Date
  }
  
  export interface ActiveStudent {
    id: string
    name: string
    email: string
    currentModule: string
    lastActive: Date
    progress: number
  }