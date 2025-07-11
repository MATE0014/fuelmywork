import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    console.log("=== SEARCH CREATORS DEBUG (fuelmywork.users) ===")
    console.log("1. Search query:", query)

    if (!query || query.trim().length < 2) {
      console.log("2. Query too short, returning empty results")
      return NextResponse.json({ creators: [] })
    }

    const client = await clientPromise
    // Explicitly connect to the 'fuelmywork' database for creator profiles
    const db = client.db("fuelmywork")
    const creatorProfilesCollection = db.collection("users") // Using 'users' collection as per your clarification

    const cleanQuery = query.trim()
    console.log("3. Clean query:", cleanQuery)

    const totalProfiles = await creatorProfilesCollection.countDocuments()
    console.log("4. Total profiles in fuelmywork.users:", totalProfiles)

    const searchCriteria = {
      $or: [{ username: { $regex: cleanQuery, $options: "i" } }, { name: { $regex: cleanQuery, $options: "i" } }],
    }

    console.log("5. Search criteria:", JSON.stringify(searchCriteria, null, 2))

    const creators = await creatorProfilesCollection
      .find(searchCriteria)
      .limit(10)
      .project({
        username: 1,
        name: 1,
        profileImage: 1,
        bio: 1,
      })
      .toArray()

    console.log("6. Search results count:", creators.length)
    console.log(
      "7. Found creators:",
      creators.map((c) => ({
        username: c.username,
        name: c.name,
      })),
    )
    console.log("=== END SEARCH CREATORS DEBUG ===")

    return NextResponse.json({ creators })
  } catch (error) {
    console.error("=== SEARCH CREATORS ERROR (fuelmywork.users) ===")
    console.error("Error searching creators:", error)
    console.error("Stack trace:", error.stack)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
