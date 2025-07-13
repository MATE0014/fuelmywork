import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const { paymentId, isVerified, creatorUsername } = await request.json()

    console.log("=== VERIFY PAYMENT DEBUG ===")
    console.log("Verifying payment:", { paymentId, isVerified, creatorUsername })

    if (!paymentId || typeof isVerified !== "boolean" || !creatorUsername) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const supportersCollection = db.collection("supporters")

    // Convert paymentId to ObjectId
    let objectId
    try {
      objectId = new ObjectId(paymentId)
    } catch (error) {
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 })
    }

    if (isVerified) {
      // Mark payment as verified
      const result = await supportersCollection.updateOne(
        {
          _id: objectId,
          creatorUsername: creatorUsername.toLowerCase().trim(),
          verified: false,
        },
        {
          $set: {
            verified: true,
            verifiedAt: new Date(),
          },
        },
      )

      console.log("Verification result:", result)

      if (result.matchedCount === 0) {
        return NextResponse.json({ error: "Payment not found or already verified" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      })
    } else {
      // Delete the payment (mark as invalid/rejected)
      const result = await supportersCollection.deleteOne({
        _id: objectId,
        creatorUsername: creatorUsername.toLowerCase().trim(),
        verified: false,
      })

      console.log("Deletion result:", result)

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        message: "Payment rejected and removed",
      })
    }
  } catch (error) {
    console.error("=== VERIFY PAYMENT ERROR ===")
    console.error("Error verifying payment:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
