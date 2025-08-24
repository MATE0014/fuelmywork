import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { generateOTP, hashOTP, generateOTPExpiry } from "@/lib/otp"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")
    const passwordResetCollection = db.collection("password_resets")

    // Step 1: Send OTP if no OTP provided
    if (!otp) {
      // Check if user exists and is a credentials user
      const user = await usersCollection.findOne({
        email: email.toLowerCase(),
        provider: { $in: [null, "credentials"] }, // Only allow password reset for credential accounts
      })

      // Don't reveal whether email exists for security
      const otpCode = generateOTP()
      const hashedOTP = hashOTP(otpCode)
      const otpExpiry = generateOTPExpiry()

      // Store reset request (even if user doesn't exist for security)
      const resetData = {
        email: email.toLowerCase(),
        otp: hashedOTP,
        otpExpiry: otpExpiry,
        createdAt: new Date(),
        attempts: 0,
      }

      // Upsert reset request
      await passwordResetCollection.updateOne({ email: email.toLowerCase() }, { $set: resetData }, { upsert: true })

      // Only send email if user exists and is a credentials user
      if (user) {
        console.log("Sending password reset OTP to:", email)
        const emailResult = await sendPasswordResetEmail(email, otpCode, user.name)

        if (!emailResult.success) {
          console.error("Failed to send password reset email:", emailResult.error)
          return new Response(
            JSON.stringify({
              message: "Failed to send reset email. Please try again.",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          )
        }
      }

      return new Response(
        JSON.stringify({
          message: "If an account with this email exists, you will receive a password reset code.",
          otpSent: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Step 2: Verify OTP and reset password
    if (!newPassword) {
      return new Response(JSON.stringify({ message: "New password is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ message: "Password must be at least 6 characters long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Find reset request
    const resetRequest = await passwordResetCollection.findOne({
      email: email.toLowerCase(),
    })

    if (!resetRequest) {
      return new Response(JSON.stringify({ message: "Invalid or expired reset request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if OTP is expired
    if (new Date() > resetRequest.otpExpiry) {
      await passwordResetCollection.deleteOne({ _id: resetRequest._id })
      return new Response(JSON.stringify({ message: "Reset code has expired. Please request a new one." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Verify OTP
    const hashedInputOTP = hashOTP(otp)
    if (hashedInputOTP !== resetRequest.otp) {
      // Increment attempts
      await passwordResetCollection.updateOne({ _id: resetRequest._id }, { $inc: { attempts: 1 } })

      // Delete after 5 failed attempts
      if (resetRequest.attempts >= 4) {
        await passwordResetCollection.deleteOne({ _id: resetRequest._id })
        return new Response(JSON.stringify({ message: "Too many failed attempts. Please request a new reset code." }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }

      return new Response(JSON.stringify({ message: "Invalid reset code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Find user and update password
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      provider: { $in: [null, "credentials"] },
    })

    if (!user) {
      await passwordResetCollection.deleteOne({ _id: resetRequest._id })
      return new Response(JSON.stringify({ message: "User not found or not eligible for password reset" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    // Clean up reset request
    await passwordResetCollection.deleteOne({ _id: resetRequest._id })

    console.log("Password reset successful for user:", user.email)

    return new Response(
      JSON.stringify({
        message: "Password reset successful! You can now sign in with your new password.",
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Password reset error:", error)
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
