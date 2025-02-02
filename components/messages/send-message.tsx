import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

export function SendMessage({ onSend }: { onSend: (message: string) => Promise<void> }) {
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSend(message)
      setMessage('')
      toast({
        title: 'Message sent successfully',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Failed to send message',
        variant: 'destructive',
        duration: 3000,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1"
      />
      <Button type="submit">Send</Button>
    </form>
  )
}