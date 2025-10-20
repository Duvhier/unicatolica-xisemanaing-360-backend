import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';

const router = Router();

// ✅ Validación de campos
function validatePayload(body) {
  const errors = [];
  const required = ['nombre', 'cedula', 'correo', 'telefono', 'programa', 'semestre'];

  for (const key of required) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      errors.push(`Campo requerido o inválido: ${key}`);
    }
  }

  if (!Array.isArray(body.actividades) || body.actividades.length === 0) {
    errors.push('El campo "actividades" debe ser un arreglo con al menos una actividad.');
  }

  return { ok: errors.length === 0, errors };
}

router.post('/registro', async (req, res) => {
  try {
    const payload = req.body || {};
    const { ok, errors } = validatePayload(payload);

    if (!ok) {
      return res.status(400).json({ message: 'Validación fallida', errors });
    }

    // 🔹 Conexión segura a MongoDB (ideal para entornos serverless)
    const { db } = await connectMongo();
    const col = db.collection('inscripciones');

    const nowIso = new Date().toISOString();
    const actividad = payload.actividades[0];

    // 🔹 Construcción del documento a guardar
    const doc = {
      nombre: payload.nombre.trim(),
      cedula: payload.cedula.trim(),
      correo: payload.correo.trim(),
      telefono: payload.telefono.trim(),
      programa: payload.programa.trim(),
      semestre: payload.semestre.trim(),
      actividades: payload.actividades,
      actividad,
      grupo: payload.grupo ?? null,
      created_at: nowIso
    };

    // 🔹 Inserción en la colección
    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    // 🔹 Generar el código QR
    const qrPayload = {
      id: insertedId,
      estudiante: { nombre: payload.nombre, cedula: payload.cedula },
      actividad,
      emitido: nowIso
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), { errorCorrectionLevel: 'M' });

    // 🔹 Respuesta exitosa
    return res.status(201).json({
      message: 'Inscripción registrada correctamente',
      id: insertedId,
      qr: qrDataUrl,
      qrData: qrPayload
    });
  } catch (err) {
    console.error('❌ Error en /inscripciones/registro:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// ✅ Endpoint opcional para verificar las inscripciones (modo debug)
router.get('/listar', async (req, res) => {
  try {
    const { db } = await connectMongo();
    const col = db.collection('inscripciones');
    const inscripciones = await col.find({}).limit(10).toArray();

    return res.json({
      message: 'Inscripciones encontradas',
      total: inscripciones.length,
      inscripciones: inscripciones.map(insc => ({
        id: insc._id,
        nombre: insc.nombre,
        cedula: insc.cedula,
        programa: insc.programa,
        actividad: insc.actividad,
        created_at: insc.created_at
      }))
    });
  } catch (err) {
    console.error('❌ Error en /inscripciones/listar:', err);
    return res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
});

export default router;
