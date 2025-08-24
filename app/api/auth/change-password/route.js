import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { generateOTP } from "@/lib/otp"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { currentPassword, newPassword, otp } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ message: "New password must be at least 6 characters long" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")

    // Use email to find user since that's more reliable
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if user signed up with credentials (has password)
    if (!user.password) {
      return NextResponse.json(
        { message: "Cannot change password for OAuth accounts. Please use your OAuth provider." },
        { status: 400 },
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 400 })
    }

    // If OTP is provided, verify it and change password
    if (otp) {
      if (!user.passwordChangeOTP || !user.passwordChangeOTPExpires) {
        return NextResponse.json({ message: "No OTP request found. Please request a new OTP." }, { status: 400 })
      }

      if (new Date() > user.passwordChangeOTPExpires) {
        return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 })
      }

      if (user.passwordChangeOTP !== otp) {
        return NextResponse.json({ message: "Invalid OTP" }, { status: 400 })
      }

      // Hash new password and update
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            password: hashedNewPassword,
            updatedAt: new Date(),
          },
          $unset: {
            passwordChangeOTP: "",
            passwordChangeOTPExpires: "",
          },
        },
      )

      return NextResponse.json({ message: "Password changed successfully" })
    }

    // If no OTP provided, send OTP to email
    const otpCode = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordChangeOTP: otpCode,
          passwordChangeOTPExpires: otpExpires,
        },
      },
    )

    // Send OTP email
    const emailResult = await sendPasswordResetEmail(user.email, otpCode, user.name)
    if (!emailResult.success) {
      return NextResponse.json({ message: "Failed to send OTP email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "OTP sent to your email. Please verify to complete password change.",
      otpSent: true,
    })
  } catch (error) {
    console.error("Password change error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
