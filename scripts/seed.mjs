import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'resto-app';
const collectionName = process.env.MONGODB_COLLECTION || 'restaurants';

if (!uri) {
  console.error('Missing MONGODB_URI. Please set it before running the seed script.');
  process.exit(1);
}

async function seed() {
  const dataPath = path.join(__dirname, '..', 'data', 'restaurants.json');
  const fileBuffer = await fs.readFile(dataPath, 'utf-8');
  const restaurants = JSON.parse(fileBuffer);

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const collection = client.db(dbName).collection(collectionName);

    await collection.deleteMany({});
    const result = await collection.insertMany(restaurants);

    console.log(`Seeded ${result.insertedCount} restaurants into ${collectionName}`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error('Seeding failed', error);
  process.exit(1);
});

