import { MongoClient, Document } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? 'resto_app';

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export const hasMongoConfig = Boolean(uri);

async function createClient() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  const client = new MongoClient(uri);
  return client.connect();
}

export const getMongoClient = async () => {
  if (!hasMongoConfig) {
    throw new Error('MongoDB is not configured');
  }

  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClient();
  }

  return global._mongoClientPromise;
};

export const getMongoCollection = async <T extends Document>(collectionName: string) => {
  const client = await getMongoClient();
  return client.db(dbName).collection<T>(collectionName);
};