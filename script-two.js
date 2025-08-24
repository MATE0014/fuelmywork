// mergeSupportersToPayments.js
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://moxitrewar777:Moxit2004@fuelmywork-users.j49zwc7.mongodb.net/fuelmywork?retryWrites=true&w=majority&appName=fuelmywork-users";

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("fuelmywork");

    const supportersCol = db.collection("supporters");
    const paymentsCol = db.collection("payments");

    // Fetch all supporters (old payments)
    const oldPayments = await supportersCol.find({}).toArray();

    if (oldPayments.length === 0) {
      console.log("No records found in supporters collection.");
      return;
    }

    // Optional: remove _id so MongoDB can insert cleanly without conflicts
    const transformed = oldPayments.map(({ _id, ...rest }) => rest);

    // Insert into payments
    const result = await paymentsCol.insertMany(transformed);

    console.log(`✅ Migrated ${result.insertedCount} old payments from supporters → payments.`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await client.close();
  }
}

run();
