// 1. Load environment variables from .env file
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;

// 2. Get the connection string from the environment variables
const url = process.env.MONGO_URL;

if (!url) {
  console.error('MongoDB connection string is missing in the .env file.');
  console.error('Please set the MONGO_URL variable.');
  process.exit(1);
}

const client = new MongoClient(url);

async function runTest() {
  try {
    // 3. Connect to the server and wait for the connection to complete
    await client.connect();
    console.log('✅ Connected successfully to MongoDB!');

    // 4. Get the correct database and collection objects
    // Make sure to use the database name you specified in your connection string or here.
    const db = client.db();
    const usersCollection = db.collection('users');
    console.log(`- Using database: "${db.databaseName}", collection: "users"`);

    // 5. Insert the document and wait for it to complete
    console.log('\nInserting a document...');
    const result = await usersCollection.insertOne({ _id: 1, 'name': 'Bob', 'lname': 'Smith' });
    console.log(`- Inserted document with _id: ${result.insertedId}`);

    // 6. It's good practice to clean up test data
    /*console.log('\nCleaning up the test document...');
    await usersCollection.deleteOne({ _id: 1 });
    console.log('- Deleted test document.');*/

  } catch (e) {
    console.error('❌ An error occurred during the test:', e);
  } finally {
    // 7. Ensure the client will close when you finish or an error occurs
    await client.close();
    console.log('\nConnection closed. Test finished.');
  }
}

// Run the async test function
runTest();
