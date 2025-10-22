// routes/liderazgo.js
import { Router } from "express";
import QRCode from "qrcode";
import { connectMongo } from '../mongo.js';

const router = Router();

// ✅ Validación de los campos enviados por el frontend
function validateLiderazgo(body) {
  const errors = [];
  const requiredFields = ["nombre", "cedula", "correo", "telefono", "rol", "area"];

  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
      errors.push(`Campo requerido o inválido: ${field}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

// ✅ Endpoint principal: Registro de liderazgo
router.post("/registro", async (req, res) => {
  try {
    const payload = req.body || {};
    const { ok, errors } = validateLiderazgo(payload);

    if (!ok) {
      return res.status(400).json({ message: "Validación fallida", errors });
    }

    const { db } = await connectMongo();
    const col = db.collection("liderazgo"); // colección donde se guardarán las inscripciones

    const nowIso = new Date().toISOString();

    // Documento a guardar en MongoDB
    const doc = {
      nombre: payload.nombre.trim(),
      cedula: payload.cedula.trim(),
      correo: payload.correo.trim(),
      telefono: payload.telefono.trim(),
      rol: payload.rol.trim(),
      area: payload.area.trim(),
      created_at: nowIso
    };

    // 🔹 Insertar el documento en la base de datos
    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    // 🔹 Crear datos para el QR
    const qrPayload = {
      id: insertedId,
      nombre: payload.nombre,
      cedula: payload.cedula,
      evento: "Desarrollo Personal y Liderazgo",
      emitido: nowIso
    };

    // 🔹 Generar QR como base64
    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
      errorCorrectionLevel: "M"
    });

    // 🔹 Responder al frontend con el resultado
    return res.status(201).json({
      message: "Inscripción registrada correctamente",
      id: insertedId,
      qr: qrDataUrl,
      qrData: qrPayload
    });
  } catch (err) {
    console.error("❌ Error en /liderazgo/registro:", err);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: err.message
    });
  }
});

// ✅ Endpoint para listar los inscritos (opcional)
router.get("/listar", async (req, res) => {
  try {
    const { db } = await connectMongo();
    const col = db.collection("liderazgo");
    const docs = await col.find({}).sort({ created_at: -1 }).toArray();

    res.json({
      message: "Listado de inscritos obtenido correctamente",
      total: docs.length,
      registros: docs
    });
  } catch (err) {
    console.error("❌ Error en /liderazgo/listar:", err);
    res.status(500).json({ message: "Error interno del servidor", error: err.message });
  }
});

export default router;
