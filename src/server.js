import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import inscripcionesRouter from './routes/inscripciones.js';
import { connectMongo } from './mongo.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS no permitido para este origen'));
  },
  credentials: true
}));

app.options('*', cors());

app.use(express.json({ limit: '2mb' }));

// healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use('/inscripciones', inscripcionesRouter);

const port = Number(process.env.PORT) || 4000;

// Conectar a Mongo y luego levantar el servidor
connectMongo()
  .then(() => {
    app.listen(port, () => {
      console.log(`API escuchando en http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });


