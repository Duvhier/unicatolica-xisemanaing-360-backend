import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

function getMongoUri() {
  const fromEnv = process.env.MONGO_URI_ATLAS || process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || process.env.MONGO_URI_;
  if (!fromEnv) {
    throw new Error('MONGO_URI no configurada. Define MONGO_URI (o MONGO_URI_ATLAS/MONGO_URI_LOCAL) en tu .env');
  }
  return fromEnv;
}

export async function connectMongo() {
  if (cachedDb && cachedClient) return { client: cachedClient, db: cachedDb };

  const uri = getMongoUri();
  const client = new MongoClient(uri, {
    // opciones seguras por defecto
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4 // Forzar IPv4
  });
  await client.connect();

  // Si la URI incluye el nombre de la base de datos, úsalo; de lo contrario, usa uno por defecto
  const dbNameFromUri = (() => {
    try {
      const url = new URL(uri);
      const pathname = url.pathname?.replace(/^\//, '') || '';
      return pathname || 'eventoIngenieria';
    } catch {
      return 'eventoIngenieria';
    }
  })();

  const db = client.db(dbNameFromUri);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export function getDbSync() {
  if (!cachedDb) throw new Error('MongoDB no conectado. Llama a connectMongo() primero.');
  return cachedDb;
}


