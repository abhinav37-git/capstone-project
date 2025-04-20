import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import SignInClient from "@/components/auth/signin-client"
import { Session } from "next-auth"

// Server component for initial auth check
export default async function SignInPage({
  searchParams,
}: {
  searchParams: { error?: string; callbackUrl?: string }
}) {
  // Check for session server-side first
  const session = await getServerSession(authOptions)
  
  // If already authenticated, redirect to appropriate page based on role
  if (session?.user) {
    // Use explicit role-based redirects to prevent loops
    if (session.user.role === "ADMIN") {
      return redirect('/admin')
    } else if (session.user.role === "TEACHER") {
      return redirect('/teacher')
    } else {
      return redirect('/dashboard')
    }
  }
  
  // Parse error messages for better user experience
  const errorMessage = getErrorMessage(searchParams.error)
  
  // Safe callback URL handling - prevent open redirect vulnerabilities
  const callbackUrl = validateCallbackUrl(searchParams.callbackUrl)
  
  // Render client component with proper props
  return <SignInClient errorMessage={errorMessage} callbackUrl={callbackUrl} />
}

// Helper function to get meaningful error messages
function getErrorMessage(error?: string): string | null {
  if (!error) return null
  
  const errorMessages: Record<string, string> = {
    'OAuthSignin': 'Error starting OAuth sign-in',
    'OAuthCallback': 'Error completing OAuth sign-in',
    'OAuthCreateAccount': 'Error creating OAuth account',
    'EmailCreateAccount': 'Error creating email account',
    'Callback': 'Error during callback processing',
    'OAuthAccountNotLinked': 'Email already in use with different provider',
    'EmailSignin': 'Error sending email signin link',
    'CredentialsSignin': 'Invalid credentials',
    'SessionRequired': 'Please sign in to access this page',
    'InvalidSession': 'Your session is invalid or has expired',
    'server_error': 'Server error occurred',
    'default': 'An error occurred during authentication'
  }
  
  return errorMessages[error] || errorMessages.default
}

// Helper function to validate callback URL to prevent open redirect vulnerabilities
function validateCallbackUrl(url?: string): string {
  // If no URL provided, use dashboard as default
  if (!url) return '/dashboard'
  
  try {
    // For absolute URLs, check if they're on the same origin
    if (url.startsWith('http')) {
      const urlObj = new URL(url)
      // Only allow URLs from our domain - replace with your actual domain in production
      const allowedHosts = ['localhost', 'capstone-project-a320.onrender.com']
      if (!allowedHosts.includes(urlObj.hostname)) {
        return '/dashboard'
      }
    }
    
    // For relative URLs, make sure they start with /
    if (!url.startsWith('/')) {
      url = '/' + url
    }
    
    return url
  } catch (e) {
    // If URL parsing fails, return a safe default
    return '/dashboard'
  }
}
