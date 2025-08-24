"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRef } from "react"
import {
  Loader2,
  User,
  CreditCard,
  Users,
  RefreshCw,
  Github,
  CheckCircle,
  AlertCircle,
  Shield,
  Eye,
  Copy,
  Heart,
  TrendingUp,
  DollarSign,
  QrCode,
  Save,
  Key,
  Trash2,
  FileText,
  EyeOff,
} from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import Link from "next/link"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState(null)
  const [pendingPayments, setPendingPayments] = useState([])
  const [originalData, setOriginalData] = useState({})
  const [usernameStatus, setUsernameStatus] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)
  const { data: session } = useSession()

  // Security modals
  const [passwordChangeModal, setPasswordChangeModal] = useState(false)
  const [deleteAccountModal, setDeleteAccountModal] = useState(false)
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  })
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: "",
    otp: "",
    confirmDelete: "",
  })
  const [otpSent, setOtpSent] = useState({ password: false, delete: false })

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    profileImage: "",
    bannerImage: "",
    upiId: "",
    qrCodeImage: "",
    razorpayId: "",
    razorpaySecret: "",
  })

  const [paymentLogs, setPaymentLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
    deletePassword: false,
  })

  const [resendTimeout, setResendTimeout] = useState({
    password: 0,
    delete: 0,
  })

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)

        const cleanData = {
          name: data.name || user?.name || "",
          username: data.username || "",
          bio: data.bio || "",
          profileImage: data.profileImage || user?.image || "",
          bannerImage: data.bannerImage || "",
          upiId: data.upiId || "",
          qrCodeImage: data.qrCodeImage || "",
          razorpayId: data.razorpayId || "",
          razorpaySecret: data.razorpaySecret || "",
        }

        setFormData(cleanData)
        setOriginalData({ ...cleanData })
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/creator/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchPendingPayments = async () => {
    try {
      const response = await fetch("/api/creator/pending-payments")
      if (response.ok) {
        const data = await response.json()
        setPendingPayments(data || [])
      }
    } catch (error) {
      console.error("Error fetching pending payments:", error)
    }
  }

  const fetchPaymentLogs = async () => {
    setLoadingLogs(true)
    try {
      const response = await fetch("/api/creator/payment-logs")
      if (response.ok) {
        const data = await response.json()
        setPaymentLogs(data.logs || [])
      } else {
        console.error("Failed to fetch payment logs")
      }
    } catch (error) {
      console.error("Error fetching payment logs:", error)
    } finally {
      setLoadingLogs(false)
    }
  }

  const refreshDashboard = async () => {
    setRefreshing(true)
    await Promise.all([fetchProfile(), fetchStats(), fetchPendingPayments()])
    setRefreshing(false)
    toast.success("Dashboard refreshed!")
  }

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfile()
      fetchStats()
      fetchPendingPayments()
    }
  }, [user, authLoading])

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchPendingPayments()
      fetchPaymentLogs() // Added payment logs fetch
    }
  }, [user])

  // Check if there are any changes
  const hasChanges = () => {
    // If there’s no original data (new account), always allow saving
    if (Object.keys(originalData).length === 0) {
      return true
    }

    for (const key of Object.keys(formData)) {
      const current = formData[key] || ""
      const original = originalData[key] || ""

      if (typeof current === "string" && typeof original === "string") {
        if (current.trim() !== original.trim()) {
          return true
        }
      } else if (current !== original) {
        return true
      }
    }

    return false
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      setUsernameStatus("")
      return
    }

    // Skip check if username hasn't changed from original
    if (username === originalData.username) {
      setUsernameStatus("")
      return
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      setUsernameStatus("Username can only contain letters, numbers, hyphens, and underscores")
      return
    }

    setCheckingUsername(true)
    try {
      const response = await fetch(`/api/user/check-username-availability?username=${username}&userId=${user.id}`)
      const result = await response.json()

      if (response.ok) {
        if (result.available) {
          setUsernameStatus("✓ Username is available")
        } else {
          setUsernameStatus("✗ Username is already taken")
        }
      } else {
        setUsernameStatus(result.message || "Error checking username")
      }
    } catch (error) {
      console.error("Username check error:", error)
      setUsernameStatus("Error checking username")
    } finally {
      setCheckingUsername(false)
    }
  }

  const usernameCheckTimeout = useRef(null)

  const handleUsernameChange = (value) => {
    handleInputChange("username", value)
    setUsernameStatus("")

    if (usernameCheckTimeout.current) {
      clearTimeout(usernameCheckTimeout.current)
    }

    usernameCheckTimeout.current = setTimeout(() => {
      checkUsernameAvailability(value)
    }, 500)
  }

  const handleSaveProfile = async () => {
    // Check if there are any changes
    if (!hasChanges()) {
      toast.error("No changes to save!")
      return
    }

    if (!formData.username.trim()) {
      toast.error("Username is required!")
      return
    }

    if (usernameStatus.includes("taken")) {
      toast.error("Please choose a different username")
      return
    }

    setSaving(true)
    const loadingToast = toast.loading("Saving profile...")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // ✅ keep local state as the source of truth
        setOriginalData({ ...formData })

        toast.dismiss(loadingToast)
        toast.success("Profile updated successfully!")
        // ⚠️ don't call fetchProfile() here, only update on manual refresh
      } else {
        toast.dismiss(loadingToast)
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.dismiss(loadingToast)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const verifyPayment = async (paymentId, action) => {
    try {
      const status = action === "approve" ? "completed" : "rejected"
      const response = await fetch("/api/creator/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, status }),
      })

      if (response.ok) {
        toast.success(`Payment ${action}d successfully!`)
        await fetchPendingPayments()
        await fetchStats()
      } else {
        const error = await response.json()
        toast.error(error.message || `Failed to ${action} payment`)
      }
    } catch (error) {
      console.error(`Error ${action}ing payment:`, error)
      toast.error(`Failed to ${action} payment`)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordChangeData.currentPassword || !passwordChangeData.newPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordChangeData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long")
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordChangeData.currentPassword,
          newPassword: passwordChangeData.newPassword,
          otp: passwordChangeData.otp,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.otpSent) {
          setOtpSent((prev) => ({ ...prev, password: true }))
          toast.success("OTP sent to your email!")

          setResendTimeout((prev) => ({ ...prev, password: 60 }))

          const interval = setInterval(() => {
            setResendTimeout((prev) => {
              const newTimeout = prev.password - 1
              if (newTimeout <= 0) {
                clearInterval(interval)
                return { ...prev, password: 0 }
              }
              return { ...prev, password: newTimeout }
            })
          }, 1000)
        } else {
          toast.success("Password changed successfully!")
          setPasswordChangeModal(false)
          setPasswordChangeData({ currentPassword: "", newPassword: "", confirmPassword: "", otp: "" })
          setOtpSent((prev) => ({ ...prev, password: false }))
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast.error("Failed to change password")
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteAccountData.confirmDelete || deleteAccountData.confirmDelete !== "DELETE_MY_ACCOUNT") {
      toast.error("Please type 'DELETE_MY_ACCOUNT' to confirm")
      return
    }

    const isGitHubUser = !session?.user?.password
    if (!isGitHubUser && !deleteAccountData.password) {
      toast.error("Password is required")
      return
    }

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deleteAccountData.password,
          otp: deleteAccountData.otp,
          confirmDelete: deleteAccountData.confirmDelete,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.otpSent) {
          setOtpSent((prev) => ({ ...prev, delete: true }))
          toast.success("OTP sent to your email!")

          setResendTimeout((prev) => ({ ...prev, delete: 60 }))

          const interval = setInterval(() => {
            setResendTimeout((prev) => {
              const newTimeout = prev.delete - 1
              if (newTimeout <= 0) {
                clearInterval(interval)
                return { ...prev, delete: 0 }
              }
              return { ...prev, delete: newTimeout }
            })
          }, 1000)
        } else if (result.deleted) {
          toast.success("Account deleted successfully!")
          await signOut({ callbackUrl: "/" })
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Account deletion error:", error)
      toast.error("Failed to delete account")
    }
  }

  const handleResendOTP = async (type) => {
    if (resendTimeout[type] > 0) {
      return
    }

    try {
      let endpoint, data

      if (type === "password") {
        endpoint = "/api/auth/change-password"
        data = {
          currentPassword: passwordChangeData.currentPassword,
          newPassword: passwordChangeData.newPassword,
        }
      } else if (type === "delete") {
        endpoint = "/api/auth/delete-account"
        data = {
          password: deleteAccountData.password,
          confirmDelete: deleteAccountData.confirmDelete,
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok && result.otpSent) {
        toast.success("New OTP sent to your email!")

        setResendTimeout((prev) => ({ ...prev, [type]: 60 }))

        const interval = setInterval(() => {
          setResendTimeout((prev) => {
            const newTimeout = prev[type] - 1
            if (newTimeout <= 0) {
              clearInterval(interval)
              return { ...prev, [type]: 0 }
            }
            return { ...prev, [type]: newTimeout }
          })
        }, 1000)
      } else {
        toast.error(result.message || "Failed to resend OTP")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast.error("Failed to resend OTP")
    }
  }

  const calculateProfileCompletion = () => {
    if (!formData) return 0

    const fields = [
      formData.name,
      formData.username,
      formData.bio,
      formData.profileImage,
      formData.upiId || formData.razorpayId,
    ]

    const completedFields = fields.filter((field) => field && field.trim() !== "").length
    return Math.round((completedFields / fields.length) * 100)
  }

  const copyProfileLink = () => {
    if (!formData.username) {
      toast.error("Please set a username first")
      return
    }

    const profileUrl = `${window.location.origin}/${formData.username}`
    navigator.clipboard.writeText(profileUrl)
    toast.success("Profile link copied to clipboard!")
  }

  const resetChanges = () => {
    setFormData({ ...originalData })
    setUsernameStatus("")
    toast.info("Changes reset to original values")
  }

  // Get authentication method display
  const getAuthMethodDisplay = () => {
    if (!user) return null

    const provider = user.provider || "unknown"

    switch (provider) {
      case "github":
        return {
          icon: <Github className="h-4 w-4" />,
          text: "GitHub Account Connected",
          color: "bg-purple-600",
        }
      case "credentials":
        return {
          icon: <Shield className="h-4 w-4" />,
          text: "Email & Password",
          color: "bg-green-600",
        }
      default:
        return {
          icon: <User className="h-4 w-4" />,
          text: "Standard Account",
          color: "bg-gray-600",
        }
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6">Please sign in to access your dashboard.</p>
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  const profileCompletion = calculateProfileCompletion()
  const authMethod = getAuthMethodDisplay()
  const changesDetected = hasChanges()

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit">
      <div className="px-4 py-6 md:px-6 md:py-8 pb-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Dashboard</h1>
                <p className="text-gray-400 text-sm md:text-base">Welcome back, {user.name?.split(" ")[0]}!</p>
                {authMethod && (
                  <Badge className={`mt-2 ${authMethod.color} text-white`}>
                    {authMethod.icon}
                    <span className="ml-1">{authMethod.text}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <Button
                  onClick={refreshDashboard}
                  disabled={refreshing}
                  variant="outline"
                  className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.provider === "github" ? "GitHub Account" : "Standard Account"}
                  </p>
                </div>
                <img
                  src={formData.profileImage || user.image || "/placeholder.svg?height=48&width=48"}
                  alt={user.name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Supporters</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats?.totalSupporters || 0}</div>
                <p className="text-xs text-gray-400">
                  {(stats?.totalSupporters || 0) === 0 ? "Complete profile to start" : "People supporting you"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Earned</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">₹{stats?.totalEarnings || 0}</div>
                <p className="text-xs text-gray-400">
                  {(stats?.totalEarnings || 0) === 0 ? "Set up payments to start" : "Total earnings"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">₹{stats?.monthlyEarnings || 0}</div>
                <p className="text-xs text-gray-400">
                  {(stats?.monthlyEarnings || 0) === 0 ? "No earnings this month" : "Current month earnings"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-300">Pending Verification</CardTitle>
                  <Heart className="h-4 w-4 text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{pendingPayments.length}</div>
                <p className="text-xs text-gray-400">
                  {pendingPayments.length === 0 ? "No pending payments" : "Awaiting verification"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
            <div className="overflow-x-auto">
              <TabsList className="bg-gray-800 border-gray-600 flex w-max min-w-full gap-1 p-1">
                <TabsTrigger
                  value="overview"
                  className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white whitespace-nowrap px-3 py-2 text-sm"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white whitespace-nowrap px-3 py-2 text-sm"
                >
                  Profile Settings
                </TabsTrigger>
                <TabsTrigger
                  value="payments"
                  className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white whitespace-nowrap px-3 py-2 text-sm"
                >
                  Payment Setup
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white whitespace-nowrap px-3 py-2 text-sm"
                >
                  Payment Verification
                  {pendingPayments.length > 0 && (
                    <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                      {pendingPayments.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white whitespace-nowrap px-3 py-2 text-sm"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger
                  value="logs"
                  className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white whitespace-nowrap px-3 py-2 text-sm"
                >
                  Payment Logs
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              {/* Account Info */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    {user.provider === "github" ? "GitHub Account" : "Account Information"}
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {user.provider === "github" ? "Connected via OAuth" : "Standard account"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img
                      src={formData.profileImage || user.image || "/placeholder.svg?height=48&width=48"}
                      alt={user.name}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gray-600"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <p className="text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500">User ID: {user.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Your Profile Link</CardTitle>
                    <CardDescription className="text-gray-300">Share this link with your supporters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <Input
                        value={formData.username ? `fuelmywork.com/${formData.username}` : "Set username first"}
                        readOnly
                        className="bg-gray-700 border-gray-600 text-gray-300 flex-grow"
                      />
                      <Button
                        onClick={copyProfileLink}
                        disabled={!formData.username}
                        variant="outline"
                        className="border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700 hover:text-gray-200 w-full sm:w-auto"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(`/${formData.username}`, "_blank")}
                        disabled={!formData.username}
                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Profile Completion</CardTitle>
                    <CardDescription className="text-gray-300">
                      Complete your profile to start receiving support
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Profile completion</span>
                        <span className="text-gray-300">{profileCompletion}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${profileCompletion}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="space-y-4 md:space-y-6">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Edit Profile Information</CardTitle>
                  <CardDescription className="text-gray-300">Update your public creator profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Banner Image */}
                  <ImageUpload
                    currentImage={formData.bannerImage}
                    onImageUpdate={(imageUrl) => handleInputChange("bannerImage", imageUrl)}
                    aspect={16 / 9}
                    circularCrop={false}
                    title="Banner Image"
                    description="Click to upload and crop banner image (16:9 ratio recommended)"
                    size="banner"
                  />

                  {/* Profile Image */}
                  <div className="max-w-fit">
                    <ImageUpload
                      currentImage={formData.profileImage}
                      onImageUpdate={(imageUrl) => handleInputChange("profileImage", imageUrl)}
                      aspect={1}
                      circularCrop={true}
                      title="Profile Image"
                      description="Click to upload and crop profile image (square ratio recommended)"
                      size="medium"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Username *</Label>
                    <div className="relative">
                      <Input
                        value={formData.username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="your-unique-username"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                      {checkingUsername && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        </div>
                      )}
                    </div>
                    {usernameStatus && (
                      <p
                        className={`text-xs flex items-center gap-1 ${
                          usernameStatus.includes("✓") ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {usernameStatus.includes("✓") ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {usernameStatus}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      This will be your unique URL: fuelmywork.com/{formData.username || "username"}
                    </p>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Display Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={user.name || "Your display name"}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">Defaults to your account name: {user.name}</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Bio</Label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell your supporters about yourself..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>

                  {/* Save buttons for Profile Settings */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                    <Button
                      onClick={resetChanges}
                      variant="outline"
                      className="border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 w-full sm:w-auto"
                      size="sm"
                    >
                      Reset Changes
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-w-[120px]"
                      size="sm"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Setup Tab */}
            <TabsContent value="payments" className="space-y-4 md:space-y-6">
              {/* Razorpay Integration */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    Razorpay Integration (Recommended)
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Professional payment processing with automatic settlement to your bank account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-2">How to get Razorpay credentials:</h4>
                    <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
                      <li>
                        Sign up at{" "}
                        <a href="https://razorpay.com" target="_blank" className="underline" rel="noreferrer">
                          razorpay.com
                        </a>
                      </li>
                      <li>Complete KYC verification</li>
                      <li>Go to Settings → API Keys</li>
                      <li>Generate API keys and copy them here</li>
                    </ol>
                  </div>

                  {/* Current Status */}
                  {formData.razorpayId && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">Razorpay Configured</span>
                      </div>
                      <p className="text-green-300 text-sm">Key ID: {formData.razorpayId.substring(0, 12)}...</p>
                    </div>
                  )}

                  {/* Razorpay Key ID */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Razorpay Key ID</Label>
                    <Input
                      value={formData.razorpayId}
                      onChange={(e) => handleInputChange("razorpayId", e.target.value)}
                      placeholder="rzp_test_xxxxxxxxxx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  {/* Razorpay Secret */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Razorpay Key Secret</Label>
                    <Input
                      type="password"
                      value={formData.razorpaySecret}
                      onChange={(e) => handleInputChange("razorpaySecret", e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      Keep this secret safe. It will be encrypted and stored securely.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Payment Details */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-green-400" />
                    Personal Payment Details (Optional)
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Add your UPI ID and QR code for direct payments from supporters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">Important Note:</h4>
                    <p className="text-yellow-200 text-sm">
                      Personal payment details allow supporters to pay you directly. However, these payments are not
                      tracked by our platform and you'll need to manage them manually. Razorpay integration is
                      recommended for better tracking and automatic settlement.
                    </p>
                  </div>

                  {/* UPI ID */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">UPI ID</Label>
                    <Input
                      value={formData.upiId}
                      onChange={(e) => handleInputChange("upiId", e.target.value)}
                      placeholder="yourname@paytm / yourname@phonepe / yourname@gpay"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      Your UPI ID for direct payments (e.g., yourname@paytm, yourname@phonepe)
                    </p>
                  </div>

                  {/* QR Code Image */}
                  <div className="max-w-fit">
                    <ImageUpload
                      currentImage={formData.qrCodeImage}
                      onImageUpdate={(imageUrl) => handleInputChange("qrCodeImage", imageUrl)}
                      aspect={1}
                      circularCrop={false}
                      title="Payment QR Code"
                      description="Upload your payment QR code (will be cropped to square format)"
                      size="large"
                    />
                  </div>

                  {/* Current Status */}
                  {(formData.qrCodeImage || formData.upiId) && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">Personal Payment Details Added</span>
                      </div>
                      <div className="text-green-300 text-sm space-y-1">
                        {formData.upiId && <p>UPI ID: {formData.upiId}</p>}
                        {formData.qrCodeImage && <p>QR Code: Uploaded</p>}
                      </div>
                    </div>
                  )}

                  {/* Save buttons for Payment Setup */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                    <Button
                      onClick={resetChanges}
                      variant="outline"
                      className="border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-600 w-full sm:w-auto"
                      size="sm"
                    >
                      Reset Changes
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto min-w-[120px]"
                      size="sm"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Payment Settings
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Verification Tab */}
            <TabsContent value="pending" className="space-y-4 md:space-y-6">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    Pending Payment Verification
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Review and verify direct payments received from supporters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingPayments.length > 0 ? (
                    <div className="space-y-4">
                      {pendingPayments.map((payment) => (
                        <div key={payment._id} className="border border-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold text-white">{payment.supporterName}</span>
                                <span className="text-green-400 font-bold">₹{payment.amount}</span>
                              </div>

                              {payment.transactionId && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-400">Transaction ID:</span>
                                  <span className="text-gray-300 font-mono bg-gray-700 px-2 py-1 rounded">
                                    {payment.transactionId}
                                  </span>
                                </div>
                              )}

                              {payment.message && (
                                <div className="text-sm">
                                  <span className="text-gray-400">Message:</span>
                                  <p className="text-gray-300 italic mt-1">"{payment.message}"</p>
                                </div>
                              )}

                              <div className="text-xs text-gray-500">
                                Submitted on{" "}
                                {new Date(payment.createdAt || Date.now()).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => verifyPayment(payment._id, "reject")}
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                Reject
                              </Button>
                              <Button
                                onClick={() => verifyPayment(payment._id, "approve")}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No pending payments to verify</p>
                      <p className="text-sm text-gray-500">All direct payments have been processed</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 md:space-y-6">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    Account Security
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Manage your account security settings and sensitive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Change */}
                  {user.provider === "credentials" && (
                    <div className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-white font-semibold flex items-center gap-2">
                            <Key className="h-4 w-4 text-green-400" />
                            Change Password
                          </h4>
                          <p className="text-gray-400 text-sm">Update your account password with email verification</p>
                        </div>
                        <Button
                          onClick={() => setPasswordChangeModal(true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Account Deletion */}
                  <div className="border border-red-700 rounded-lg p-4 bg-red-900/10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          <Trash2 className="h-4 w-4 text-red-400" />
                          Delete Account
                        </h4>
                        <p className="text-gray-400 text-sm">Permanently delete your account and all associated data</p>
                      </div>
                      <Button
                        onClick={() => setDeleteAccountModal(true)}
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        Delete Account
                      </Button>
                    </div>
                    <div className="bg-red-900/20 border border-red-700 rounded p-3">
                      <p className="text-red-300 text-sm">
                        ⚠️ <strong>Warning:</strong> This action cannot be undone. All your data, including profile,
                        payments, and supporter information will be permanently deleted.
                      </p>
                    </div>
                  </div>

                  {/* OAuth Account Info */}
                  {user.provider === "github" && (
                    <div className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Github className="h-5 w-5 text-purple-400" />
                        <div>
                          <h4 className="text-white font-semibold">GitHub Account</h4>
                          <p className="text-gray-400 text-sm">Your account is connected via GitHub OAuth</p>
                        </div>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                        <p className="text-blue-300 text-sm">
                          💡 <strong>Note:</strong> Password changes are managed through GitHub. To change your
                          password, please visit your GitHub account settings.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4 md:space-y-6">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Payment Activity Logs
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Complete history of all payment activities and status changes
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[60vh] overflow-y-auto">
                  {loadingLogs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                      <span className="ml-2 text-gray-400">Loading payment logs...</span>
                    </div>
                  ) : paymentLogs.length > 0 ? (
                    <div className="space-y-4">
                      {paymentLogs.map((log) => (
                        <div key={log._id} className="border border-gray-700 rounded-lg p-3 md:p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="space-y-2 flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <span className={`font-semibold text-sm ${log.actionColor}`}>{log.action}</span>
                                <span className="hidden sm:inline text-gray-400">•</span>
                                <span className="text-white font-medium text-sm truncate">{log.supporterName}</span>
                                <span className="text-green-400 font-bold text-sm">₹{log.amount}</span>
                              </div>

                              {log.transactionId && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                                  <span className="text-gray-400 flex-shrink-0">Transaction ID:</span>
                                  <span className="text-gray-300 font-mono bg-gray-700 px-2 py-1 rounded text-xs break-all">
                                    {log.transactionId}
                                  </span>
                                </div>
                              )}

                              {log.message && (
                                <div className="text-xs sm:text-sm">
                                  <span className="text-gray-400">Message:</span>
                                  <p className="text-gray-300 italic mt-1 break-words">"{log.message}"</p>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                                <div className="flex-shrink-0">
                                  <span className="text-gray-400">Received:</span>{" "}
                                  {new Date(log.createdAt || Date.now()).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                                {log.updatedAt && log.updatedAt !== log.createdAt && (
                                  <div className="flex-shrink-0">
                                    <span className="text-gray-400">Updated:</span>{" "}
                                    {new Date(log.updatedAt).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                              {log.paymentMethod && (
                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded whitespace-nowrap">
                                  {log.paymentMethod === "direct" ? "Direct/UPI" : log.paymentMethod}
                                </span>
                              )}
                              <div
                                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                  log.status === "completed"
                                    ? "bg-green-400"
                                    : log.status === "rejected"
                                      ? "bg-red-400"
                                      : "bg-yellow-400"
                                }`}
                                title={log.status}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No payment activity yet</p>
                      <p className="text-sm text-gray-500">
                        Payment logs will appear here once you start receiving payments
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={passwordChangeModal} onOpenChange={setPasswordChangeModal}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-2">
              <Label className="text-gray-300">Current Password</Label>
              <div className="relative">
                <Input
                  type={passwordVisibility.currentPassword ? "text" : "password"}
                  value={passwordChangeData.currentPassword}
                  onChange={(e) => setPasswordChangeData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setPasswordVisibility((prev) => ({ ...prev, currentPassword: !prev.currentPassword }))}
                >
                  {passwordVisibility.currentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label className="text-gray-300">New Password</Label>
              <div className="relative">
                <Input
                  type={passwordVisibility.newPassword ? "text" : "password"}
                  value={passwordChangeData.newPassword}
                  onChange={(e) => setPasswordChangeData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setPasswordVisibility((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                >
                  {passwordVisibility.newPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label className="text-gray-300">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={passwordVisibility.confirmPassword ? "text" : "password"}
                  value={passwordChangeData.confirmPassword}
                  onChange={(e) => setPasswordChangeData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setPasswordVisibility((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                >
                  {passwordVisibility.confirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* OTP Verification */}
            {otpSent.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">OTP (Sent to your email)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResendOTP("password")}
                    className="text-blue-400 hover:text-blue-300 hover:bg-transparent bg-transparent p-0 h-auto disabled:opacity-50"
                    disabled={resendTimeout.password > 0}
                  >
                    {resendTimeout.password > 0 ? `Resend OTP (${resendTimeout.password}s)` : "Resend OTP"}
                  </Button>
                </div>
                <Input
                  type="text"
                  value={passwordChangeData.otp}
                  onChange={(e) => setPasswordChangeData((prev) => ({ ...prev, otp: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordChangeModal(false)}
              className="border-red-600 bg-white text-red-600 hover:bg-red-600 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} className="bg-green-600 hover:bg-green-700">
              {otpSent.password ? "Change Password" : "Send OTP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAccountModal} onOpenChange={setDeleteAccountModal}>
        <DialogContent className="bg-gray-800 border-red-600 text-white">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {profile?.authProvider === "credentials" && (
              <div className="space-y-2">
                <Label className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    type={passwordVisibility.deletePassword ? "text" : "password"}
                    value={deleteAccountData.password}
                    onChange={(e) => setDeleteAccountData((prev) => ({ ...prev, password: e.target.value }))}
                    className="bg-gray-700 border-gray-600 text-white pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setPasswordVisibility((prev) => ({ ...prev, deletePassword: !prev.deletePassword }))}
                  >
                    {passwordVisibility.deletePassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* OTP Verification */}
            {otpSent.delete && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">OTP (Sent to your email)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResendOTP("delete")}
                    className="text-blue-400 hover:text-blue-300 hover:bg-transparent bg-transparent p-0 h-auto disabled:opacity-50"
                    disabled={resendTimeout.delete > 0}
                  >
                    {resendTimeout.delete > 0 ? `Resend OTP (${resendTimeout.delete}s)` : "Resend OTP"}
                  </Button>
                </div>
                <Input
                  type="text"
                  value={deleteAccountData.otp}
                  onChange={(e) => setDeleteAccountData((prev) => ({ ...prev, otp: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            )}

            {/* Confirm Delete */}
            <div className="space-y-2">
              <Label className="text-red-400">Confirm Deletion (Type DELETE_MY_ACCOUNT)</Label>
              <Input
                type="text"
                value={deleteAccountData.confirmDelete}
                onChange={(e) => setDeleteAccountData((prev) => ({ ...prev, confirmDelete: e.target.value }))}
                className="bg-gray-700 border-red-600 text-red-400"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteAccountModal(false)}
              className="border-red-600 bg-white text-red-600 hover:bg-red-600 hover:text-white"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteAccount} className="bg-green-600 hover:bg-green-700">
              {otpSent.delete ? "Delete Account" : "Send OTP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
