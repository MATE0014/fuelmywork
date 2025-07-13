import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const data = await request.json()
    const { creatorUsername, supporterName, amount, message, paymentMethod, paymentId } = data

    console.log("=== ADD SUPPORTER DEBUG ===")
    console.log("Adding supporter:", { creatorUsername, supporterName, amount, paymentMethod, paymentId })

    if (!creatorUsername || !supporterName || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (Number.parseFloat(amount) < 1) {
      return NextResponse.json({ error: "Amount must be at least ₹1" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("fuelmywork")
    const supportersCollection = db.collection("supporters")

    const supporterData = {
      creatorUsername: creatorUsername.toLowerCase().trim(),
      name: supporterName.trim(),
      amount: Number.parseFloat(amount),
      message: message?.trim() || "",
      paymentMethod: paymentMethod || "direct",
      paymentId: paymentId?.trim() || "",
      createdAt: new Date(),
      verified: paymentMethod === "direct" ? false : true, // Direct payments are unverified
    }

    console.log("Supporter data to save:", supporterData)

    const result = await supportersCollection.insertOne(supporterData)

    console.log("MongoDB insert result:", {
      acknowledged: result.acknowledged,
      insertedId: result.insertedId,
    })

    if (result.acknowledged) {
      console.log("Supporter added successfully")
      return NextResponse.json({
        success: true,
        message: "Supporter added successfully",
        supporterId: result.insertedId,
      })
    } else {
      throw new Error("Failed to insert supporter")
    }
  } catch (error) {
    console.error("=== ADD SUPPORTER ERROR ===")
    console.error("Error adding supporter:", error)
    console.error("Stack:", error.stack)
    return NextResponse.json({ error: "Failed to add supporter: " + error.message }, { status: 500 })
  }
}
