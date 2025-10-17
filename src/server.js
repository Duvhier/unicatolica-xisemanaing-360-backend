import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import inscripcionesRouter from './routes/inscripciones.js';
import { connectMongo } from './mongo.js';

dotenv.config();

const app = express();

// ✅ Configurar orígenes permitidos
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('CORS no permitido para este origen'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// ✅ Permitir preflight requests
app.options('*', cors());

// ✅ Añadir encabezados de seguridad recomendados
app.use((req, res, next) => {
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json({ limit: '2mb' }));

// 🩺 Healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// 🧩 Rutas
app.use('/inscripciones', inscripcionesRouter);

const port = Number(process.env.PORT) || 4000;

connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`✅ API corriendo en puerto ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });
