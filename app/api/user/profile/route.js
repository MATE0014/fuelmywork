import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"
import crypto from "crypto"

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const ALGORITHM = "aes-256-cbc"

if (!ENCRYPTION_KEY) {
  console.error("ENCRYPTION_KEY environment variable is not set!")
}

function encrypt(text) {
  if (!text || !ENCRYPTION_KEY) return text
  try {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
    let encrypted = cipher.update(text, "utf8", "hex")
    encrypted += cipher.final("hex")
    return iv.toString("hex") + ":" + encrypted
  } catch (error) {
    console.error("Encryption error:", error)
    return text
  }
}

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

// GET - Fetch user profile
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    console.log("=== PROFILE GET DEBUG (fuelmywork.users) ===")
    console.log("Fetching profile for userId:", userId)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const client = await clientPromise
    // Explicitly connect to the 'fuelmywork' database for creator profiles
    const db = client.db("fuelmywork")
    const creatorProfilesCollection = db.collection("users") // Using 'users' collection as per your clarification

    console.log("Connected to database: fuelmywork")
    console.log("Collection for creator profiles: users")

    const profile = await creatorProfilesCollection.findOne({ userId: userId })
    console.log("Found profile for userId in fuelmywork.users:", profile ? "Yes" : "No")

    if (!profile) {
      console.log("No profile found in fuelmywork.users, returning empty profile")
      return NextResponse.json({
        username: "",
        name: "",
        email: "",
        bio: "",
        profileImage: "",
        bannerImage: "",
        razorpayId: "",
        razorpaySecret: "",
      })
    }

    const profileData = {
      username: profile.username || "",
      name: profile.name || "",
      email: profile.email || "",
      bio: profile.bio || "",
      profileImage: profile.profileImage || "",
      bannerImage: profile.bannerImage || "",
      razorpayId: profile.razorpayId || "",
      razorpaySecret: profile.razorpaySecret ? decrypt(profile.razorpaySecret) : "",
    }

    console.log("Returning profile data:", { ...profileData, razorpaySecret: profileData.razorpaySecret ? "***" : "" })
    console.log("=== END PROFILE GET DEBUG ===")

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("=== PROFILE GET ERROR (fuelmywork.users) ===")
    console.error("Error fetching profile:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to fetch profile: " + error.message }, { status: 500 })
  }
}

// POST - Save user profile
export async function POST(request) {
  try {
    const data = await request.json()
    const { userId, username, name, email, bio, profileImage, bannerImage, razorpayId, razorpaySecret } = data

    console.log("=== PROFILE SAVE DEBUG (fuelmywork.users) ===")
    console.log("Saving profile for userId:", userId)
    console.log("Username:", username)

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!username || !username.trim()) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username.trim())) {
      return NextResponse.json(
        {
          error: "Username can only contain letters, numbers, hyphens, and underscores",
        },
        { status: 400 },
      )
    }

    const client = await clientPromise
    // Explicitly connect to the 'fuelmywork' database for creator profiles
    const db = client.db("fuelmywork")
    const creatorProfilesCollection = db.collection("users") // Using 'users' collection as per your clarification

    console.log("Connected to database: fuelmywork")
    console.log("Collection for creator profiles: users")

    const existingProfile = await creatorProfilesCollection.findOne({
      username: username.toLowerCase().trim(),
      userId: { $ne: userId },
    })

    if (existingProfile) {
      console.log("Username already taken by another user in fuelmywork.users")
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
    }

    const profileData = {
      userId, // This links to the NextAuth user ID from the 'test' database
      username: username.toLowerCase().trim(),
      name: name?.trim() || "",
      email: email?.trim() || "",
      bio: bio?.trim() || "",
      profileImage: profileImage || "",
      bannerImage: bannerImage || "",
      razorpayId: razorpayId?.trim() || "",
      razorpaySecret: razorpaySecret?.trim() ? encrypt(razorpaySecret.trim()) : "",
      updatedAt: new Date(),
    }

    console.log("Profile data to save to fuelmywork.users:", {
      ...profileData,
      razorpaySecret: profileData.razorpaySecret ? "***encrypted***" : "",
    })

    const result = await creatorProfilesCollection.updateOne(
      { userId: userId },
      {
        $set: profileData,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    )

    console.log("MongoDB operation result (fuelmywork.users):", {
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount,
      upsertedId: result.upsertedId,
    })

    const savedProfile = await creatorProfilesCollection.findOne({ userId: userId })
    console.log("Verification - Profile saved successfully in fuelmywork.users:", !!savedProfile)
    if (savedProfile) {
      console.log("Saved profile username:", savedProfile.username)
    }

    const totalProfilesAfter = await creatorProfilesCollection.countDocuments()
    console.log("Total profiles in fuelmywork.users after save:", totalProfilesAfter)

    console.log("=== END PROFILE SAVE DEBUG ===")

    return NextResponse.json({
      success: true,
      message: result.upsertedCount > 0 ? "Profile created successfully" : "Profile updated successfully",
      isNewProfile: result.upsertedCount > 0,
      wasModified: result.modifiedCount > 0,
      debug: {
        totalProfilesAfter,
        profileExists: !!savedProfile,
        savedUsername: savedProfile?.username,
      },
    })
  } catch (error) {
    console.error("=== PROFILE SAVE ERROR (fuelmywork.users) ===")
    console.error("Error saving profile:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to save profile: " + error.message }, { status: 500 })
  }
}
