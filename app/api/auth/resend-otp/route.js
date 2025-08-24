import clientPromise from "@/lib/mongodb"
import { generateOTP, hashOTP, generateOTPExpiry } from "@/lib/otp"
import { sendOTPEmail } from "@/lib/email"

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const pendingUsersCollection = db.collection("pending_users")

    // Find pending user
    const pendingUser = await pendingUsersCollection.findOne({
      email: email.toLowerCase(),
    })

    if (!pendingUser) {
      return new Response(JSON.stringify({ message: "No pending registration found for this email" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if last OTP was sent less than 1 minute ago (rate limiting)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    if (pendingUser.createdAt > oneMinuteAgo) {
      const secondsLeft = Math.ceil((pendingUser.createdAt.getTime() + 60000 - Date.now()) / 1000)
      return new Response(
        JSON.stringify({
          message: `Please wait ${secondsLeft} seconds before requesting a new OTP`,
          secondsLeft: secondsLeft,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Generate new OTP
    const otp = generateOTP()
    const hashedOTP = hashOTP(otp)
    const otpExpiry = generateOTPExpiry()

    console.log("Resending OTP email via Brevo to:", email)

    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, pendingUser.name)

    if (!emailResult.success) {
      console.error("Failed to resend OTP email via Brevo:", emailResult.error)
      return new Response(
        JSON.stringify({
          message: "Failed to send verification email. Please try again.",
          error: emailResult.error,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("OTP email resent successfully via Brevo")

    // Update pending user with new OTP
    await pendingUsersCollection.updateOne(
      { _id: pendingUser._id },
      {
        $set: {
          otp: hashedOTP,
          otpExpiry: otpExpiry,
          attempts: 0, // Reset attempts
          createdAt: new Date(), // Update timestamp for rate limiting
        },
      },
    )

    return new Response(
      JSON.stringify({
        message: "New verification code sent to your email!",
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Resend OTP error:", error)
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
