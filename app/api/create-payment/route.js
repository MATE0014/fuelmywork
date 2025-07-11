import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import Razorpay from "razorpay"
import crypto from "crypto" // Import crypto for decryption

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const ALGORITHM = "aes-256-cbc"

function decrypt(text) {
  if (!text || !ENCRYPTION_KEY) return text
  try {
    const textParts = text.split(":")
    if (textParts.length !== 2) return text

    const iv = Buffer.from(textParts.shift(), "hex")
    const encryptedText = textParts.join(":")
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return text
  }
}

export async function POST(request) {
  try {
    const { amount, creatorUsername, supporterName, message } = await request.json()

    console.log("=== CREATE PAYMENT DEBUG ===")
    console.log("Amount:", amount, "Creator:", creatorUsername)

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!creatorUsername || !supporterName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    // Explicitly connect to the 'fuelmywork' database for creator profiles
    const db = client.db("fuelmywork")
    const creatorProfilesCollection = db.collection("users") // Using 'users' collection for creator profiles

    console.log("Fetching creator's Razorpay credentials from fuelmywork.users...")
    const creator = await creatorProfilesCollection.findOne({
      username: creatorUsername.toLowerCase().trim(),
    })

    if (!creator || !creator.razorpayId || !creator.razorpaySecret) {
      console.log("Creator payment setup incomplete or creator not found.")
      return NextResponse.json({ error: "Creator payment setup incomplete" }, { status: 400 })
    }

    // Decrypt Razorpay secret
    const razorpaySecret = decrypt(creator.razorpaySecret)
    console.log("Razorpay Key ID:", creator.razorpayId)
    console.log("Razorpay Secret (decrypted):", razorpaySecret ? "***" : "NOT FOUND")

    if (!razorpaySecret) {
      console.error("Failed to decrypt Razorpay secret.")
      return NextResponse.json({ error: "Failed to retrieve creator's payment secret" }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: creator.razorpayId,
      key_secret: razorpaySecret,
    })

    console.log("Creating Razorpay order...")
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `support_${Date.now()}`,
      notes: {
        creatorUsername,
        supporterName,
        message: message || "",
      },
    })

    console.log("Razorpay order created:", order.id)
    console.log("=== END CREATE PAYMENT DEBUG ===")

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error("=== CREATE PAYMENT ERROR ===")
    console.error("Error creating payment order:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to create payment order: " + error.message }, { status: 500 })
  }
}
