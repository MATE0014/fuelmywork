import Razorpay from "razorpay"
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function POST(req) {
  try {
    // Initialize Razorpay inside the function to avoid build-time issues
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      currency,
      creatorId,
      supporterId,
      message,
    } = await req.json()

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      return NextResponse.json(
        { message: "Payment verification failed: Invalid signature" }, 
        { status: 400 }
      )
    }

    // If signature is authentic, save payment details to your database
    const client = await clientPromise
    const db = client.db("fuelmywork")
    const paymentsCollection = db.collection("payments")

    const paymentData = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount: amount / 100, // Convert back to original currency unit
      currency,
      creatorId: new ObjectId(creatorId),
      supporterId: new ObjectId(supporterId),
      message,
      status: "pending", // Changed status to pending for manual verification by creators
      createdAt: new Date(),
    }

    await paymentsCollection.insertOne(paymentData)

    return NextResponse.json(
      { message: "Payment verified and recorded successfully" }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
