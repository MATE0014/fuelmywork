// migrate.js
import { MongoClient } from "mongodb"
import dotenv from "dotenv"

// Load env
dotenv.config({ path: ".env.local" })

if (!process.env.MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env.local")
  process.exit(1)
}

const uri = process.env.MONGODB_URI

async function migrate() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB")

    const testDB = client.db("test")
    const fuelmyworkDB = client.db("fuelmywork")

    // Get all collections in test
    const testCollections = await testDB.listCollections().toArray()
    console.log("📦 Found collections in test:", testCollections.map(c => c.name))

    for (const { name } of testCollections) {
      const sourceCol = testDB.collection(name)
      const targetCol = fuelmyworkDB.collection(name)

      const docs = await sourceCol.find({}).toArray()
      console.log(`➡️ Migrating ${docs.length} docs from test.${name} → fuelmywork.${name}`)

      for (const doc of docs) {
        // Avoid duplicate _id conflicts
        const { _id, ...rest } = doc

        await targetCol.updateOne(
          { email: doc.email || _id }, // try matching by email if exists, otherwise _id
          { $setOnInsert: rest },
          { upsert: true }
        )
      }

      console.log(`✅ Finished migrating collection: ${name}`)
    }

    console.log("🎉 Migration complete")
  } catch (err) {
    console.error("❌ Migration failed:", err)
  } finally {
    await client.close()
    process.exit(0)
  }
}

migrate()
