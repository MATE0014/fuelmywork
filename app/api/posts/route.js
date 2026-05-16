import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch posts (community feed)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const creatorId = searchParams.get("creatorId")
    const sortBy = searchParams.get("sortBy") || "newest"

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const postsCollection = db.collection("posts")
    const usersCollection = db.collection("users")

    // Build query
    const query = {}
    if (creatorId) {
      query.creatorId = new ObjectId(creatorId)
    }

    let sortOptions = { createdAt: -1 } // Default: newest first

    switch (sortBy) {
      case "oldest":
        sortOptions = { createdAt: 1 }
        break
      case "most-liked":
        sortOptions = { likesCount: -1, createdAt: -1 }
        break
      case "most-commented":
        sortOptions = { commentsCount: -1, createdAt: -1 }
        break
      case "newest":
      default:
        sortOptions = { createdAt: -1 }
        break
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Fetch posts with creator info
    const posts = await postsCollection
      .aggregate([
        { $match: query },
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  profileImage: 1,
                  _id: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$creator",
        },
      ])
      .toArray()

    // Get total count for pagination
    const totalPosts = await postsCollection.countDocuments(query)
    const totalPages = Math.ceil(totalPosts / limit)

    return new Response(
      JSON.stringify({
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error fetching posts:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// POST - Create a new post
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await req.json()
    const { content, image } = body

    // Validate content
    if (!content || content.trim().length === 0) {
      return new Response(JSON.stringify({ message: "Post content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (content.trim().length > 2000) {
      return new Response(JSON.stringify({ message: "Post content must be less than 2000 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const postsCollection = db.collection("posts")

    // Create post object
    const newPost = {
      creatorId: new ObjectId(session.user.id),
      content: content.trim(),
      image: image || null,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await postsCollection.insertOne(newPost)

    // Fetch the created post with creator info
    const createdPost = await postsCollection
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: "users",
            localField: "creatorId",
            foreignField: "_id",
            as: "creator",
            pipeline: [
              {
                $project: {
                  name: 1,
                  username: 1,
                  profileImage: 1,
                  _id: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$creator",
        },
      ])
      .toArray()

    return new Response(
      JSON.stringify({
        message: "Post created successfully",
        post: createdPost[0],
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error creating post:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
