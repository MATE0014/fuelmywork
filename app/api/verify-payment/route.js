import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request) {
  try {
    const data = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      creatorUsername,
      supporterName,
      message,
      amount,
    } = data

    console.log("=== PAYMENT VERIFICATION DEBUG ===")
    console.log("Verifying payment:", {
      razorpay_order_id,
      razorpay_payment_id,
      creatorUsername,
      supporterName,
      amount,
    })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment verification data" }, { status: 400 })
    }

    // Get creator's Razorpay secret for verification
    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")

    const creator = await usersCollection.findOne({
      username: creatorUsername.toLowerCase().trim(),
    })

    if (!creator || !creator.razorpaySecret) {
      return NextResponse.json({ error: "Creator not found or Razorpay not configured" }, { status: 400 })
    }

    // Decrypt the Razorpay secret
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

    const razorpaySecret = decrypt(creator.razorpaySecret)

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac("sha256", razorpaySecret).update(body.toString()).digest("hex")

    const isSignatureValid = expectedSignature === razorpay_signature

    console.log("Payment verification result:", isSignatureValid)

    if (isSignatureValid) {
      // Save supporter to database
      const supportersCollection = db.collection("supporters")

      const supporterData = {
        creatorUsername: creatorUsername.toLowerCase().trim(),
        name: supporterName?.trim() || "Anonymous",
        amount: Number.parseFloat(amount) || 0,
        message: message?.trim() || "",
        paymentMethod: "razorpay",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        createdAt: new Date(),
        verified: true,
      }

      console.log("Saving supporter data:", supporterData)

      const supporterResult = await supportersCollection.insertOne(supporterData)

      console.log("Supporter save result:", {
        acknowledged: supporterResult.acknowledged,
        insertedId: supporterResult.insertedId,
      })

      return NextResponse.json({
        success: true,
        message: "Payment verified and supporter recorded successfully",
        supporterId: supporterResult.insertedId,
      })
    } else {
      console.log("Payment signature verification failed")
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("=== PAYMENT VERIFICATION ERROR ===")
    console.error("Error verifying payment:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Payment verification failed: " + error.message }, { status: 500 })
  }
}
