import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req) {
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

    const pendingPayments = await paymentsCollection
      .find(
        { creatorId: new ObjectId(session.user.id), status: "pending" },
        {
          projection: {
            amount: 1,
            supporterName: 1,
            message: 1,
            createdAt: 1,
            transactionId: 1,
            paymentMethod: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray()

    const paymentsWithNames = pendingPayments.map((p) => ({
      _id: p._id,
      amount: p.amount,
      supporterName: p.supporterName || "Anonymous",
      message: p.message || "",
      createdAt: p.createdAt,
      transactionId: p.transactionId,
      paymentMethod: p.paymentMethod || "direct",
    }))

    return new Response(JSON.stringify(paymentsWithNames), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching pending payments:", error)
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
