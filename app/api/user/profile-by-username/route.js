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

    console.log("=== PROFILE BY USERNAME DEBUG ===")
    console.log("Looking for username:", username)

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const creatorProfilesCollection = db.collection("users")

    console.log("Connected to database: fuelmywork")
    console.log("Collection: users")

    const profile = await creatorProfilesCollection.findOne({
      username: username.toLowerCase().trim(),
    })

    console.log("Found profile:", profile ? "Yes" : "No")

    if (!profile) {
      console.log("No profile found for username:", username)
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    const profileData = {
      username: profile.username || "",
      name: profile.name || "",
      email: profile.email || "",
      bio: profile.bio || "",
      profileImage: profile.profileImage || "",
      bannerImage: profile.bannerImage || "",
      razorpayId: profile.razorpayId || "",
      qrCodeImage: profile.qrCodeImage || "",
      upiId: profile.upiId || "",
      // Don't return the secret key for security
      hasRazorpaySetup: !!(profile.razorpayId && profile.razorpaySecret),
      hasPersonalPayment: !!(profile.qrCodeImage || profile.upiId),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }

    console.log("Returning profile data for:", username)
    console.log("Has Razorpay setup:", profileData.hasRazorpaySetup)
    console.log("Has personal payment:", profileData.hasPersonalPayment)
    console.log("=== END PROFILE BY USERNAME DEBUG ===")

    return NextResponse.json(profileData)
  } catch (error) {
    console.error("=== PROFILE BY USERNAME ERROR ===")
    console.error("Error fetching profile:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to fetch profile: " + error.message }, { status: 500 })
  }
}
