import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")
    const userId = searchParams.get("userId")

    if (!username) {
      return new Response(JSON.stringify({ message: "Username is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      return new Response(
        JSON.stringify({
          available: false,
          message: "Username can only contain letters, numbers, hyphens, and underscores",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Validate username length
    if (username.length < 3 || username.length > 30) {
      return new Response(
        JSON.stringify({
          available: false,
          message: "Username must be between 3 and 30 characters",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")

    // Build query to exclude current user if userId is provided
    const query = {
      username: { $regex: new RegExp(`^${username}$`, "i") },
    }

    if (userId) {
      // Validate ObjectId format before using it
      if (ObjectId.isValid(userId)) {
        query._id = { $ne: new ObjectId(userId) }
      } else {
        return new Response(
          JSON.stringify({
            available: false,
            message: "Invalid userId format",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    const existingUser = await usersCollection.findOne(query)
    const available = !existingUser

    return new Response(
      JSON.stringify({
        available,
        message: available ? "Username is available" : "Username is already taken",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Username availability error:", error)
    return new Response(
      JSON.stringify({
        available: false,
        message: "Error checking username availability",
      }),
      {
        status: 500,
      headers: { "Content-Type": "application/json" },
      },
    )
  }
}
