import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.id) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const client = await clientPromise
    const db = client.db("fuelmywork")
    const paymentsCollection = db.collection("payments")

    const requestBody = await req.json()

    const { paymentId, status } = requestBody

    if (!paymentId || !status) {
      console.log("[v0] Missing required fields - paymentId:", paymentId, "status:", status)
      return new Response(JSON.stringify({ message: "Payment ID and status are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const paymentObjectId = new ObjectId(paymentId)
    const creatorObjectId = new ObjectId(session.user.id)

    // Find the payment and ensure it belongs to the current creator
    const payment = await paymentsCollection.findOne({
      _id: paymentObjectId,
      creatorId: creatorObjectId,
    })

    if (!payment) {
      return new Response(JSON.stringify({ message: "Payment not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Update the payment status
    const result = await paymentsCollection.updateOne(
      { _id: paymentObjectId },
      { $set: { status: status, updatedAt: new Date() } },
    )

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Payment not updated" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ message: `Payment status updated to ${status}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error verifying/updating creator payment:", error)
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
