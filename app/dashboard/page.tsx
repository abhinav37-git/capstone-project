import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/dashboard-client"
import { Session } from "next-auth"
import { ErrorBoundary } from "@/components/error-boundary"

// Use proper type definition for the session
type ExtendedSession = Session & {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  }
}

// Server component for initial auth check
export default async function DashboardPage() {
  try {
    // Get the session with proper error handling
    const session = await getServerSession(authOptions) as ExtendedSession | null
    
    // Simple and direct auth check - don't over-complicate
    if (!session || !session.user) {
      console.log("No session found, redirecting to sign in");
      // Use a relative path for better handling of base paths
      return redirect('/auth/signin');
    }
    
    // Make sure user ID exists
    if (!session.user.id) {
      console.error("User ID missing from session");
      return redirect('/auth/signin?error=invalid_session');
    }
    
    // Wrap the client component in an error boundary for better error handling
    return (
      <ErrorBoundary
        fallback={<div className="p-6">Something went wrong loading the dashboard. Please try refreshing.</div>}
      >
        <DashboardClient session={session} />
      </ErrorBoundary>
    );
  } catch (error) {
    // Log server-side errors
    console.error("Error in dashboard page:", error);
    return redirect('/auth/signin?error=server_error');
  }
}
