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

  if (!ObjectId.isValid(session.user.id)) {
    return new Response(JSON.stringify({ message: "Invalid user ID format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const client = await clientPromise
    const db = client.db("fuelmywork")
    const paymentsCollection = db.collection("payments")

    const creatorId = new ObjectId(session.user.id)

    // Get current month start and end dates
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Monthly earnings
    const monthlyEarningsResult = await paymentsCollection
      .aggregate([
        {
          $match: {
            creatorId: creatorId,
            status: "completed",
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray()
    const monthlyEarnings = monthlyEarningsResult.length > 0 ? monthlyEarningsResult[0].total : 0

    // Total earnings
    const totalEarningsResult = await paymentsCollection
      .aggregate([
        { $match: { creatorId: creatorId, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray()
    const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].total : 0

    // Total supporters (unique supporters)
    const totalSupportersResult = await paymentsCollection
      .aggregate([
        { $match: { creatorId: creatorId, status: "completed" } },
        { $group: { _id: "$supporterId" } },
        { $count: "count" },
      ])
      .toArray()
    const totalSupporters = totalSupportersResult.length > 0 ? totalSupportersResult[0].count : 0

    // Latest payments
    const latestPayments = await paymentsCollection
      .find(
        { creatorId: creatorId, status: "completed" },
        { projection: { amount: 1, supporterId: 1, message: 1, createdAt: 1 } },
      )
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    // Fetch supporter names for latest payments
    const supporterIds = [...new Set(latestPayments.map((p) => p.supporterId.toString()))].map((id) => new ObjectId(id))
    const usersCollection = db.collection("users")
    const supportersMap = new Map()
    if (supporterIds.length > 0) {
      const supporters = await usersCollection
        .find({ _id: { $in: supporterIds } }, { projection: { name: 1, username: 1 } })
        .toArray()
      supporters.forEach((s) => supportersMap.set(s._id.toString(), s.name || s.username || "Anonymous"))
    }

    const paymentsWithNames = latestPayments.map((p) => ({
      ...p,
      supporterName: supportersMap.get(p.supporterId.toString()) || "Anonymous",
    }))

    return new Response(
      JSON.stringify({
        totalEarnings,
        monthlyEarnings,
        totalSupporters,
        latestPayments: paymentsWithNames,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error fetching creator stats:", error)
    return new Response(JSON.stringify({ message: "Internal server error", error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
