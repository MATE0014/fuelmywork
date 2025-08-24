"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Timer } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [step, setStep] = useState(1) // 1: Sign up form, 2: OTP verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const router = useRouter()

  // Start countdown timer for OTP resend
  const startTimer = () => {
    setCanResend(false)
    setOtpTimer(60)
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return false
    }
    if (!formData.email.trim()) {
      toast.error("Email is required")
      return false
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }
    return true
  }

  const handleSignUp = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Verification code sent to your email!")
        setStep(2)
        startTimer()
      } else {
        toast.error(data.message || "Sign up failed")
      }
    } catch (error) {
      console.error("Sign up error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()

    if (!otp.trim() || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Account created successfully! Signing you in...")

        // Auto-login the user after successful verification
        if (data.autoLogin) {
          try {
            const signInResult = await signIn("credentials", {
              email: formData.email.trim().toLowerCase(),
              password: formData.password,
              redirect: false,
            })

            if (signInResult?.ok) {
              toast.success("Welcome to Fuelmywork! 🎉")
              router.push("/dashboard")
              router.refresh()
            } else {
              // If auto-login fails, redirect to login page
              toast.info("Account created! Please sign in.")
              router.push("/login?message=Account created successfully")
            }
          } catch (signInError) {
            console.error("Auto sign-in error:", signInError)
            toast.info("Account created! Please sign in.")
            router.push("/login?message=Account created successfully")
          }
        } else {
          router.push("/login?message=Account created successfully")
        }
      } else {
        toast.error(data.message || "Verification failed")
      }
    } catch (error) {
      console.error("OTP verification error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("New verification code sent!")
        startTimer()
      } else {
        toast.error(data.message || "Failed to resend code")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error("Failed to resend code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-950 text-white font-outfit flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          {step === 1 ? (
            <>
              <CardTitle className="text-2xl font-bold text-center text-white">Create Account</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Join Fuelmywork to support your favorite creators
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl font-bold text-center text-white">Verify Email</CardTitle>
              <CardDescription className="text-center text-gray-400">
                Enter the 6-digit code sent to {formData.email}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-6">
                <Mail className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-300 text-sm">
                  We've sent a 6-digit verification code to your email address. Please check your inbox and enter the
                  code below.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-gray-300">
                  Verification Code
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying & Signing In...
                  </>
                ) : (
                  "Verify & Sign In"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">Didn't receive the code?</p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className="text-orange-400 hover:text-orange-300"
                >
                  {!canResend ? (
                    <>
                      <Timer className="mr-2 h-4 w-4" />
                      Resend in {otpTimer}s
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full text-gray-400 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign Up
              </Button>
            </form>
          )}

          <div className="text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
