import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectToDatabase } from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("[v0] No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(session.user.id)) {
      console.log("[v0] Invalid user ID format:", session.user.id)
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const creatorId = new ObjectId(session.user.id)

    // Fetch all payments for this creator with detailed information
    const paymentLogs = await db
      .collection("payments")
      .find({ creatorId })
      .sort({ createdAt: -1 }) // Most recent first
      .toArray()

    // Transform the data to include action descriptions
    const transformedLogs = paymentLogs.map((payment) => {
      let action = "Payment Received"
      let actionColor = "text-blue-400"

      if (payment.status === "completed") {
        action = "Payment Approved"
        actionColor = "text-green-400"
      } else if (payment.status === "rejected") {
        action = "Payment Rejected"
        actionColor = "text-red-400"
      } else if (payment.status === "pending") {
        action = "Payment Pending"
        actionColor = "text-yellow-400"
      }

      return {
        _id: payment._id,
        supporterName: payment.supporterName,
        amount: payment.amount,
        message: payment.message,
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        action,
        actionColor,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      }
    })

    return NextResponse.json({ logs: transformedLogs })
  } catch (error) {
    console.error("[v0] Payment logs API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
