import { MongoClient, ServerApiVersion } from "mongodb";

let cachedClient = null;
let cachedDb = null;

export async function connectMongo() {
  if (cachedDb && cachedClient) return { client: cachedClient, db: cachedDb };

  const uri = process.env.MONGO_URI;

  if (!uri) throw new Error("❌ MONGO_URI no configurada en .env o en Vercel.");

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    ssl: true,
    retryWrites: true,
    connectTimeoutMS: 20000,
  });

  try {
    await client.connect();
    const db = client.db("eventoIngenieria");
    cachedClient = client;
    cachedDb = db;
    console.log("✅ Conectado a MongoDB Atlas correctamente.");
    return { client, db };
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    throw err;
  }
}
