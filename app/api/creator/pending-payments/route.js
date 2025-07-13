import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    console.log("=== PENDING PAYMENTS DEBUG ===")
    console.log("Fetching pending payments for creator:", username)

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const supportersCollection = db.collection("supporters")

    const cleanUsername = username.toLowerCase().trim()
    console.log("Clean username:", cleanUsername)

    // First, let's see all supporters for this creator
    const allSupporters = await supportersCollection.find({ creatorUsername: cleanUsername }).toArray()
    console.log("All supporters for this creator:", allSupporters.length)
    console.log(
      "Sample all supporters:",
      allSupporters.slice(0, 3).map((s) => ({
        name: s.name,
        amount: s.amount,
        verified: s.verified,
        paymentMethod: s.paymentMethod,
      })),
    )

    // Get all unverified direct payments for this creator
    const pendingPayments = await supportersCollection
      .find({
        creatorUsername: cleanUsername,
        verified: false,
        paymentMethod: "direct",
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log("Found pending payments:", pendingPayments.length)
    console.log(
      "Pending payments details:",
      pendingPayments.map((p) => ({
        name: p.name,
        amount: p.amount,
        verified: p.verified,
        paymentMethod: p.paymentMethod,
        paymentId: p.paymentId,
      })),
    )

    const formattedPayments = pendingPayments.map((payment) => ({
      _id: payment._id.toString(),
      name: payment.name,
      amount: payment.amount,
      message: payment.message || "",
      paymentId: payment.paymentId || "",
      createdAt: payment.createdAt,
    }))

    console.log("=== END PENDING PAYMENTS DEBUG ===")

    return NextResponse.json({ payments: formattedPayments })
  } catch (error) {
    console.error("=== PENDING PAYMENTS ERROR ===")
    console.error("Error fetching pending payments:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to fetch pending payments" }, { status: 500 })
  }
}
