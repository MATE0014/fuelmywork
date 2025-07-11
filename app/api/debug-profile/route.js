import clientPromise from "@/lib/mongodb"
import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    const client = await clientPromise // This client is connected based on MONGODB_URI (likely 'test' DB)

    const result = {
      timestamp: new Date().toISOString(),
      searchUsername: username,
      databaseConnections: {},
    }

    // --- Debugging NextAuth Database (assuming MONGODB_URI points here, e.g., 'test') ---
    try {
      const nextAuthDb = client.db() // Get the default database from MONGODB_URI
      const nextAuthDbName = nextAuthDb.databaseName
      result.databaseConnections.nextAuth = {
        name: nextAuthDbName,
        collections: {},
      }

      const nextAuthUsersCollection = nextAuthDb.collection("users")
      const nextAuthUsersCount = await nextAuthUsersCollection.countDocuments()
      const nextAuthUsersSample = await nextAuthUsersCollection.find({}).limit(5).toArray()

      result.databaseConnections.nextAuth.collections.users = {
        count: nextAuthUsersCount,
        sample: nextAuthUsersSample.map((u) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
        })),
      }

      const nextAuthAccountsCollection = nextAuthDb.collection("accounts")
      const nextAuthAccountsCount = await nextAuthAccountsCollection.countDocuments()
      result.databaseConnections.nextAuth.collections.accounts = {
        count: nextAuthAccountsCount,
      }

      const nextAuthSessionsCollection = nextAuthDb.collection("sessions")
      const nextAuthSessionsCount = await nextAuthSessionsCollection.countDocuments()
      result.databaseConnections.nextAuth.collections.sessions = {
        count: nextAuthSessionsCount,
      }
    } catch (e) {
      result.databaseConnections.nextAuth = { error: "Could not connect to NextAuth DB: " + e.message }
    }

    // --- Debugging Fuelmywork Database (explicitly connecting to 'fuelmywork') ---
    try {
      const fuelmyworkDb = client.db("fuelmywork")
      result.databaseConnections.fuelmywork = {
        name: "fuelmywork",
        collections: {},
      }

      const fuelmyworkUsersCollection = fuelmyworkDb.collection("users") // This is where creator profiles are
      const fuelmyworkUsersCount = await fuelmyworkUsersCollection.countDocuments()
      const fuelmyworkUsersSample = await fuelmyworkUsersCollection.find({}).limit(5).toArray()

      result.databaseConnections.fuelmywork.collections.users_creator_profiles = {
        count: fuelmyworkUsersCount,
        sample: fuelmyworkUsersSample.map((p) => ({
          id: p._id.toString(),
          userId: p.userId, // This is the NextAuth user ID
          username: p.username,
          name: p.name,
          email: p.email,
        })),
      }

      const fuelmyworkSupportersCollection = fuelmyworkDb.collection("supporters")
      const fuelmyworkSupportersCount = await fuelmyworkSupportersCollection.countDocuments()
      const fuelmyworkSupportersSample = await fuelmyworkSupportersCollection.find({}).limit(5).toArray()

      result.databaseConnections.fuelmywork.collections.supporters = {
        count: fuelmyworkSupportersCount,
        sample: fuelmyworkSupportersSample.map((s) => ({
          id: s._id.toString(),
          creatorUsername: s.creatorUsername,
          amount: s.amount,
          name: s.name,
        })),
      }
    } catch (e) {
      result.databaseConnections.fuelmywork = { error: "Could not connect to fuelmywork DB: " + e.message }
    }

    // --- Detailed Username Search in fuelmywork.users ---
    if (username) {
      try {
        const fuelmyworkDb = client.db("fuelmywork")
        const creatorProfilesCollection = fuelmyworkDb.collection("users")
        const cleanUsername = username.toLowerCase().trim()

        const exactMatch = await creatorProfilesCollection.findOne({ username: cleanUsername })
        const partialMatches = await creatorProfilesCollection
          .find({
            username: { $regex: username, $options: "i" },
          })
          .toArray()

        result.usernameSearchInFuelmyworkUsers = {
          original: username,
          cleaned: cleanUsername,
          exactMatch: exactMatch
            ? {
                id: exactMatch._id.toString(),
                userId: exactMatch.userId,
                username: exactMatch.username,
                name: exactMatch.name,
              }
            : null,
          partialMatches: partialMatches.map((p) => ({
            id: p._id.toString(),
            userId: p.userId,
            username: p.username,
            name: p.name,
          })),
        }
      } catch (e) {
        result.usernameSearchInFuelmyworkUsers = { error: "Error during username search: " + e.message }
      }
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
