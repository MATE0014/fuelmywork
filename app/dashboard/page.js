"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  User,
  Heart,
  TrendingUp,
  DollarSign,
  Users,
  Upload,
  Save,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle,
  Edit,
  Loader2,
} from "lucide-react"

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: "",
    name: "",
    email: "",
    bio: "",
    profileImage: "",
    bannerImage: "",
    razorpayId: "",
    razorpaySecret: "",
  })

  // Original data to track changes
  const [originalData, setOriginalData] = useState({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Load user profile data when user is available
    if (user && user.id) {
      loadUserProfile()
    }
  }, [user, authLoading, router])

  // Check for changes whenever profileData updates
  useEffect(() => {
    if (Object.keys(originalData).length > 0) {
      const dataChanged = Object.keys(profileData).some((key) => {
        const current = profileData[key] || ""
        const original = originalData[key] || ""
        return current !== original
      })
      setHasChanges(dataChanged)
    }
  }, [profileData, originalData])

  const loadUserProfile = async () => {
    if (!user?.id) return

    setDataLoading(true)
    try {
      console.log("Loading profile for user:", user.id)
      const response = await fetch(`/api/user/profile?userId=${user.id}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Loaded profile data:", data)

        // Pre-fill with GitHub data if profile is empty
        const cleanData = {
          username: data.username || "",
          name: data.name || user.name || "",
          email: data.email || user.email || "",
          bio: data.bio || "",
          profileImage: data.profileImage || user.image || "",
          bannerImage: data.bannerImage || "",
          razorpayId: data.razorpayId || "",
          razorpaySecret: data.razorpaySecret || "",
        }

        setProfileData(cleanData)
        setOriginalData(cleanData)

        toast.success("Profile loaded successfully")
      } else {
        const errorData = await response.json()
        console.error("Failed to load profile:", errorData)
        toast.error("Failed to load profile data")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast.error("Error loading profile data")
    } finally {
      setDataLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
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
      const response = await fetch(`/api/user/check-username?username=${username}&userId=${user.id}`)
      const result = await response.json()

      if (result.available) {
        setUsernameStatus("✓ Username is available")
      } else {
        setUsernameStatus("✗ Username is already taken")
      }
    } catch (error) {
      setUsernameStatus("Error checking username")
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleUsernameChange = (value) => {
    handleInputChange("username", value)
    setUsernameStatus("")

    // Debounce username checking
    const timeoutId = setTimeout(() => {
      checkUsernameAvailability(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const handleImageUpload = (field, event) => {
    const file = event.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        handleInputChange(field, e.target.result)
        toast.success("Image uploaded successfully")
      }
      reader.readAsDataURL(file)
    }
  }

  const saveProfile = async () => {
    if (!profileData.username.trim()) {
      toast.error("Username is required!")
      return
    }

    if (usernameStatus.includes("taken")) {
      toast.error("Please choose a different username")
      return
    }

    setLoading(true)
    const loadingToast = toast.loading("Saving profile...")

    try {
      console.log("Saving profile data:", profileData)

      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          ...profileData,
        }),
      })

      const result = await response.json()
      console.log("Save response:", result)

      if (response.ok) {
        // Update original data to reflect saved state
        setOriginalData({ ...profileData })
        setHasChanges(false)

        // Dismiss loading toast and show success
        toast.dismiss(loadingToast)
        toast.success("Profile saved successfully!", {
          description: "Your changes have been saved to the database.",
        })

        // Clear username status
        setUsernameStatus("")
      } else {
        toast.dismiss(loadingToast)
        toast.error("Failed to save profile", {
          description: result.error || "An error occurred while saving",
        })
      }
    } catch (error) {
      console.error("Save error:", error)
      toast.dismiss(loadingToast)
      toast.error("Failed to save profile", {
        description: "Network error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyProfileLink = () => {
    if (!profileData.username) {
      toast.error("Please set a username first")
      return
    }

    const profileUrl = `${window.location.origin}/${profileData.username}`
    navigator.clipboard.writeText(profileUrl)
    toast.success("Profile link copied to clipboard!")
  }

  const resetChanges = () => {
    setProfileData({ ...originalData })
    setHasChanges(false)
    setUsernameStatus("")
    toast.info("Changes reset to original values")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit">
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-400">Welcome back, {user.name?.split(" ")[0]}!</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-300">{user.name}</p>
                  <p className="text-xs text-gray-500">GitHub Account</p>
                </div>
                <img
                  src={profileData.profileImage || user.image || "/placeholder.svg?height=48&width=48"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-gray-600"
                />
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-600">
              <TabsTrigger value="overview" className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Profile Settings
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-gray-500 data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                Payment Setup
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* GitHub Account Info */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    GitHub Account
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </CardTitle>
                  <CardDescription className="text-gray-300">Connected via OAuth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img
                      src={user.image || "/placeholder.svg?height=64&width=64"}
                      alt={user.name}
                      className="w-16 h-16 rounded-full border-2 border-gray-600"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                      <p className="text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500">User ID: {user.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Profile Display */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    Creator Profile
                    <Edit className="h-4 w-4 text-gray-400" />
                  </CardTitle>
                  <CardDescription className="text-gray-300">Your public creator profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Banner */}
                  {profileData.bannerImage && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Banner Image</Label>
                      <div className="w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={profileData.bannerImage || "/placeholder.svg"}
                          alt="Current Banner"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Current Profile Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        {profileData.profileImage ? (
                          <img
                            src={profileData.profileImage || "/placeholder.svg"}
                            alt="Current Profile"
                            className="w-16 h-16 rounded-full border-2 border-gray-600"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {profileData.name || "No display name set"}
                          </h3>
                          <p className="text-gray-400">
                            {profileData.username ? `@${profileData.username}` : "No username set"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Email</Label>
                        <p className="text-gray-400 text-sm">{profileData.email || "No email set"}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Bio</Label>
                        <p className="text-gray-400 text-sm">{profileData.bio || "No bio added yet"}</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Payment Setup</Label>
                        <div className="flex items-center gap-2">
                          {profileData.razorpayId ? (
                            <div className="flex items-center gap-2 text-green-400">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Razorpay configured</span>
                              <span className="text-xs text-gray-500">
                                ({profileData.razorpayId.substring(0, 12)}...)
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-yellow-400">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm">Payment setup required</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-300">Total Supporters</CardTitle>
                      <Users className="h-4 w-4 text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">0</div>
                    <p className="text-xs text-gray-400">Complete profile to start</p>
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
                    <div className="text-2xl font-bold text-white">₹0</div>
                    <p className="text-xs text-gray-400">Set up payments to start</p>
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
                    <div className="text-2xl font-bold text-white">₹0</div>
                    <p className="text-xs text-gray-400">No earnings yet</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-300">Profile Views</CardTitle>
                      <Heart className="h-4 w-4 text-red-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">0</div>
                    <p className="text-xs text-gray-400">Share your profile link</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-800 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">Your Profile Link</CardTitle>
                    <CardDescription className="text-gray-300">Share this link with your supporters</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={profileData.username ? `fuelmywork.com/${profileData.username}` : "Set username first"}
                        readOnly
                        className="bg-gray-700 border-gray-600 text-gray-300"
                      />
                      <Button
                        onClick={copyProfileLink}
                        disabled={!profileData.username}
                        variant="outline"
                        className="text-gray-300 border-gray-600 bg-transparent hover:bg-gray-700 hover:text-black"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(`/${profileData.username}`, "_blank")}
                        disabled={!profileData.username}
                        className="bg-blue-600 hover:bg-blue-700"
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
                        <span className="text-gray-300">
                          {Math.round(
                            (Object.values(profileData).filter((val) => val && val.trim()).length /
                              Object.keys(profileData).length) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.round(
                              (Object.values(profileData).filter((val) => val && val.trim()).length /
                                Object.keys(profileData).length) *
                                100,
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Settings Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Edit Profile Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Update your public creator profile (linked to your GitHub account)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Banner Image */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Banner Image</Label>
                    <div className="relative">
                      <div className="w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                        {profileData.bannerImage ? (
                          <img
                            src={profileData.bannerImage || "/placeholder.svg"}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Upload className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("bannerImage", e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Profile Image</Label>
                    <div className="relative w-24 h-24">
                      <div className="w-full h-full bg-gray-700 rounded-full overflow-hidden">
                        {profileData.profileImage ? (
                          <img
                            src={profileData.profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <User className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload("profileImage", e)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Current GitHub image will be used if no custom image is uploaded
                    </p>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Username *</Label>
                    <div className="relative">
                      <Input
                        value={profileData.username}
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
                      This will be your unique URL: fuelmywork.com/{profileData.username || "username"}
                    </p>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Display Name</Label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={user.name || "Your display name"}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">Defaults to your GitHub name: {user.name}</p>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder={user.email || "your@email.com"}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">Defaults to your GitHub email: {user.email}</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Bio</Label>
                    <Textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell your supporters about yourself..."
                      className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Save Button for Profile Tab */}
              {hasChanges && (
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="text-sm text-yellow-400">You have unsaved changes</div>
                  <div className="flex gap-2">
                    <Button
                      onClick={resetChanges}
                      variant="outline"
                      className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={saveProfile}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Payment Setup Tab */}
            <TabsContent value="payments" className="space-y-6">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Razorpay Integration</CardTitle>
                  <CardDescription className="text-gray-300">
                    Set up your Razorpay credentials to receive payments from supporters
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
                  {profileData.razorpayId && (
                    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-semibold">Razorpay Configured</span>
                      </div>
                      <p className="text-green-300 text-sm">Key ID: {profileData.razorpayId.substring(0, 12)}...</p>
                    </div>
                  )}

                  {/* Razorpay Key ID */}
                  <div className="space-y-2">
                    <Label className="text-gray-300">Razorpay Key ID</Label>
                    <Input
                      value={profileData.razorpayId}
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
                      value={profileData.razorpaySecret}
                      onChange={(e) => handleInputChange("razorpaySecret", e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-xs text-gray-400">
                      Keep this secret safe. It will be encrypted and stored securely.
                    </p>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                      <strong>Security Note:</strong> Your Razorpay credentials are encrypted and stored securely. We
                      never store them in plain text.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button for Payment Tab */}
              {hasChanges && (
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-600">
                  <div className="text-sm text-yellow-400">You have unsaved changes</div>
                  <div className="flex gap-2">
                    <Button
                      onClick={resetChanges}
                      variant="outline"
                      className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={saveProfile}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
