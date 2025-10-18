import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import inscripcionesRouter from "./routes/inscripciones.js";
import { connectMongo } from "./mongo.js";

dotenv.config();

const app = express();

// ✅ Dominio frontend permitido
// Puedes agregar varios separados por comas en tu .env:
// ALLOWED_ORIGINS=https://unicatolica-xisemanaing-360.vercel.app,https://otro-dominio.com
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "https://unicatolica-xisemanaing-360.vercel.app" || "https://si.cidt.unicatolica.edu.co" )
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// ✅ Middleware CORS
app.use(
  cors({
    origin: (origin, cb) => {
      // En caso de peticiones internas o sin origin (ej: Postman)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) {
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

// ✅ Permitir preflight requests
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
app.get("/health", (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// 🧩 Rutas
app.use("/inscripciones", inscripcionesRouter);

const port = Number(process.env.PORT) || 4000;

// ✅ Conectar a Mongo y levantar servidor
connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ API corriendo en puerto ${port}`);
      console.log(`🌍 Orígenes permitidos: ${allowedOrigins.join(", ")}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  });

export default app;
