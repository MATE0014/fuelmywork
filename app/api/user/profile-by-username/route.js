import clientPromise from "@/lib/mongodb"

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get("username")


  if (!username) {
    return new Response(JSON.stringify({ message: "Username is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    const client = await clientPromise
    const db = client.db("fuelmywork")
    const usersCollection = db.collection("users")

    const userForPaymentCheck = await usersCollection.findOne(
      { username: { $regex: new RegExp(`^${username}$`, "i") } },
      {
        projection: {
          upiId: 1,
          razorpayId: 1,
          razorpaySecret: 1,
        },
      },
    )

    if (!userForPaymentCheck) {
      return new Response(JSON.stringify({ message: "User profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const hasRazorpaySetup = !!(
      userForPaymentCheck.razorpayId &&
      userForPaymentCheck.razorpayId.trim() !== "" &&
      userForPaymentCheck.razorpaySecret &&
      userForPaymentCheck.razorpaySecret.trim() !== ""
    )
    const hasPersonalPayment = !!(userForPaymentCheck.upiId && userForPaymentCheck.upiId.trim() !== "")

    // Search for user by username (case-insensitive) for public data
    const userProfile = await usersCollection.findOne(
      { username: { $regex: new RegExp(`^${username}$`, "i") } },
      {
        projection: {
          password: 0,
          emailVerified: 0,
          createdAt: 0,
          updatedAt: 0,
          razorpaySecret: 0, // Don't expose sensitive payment data
        },
      },
    )

    // Prepare response with payment flags
    const responseData = {
      ...userProfile,
      hasRazorpaySetup,
      hasPersonalPayment,
    }


    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error fetching user profile by username:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
