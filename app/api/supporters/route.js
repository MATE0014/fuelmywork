import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")
  const creatorId = searchParams.get("creatorId")

  if (!username && !creatorId) {
    return new Response(JSON.stringify({ message: "Username or Creator ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const client = await clientPromise
    const db = client.db("fuelmywork")
    const paymentsCollection = db.collection("payments")
    const usersCollection = db.collection("users")

    let creatorObjectId

    if (username) {
      const creator = await usersCollection.findOne({ username })
      if (!creator) {
        return new Response(JSON.stringify({ supporters: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }
      creatorObjectId = creator._id
    } else {
      creatorObjectId = new ObjectId(creatorId)
    }

    const payments = await paymentsCollection
      .find({
        creatorId: creatorObjectId,
        status: { $in: ["completed", "pending"] },
      })
      .sort({ createdAt: -1 })
      .toArray()

    const supporters = payments.map((payment) => ({
      name: payment.supporterName || "Anonymous",
      amount: payment.amount,
      message: payment.message || "",
      verified: payment.status === "completed",
      createdAt: payment.createdAt,
      paymentMethod: payment.paymentMethod || "unknown",
      paymentId: payment.paymentId,
    }))

    return new Response(JSON.stringify({ supporters }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching supporters:", error)
    return new Response(JSON.stringify({ supporters: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
