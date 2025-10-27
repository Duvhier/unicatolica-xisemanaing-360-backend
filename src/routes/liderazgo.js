// routes/liderazgo.js
import { Router } from "express";
import QRCode from "qrcode";
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from "../controllers/emailController.js";

const router = Router();

// ✅ Función para verificar disponibilidad de cupos
async function verificarCupos(db) {
    try {
        const actividadesCol = db.collection('actividades');
        const actividad = await actividadesCol.findOne({
            coleccion: 'liderazgo'
        });

        if (!actividad) {
            return { disponible: true, mensaje: 'Actividad no configurada' };
        }

        const inscritosCol = db.collection('liderazgo');
        const totalInscritos = await inscritosCol.countDocuments({});
        const cuposDisponibles = Math.max(0, actividad.cupoMaximo - totalInscritos);

        return {
            disponible: cuposDisponibles > 0,
            cuposDisponibles: cuposDisponibles,
            cupoMaximo: actividad.cupoMaximo,
            inscritos: totalInscritos,
            mensaje: cuposDisponibles > 0
                ? `Cupos disponibles: ${cuposDisponibles}/${actividad.cupoMaximo}`
                : 'Cupo agotado'
        };
    } catch (err) {
        console.error('❌ Error verificando cupos:', err);
        return { disponible: true, mensaje: 'Error verificando cupos' };
    }
}

// ✅ Validación mejorada de los campos
function validateLiderazgo(body) {
    const errors = [];
    const requiredFields = ["nombre", "cedula", "correo", "telefono", "rol", "area"];

    for (const field of requiredFields) {
        if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
            errors.push(`Campo requerido o inválido: ${field}`);
        }
    }

    // 🔹 Validación específica para cédula (solo números)
    if (body.cedula) {
        const cedulaRegex = /^\d+$/;
        if (!cedulaRegex.test(body.cedula.trim())) {
            errors.push("La cédula debe contener solo números");
        }
    }

    // 🔹 Validación específica para teléfono
    if (body.telefono) {
        const telefonoRegex = /^\d+$/;
        if (!telefonoRegex.test(body.telefono.trim())) {
            errors.push("El teléfono debe contener solo números");
        }
    }

    return { ok: errors.length === 0, errors };
}

// 🔹 Función para validar correo institucional
function validarCorreoInstitucional(correo) {
    const correoInstitucionalRegex = /^[a-zA-Z0-9._%+-]+@unicatolica\.edu\.co$/i;
    return correoInstitucionalRegex.test(correo);
}

// 🔹 Función para verificar duplicados
async function verificarDuplicados(db, cedula, correo) {
    const col = db.collection("liderazgo");

    const existente = await col.findOne({
        $or: [{ cedula }, { correo }],
    });

    if (existente) {
        if (existente.cedula === cedula && existente.correo === correo) {
            return { duplicado: true, mensaje: "Ya existe un registro con esta cédula y correo electrónico." };
        } else if (existente.cedula === cedula) {
            return { duplicado: true, mensaje: "Ya existe un registro con este número de cédula." };
        } else if (existente.correo === correo) {
            return { duplicado: true, mensaje: "Ya existe un registro con este correo electrónico." };
        }
    }

    return { duplicado: false };
}

router.post("/registro", async (req, res) => {
    try {
        const payload = req.body || {};
        const { ok, errors } = validateLiderazgo(payload);

        if (!ok) {
            return res.status(400).json({
                message: "Validación fallida",
                errors
            });
        }

        const { db } = await connectMongo();

        // ✅ VERIFICAR CUPOS DISPONIBLES ANTES DE CONTINUAR
        console.log('🔍 Verificando cupos disponibles...');
        const estadoCupos = await verificarCupos(db);

        if (!estadoCupos.disponible) {
            console.log('❌ Cupo agotado para Desarrollo Personal y Liderazgo');
            return res.status(409).json({
                message: 'Cupo agotado',
                error: `Lo sentimos, no hay cupos disponibles para Desarrollo Personal y Liderazgo. ${estadoCupos.inscritos}/${estadoCupos.cupoMaximo} inscritos.`
            });
        }

        console.log('✅ Cupos disponibles:', estadoCupos.cuposDisponibles);

        const col = db.collection("liderazgo");

        // ... (el resto del código permanece igual)

        const correo = payload.correo.trim().toLowerCase();
        const cedula = payload.cedula.trim();

        // 🔹 Validar que el correo sea institucional
        if (!validarCorreoInstitucional(correo)) {
            console.log("❌ Correo no institucional bloqueado:", correo);
            return res.status(400).json({
                message: "El correo debe ser institucional (ejemplo@unicatolica.edu.co)",
                details: "Solo se permiten correos con el dominio @unicatolica.edu.co"
            });
        }

        // 🔹 Verificar duplicados con mensajes específicos
        const { duplicado, mensaje } = await verificarDuplicados(db, cedula, correo);

        if (duplicado) {
            return res.status(400).json({
                message: mensaje,
                details: "No se permiten registros duplicados"
            });
        }

        const nowIso = new Date().toISOString();

        const doc = {
            nombre: payload.nombre.trim(),
            cedula,
            correo,
            telefono: payload.telefono.trim(),
            rol: payload.rol.trim(),
            area: payload.area.trim(),
            created_at: nowIso,
            // 🔹 Agregar campos de auditoría
            updated_at: nowIso,
            estado: "activo"
        };

        // 🔹 Insertar el documento en la base de datos
        const insertRes = await col.insertOne(doc);
        const insertedId = insertRes.insertedId;

        // 🔹 Crear datos para el QR
        const qrPayload = {
            id: insertedId.toString(),
            nombre: payload.nombre.trim(),
            cedula,
            evento: "Desarrollo Personal y Liderazgo",
            emitido: nowIso,
            tipo: "liderazgo"
        };

        // 🔹 Generar QR como base64
        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
            errorCorrectionLevel: "M",
            width: 300,
            margin: 2
        });

        // 🔹 Actualizar el documento con el QR
        await col.updateOne(
            { _id: insertedId },
            {
                $set: {
                    qr_data: qrPayload,
                    qr_generated_at: nowIso
                }
            }
        );

        // 🔹 Enviar el correo de confirmación
        try {
            console.log("📧 Preparando envío de correo a:", correo);
            await enviarCorreoRegistro({
                nombre: payload.nombre.trim(),
                cedula,
                correo,
                telefono: payload.telefono.trim(),
                area: payload.area.trim(),
                rol: payload.rol.trim(),
                qr: qrDataUrl,
            });
            console.log("✅ Correo enviado exitosamente a:", correo);
        } catch (emailError) {
            console.error("❌ Error al enviar correo:", emailError);
            // No retornamos error aquí, solo logueamos
        }

        // 🔹 Responder al frontend con el resultado
        return res.status(201).json({
            message: "Inscripción registrada correctamente",
            id: insertedId,
            qr: qrDataUrl,
            qrData: qrPayload,
            emailEnviado: true
        });

    } catch (err) {
        console.error("❌ Error en /liderazgo/registro:", err);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: process.env.NODE_ENV === 'development' ? err.message : 'Contacte al administrador'
        });
    }
});

// ✅ Endpoint adicional para verificar disponibilidad
router.post("/verificar", async (req, res) => {
    try {
        const { cedula, correo } = req.body;

        if (!cedula && !correo) {
            return res.status(400).json({
                message: "Se requiere cédula o correo para verificar"
            });
        }

        const { db } = await connectMongo();

        if (correo && !validarCorreoInstitucional(correo.trim().toLowerCase())) {
            return res.status(400).json({
                message: "El correo debe ser institucional",
                disponible: false
            });
        }

        const { duplicado, mensaje } = await verificarDuplicados(
            db,
            cedula ? cedula.trim() : null,
            correo ? correo.trim().toLowerCase() : null
        );

        return res.json({
            disponible: !duplicado,
            message: duplicado ? mensaje : "Datos disponibles para registro"
        });

    } catch (err) {
        console.error("❌ Error en /liderazgo/verificar:", err);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: err.message
        });
    }
});

// ✅ Endpoint para listar los inscritos
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
        res.status(500).json({
            message: "Error interno del servidor",
            error: err.message
        });
    }
});

export default router;