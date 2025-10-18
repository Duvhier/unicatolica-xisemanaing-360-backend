import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongo, sync, checkConnection } from "./src/mongo.js";
import inscripcionesRouter from "./src/routes/inscripciones.js";

dotenv.config();

const app = express();

// ✅ Configurar orígenes permitidos (local + producción)
const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS?.split(",").map(s => s.trim()) || []),
  "https://unicatolica-xisemanaing-360.vercel.app",
  "https://si.cidt.unicatolica.edu.co",
  "http://localhost:5173",
  "http://localhost:4000"
].filter(Boolean);

console.log("🌍 Orígenes permitidos:", allowedOrigins);

// ✅ Middleware CORS mejorado
app.use(cors({
  origin: function (origin, callback) {
    console.log("🌐 Solicitud desde origen:", origin);
    
    // Permitir requests sin origin (como Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista de permitidos
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Comparación exacta o por dominio
      return origin === allowedOrigin || 
             origin.replace(/\/$/, "") === allowedOrigin.replace(/\/$/, "");
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ✅ Manejar preflight OPTIONS requests explícitamente
app.options('*', cors());

// ✅ Encabezados de seguridad recomendados
app.use((req, res, next) => {
  // Solo establecer headers CORS para orígenes permitidos
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some(allowed => origin === allowed || origin.replace(/\/$/, "") === allowed.replace(/\/$/, ""))) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers");
  
  // Encabezados de seguridad
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  
  next();
});

app.use(express.json({ limit: "2mb" }));

// 🩺 Ruta de prueba mejorada para CORS
app.get("/debug-cors", (req, res) => {
  const origin = req.headers.origin;
  const isAllowed = origin && allowedOrigins.some(allowed => 
    origin === allowed || origin.replace(/\/$/, "") === allowed.replace(/\/$/, "")
  );
  
  res.json({
    origin: origin || null,
    allowed: allowedOrigins,
    isAllowed: !!isAllowed,
    message: "Prueba de CORS desde el backend en Vercel",
    timestamp: new Date().toISOString()
  });
});

// 🩺 Ruta específica para probar preflight
app.options("/debug-cors", cors());

// 🧩 Rutas
app.use("/inscripciones", inscripcionesRouter);

// ✅ Ruta de salud para verificar que el servidor está funcionando
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Servidor funcionando correctamente",
    timestamp: new Date().toISOString()
  });
});

const port = Number(process.env.PORT) || 4000;

// ✅ Conectar a Mongo y levantar servidor con verificación
async function startServer() {
  try {
    console.log("🔄 Conectando a MongoDB...");
    await connectMongo();
    
    console.log("✅ MongoDB conectado exitosamente");
    
    // Verificar que la conexión esté activa usando sync
    const db = sync();
    if (!db) {
      throw new Error("No se pudo obtener la conexión a la base de datos");
    }
    
    // Realizar una operación de prueba para confirmar la conexión
    const isConnected = await checkConnection();
    if (!isConnected) {
      throw new Error("No se pudo verificar la conexión a MongoDB");
    }
    
    console.log("✅ Conexión a MongoDB verificada con ping");
    
    app.listen(port, () => {
      console.log(`✅ API corriendo en puerto ${port}`);
      console.log(`🌍 Orígenes permitidos: ${allowedOrigins.join(", ")}`);
      console.log(`🔍 Debug CORS disponible en: /debug-cors`);
      console.log(`❤️  Health check disponible en: /health`);
    });
    
  } catch (err) {
    console.error("❌ Error iniciando el servidor:", err);
    process.exit(1);
  }
}

startServer();

export default app;