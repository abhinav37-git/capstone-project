"use client"

import { useState, useEffect } from 'react'
import { signIn, useSession, SignInOptions } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Github, Mail, Loader2, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SignInClientProps {
  errorMessage: string | null
  callbackUrl: string
}

export default function SignInClient({ errorMessage, callbackUrl }: SignInClientProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [oauthLoading, setOAuthLoading] = useState<string | null>(null)
  
  // Handle session state changes to avoid client-side redirect loops
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const destination = callbackUrl || '/dashboard'
      router.push(destination)
      toast.success('Signed in successfully')
    }
  }, [session, status, router, callbackUrl])
  
  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    )
  }
  
  // If already authenticated but still on this page (unlikely due to server redirect)
  // Show a message with redirection options
  if (status === 'authenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Already Signed In</CardTitle>
            <CardDescription>
              You are already signed in as {session?.user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Would you like to go to your dashboard?</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setLocalError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        // Provide more specific error messages based on error code
        const errorMessages: Record<string, string> = {
          'CredentialsSignin': 'Invalid email or password',
          'OAuthAccountNotLinked': 'Email already exists with different provider',
          'EmailSignin': 'Error sending email link',
          'SessionRequired': 'Please sign in to access this page',
          'Default': 'Authentication failed'
        }
        
        const errorMessage = errorMessages[result.error] || errorMessages.Default
        setLocalError(errorMessage)
        toast.error('Sign in failed')
      } else {
        // Let the useEffect handle the redirect
      }
    } catch (error) {
      setLocalError('An unexpected error occurred')
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  // Display combined errors (from URL or local state)
  const displayError = errorMessage || localError

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        {displayError && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="relative w-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative bg-white px-4 text-sm text-gray-500">
                  Or continue with
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOAuthLoading('google')
                    signIn('google', { callbackUrl, redirect: true })
                  }}
                  disabled={isLoading || oauthLoading !== null}
                  className="flex items-center justify-center gap-2"
                >
                  {oauthLoading === 'google' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Google
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOAuthLoading('github')
                    signIn('github', { callbackUrl, redirect: true })
                  }}
                  disabled={isLoading || oauthLoading !== null}
                  className="flex items-center justify-center gap-2"
                >
                  {oauthLoading === 'github' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="h-4 w-4" />
                  )}
                  GitHub
                </Button>
              </div>
            </div>
            
            <div className="text-center w-full text-sm">
              <p>Don't have an account? <a href="/auth/register" className="text-blue-600 hover:underline">Register</a></p>
              <a href="/" className="block mt-2 text-gray-600 hover:underline">Return to home page</a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

