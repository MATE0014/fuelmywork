import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch a single post
export async function GET(req, { params }) {
  try {
    const { postId } = params

    if (!ObjectId.isValid(postId)) {
      return new Response(JSON.stringify({ message: "Invalid post ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const postsCollection = db.collection("posts")

    const post = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
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

    if (!post.length) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ post: post[0] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching post:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// PUT - Update a post
export async function PUT(req, { params }) {
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
    const { content, image } = body

    if (!ObjectId.isValid(postId)) {
      return new Response(JSON.stringify({ message: "Invalid post ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

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

    // Check if post exists and user owns it
    const existingPost = await postsCollection.findOne({ _id: new ObjectId(postId) })
    if (!existingPost) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (existingPost.creatorId.toString() !== session.user.id) {
      return new Response(JSON.stringify({ message: "Forbidden: You can only edit your own posts" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Update post
    const updateData = {
      content: content.trim(),
      image: image || null,
      updatedAt: new Date(),
    }

    const result = await postsCollection.updateOne({ _id: new ObjectId(postId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch updated post with creator info
    const updatedPost = await postsCollection
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
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
        message: "Post updated successfully",
        post: updatedPost[0],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error updating post:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// DELETE - Delete a post
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { postId } = params

    if (!ObjectId.isValid(postId)) {
      return new Response(JSON.stringify({ message: "Invalid post ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const postsCollection = db.collection("posts")
    const likesCollection = db.collection("likes")
    const commentsCollection = db.collection("comments")

    // Check if post exists and user owns it
    const existingPost = await postsCollection.findOne({ _id: new ObjectId(postId) })
    if (!existingPost) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (existingPost.creatorId.toString() !== session.user.id) {
      return new Response(JSON.stringify({ message: "Forbidden: You can only delete your own posts" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Delete post and related data
    await Promise.all([
      postsCollection.deleteOne({ _id: new ObjectId(postId) }),
      likesCollection.deleteMany({ postId: new ObjectId(postId) }),
      commentsCollection.deleteMany({ postId: new ObjectId(postId) }),
    ])

    return new Response(JSON.stringify({ message: "Post deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error deleting post:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
