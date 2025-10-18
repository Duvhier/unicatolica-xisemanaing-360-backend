import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("❌ No se encontró la variable MONGO_URI en el archivo .env");
    process.exit(1);
  }

  console.log("🔍 Probando conexión a MongoDB Atlas...");

  const client = new MongoClient(uri, {
    ssl: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4, // Fuerza IPv4
  });

  try {
    await client.connect();
    console.log("✅ Conexión exitosa a MongoDB Atlas!");

    const dbName = new URL(uri).pathname.replace(/^\//, "") || "eventoIngenieria";
    console.log(`📦 Base de datos activa: ${dbName}`);

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    console.log("📚 Colecciones encontradas:");
    collections.forEach(c => console.log(`   - ${c.name}`));

  } catch (err) {
    console.error("❌ Error al conectar a MongoDB Atlas:");
    console.error(err);
  } finally {
    await client.close();
    console.log("🔒 Conexión cerrada.");
  }
}

testConnection();
