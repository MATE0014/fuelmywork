import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyOTP } from "@/lib/otp"

export async function POST(request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const pendingUsersCollection = db.collection("pending_users")
    const usersCollection = db.collection("users")

    const userExists = await pendingUsersCollection.findOne({
      email: email.toLowerCase(),
    })

    const user = await pendingUsersCollection.findOne({
      email: email.toLowerCase(),
      otpExpiry: { $gt: new Date() },
    })

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    const otpValid = verifyOTP(otp, user.otp)

    if (!otpValid) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 })
    }

    const verifiedUser = {
      ...user,
      isVerified: true,
      emailVerified: new Date(),
    }

    // Remove OTP fields
    delete verifiedUser.otp
    delete verifiedUser.otpExpiry

    // Insert into users collection
    const result = await usersCollection.insertOne(verifiedUser)

    // Remove from pending_users collection
    await pendingUsersCollection.deleteOne({ _id: user._id })

    // Return success with user data for auto-login
    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: result.insertedId.toString(),
        email: verifiedUser.email,
        name: verifiedUser.name,
        username: verifiedUser.username,
        image: verifiedUser.profileImage,
      },
      autoLogin: true,
      success: true,
    })
  } catch (error) {
    console.error("OTP verification error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
