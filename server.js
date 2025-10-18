import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectMongo, sync } from "./src/mongo.js";
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

app.use(
  cors({
    origin: (origin, cb) => {
      console.log("🌐 Solicitud desde origen:", origin);

      if (!origin) return cb(null, true); // Permitir Postman o llamadas sin origin

      // Permitir si coincide exactamente o si incluye dominio base
      const permitido = allowedOrigins.some(o => origin?.replace(/\/$/, "") === o.replace(/\/$/, ""));

      if (permitido) {
        cb(null, true);
      } else {
        console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
        cb(new Error("CORS no permitido para este origen"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Preflight
app.options("*", cors());

// ✅ Encabezados de seguridad recomendados
app.use((req, res, next) => {
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(express.json({ limit: "2mb" }));

// 🩺 Ruta de prueba
app.get("/debug-cors", (req, res) => {
  res.json({
    origin: req.headers.origin || null,
    allowed: allowedOrigins,
    message: "Prueba de CORS desde el backend en Vercel",
  });
});

// 🧩 Rutas
app.use("/inscripciones", inscripcionesRouter);

const port = Number(process.env.PORT) || 4000;

// ✅ Conectar a Mongo y levantar servidor
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
    await db.admin().ping();
    console.log("✅ Conexión a MongoDB verificada con ping");
    
    app.listen(port, () => {
      console.log(`✅ API corriendo en puerto ${port}`);
      console.log(`🌍 Orígenes permitidos: ${allowedOrigins.join(", ")}`);
    });
    
  } catch (err) {
    console.error("❌ Error iniciando el servidor:", err);
    process.exit(1);
  }
}

startServer();

export default app;