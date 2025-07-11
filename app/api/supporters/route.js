import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    console.log("=== SUPPORTERS GET DEBUG (fuelmywork.supporters) ===")
    console.log("Fetching supporters for creatorUsername:", username)

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const client = await clientPromise
    // Explicitly connect to the 'fuelmywork' database for supporters
    const db = client.db("fuelmywork")
    const supportersCollection = db.collection("supporters") // This collection should be in 'fuelmywork'

    console.log("Connected to database: fuelmywork")
    console.log("Collection for supporters: supporters")

    const supportersList = await supportersCollection
      .find({ creatorUsername: username.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    console.log("Found supporters count:", supportersList.length)
    console.log("=== END SUPPORTERS GET DEBUG ===")

    return NextResponse.json({ supporters: supportersList })
  } catch (error) {
    console.error("=== SUPPORTERS GET ERROR (fuelmywork.supporters) ===")
    console.error("Error fetching supporters:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to fetch supporters" }, { status: 500 })
  }
}
