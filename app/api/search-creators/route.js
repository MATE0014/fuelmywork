import clientPromise from "@/lib/mongodb"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get("q") || ""

  try {
    if (!query.trim()) {
      return new Response(JSON.stringify({ creators: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork") // explicitly pick your db

    const regex = { $regex: query.trim(), $options: "i" }

    // Search GitHub users collection
    const githubUsers = await db
      .collection("users") // assuming this is GitHub’s collection
      .find({
        $or: [{ name: regex }, { username: regex }],
      })
      .project({
        name: 1,
        username: 1,
        profileImage: 1,
        bio: 1,
        _id: 0,
      })
      .limit(10)
      .toArray()

    // Search Email users collection
    const emailUsers = await db
      .collection("emailUsers") // <-- replace with actual collection name
      .find({
        $or: [{ name: regex }, { username: regex }],
      })
      .project({
        name: 1,
        username: 1,
        profileImage: 1,
        bio: 1,
        _id: 0,
      })
      .limit(10)
      .toArray()

    // Merge results and avoid duplicates
    const merged = [...githubUsers, ...emailUsers]

    return new Response(JSON.stringify({ creators: merged }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error searching creators:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
