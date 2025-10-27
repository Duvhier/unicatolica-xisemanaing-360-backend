import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import inscripcionesRouter from "./src/routes/inscripciones.js";
import organizadorRouter from "./src/routes/organizadorRoutes.js";
import liderazgoRoutes from "./src/routes/liderazgo.js";
import technologicalRoutes from "./src/routes/technological.js";
import actividadesRouter from "./api/actividades.js";
import dns from "dns";

dotenv.config();

const app = express();

// Fuerza preferencia IPv4 para evitar issues TLS/IPv6 en algunos hosts
dns.setDefaultResultOrder?.("ipv4first");

// =========================================================
// 🌍 CONFIGURACIÓN DE CORS
// =========================================================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

// Permite peticiones desde los dominios autorizados
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (como Postman)
      if (!origin) return callback(null, true);

      // Verifica si el origen está permitido
      const isAllowed = allowedOrigins.some(o => origin.includes(o));

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS bloqueado para origen: ${origin}`);
        callback(new Error(`Origen no permitido por CORS: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Preflight
app.options("*", cors());

// =========================================================
// 🧠 ENCABEZADOS DE SEGURIDAD
// =========================================================
app.use((req, res, next) => {
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  res.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

// =========================================================
// 🔧 MIDDLEWARES
// =========================================================
app.use(express.json({ limit: "2mb" }));

// =========================================================
// 🔍 RUTA DE PRUEBA CORS
// =========================================================
app.get("/debug-cors", (req, res) => {
  res.json({
    origin: req.headers.origin || "sin origen",
    allowed: allowedOrigins,
    message: "Backend en línea y CORS configurado correctamente 🚀",
  });
});

// =========================================================
// 📦 RUTAS DE NEGOCIO
// =========================================================
app.use("/inscripciones", inscripcionesRouter);
app.use("/organizador", organizadorRouter);
app.use("/liderazgo", liderazgoRoutes);
app.use("/technological", technologicalRoutes);
app.use('/api/actividades', actividadesRouter);

// =========================================================
// 🚀 INICIALIZACIÓN
// =========================================================
const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`✅ Servidor en puerto ${port}`);
  console.log(`🌍 Orígenes permitidos: ${allowedOrigins.join(", ")}`);
});

// =========================================================
// 🎯 RUTA TEMPORAL PARA INICIALIZAR ACTIVIDADES
// =========================================================
app.get('/inicializar-actividades', async (req, res) => {
  try {
    const response = await fetch('http://localhost:4000/api/actividades/inicializar', {
      method: 'POST'
    });
    const result = await response.json();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
