"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const Login = () => {
  const { user, login, loading } = useAuth()
  const router = useRouter()
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    // Redirect if already logged in
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  const handleGitHubLogin = async () => {
    try {
      setSigningIn(true)
      toast.loading("Redirecting to GitHub...")
      await login("github")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Failed to sign in with GitHub")
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Don't render login page if already logged in
  }

  return (
    <div className="min-h-[61.6vh] bg-gray-950 text-white font-outfit flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-8">
          <a href="/" className="flex items-center text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </a>
        </div>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            {/* Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor" />
                <path
                  d="M12 16L13.09 20.26L18 21L13.09 21.74L12 26L10.91 21.74L6 21L10.91 20.26L12 16Z"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Welcome to fuelmywork</CardTitle>
            <CardDescription className="text-gray-300">
              Sign in with GitHub to start supporting creators or showcase your work
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* GitHub Login */}
            <Button
              onClick={handleGitHubLogin}
              disabled={signingIn}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 flex items-center justify-center gap-3 py-3"
            >
              {signingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
              {signingIn ? "Signing in..." : "Continue with GitHub"}
            </Button>

            <div className="pt-4 text-center">
              <p className="text-sm text-gray-400">
                By signing in, you agree to our{" "}
                <a href="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            New to fuelmywork?{" "}
            <a href="/about" className="text-blue-400 hover:text-blue-300">
              Learn more about our platform
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
