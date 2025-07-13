import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    console.log("=== CREATOR STATS DEBUG ===")
    console.log("Fetching stats for creator:", username)

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const supportersCollection = db.collection("supporters")

    const cleanUsername = username.toLowerCase().trim()
    console.log("Clean username:", cleanUsername)

    // Get all supporters for this creator
    const allSupporters = await supportersCollection.find({ creatorUsername: cleanUsername }).toArray()

    console.log("Total supporters found:", allSupporters.length)
    console.log(
      "Sample supporters:",
      allSupporters.slice(0, 3).map((s) => ({
        name: s.name,
        amount: s.amount,
        verified: s.verified,
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt,
      })),
    )

    // Calculate stats
    const verifiedSupporters = allSupporters.filter((s) => s.verified === true)
    const pendingSupporters = allSupporters.filter((s) => s.verified === false)

    console.log("Verified supporters:", verifiedSupporters.length)
    console.log("Pending supporters:", pendingSupporters.length)

    const totalSupporters = verifiedSupporters.length
    const totalEarned = verifiedSupporters.reduce((sum, s) => sum + (s.amount || 0), 0)
    const pendingVerification = pendingSupporters.length

    // Calculate this month's earnings
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthSupporters = verifiedSupporters.filter((s) => new Date(s.createdAt) >= startOfMonth)
    const thisMonth = thisMonthSupporters.reduce((sum, s) => sum + (s.amount || 0), 0)

    const stats = {
      totalSupporters,
      totalEarned,
      thisMonth,
      pendingVerification,
    }

    console.log("Calculated stats:", stats)
    console.log("=== END CREATOR STATS DEBUG ===")

    return NextResponse.json(stats)
  } catch (error) {
    console.error("=== CREATOR STATS ERROR ===")
    console.error("Error fetching creator stats:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
