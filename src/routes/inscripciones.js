import { Router } from 'express';
import QRCode from 'qrcode';
import { getDb } from '../mongo.js'; // 🔹 se cambia getDbSync por getDb

const router = Router();

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validatePayload(body) {
  const errors = [];
  const requiredStudent = ['nombre', 'cedula', 'correo', 'telefono', 'programa', 'semestre'];
  for (const key of requiredStudent) {
    if (!isNonEmptyString(body[key])) errors.push(`Campo requerido: ${key}`);
  }

  if (!Array.isArray(body.actividades) || body.actividades.length === 0) {
    errors.push('actividades debe ser un arreglo con al menos un elemento');
  }

  const actividad = Array.isArray(body.actividades) ? body.actividades[0] : undefined;
  if (!isNonEmptyString(actividad)) {
    errors.push('actividad inválida');
  }

  if (body.grupo) {
    const g = body.grupo;
    if (!isNonEmptyString(g.nombre)) errors.push('grupo.nombre requerido');
    if (!g.proyecto || !isNonEmptyString(g.proyecto.nombre)) errors.push('grupo.proyecto.nombre requerido');
    if (!g.proyecto || !isNonEmptyString(g.proyecto.descripcion)) errors.push('grupo.proyecto.descripcion requerido');
    if (!g.proyecto || !isNonEmptyString(g.proyecto.categoria)) errors.push('grupo.proyecto.categoria requerido');
    if (!isNonEmptyString(g.institucion)) errors.push('grupo.institucion requerido');
    if (!isNonEmptyString(g.correo)) errors.push('grupo.correo requerido');
  }

  return { ok: errors.length === 0, errors, actividad };
}

router.post('/registro', async (req, res) => {
  try {
    const payload = req.body || {};
    const { ok, errors, actividad } = validatePayload(payload);
    if (!ok) {
      return res.status(400).json({ message: 'Validación fallida', errors });
    }

    const nowIso = new Date().toISOString();
    const db = await getDb(); // 🔹 conexión segura y asíncrona
    const col = db.collection('inscripciones');

    const grupo = payload.grupo ?? null;
    const integrantes = Array.isArray(grupo?.integrantes) ? grupo.integrantes : [payload.nombre];

    const doc = {
      nombre: payload.nombre,
      cedula: payload.cedula,
      correo: payload.correo,
      telefono: payload.telefono,
      programa: payload.programa,
      semestre: payload.semestre,
      actividad,
      grupo_nombre: grupo ? grupo.nombre : null,
      grupo_institucion: grupo ? grupo.institucion : null,
      grupo_correo: grupo ? grupo.correo : null,
      grupo_telefono: grupo ? (grupo.telefono || null) : null,
      proyecto_nombre: grupo ? grupo.proyecto?.nombre : null,
      proyecto_descripcion: grupo ? grupo.proyecto?.descripcion : null,
      proyecto_categoria: grupo ? grupo.proyecto?.categoria : null,
      integrantes,
      created_at: nowIso
    };

    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    const qrPayload = {
      id: insertedId,
      estudiante: {
        nombre: payload.nombre,
        cedula: payload.cedula
      },
      actividad,
      emitido: nowIso
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), { errorCorrectionLevel: 'M' });

    return res.status(201).json({
      message: 'Inscripción registrada',
      id: insertedId,
      qr: qrDataUrl,
      qrData: qrPayload,
      estudiante: { nombre: payload.nombre, cedula: payload.cedula }
    });
  } catch (err) {
    console.error('❌ Error en POST /registro:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

router.get('/listar', async (req, res) => {
  try {
    const db = await getDb(); // 🔹 conexión segura y asíncrona
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
        grupo: insc.grupo_nombre,
        created_at: insc.created_at
      }))
    });
  } catch (err) {
    console.error('❌ Error en GET /listar:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
