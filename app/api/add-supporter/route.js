import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
  try {
    console.log("[v0] Add-supporter API called")
    const { creatorUsername, supporterName, amount, message, paymentId, paymentMethod } = await req.json()
    console.log("[v0] Payment data received:", { creatorUsername, supporterName, amount, paymentMethod, paymentId })

    if (!creatorUsername || !supporterName || !amount) {
      return new Response(JSON.stringify({ message: "Creator username, supporter name, and amount are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")
    const paymentsCollection = db.collection("payments")

    const creator = await usersCollection.findOne({ username: creatorUsername })
    if (!creator) {
      return new Response(JSON.stringify({ message: "Creator not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    console.log("[v0] Creator found:", creator._id)

    const tempSupporterId = new ObjectId()

    const paymentRecord = {
      creatorId: creator._id,
      supporterId: tempSupporterId,
      supporterName: supporterName.trim(), // Store supporter name for display
      amount: Number.parseFloat(amount),
      message: message || "",
      currency: "INR", // Changed from USD to INR for Indian payments
      status: paymentMethod === "direct" ? "pending" : "completed",
      paymentMethod: paymentMethod || "direct",
      transactionId: paymentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await paymentsCollection.insertOne(paymentRecord)
    console.log("[v0] Payment record created:", result.insertedId)
    console.log("[v0] Payment record data:", paymentRecord)

    return new Response(
      JSON.stringify({ message: "Supporter record added successfully", paymentId: result.insertedId, success: true }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error adding supporter record:", error)
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
