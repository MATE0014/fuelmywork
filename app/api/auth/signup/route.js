import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"
import { generateOTP, hashOTP, generateOTPExpiry } from "@/lib/otp"
import { sendOTPEmail } from "@/lib/email"

export async function POST(req) {
  try {
    const { name, email, password } = await req.json()

    // Validation
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Password validation
    if (password.length < 8) {
      return new Response(JSON.stringify({ message: "Password must be at least 8 characters long" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")
    const pendingUsersCollection = db.collection("pending_users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    })

    if (existingUser) {
      return new Response(JSON.stringify({ message: "This email is already registered" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Check if there's already a pending registration for this email
    const existingPending = await pendingUsersCollection.findOne({
      email: email.toLowerCase(),
    })

    // Generate OTP
    const otp = generateOTP()
    const hashedOTP = hashOTP(otp)
    const otpExpiry = generateOTPExpiry()


    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Prepare user data
    const pendingUserData = {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      otp: hashedOTP,
      otpExpiry: otpExpiry,
      createdAt: new Date(),
      attempts: 0, // Track verification attempts
    }


    // Send OTP email
    const emailResult = await sendOTPEmail(email, otp, name)

    if (!emailResult.success) {
      console.error("Failed to send OTP email via Brevo:", emailResult.error)
      return new Response(
        JSON.stringify({
          message: "Failed to send verification email. Please check your email address and try again.",
          error: emailResult.error,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    console.log("OTP email sent successfully via Brevo")

    // Store pending user (upsert to handle re-registration)
    if (existingPending) {
      await pendingUsersCollection.updateOne({ _id: existingPending._id }, { $set: pendingUserData })
    } else {
      await pendingUsersCollection.insertOne(pendingUserData)
    }

    return new Response(
      JSON.stringify({
        message: "Registration successful! Please check your email for the verification code.",
        email: email.toLowerCase(),
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Signup error:", error)
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
