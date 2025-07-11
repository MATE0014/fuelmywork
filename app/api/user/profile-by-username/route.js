import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const ALGORITHM = "aes-256-cbc"

function decrypt(text) {
  if (!text || !ENCRYPTION_KEY) return text
  try {
    const textParts = text.split(":")
    if (textParts.length !== 2) return text

    const iv = Buffer.from(textParts.shift(), "hex")
    const encryptedText = textParts.join(":")
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    let decrypted = decipher.update(encryptedText, "hex", "utf8")
    decrypted += decipher.final("utf8")
    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    return text
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    console.log("=== PROFILE BY USERNAME DEBUG (fuelmywork.users) ===")
    console.log("1. Raw username from URL:", username)

    if (!username) {
      console.log("ERROR: No username provided")
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const cleanUsername = username.toLowerCase().trim()
    console.log("2. Cleaned username for search:", cleanUsername)

    const client = await clientPromise
    // Explicitly connect to the 'fuelmywork' database for creator profiles
    const db = client.db("fuelmywork")
    const creatorProfilesCollection = db.collection("users") // Using 'users' collection as per your clarification

    console.log("3. Connected to database: fuelmywork")
    console.log("4. Searching in collection: users")

    const profile = await creatorProfilesCollection.findOne({
      username: cleanUsername,
    })

    console.log("5. Search result:", profile ? "FOUND" : "NOT FOUND")

    if (profile) {
      console.log("6. Found profile details:", {
        id: profile._id,
        username: profile.username,
        name: profile.name,
        userId: profile.userId,
        hasRazorpayId: !!profile.razorpayId,
      })
    } else {
      console.log("6. Profile not found. Checking similar usernames...")
      const similarProfiles = await creatorProfilesCollection
        .find({
          username: { $regex: username, $options: "i" },
        })
        .toArray()
      console.log(
        "7. Similar usernames found:",
        similarProfiles.map((p) => p.username),
      )
    }

    if (!profile) {
      console.log("FINAL: Returning 404 - User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const publicProfile = {
      username: profile.username,
      name: profile.name || "",
      bio: profile.bio || "",
      profileImage: profile.profileImage || "",
      bannerImage: profile.bannerImage || "",
      razorpayId: profile.razorpayId || "",
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }

    console.log("FINAL: Returning profile data successfully")
    console.log("=== END PROFILE BY USERNAME DEBUG ===")

    return NextResponse.json(publicProfile)
  } catch (error) {
    console.error("=== PROFILE BY USERNAME ERROR (fuelmywork.users) ===")
    console.error("Error fetching profile by username:", error)
    console.error("Stack trace:", error.stack)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
