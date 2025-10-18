import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

function getMongoUri() {
  const fromEnv =
    process.env.MONGO_URI_ATLAS ||
    process.env.MONGO_URI_LOCAL ||
    process.env.MONGO_URI ||
    process.env.MONGO_URI_;

  if (!fromEnv) {
    throw new Error('❌ MONGO_URI no configurada. Define MONGO_URI (o MONGO_URI_ATLAS/MONGO_URI_LOCAL) en tu .env');
  }

  // ✅ Garantiza que la conexión use TLS (importante para Atlas en Vercel)
  if (!fromEnv.includes('tls=true') && !fromEnv.includes('ssl=true')) {
    return fromEnv.includes('?')
      ? `${fromEnv}&tls=true`
      : `${fromEnv}?tls=true`;
  }

  return fromEnv;
}

export async function connectMongo() {
  if (cachedDb && cachedClient) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = getMongoUri();

  const client = new MongoClient(uri, {
    ssl: true,
    tlsAllowInvalidCertificates: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    family: 4, // Fuerza IPv4
  });

  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas exitosamente');

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
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err);
    throw err;
  }
}

// ✅ Nueva versión: obtiene la BD y reconecta si es necesario (ideal para Vercel)
export async function getDb() {
  if (!cachedDb || !cachedClient) {
    console.warn('⚠️ MongoDB no conectado. Reintentando conexión...');
    const { db } = await connectMongo();
    return db;
  }
  return cachedDb;
}
