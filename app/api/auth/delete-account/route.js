import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { generateOTP } from "@/lib/otp"
import { sendOTPEmail, sendAccountDeletionNotificationEmail } from "@/lib/email"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { password, otp, confirmDelete } = await request.json()

    if (!confirmDelete || confirmDelete !== "DELETE_MY_ACCOUNT") {
      return NextResponse.json({ message: "Please type 'DELETE_MY_ACCOUNT' to confirm deletion" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")
    const paymentsCollection = db.collection("payments")
    const supportersCollection = db.collection("supporters")

    // Use email to find user since that's more reliable
    const user = await usersCollection.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const isGitHubUser = !user.password

    // For credentials users, verify password
    if (!isGitHubUser && !password) {
      return NextResponse.json({ message: "Password is required for account deletion" }, { status: 400 })
    }

    if (!isGitHubUser && password) {
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Incorrect password" }, { status: 400 })
      }
    }

    // If OTP is provided, verify it and delete account
    if (otp) {
      if (!user.deleteAccountOTP || !user.deleteAccountOTPExpires) {
        return NextResponse.json({ message: "No OTP request found. Please request a new OTP." }, { status: 400 })
      }

      if (new Date() > user.deleteAccountOTPExpires) {
        return NextResponse.json({ message: "OTP has expired. Please request a new one." }, { status: 400 })
      }

      if (user.deleteAccountOTP !== otp) {
        return NextResponse.json({ message: "Invalid OTP" }, { status: 400 })
      }

      // Delete all user data
      await Promise.all([
        usersCollection.deleteOne({ _id: user._id }),
        paymentsCollection.deleteMany({ creatorId: user._id.toString() }),
        supportersCollection.deleteMany({ creatorId: user._id.toString() }),
      ])

      await sendAccountDeletionNotificationEmail(user.email, user.name)

      return NextResponse.json({ message: "Account deleted successfully", deleted: true })
    }

    // If no OTP provided, send OTP to email
    const otpCode = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          deleteAccountOTP: otpCode,
          deleteAccountOTPExpires: otpExpires,
        },
      },
    )

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otpCode, user.name, "account deletion")
    if (!emailResult.success) {
      return NextResponse.json({ message: "Failed to send OTP email" }, { status: 500 })
    }

    return NextResponse.json({
      message: "OTP sent to your email. Please verify to complete account deletion.",
      otpSent: true,
    })
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
