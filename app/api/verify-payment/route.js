import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import crypto from "crypto"

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      creatorUsername,
      supporterName,
      message,
      amount,
    } = await request.json()

    console.log("=== VERIFY PAYMENT DEBUG ===")
    console.log("Verifying payment for order:", razorpay_order_id)
    console.log("Creator:", creatorUsername)

    const client = await clientPromise
    // Explicitly connect to the 'fuelmywork' database for creator profiles
    const db = client.db("fuelmywork")
    const creatorProfilesCollection = db.collection("users") // Using 'users' collection for creator profiles

    console.log("Fetching creator's Razorpay secret from fuelmywork.users...")
    const creator = await creatorProfilesCollection.findOne({
      username: creatorUsername.toLowerCase().trim(),
    })

    if (!creator || !creator.razorpaySecret) {
      console.log("Creator not found or Razorpay secret missing.")
      return NextResponse.json({ error: "Creator not found or payment setup incomplete" }, { status: 400 })
    }

    const razorpaySecret = decrypt(creator.razorpaySecret)
    console.log("Razorpay Secret (decrypted):", razorpaySecret ? "***" : "NOT FOUND")

    if (!razorpaySecret) {
      console.error("Failed to decrypt Razorpay secret for verification.")
      return NextResponse.json({ error: "Failed to retrieve creator's payment secret" }, { status: 500 })
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", razorpaySecret).update(body.toString()).digest("hex")

    console.log("Comparing signatures...")
    if (expectedSignature !== razorpay_signature) {
      console.log("Signature mismatch!")
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }
    console.log("Signature matched.")

    const supportersCollection = db.collection("supporters") // This collection should also be in 'fuelmywork'
    console.log("Saving supporter record to fuelmywork.supporters...")
    await supportersCollection.insertOne({
      creatorUsername: creatorUsername.toLowerCase().trim(),
      name: supporterName,
      message: message || "",
      amount: amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      createdAt: new Date(),
    })
    console.log("Supporter record saved.")

    console.log("=== END VERIFY PAYMENT DEBUG ===")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("=== VERIFY PAYMENT ERROR ===")
    console.error("Error verifying payment:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}
