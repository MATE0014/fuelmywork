import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")

    const user = await usersCollection.findOne({ _id: new ObjectId(session.user.id) })

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { password, ...userWithoutPassword } = user
    const responseUser = {
      ...userWithoutPassword,
      authProvider: password ? "credentials" : "github",
    }

    return new Response(JSON.stringify(responseUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const body = await req.json()

    const { name, username, bio, profileImage, bannerImage, upiId, qrCodeImage, razorpayId, razorpaySecret } = body

    // Validate required fields
    if (!username || username.trim().length === 0) {
      return new Response(JSON.stringify({ message: "Username is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username.trim())) {
      return new Response(
        JSON.stringify({
          message: "Username can only contain letters, numbers, hyphens, and underscores",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Validate username length
    if (username.trim().length < 3 || username.trim().length > 30) {
      return new Response(
        JSON.stringify({
          message: "Username must be between 3 and 30 characters",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")

    // Check if username is already taken by another user
    const existingUser = await usersCollection.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
      _id: { $ne: new ObjectId(session.user.id) },
    })

    if (existingUser) {
      return new Response(JSON.stringify({ message: "Username is already taken" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Validate image URLs if provided
    const validateImageUrl = (url, fieldName, maxSizeMB = 5) => {
      if (!url) return null

      if (typeof url !== "string") {
        throw new Error(`${fieldName} must be a valid URL string`)
      }

      // Allow data URLs (base64) and regular URLs
      if (url.startsWith("data:image/") || url.startsWith("http://") || url.startsWith("https://")) {
        // For data URLs, check approximate size (base64 is ~33% larger than binary)
        if (url.startsWith("data:image/")) {
          const sizeInBytes = (url.length * 3) / 4
          const sizeInMB = sizeInBytes / (1024 * 1024)
          if (sizeInMB > maxSizeMB) {
            throw new Error(`${fieldName} is too large. Maximum size is ${maxSizeMB}MB`)
          }
        }
        return url.trim()
      }

      throw new Error(`${fieldName} must be a valid image URL`)
    }

    // Prepare update data
    const updateData = {
      name: name?.trim() || null,
      username: username.trim().toLowerCase(), // Store username in lowercase for consistency
      bio: bio?.trim() || null,
      profileImage: validateImageUrl(profileImage, "Profile image"),
      bannerImage: validateImageUrl(bannerImage, "Banner image"),
      upiId: upiId?.trim() || null,
      qrCodeImage: validateImageUrl(qrCodeImage, "QR code image"),
      razorpayId: razorpayId?.trim() || null,
      razorpaySecret: razorpaySecret?.trim() || null,
      updatedAt: new Date(),
    }

    // Remove null values to avoid overwriting existing data with null
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === null || updateData[key] === "") {
        delete updateData[key]
      }
    })

    const result = await usersCollection.updateOne({ _id: new ObjectId(session.user.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Fetch and return updated user data
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { password: 0 } },
    )

    return new Response(
      JSON.stringify({
        message: "Profile updated successfully",
        user: updatedUser,
        modifiedCount: result.modifiedCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Error updating user profile:", error)
    return new Response(
      JSON.stringify({
        message: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
