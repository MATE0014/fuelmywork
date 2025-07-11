"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Heart, Users, Share2, User, IndianRupee } from "lucide-react"
import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UserProfile({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [supporters, setSupporters] = useState([])
  const [supportAmount, setSupportAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [supporterName, setSupporterName] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [processingPayment, setProcessingPayment] = useState(false)

  const defaultAmounts = [50, 100, 250, 500, 1000]

  useEffect(() => {
    if (resolvedParams?.username) {
      loadUserProfile(resolvedParams.username)
      loadSupporters(resolvedParams.username)
    }
  }, [resolvedParams?.username])

  const loadUserProfile = async (username) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/profile-by-username?username=${username}`)

      if (response.status === 404) {
        setNotFound(true)
        return
      }

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {
        setNotFound(true)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const loadSupporters = async (username) => {
    try {
      const response = await fetch(`/api/supporters?username=${username}`)
      if (response.ok) {
        const data = await response.json()
        setSupporters(data.supporters || [])
      }
    } catch (error) {
      console.error("Error loading supporters:", error)
    }
  }

  const handleAmountSelect = (amount) => {
    setSupportAmount(amount.toString())
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value)
    setSupportAmount(value)
  }

  const copyProfileLink = () => {
    const profileUrl = window.location.href
    navigator.clipboard.writeText(profileUrl)
    toast.success("Profile link copied to clipboard!")
  }

  const handleSupport = async () => {
    if (!supportAmount || Number.parseFloat(supportAmount) < 1) {
      toast.error("Please enter a valid amount (minimum ₹1)")
      return
    }

    if (!supporterName.trim()) {
      toast.error("Please enter your name")
      return
    }

    if (!profile.razorpayId) {
      toast.error("Creator hasn't set up payments yet")
      return
    }

    setProcessingPayment(true)

    try {
      // Create order
      const orderResponse = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(supportAmount),
          creatorUsername: resolvedParams.username,
          supporterName: supporterName.trim(),
          message: supportMessage.trim(),
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order")
      }

      const orderData = await orderResponse.json()

      // Initialize Razorpay
      const options = {
        key: profile.razorpayId,
        amount: orderData.amount,
        currency: "INR",
        name: "fuelmywork",
        description: `Support ${profile.name || profile.username}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                creatorUsername: resolvedParams.username,
                supporterName: supporterName.trim(),
                message: supportMessage.trim(),
                amount: Number.parseFloat(supportAmount),
              }),
            })

            if (verifyResponse.ok) {
              toast.success("Payment successful! Thank you for your support!")
              // Reset form
              setSupportAmount("")
              setCustomAmount("")
              setSupporterName("")
              setSupportMessage("")
              // Reload supporters
              loadSupporters(resolvedParams.username)
            } else {
              toast.error("Payment verification failed")
            }
          } catch (error) {
            console.error("Payment verification error:", error)
            toast.error("Payment verification failed")
          }
        },
        prefill: {
          name: supporterName,
        },
        theme: {
          color: "#2563eb",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Failed to initiate payment")
    } finally {
      setProcessingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-12 w-12 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
            <p className="text-gray-400 mb-8">
              The user "@{resolvedParams?.username}" doesn't exist or hasn't set up their profile yet.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent w-full"
            >
              Create Your Profile
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Load Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

      <div className="min-h-screen bg-gray-950 text-white font-outfit">
        {/* Back Button */}
        <div className="absolute top-20 left-6 z-10">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-gray-600 bg-gray-900/80 backdrop-blur-sm text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Banner Section */}
        <div className="relative">
          {/* Banner Image */}
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-900 to-purple-900 overflow-hidden">
            {profile.bannerImage ? (
              <img
                src={profile.bannerImage || "/placeholder.svg"}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-900 to-purple-900"></div>
            )}
          </div>

          {/* Profile Picture - Positioned to overlap banner */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
            <div className="w-32 h-32 rounded-full border-4 border-gray-950 overflow-hidden bg-gray-800">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage || "/placeholder.svg"}
                  alt={profile.name || profile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 pb-8 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{profile.name || profile.username}</h1>
            <p className="text-gray-400 text-lg mb-4">@{profile.username}</p>

            {profile.bio && <p className="text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">{profile.bio}</p>}

            {/* Share Button */}
            <div className="flex justify-center gap-4 mb-8">
              <Button
                onClick={copyProfileLink}
                variant="outline"
                className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="px-6 pb-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Supporters List */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-400" />
                    Recent Supporters
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {supporters.length} people have supported {profile.name || profile.username}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {supporters.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {supporters.map((supporter, index) => (
                        <div key={index} className="border-b border-gray-700 pb-3 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-white">{supporter.name}</span>
                            <span className="text-green-400 font-bold">₹{supporter.amount}</span>
                          </div>
                          {supporter.message && <p className="text-sm text-gray-400 italic">"{supporter.message}"</p>}
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(supporter.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No supporters yet</p>
                      <p className="text-sm text-gray-500">Be the first to support this creator!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Support Payment Form */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-green-400" />
                    Support {profile.name || profile.username}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Show your appreciation with a financial contribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!profile.razorpayId ? (
                    <div className="text-center py-8">
                      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                        <p className="text-yellow-400">
                          This creator hasn't set up payments yet. They need to configure their Razorpay account to
                          receive support.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Amount Selection */}
                      <div className="space-y-3">
                        <Label className="text-gray-300">Choose Amount</Label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {defaultAmounts.map((amount) => (
                            <Button
                              key={amount}
                              onClick={() => handleAmountSelect(amount)}
                              variant={supportAmount === amount.toString() ? "default" : "outline"}
                              className={
                                supportAmount === amount.toString()
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
                              }
                            >
                              ₹{amount}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Amount */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Or enter custom amount</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={customAmount}
                            onChange={(e) => handleCustomAmountChange(e.target.value)}
                            className="pl-10 bg-gray-700 border-gray-600 text-white"
                            min="1"
                          />
                        </div>
                      </div>

                      {/* Supporter Name */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Your Name *</Label>
                        <Input
                          placeholder="How should we display your name?"
                          value={supporterName}
                          onChange={(e) => setSupporterName(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>

                      {/* Support Message */}
                      <div className="space-y-2">
                        <Label className="text-gray-300">Message (Optional)</Label>
                        <Textarea
                          placeholder="Leave a message for the creator..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500">{supportMessage.length}/200 characters</p>
                      </div>

                      {/* Support Button */}
                      <Button
                        onClick={handleSupport}
                        disabled={processingPayment || !supportAmount || !supporterName.trim()}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Heart className="h-5 w-5 mr-2" />
                            Support with ₹ {supportAmount || "0"}
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Secure payment powered by Razorpay • No account required
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
