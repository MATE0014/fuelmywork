import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    console.log("=== SUPPORTERS GET DEBUG ===")
    console.log("Fetching supporters for creatorUsername:", username)

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const supportersCollection = db.collection("supporters")

    console.log("Connected to database: fuelmywork")
    console.log("Collection: supporters")

    const supportersList = await supportersCollection
      .find({ creatorUsername: username.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    console.log("Found supporters count:", supportersList.length)
    console.log("Sample supporters:", supportersList.slice(0, 2))

    // Format the supporters data
    const formattedSupporters = supportersList.map((supporter) => ({
      name: supporter.name,
      amount: supporter.amount,
      message: supporter.message || "",
      paymentMethod: supporter.paymentMethod || "unknown",
      verified: supporter.verified || false,
      createdAt: supporter.createdAt,
    }))

    console.log("=== END SUPPORTERS GET DEBUG ===")

    return NextResponse.json({ supporters: formattedSupporters })
  } catch (error) {
    console.error("=== SUPPORTERS GET ERROR ===")
    console.error("Error fetching supporters:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to fetch supporters" }, { status: 500 })
  }
}
