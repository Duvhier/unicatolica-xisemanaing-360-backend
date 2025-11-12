// routes/confirmaciondeasistencia.js
import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from '../controllers/emailController.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/* 🧩 FUNCIONES AUXILIARES                                                    */
/* -------------------------------------------------------------------------- */

// ✅ Obtener información de registros
async function obtenerInfoRegistros(db) {
    try {
        const actividadesCol = db.collection('actividades');
        const actividad = await actividadesCol.findOne({
            coleccion: 'confirmaciondeasistencia'
        });

        if (!actividad) {
            return {
                disponible: true,
                mensaje: 'Actividad no configurada - Usando cupo por defecto',
                inscritos: 0,
                cupoMaximo: 300 // Cupo por defecto
            };
        }

        const inscritosCol = db.collection('confirmaciondeasistencia');
        const totalInscritos = await inscritosCol.countDocuments({});
        const cuposDisponibles = Math.max(0, actividad.cupoMaximo - totalInscritos);

        return {
            disponible: cuposDisponibles > 0,
            cuposDisponibles,
            cupoMaximo: actividad.cupoMaximo,
            inscritos: totalInscritos,
            mensaje: `Registros: ${totalInscritos}/${actividad.cupoMaximo}`
        };
    } catch (err) {
        console.error('❌ Error obteniendo información de registros:', err);
        return {
            disponible: true,
            mensaje: 'Error obteniendo información - Valores por defecto',
            inscritos: 0,
            cupoMaximo: 300
        };
    }
}

// ✅ Validación de los datos recibidos
async function validatePayload(body) {
    const errors = [];

    const requiredFields = [
        'nombres',
        'apellido',
        'tipoDocumento',
        'numeroDocumento',
        'telefono',
        'facultadArea',
        'perfil',
        'email'
    ];

    for (const field of requiredFields) {
        if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
            errors.push(`Campo requerido o inválido: ${field}`);
        }
    }

    // Tipos de documento válidos
    const tiposDocumentoValidos = [
        'Cédula de Ciudadanía',
        'Tarjeta de Identidad',
        'Cédula Digital',
        'Cédula de Extranjería',
        'Pasaporte'
    ];
    if (body.tipoDocumento && !tiposDocumentoValidos.includes(body.tipoDocumento)) {
        errors.push('Tipo de documento no válido');
    }

    // Validar formato del correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email?.trim() || '')) {
        errors.push('Formato de correo electrónico no válido');
    }

    // Validar formato del teléfono (solo números)
    const telefonoRegex = /^\d+$/;
    if (body.telefono && !telefonoRegex.test(body.telefono.trim())) {
        errors.push('El teléfono debe contener solo números');
    }

    // Validación extra si el perfil es estudiante
    if (body.perfil === 'Estudiante') {
        if (!body.idEstudiante?.trim()) {
            errors.push('ID de estudiante es requerido para estudiantes');
        }
        if (!body.programaAcademico?.trim()) {
            errors.push('Programa académico es requerido para estudiantes');
        }
    }

    return { ok: errors.length === 0, errors };
}

// ✅ Verificación de duplicados
async function checkDuplicates(db, payload) {
    const col = db.collection('confirmaciondeasistencia');
    const duplicates = [];

    const existingDocumento = await col.findOne({
        numeroDocumento: payload.numeroDocumento.trim()
    });
    if (existingDocumento) {
        duplicates.push(`El número de documento ${payload.numeroDocumento} ya está registrado`);
    }

    const existingEmail = await col.findOne({
        email: payload.email.trim().toLowerCase()
    });
    if (existingEmail) {
        duplicates.push(`El correo ${payload.email} ya está registrado`);
    }

    if (payload.idEstudiante) {
        const existingId = await col.findOne({
            idEstudiante: payload.idEstudiante.trim()
        });
        if (existingId) {
            duplicates.push(`El ID de estudiante ${payload.idEstudiante} ya está registrado`);
        }
    }

    return duplicates;
}

/* -------------------------------------------------------------------------- */
/* 🧾 ENDPOINT PRINCIPAL: REGISTRO DE CONFIRMACIÓN                            */
/* -------------------------------------------------------------------------- */
router.post('/registro', async (req, res) => {
    try {
        const payload = req.body || {};
        console.log('🎯 Iniciando registro de Confirmación de Asistencia');
        console.log('📥 Payload recibido:', JSON.stringify(payload, null, 2));

        // ✅ Validar datos
        const { ok, errors } = await validatePayload(payload);
        if (!ok) return res.status(400).json({ message: 'Validación fallida', errors });

        // ✅ Conexión MongoDB
        const { db } = await connectMongo();

        // ✅ Revisar cupos
        const infoRegistros = await obtenerInfoRegistros(db);
        if (!infoRegistros.disponible) {
            return res.status(409).json({
                message: 'Cupo agotado',
                error: `No hay cupos disponibles (${infoRegistros.inscritos}/${infoRegistros.cupoMaximo})`
            });
        }

        // ✅ Verificar duplicados
        const duplicateErrors = await checkDuplicates(db, payload);
        if (duplicateErrors.length > 0) {
            return res.status(409).json({
                message: 'Datos duplicados encontrados',
                errors: duplicateErrors
            });
        }

        // ✅ Construir documento
        const nowIso = new Date().toISOString();
        const doc = {
            nombres: payload.nombres.trim(),
            apellido: payload.apellido.trim(),
            tipoDocumento: payload.tipoDocumento.trim(),
            numeroDocumento: payload.numeroDocumento.trim(),
            telefono: payload.telefono.trim(),
            facultadArea: payload.facultadArea.trim(),
            perfil: payload.perfil.trim(),
            programaAcademico: payload.programaAcademico?.trim(),
            idEstudiante: payload.idEstudiante?.trim(),
            email: payload.email.trim().toLowerCase(),
            evento: 'Ceremonia de Grados - Confirmación de Asistencia',
            actividad: 'confirmacion-asistencia',
            fechaRegistro: nowIso,
            estado: 'activo'
        };

        const col = db.collection('confirmaciondeasistencia');
        const insertRes = await col.insertOne(doc);
        const insertedId = insertRes.insertedId;

        // ✅ Generar QR
        const qrPayload = {
            id: insertedId.toString(),
            participante: {
                nombres: payload.nombres,
                apellido: payload.apellido,
                tipoDocumento: payload.tipoDocumento,
                numeroDocumento: payload.numeroDocumento,
                perfil: payload.perfil,
                programaAcademico: payload.programaAcademico,
                idEstudiante: payload.idEstudiante
            },
            actividad: 'Confirmación de Asistencia',
            evento: 'Ceremonia de Grados',
            emitido: nowIso
        };

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload));

        // ✅ Actualizar con QR
        await col.updateOne({ _id: insertedId }, {
            $set: {
                qr_data: qrPayload,
                qr_generated_at: nowIso,
                qr_image: qrDataUrl
            }
        });

        // ✅ Enviar correo
        try {
            const datosCorreo = {
                ...doc,
                qr: qrDataUrl,
                evento: 'Ceremonia de Grados - Confirmación de Asistencia'
            };
            await enviarCorreoRegistro(datosCorreo, 'confirmaciondeasistencia');
        } catch (err) {
            console.error('⚠️ Error enviando correo:', err);
        }

        // ✅ Respuesta
        const infoActualizada = await obtenerInfoRegistros(db);
        res.status(201).json({
            message: 'Confirmación de asistencia registrada correctamente',
            id: insertedId,
            qr: qrDataUrl,
            cupo: {
                disponibles: infoActualizada.cuposDisponibles,
                maximo: infoActualizada.cupoMaximo
            }
        });

    } catch (err) {
        console.error('❌ Error en /confirmaciondeasistencia/registro:', err);
        res.status(500).json({ message: 'Error interno del servidor', error: err.message });
    }
});

/* -------------------------------------------------------------------------- */
/* 🧭 OTROS ENDPOINTS                                                         */
/* -------------------------------------------------------------------------- */

// Obtener estado general
router.get('/estado-registros', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const info = await obtenerInfoRegistros(db);
        res.json({
            success: true,
            data: {
                ...info,
                actividad: 'Confirmación de Asistencia'
            }
        });
    } catch (err) {
        console.error('❌ Error en /estado-registros:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Listar registros
router.get('/listar', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('confirmaciondeasistencia');
        const registros = await col.find({}).sort({ fechaRegistro: -1 }).limit(100).toArray();
        res.json({
            message: 'Registros encontrados',
            total: registros.length,
            registros
        });
    } catch (err) {
        console.error('❌ Error en /listar:', err);
        res.status(500).json({ message: 'Error listando registros', error: err.message });
    }
});

// Buscar registro
router.get('/buscar/:documento', async (req, res) => {
    try {
        const { documento } = req.params;
        const { db } = await connectMongo();
        const col = db.collection('confirmaciondeasistencia');

        const registro = await col.findOne({
            $or: [
                { numeroDocumento: documento },
                { email: documento },
                { idEstudiante: documento }
            ]
        });

        if (!registro) {
            return res.status(404).json({ message: 'No se encontró registro' });
        }

        res.json({ message: 'Registro encontrado', registro });
    } catch (err) {
        console.error('❌ Error en /buscar:', err);
        res.status(500).json({ message: 'Error interno', error: err.message });
    }
});

export default router;
