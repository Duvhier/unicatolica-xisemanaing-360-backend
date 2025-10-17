const { MongoClient } = require("mongodb");

let uri;

// Usar la URI según el entorno
if (process.env.NODE_ENV === "development") {
  uri = process.env.MONGO_URI_LOCAL || "mongodb://localhost:27017/eventoIngenieria";
} else {
  uri = process.env.MONGO_URI_ATLAS;
}

const client = new MongoClient(uri);

async function connectDB() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("✅ Conectado a MongoDB:", uri.includes("localhost") ? "Local" : "Atlas");
    }
    return client.db("eventoIngenieria"); // nombre de la base de datos
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    throw error;
  }
}

module.exports = connectDB;
