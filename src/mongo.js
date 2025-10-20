import { MongoClient, ServerApiVersion } from "mongodb";

let cachedClient = null;
let cachedDb = null;

export async function connectMongo() {
  if (cachedDb && cachedClient) return { client: cachedClient, db: cachedDb };

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("❌ MONGO_URI no configurada en entorno");

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    // Usar flags TLS modernas; el driver habilita TLS automáticamente para SRV (mongodb+srv)
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
  });

  try {
    await client.connect();
    const db = client.db("eventoIngenieria");
    cachedClient = client;
    cachedDb = db;
    console.log("✅ Conexión a MongoDB Atlas establecida correctamente.");
    return { client, db };
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    throw err;
  }
}
