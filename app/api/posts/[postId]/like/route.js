import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// POST - Like/Unlike a post
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Await params before destructuring
    const { postId } = await params

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

    // Check if post exists
    const post = await postsCollection.findOne({ _id: new ObjectId(postId) })
    if (!post) {
      return new Response(JSON.stringify({ message: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const userId = new ObjectId(session.user.id)
    const postObjectId = new ObjectId(postId)

    // Check if user already liked the post
    const existingLike = await likesCollection.findOne({
      postId: postObjectId,
      userId: userId,
    })

    let isLiked = false
    let likesCount = post.likesCount || 0

    if (existingLike) {
      // Unlike the post
      await likesCollection.deleteOne({ _id: existingLike._id })
      likesCount = Math.max(0, likesCount - 1)
      isLiked = false
    } else {
      // Like the post
      await likesCollection.insertOne({
        postId: postObjectId,
        userId: userId,
        createdAt: new Date(),
      })
      likesCount = likesCount + 1
      isLiked = true
    }

    // Update post likes count
    await postsCollection.updateOne({ _id: postObjectId }, { $set: { likesCount } })

    return new Response(
      JSON.stringify({
        message: isLiked ? "Post liked" : "Post unliked",
        isLiked,
        likesCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error toggling like:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
