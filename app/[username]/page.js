"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import {
  User,
  Heart,
  Share2,
  Calendar,
  Loader2,
  CreditCard,
  QrCode,
  Copy,
  CheckCircle,
  ArrowLeft,
  Users,
  IndianRupee,
  Shield,
  AlertCircle,
} from "lucide-react"

const UserProfile = () => {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [supporters, setSupporters] = useState([])
  const [supportersLoading, setSupportersLoading] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [supporterName, setSupporterName] = useState("")
  const [paymentMessage, setPaymentMessage] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("razorpay")

  const username = params?.username
  const defaultAmounts = [50, 100, 250, 500, 1000]

  useEffect(() => {
    if (username) {
      fetchProfile()
      fetchSupporters()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      console.log("Fetching profile for username:", username)

      const response = await fetch(`/api/user/profile-by-username?username=${username}`)
      const data = await response.json()

      if (response.ok) {
        setProfile(data)
        console.log("Profile loaded:", data)

        // Set default payment method based on availability
        if (data.hasRazorpaySetup) {
          setSelectedPaymentMethod("razorpay")
        } else if (data.hasPersonalPayment) {
          setSelectedPaymentMethod("personal")
        }
      } else {
        setError(data.error || "Creator not found")
        console.error("Failed to fetch profile:", data.error)
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const fetchSupporters = async () => {
    try {
      setSupportersLoading(true)
      const response = await fetch(`/api/supporters?username=${username}`)
      if (response.ok) {
        const data = await response.json()
        setSupporters(data.supporters || [])
        console.log("Supporters loaded:", data.supporters?.length || 0)
      }
    } catch (error) {
      console.error("Error fetching supporters:", error)
    } finally {
      setSupportersLoading(false)
    }
  }

  const handleSupport = () => {
    if (!user) {
      router.push("/login")
      return
    }
    // Pre-fill supporter name if user is logged in
    if (user.name && !supporterName) {
      setSupporterName(user.name)
    }
    setPaymentModalOpen(true)
  }

  const handleAmountSelect = (amount) => {
    setPaymentAmount(amount.toString())
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value) => {
    setCustomAmount(value)
    setPaymentAmount(value)
  }

  const processRazorpayPayment = async () => {
    if (!paymentAmount || Number.parseFloat(paymentAmount) < 1) {
      toast.error("Please enter an amount of at least ₹1")
      return
    }

    if (!supporterName.trim()) {
      toast.error("Please enter your name")
      return
    }

    setPaymentLoading(true)

    try {
      // Create order
      const orderResponse = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number.parseFloat(paymentAmount),
          creatorUsername: username,
          supporterName: supporterName.trim(),
          supporterEmail: user?.email || "",
          message: paymentMessage.trim(),
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create payment order")
      }

      // Initialize Razorpay payment
      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: "INR",
        name: "FuelMyWork",
        description: `Support for ${profile.name || profile.username}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                creatorUsername: username,
                supporterName: supporterName.trim(),
                message: paymentMessage.trim(),
                amount: Number.parseFloat(paymentAmount),
              }),
            })

            const verifyData = await verifyResponse.json()

            if (verifyResponse.ok && verifyData.success) {
              toast.success("Payment successful! Thank you for your support!")
              setPaymentModalOpen(false)
              setPaymentAmount("")
              setCustomAmount("")
              setSupporterName("")
              setPaymentMessage("")
              // Refresh supporters list
              fetchSupporters()
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
          email: user?.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Payment error:", error)
      toast.error(error.message || "Failed to process payment")
    } finally {
      setPaymentLoading(false)
    }
  }

  const handlePersonalPayment = async () => {
    if (!paymentAmount || Number.parseFloat(paymentAmount) < 1) {
      toast.error("Please enter an amount of at least ₹1")
      return
    }

    if (!supporterName.trim()) {
      toast.error("Please enter your name")
      return
    }

    setPaymentLoading(true)

    try {
      // Add supporter to database for direct payment
      const response = await fetch("/api/add-supporter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorUsername: username,
          supporterName: supporterName.trim(),
          amount: Number.parseFloat(paymentAmount),
          message: paymentMessage.trim(),
          paymentMethod: "direct",
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success("Support recorded! Please complete the payment using the provided details.", {
          description: "Your support will show as 'pending verification' until the creator confirms receipt.",
          duration: 6000,
        })

        // Reset form and close modal
        setPaymentAmount("")
        setCustomAmount("")
        setSupporterName("")
        setPaymentMessage("")
        setPaymentModalOpen(false)

        // Refresh supporters list
        fetchSupporters()
      } else {
        throw new Error(data.error || "Failed to record support")
      }
    } catch (error) {
      console.error("Error recording support:", error)
      toast.error(error.message || "Failed to record support")
    } finally {
      setPaymentLoading(false)
    }
  }

  const copyUpiId = () => {
    navigator.clipboard.writeText(profile.upiId)
    toast.success("UPI ID copied to clipboard!")
  }

  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/${username}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${profile.name || profile.username}`,
          text: `Check out ${profile.name || profile.username}'s profile on FuelMyWork`,
          url: profileUrl,
        })
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(profileUrl)
        toast.success("Profile link copied to clipboard!")
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(profileUrl)
      toast.success("Profile link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white font-outfit flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-400">Profile Not Found</h1>
          <p className="text-gray-400">{error}</p>
          <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-950 text-white font-outfit">
      {/* Banner Section */}
      <div className="relative">
        {profile.bannerImage ? (
          <div className="h-48 md:h-64 bg-gray-800 overflow-hidden">
            <img src={profile.bannerImage || "/placeholder.svg"} alt="Banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        )}

        {/* Profile Image */}
        <div className="absolute -bottom-16 left-4 md:left-8">
          <div className="w-32 h-32 bg-gray-800 rounded-full border-4 border-gray-950 overflow-hidden">
            {profile.profileImage ? (
              <img
                src={profile.profileImage || "/placeholder.svg"}
                alt={profile.name || profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <User className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 md:px-8 pt-20 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold">{profile.name || profile.username}</h1>
              <p className="text-gray-400">@{profile.username}</p>
              {profile.bio && <p className="text-gray-300 max-w-2xl">{profile.bio}</p>}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={shareProfile}
                variant="outline"
                className="border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={handleSupport}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!profile.hasRazorpaySetup && !profile.hasPersonalPayment}
              >
                <Heart className="h-4 w-4 mr-2" />
                Support Creator
              </Button>
            </div>
          </div>

          {/* Payment Setup Status */}
          {!profile.hasRazorpaySetup && !profile.hasPersonalPayment && (
            <Card className="bg-yellow-900/20 border-yellow-700 mb-8">
              <CardContent className="p-4">
                <p className="text-yellow-200 text-sm">
                  This creator hasn't set up payment methods yet. They need to configure either Razorpay or personal
                  payment details to receive support.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - About and Support Status */}
            <div className="lg:col-span-1 space-y-6">
              {/* About Card */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.bio ? (
                    <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No bio available</p>
                  )}
                </CardContent>
              </Card>

              {/* Support Status Card */}
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Payment Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {profile.hasRazorpaySetup ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-600"></div>
                    )}
                    <span className="text-sm text-gray-300">Razorpay Payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile.hasPersonalPayment ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-600"></div>
                    )}
                    <span className="text-sm text-gray-300">Direct Payments</span>
                  </div>
                </CardContent>
              </Card>

              {/* Joined Date */}
              {profile.createdAt && (
                <Card className="bg-gray-800 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Supporters List */}
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2 text-xl">
                    <Heart className="h-5 w-5 text-red-400" />
                    Recent Supporters
                  </CardTitle>
                  <p className="text-gray-300 text-sm">
                    {supporters.length} {supporters.length === 1 ? "person has" : "people have"} supported{" "}
                    {profile.name || profile.username}
                  </p>
                </CardHeader>
                <CardContent>
                  {supportersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-400">Loading supporters...</span>
                    </div>
                  ) : supporters.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {supporters.map((supporter, index) => (
                        <div key={index} className="border-b border-gray-700 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">{supporter.name}</span>
                                {supporter.verified ? (
                                  <Shield className="h-3 w-3 text-green-400" title="Verified payment" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 text-yellow-400" title="Pending verification" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-green-400 font-bold">
                              <IndianRupee className="h-4 w-4" />
                              <span>{supporter.amount}</span>
                            </div>
                          </div>
                          {supporter.message && (
                            <div className="ml-10 mb-2">
                              <p className="text-sm text-gray-300 italic bg-gray-700/50 rounded-lg p-2">
                                "{supporter.message}"
                              </p>
                            </div>
                          )}
                          <div className="ml-10 flex items-center gap-2">
                            <p className="text-xs text-gray-500">
                              {new Date(supporter.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <span className="text-xs text-gray-600">•</span>
                            <span className="text-xs text-gray-500 capitalize">{supporter.paymentMethod}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No supporters yet</p>
                      <p className="text-sm text-gray-500">Be the first to support this creator!</p>
                      <Button
                        onClick={handleSupport}
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        disabled={!profile.hasRazorpaySetup && !profile.hasPersonalPayment}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Support Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              Support {profile.name || profile.username}
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Choose your payment method and amount to support this creator
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Payment Method Selection */}
            {profile.hasRazorpaySetup && profile.hasPersonalPayment && (
              <div className="space-y-3">
                <Label className="text-gray-300">Payment Method</Label>
                <Tabs value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="razorpay" className="data-[state=active]:bg-gray-600">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Razorpay
                    </TabsTrigger>
                    <TabsTrigger value="personal" className="data-[state=active]:bg-gray-600">
                      <QrCode className="h-4 w-4 mr-2" />
                      Direct Payment
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}

            {/* Amount Selection */}
            <div className="space-y-3">
              <Label className="text-gray-300">Choose Amount</Label>
              <div className="grid grid-cols-3 gap-2">
                {defaultAmounts.map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => handleAmountSelect(amount)}
                    variant={paymentAmount === amount.toString() ? "default" : "outline"}
                    className={
                      paymentAmount === amount.toString()
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
                value={paymentMessage}
                onChange={(e) => setPaymentMessage(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
                maxLength={200}
              />
              <p className="text-xs text-gray-500">{paymentMessage.length}/200 characters</p>
            </div>

            {/* Payment Content */}
            {selectedPaymentMethod === "razorpay" && profile.hasRazorpaySetup && (
              <div className="space-y-4">
                <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    <strong>Secure Payment:</strong> Your payment will be processed securely through Razorpay. You can
                    pay using cards, UPI, net banking, or wallets.
                  </p>
                </div>

                <Button
                  onClick={processRazorpayPayment}
                  disabled={paymentLoading || !paymentAmount || !supporterName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ₹{paymentAmount || "0"}
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-400 text-center">Secure payment powered by Razorpay</p>
              </div>
            )}

            {selectedPaymentMethod === "personal" && profile.hasPersonalPayment && (
              <div className="space-y-4">
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    <strong>Direct Payment:</strong> Use the details below to pay directly. Your support will be
                    recorded but marked as "pending verification" until confirmed.
                  </p>
                </div>

                {profile.upiId && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">UPI ID</Label>
                    <div className="flex items-center gap-2">
                      <Input value={profile.upiId} readOnly className="bg-gray-700 border-gray-600 text-white" />
                      <Button
                        onClick={copyUpiId}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 bg-transparent hover:bg-gray-700"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {profile.qrCodeImage && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Payment QR Code</Label>
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-white rounded-lg p-4">
                        <img
                          src={profile.qrCodeImage || "/placeholder.svg"}
                          alt="Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center">Scan with any UPI app to pay</p>
                  </div>
                )}

                <Button
                  onClick={handlePersonalPayment}
                  disabled={paymentLoading || !paymentAmount || !supporterName.trim()}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Record ₹{paymentAmount || "0"} Support
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  )
}

export default UserProfile
