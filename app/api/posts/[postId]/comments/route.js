import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch comments for a post
export async function GET(req, { params }) {
  try {
    const { postId } = params
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 20

    if (!ObjectId.isValid(postId)) {
      return new Response(JSON.stringify({ message: "Invalid post ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const commentsCollection = db.collection("comments")

    const skip = (page - 1) * limit

    // Fetch comments with user info
    const comments = await commentsCollection
      .aggregate([
        { $match: { postId: new ObjectId(postId) } },
        { $sort: { createdAt: 1 } }, // Oldest first for comments
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
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
          $unwind: "$user",
        },
      ])
      .toArray()

    // Get total count for pagination
    const totalComments = await commentsCollection.countDocuments({ postId: new ObjectId(postId) })
    const totalPages = Math.ceil(totalComments / limit)

    return new Response(
      JSON.stringify({
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalComments,
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
    console.error("Error fetching comments:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// POST - Add a comment to a post
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { postId } = params
    const body = await req.json()
    const { content } = body

    if (!ObjectId.isValid(postId)) {
      return new Response(JSON.stringify({ message: "Invalid post ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return new Response(JSON.stringify({ message: "Comment content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (content.trim().length > 500) {
      return new Response(JSON.stringify({ message: "Comment must be less than 500 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const postsCollection = db.collection("posts")
    const commentsCollection = db.collection("comments")

    // Check if post exists
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) })
    if (!post) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create comment
    const newComment = {
      postId: new ObjectId(postId),
      userId: new ObjectId(session.user.id),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await commentsCollection.insertOne(newComment)

    // Update post comments count
    const commentsCount = (post.commentsCount || 0) + 1
    await postsCollection.updateOne({ _id: new ObjectId(postId) }, { $set: { commentsCount } })

    // Fetch the created comment with user info
    const createdComment = await commentsCollection
      .aggregate([
        { $match: { _id: result.insertedId } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
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
          $unwind: "$user",
        },
      ])
      .toArray()

    return new Response(
      JSON.stringify({
        message: "Comment added successfully",
        comment: createdComment[0],
        commentsCount,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error adding comment:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
