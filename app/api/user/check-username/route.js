import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const userId = searchParams.get("userId")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const users = db.collection("users")

    const existingUser = await users.findOne({
      username: username.toLowerCase().trim(),
      ...(userId && { userId: { $ne: userId } }),
    })

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? "Username is already taken" : "Username is available",
    })
  } catch (error) {
    console.error("Error checking username:", error)
    return NextResponse.json({ error: "Failed to check username" }, { status: 500 })
  }
}
