// routes/desarrollofullstack.js
import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from '../controllers/emailController.js';

const router = Router();

// ✅ Función para obtener información de registros
async function obtenerInfoRegistros(db) {
    try {
        const actividadesCol = db.collection('actividades');
        const actividad = await actividadesCol.findOne({
            coleccion: 'desarrollofullstack'
        });

        if (!actividad) {
            return {
                disponible: true,
                mensaje: 'Actividad no configurada',
                inscritos: 0,
                cupoMaximo: 30 // Cupo por defecto para la certificación
            };
        }

        const inscritosCol = db.collection('desarrollofullstack');
        const totalInscritos = await inscritosCol.countDocuments({});

        // ✅ Cambio principal: siempre mostrar número de inscritos
        const cuposDisponibles = Math.max(0, actividad.cupoMaximo - totalInscritos);

        return {
            disponible: cuposDisponibles > 0,
            cuposDisponibles: cuposDisponibles,
            cupoMaximo: actividad.cupoMaximo,
            inscritos: totalInscritos,
            mensaje: `Usuarios registrados: ${totalInscritos}/${actividad.cupoMaximo}`
        };
    } catch (err) {
        console.error('❌ Error obteniendo información de registros:', err);
        return {
            disponible: true,
            mensaje: 'Error obteniendo información',
            inscritos: 0,
            cupoMaximo: 30
        };
    }
}

// ✅ Validación de campos para Full Stack
function validatePayload(body) {
    const errors = [];

    // Campos básicos requeridos para todos
    const requiredFields = [
        'nombre',
        'cedula',
        'correo',
        'telefono',
        'rol',
        'nivelIngles',
        'experienciaProgramacion',
        'motivacion',
        'expectativas'
    ];

    for (const field of requiredFields) {
        if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
            errors.push(`Campo requerido o inválido: ${field}`);
        }
    }

    // ✅ Validar rol
    const rolesValidos = ['estudiante', 'egresado'];
    if (body.rol && !rolesValidos.includes(body.rol)) {
        errors.push('Rol no válido');
    }

    // ✅ Validaciones específicas por rol
    if (body.rol === 'estudiante') {
        if (!body.idEstudiante || !body.idEstudiante.trim()) {
            errors.push('ID de estudiante es requerido');
        }
        if (!body.facultad || !body.facultad.trim()) {
            errors.push('Facultad es requerida para estudiantes');
        }
        if (!body.programa || !body.programa.trim()) {
            errors.push('Programa académico es requerido para estudiantes');
        }
        if (!body.semestre || !body.semestre.trim()) {
            errors.push('Semestre es requerido para estudiantes');
        }
    }

    // ✅ Validar nivel de inglés
    const nivelesInglesValidos = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (body.nivelIngles && !nivelesInglesValidos.includes(body.nivelIngles)) {
        errors.push('Nivel de inglés no válido');
    }

    // ✅ Validar experiencia en programación
    const experienciasValidas = [
        'ninguna',
        'basica', 
        'intermedia',
        'avanzada',
        'experta'
    ];
    if (body.experienciaProgramacion && !experienciasValidas.includes(body.experienciaProgramacion)) {
        errors.push('Experiencia en programación no válida');
    }

    // ✅ Validar conocimientos técnicos (opcionales pero con valores válidos)
    const nivelesConocimiento = ['ninguno', 'basico', 'intermedio', 'avanzado'];
    
    if (body.conocimientoSpring && !nivelesConocimiento.includes(body.conocimientoSpring)) {
        errors.push('Nivel de conocimiento Spring Boot no válido');
    }
    
    if (body.conocimientoAngular && !nivelesConocimiento.includes(body.conocimientoAngular)) {
        errors.push('Nivel de conocimiento Angular no válido');
    }
    
    if (body.conocimientoAI && !nivelesConocimiento.includes(body.conocimientoAI)) {
        errors.push('Nivel de conocimiento AI/ML no válido');
    }

    // ✅ Validar formato de correo
    if (body.correo) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.correo.trim())) {
            errors.push('Formato de correo electrónico no válido');
        }
    }

    // ✅ Validar formato de teléfono (solo números)
    if (body.telefono) {
        const telefonoRegex = /^\d+$/;
        if (!telefonoRegex.test(body.telefono.trim())) {
            errors.push('El teléfono debe contener solo números');
        }
    }

    // ✅ Validar formato de cédula (solo números)
    if (body.cedula) {
        const cedulaRegex = /^\d+$/;
        if (!cedulaRegex.test(body.cedula.trim())) {
            errors.push('La cédula debe contener solo números');
        }
    }

    return { ok: errors.length === 0, errors };
}

// ✅ Función para verificar duplicados
async function checkDuplicates(db, payload) {
    const col = db.collection('desarrollofullstack');
    const duplicates = [];

    // 1. Verificar cédula duplicada
    const existingCedula = await col.findOne({
        cedula: payload.cedula.trim()
    });
    if (existingCedula) {
        duplicates.push(`La cédula ${payload.cedula} ya está registrada`);
    }

    // 2. Verificar ID de estudiante duplicado (solo para estudiantes)
    if (payload.rol === 'estudiante' && payload.idEstudiante) {
        const existingId = await col.findOne({
            idEstudiante: payload.idEstudiante.trim()
        });
        if (existingId) {
            duplicates.push(`El ID de estudiante ${payload.idEstudiante} ya está registrado`);
        }
    }

    // 3. Verificar correo duplicado
    const existingEmail = await col.findOne({
        correo: payload.correo.trim().toLowerCase()
    });
    if (existingEmail) {
        duplicates.push(`El correo ${payload.correo} ya está registrado`);
    }

    return duplicates;
}

// ✅ Endpoint principal para registro
router.post('/registro', async (req, res) => {
    try {
        const payload = req.body || {};
        console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN DESARROLLOFULLSTACK');
        console.log('📥 Payload recibido:', JSON.stringify(payload, null, 2));

        // 🔹 Validación básica del payload
        const { ok, errors } = validatePayload(payload);
        if (!ok) {
            console.log('❌ Errores de validación:', errors);
            return res.status(400).json({ message: 'Validación fallida', errors });
        }

        // 🔹 Conexión segura a MongoDB
        const { db } = await connectMongo();

        // ✅ OBTENER INFORMACIÓN DE REGISTROS
        console.log('🔍 Obteniendo información de registros...');
        const infoRegistros = await obtenerInfoRegistros(db);

        if (!infoRegistros.disponible) {
            console.log('❌ Cupo agotado para Certificación Full Stack');
            return res.status(409).json({
                message: 'Cupo agotado',
                error: `Lo sentimos, no hay cupos disponibles para la Certificación Full Stack. ${infoRegistros.inscritos}/${infoRegistros.cupoMaximo} usuarios registrados.`
            });
        }

        console.log('✅ Información de registros:', infoRegistros.mensaje);

        // ✅ COLECCIÓN DESARROLLOFULLSTACK
        const col = db.collection('desarrollofullstack');
        console.log('✅ Conectado a colección: desarrollofullstack');

        // 🔹 VERIFICAR DUPLICADOS ANTES DE INSERTAR
        console.log('🔍 Verificando duplicados en la base de datos...');
        const duplicateErrors = await checkDuplicates(db, payload);

        if (duplicateErrors.length > 0) {
            console.log('❌ Se encontraron duplicados:', duplicateErrors);
            return res.status(409).json({
                message: 'Datos duplicados encontrados',
                errors: duplicateErrors
            });
        }

        console.log('✅ No se encontraron duplicados, procediendo con el registro...');

        const nowIso = new Date().toISOString();

        // 🔹 Construcción del documento a guardar
        const doc = {
            // Datos personales básicos
            nombre: payload.nombre.trim(),
            cedula: payload.cedula.trim(),
            correo: payload.correo.trim().toLowerCase(),
            telefono: payload.telefono.trim(),
            rol: payload.rol.trim(),

            // Campos específicos por rol
            ...(payload.rol === 'estudiante' && {
                idEstudiante: payload.idEstudiante.trim(),
                facultad: payload.facultad.trim(),
                programa: payload.programa.trim(),
                semestre: payload.semestre.trim()
            }),

            // Información técnica
            nivelIngles: payload.nivelIngles,
            experienciaProgramacion: payload.experienciaProgramacion,
            conocimientoSpring: payload.conocimientoSpring || 'ninguno',
            conocimientoAngular: payload.conocimientoAngular || 'ninguno',
            conocimientoAI: payload.conocimientoAI || 'ninguno',
            motivacion: payload.motivacion.trim(),
            expectativas: payload.expectativas.trim(),

            // Información de actividades
            actividades: payload.actividades || ['fullstack-certification'],
            actividad: 'fullstack-certification',

            // Metadatos del evento
            evento: 'Certificación Full Stack: Spring Boot, Angular & AI',
            tipo_evento: 'certificacion',
            horario: '8:00 pm - 10:00 pm',
            lugar: 'Salas de Sistemas 1, 2 - Sede Pance',
            sesiones: [
                '10 Nov - Backend Empresarial con Spring Boot + AI',
                '12 Nov - Frontend Empresarial con Angular + AI', 
                '14 Nov - Integración Full Stack con AI'
            ],
            certificado: 'Internacional DevSeniorCode',

            // Metadatos del sistema
            created_at: nowIso,
            updated_at: nowIso,
            estado: 'activo'
        };

        console.log('📝 Documento a guardar EN COLECCIÓN DESARROLLOFULLSTACK:', JSON.stringify(doc, null, 2));

        // 🔹 Inserción en la colección "desarrollofullstack"
        const insertRes = await col.insertOne(doc);
        const insertedId = insertRes.insertedId;

        console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN DESARROLLOFULLSTACK CON ID:', insertedId);

        // 🔹 Generar el código QR
        const qrPayload = {
            id: insertedId.toString(),
            participante: {
                nombre: payload.nombre,
                cedula: payload.cedula,
                rol: payload.rol,
                ...(payload.rol === 'estudiante' && {
                    idEstudiante: payload.idEstudiante,
                    programa: payload.programa
                })
            },
            certificacion: {
                nombre: 'Full Stack: Spring Boot, Angular & AI',
                nivelIngles: payload.nivelIngles,
                experiencia: payload.experienciaProgramacion
            },
            actividad: 'Certificación Full Stack',
            evento: 'Certificación Full Stack: Spring Boot, Angular & AI',
            horario: '8:00 pm - 10:00 pm (10, 12, 14 Nov)',
            lugar: 'Salas de Sistemas 1, 2 - Sede Pance',
            emitido: nowIso
        };

        const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), {
            errorCorrectionLevel: 'M',
            width: 300,
            margin: 2
        });

        // 🔹 ACTUALIZAR EL DOCUMENTO CON EL QR
        await col.updateOne(
            { _id: insertedId },
            {
                $set: {
                    qr_data: qrPayload,
                    qr_generated_at: nowIso,
                    qr_image: qrDataUrl
                }
            }
        );

        console.log('✅ QR guardado en la base de datos');

        // 🔹 ENVÍO DE CORREO ELECTRÓNICO
        let emailEnviado = false;
        try {
            console.log("📧 Preparando envío de correo de confirmación...");

            // Preparar datos para el correo
            const datosCorreo = {
                nombre: payload.nombre.trim(),
                cedula: payload.cedula.trim(),
                correo: payload.correo.trim().toLowerCase(),
                telefono: payload.telefono.trim(),
                rol: payload.rol.trim(),
                idEstudiante: payload.idEstudiante?.trim(),
                facultad: payload.facultad?.trim(),
                programa: payload.programa?.trim(),
                semestre: payload.semestre?.trim(),
                nivelIngles: payload.nivelIngles,
                experienciaProgramacion: payload.experienciaProgramacion,
                conocimientoSpring: payload.conocimientoSpring,
                conocimientoAngular: payload.conocimientoAngular,
                conocimientoAI: payload.conocimientoAI,
                motivacion: payload.motivacion.trim(),
                expectativas: payload.expectativas.trim(),
                // QR con múltiples nombres para compatibilidad
                qr: qrDataUrl,
                qr_image: qrDataUrl,
                qrDataUrl: qrDataUrl
            };

            // 🔍 VERIFICACIÓN DE DATOS ANTES DE ENVIAR
            console.log("🔍 VERIFICACIÓN QR ANTES DE ENVIAR CORREO:");
            console.log("QR Data URL length:", qrDataUrl.length);
            console.log("QR starts with data:image:", qrDataUrl.startsWith('data:image'));
            console.log("Datos correo QR property:", !!datosCorreo.qr);
            console.log("Datos correo QR_IMAGE property:", !!datosCorreo.qr_image);
            console.log("Datos correo QRDataUrl property:", !!datosCorreo.qrDataUrl);

            console.log("📨 Datos para el correo:", JSON.stringify({
                ...datosCorreo,
                qr: datosCorreo.qr ? `[QR_DATA_LENGTH: ${datosCorreo.qr.length}]` : 'NO_QR',
                qr_image: datosCorreo.qr_image ? `[QR_IMAGE_LENGTH: ${datosCorreo.qr_image.length}]` : 'NO_QR_IMAGE',
                qrDataUrl: datosCorreo.qrDataUrl ? `[QR_DATA_URL_LENGTH: ${datosCorreo.qrDataUrl.length}]` : 'NO_QR_DATA_URL'
            }, null, 2));

            // Enviar correo
            await enviarCorreoRegistro(datosCorreo, 'desarrollofullstack');
            emailEnviado = true;
            console.log("✅ Correo de Certificación Full Stack enviado exitosamente a:", payload.correo);
        } catch (emailError) {
            console.error("❌ Error al enviar correo:", emailError);
            // No retornamos error aquí, solo logueamos para no afectar el registro
        }

        // 🔹 Obtener información actualizada después del registro
        const infoActualizada = await obtenerInfoRegistros(db);

        // 🔹 Respuesta exitosa
        const response = {
            message: 'Inscripción a Certificación Full Stack registrada correctamente',
            id: insertedId,
            qr: qrDataUrl,
            qrData: qrPayload,
            emailEnviado: emailEnviado,
            infoRegistros: {
                inscritos: infoActualizada.inscritos,
                cupoMaximo: infoActualizada.cupoMaximo,
                mensaje: infoActualizada.mensaje
            },
            participante: {
                nombre: payload.nombre,
                rol: payload.rol,
                ...(payload.rol === 'estudiante' && {
                    idEstudiante: payload.idEstudiante,
                    programa: payload.programa,
                    semestre: payload.semestre
                })
            },
            certificacion: {
                nombre: 'Full Stack: Spring Boot, Angular & AI',
                sesiones: 3,
                certificado: 'Internacional DevSeniorCode'
            },
            cupo: {
                disponibles: infoActualizada.cuposDisponibles,
                maximo: infoActualizada.cupoMaximo
            },
            coleccion: 'desarrollofullstack',
            confirmacion: 'DATOS GUARDADOS EN COLECCIÓN DESARROLLOFULLSTACK'
        };

        console.log('✅ Respuesta exitosa:', JSON.stringify(response, null, 2));
        return res.status(201).json(response);
    } catch (err) {
        console.error('❌ Error en /desarrollofullstack/registro:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para verificar disponibilidad de datos
router.post('/verificar-disponibilidad', async (req, res) => {
    try {
        const { cedula, idEstudiante, correo } = req.body;
        const { db } = await connectMongo();
        const col = db.collection('desarrollofullstack');

        console.log('🔍 Verificando disponibilidad de datos para Full Stack:', { cedula, idEstudiante, correo });

        // 🔹 Obtener información actual de registros
        const infoRegistros = await obtenerInfoRegistros(db);

        const disponibilidad = {
            cedula: true,
            idEstudiante: true,
            correo: true,
            mensajes: []
        };

        // Verificar cédula
        if (cedula) {
            const existingCedula = await col.findOne({ cedula: cedula.trim() });
            if (existingCedula) {
                disponibilidad.cedula = false;
                disponibilidad.mensajes.push('La cédula ya está registrada');
            }
        }

        // Verificar ID de estudiante
        if (idEstudiante) {
            const existingId = await col.findOne({ idEstudiante: idEstudiante.trim() });
            if (existingId) {
                disponibilidad.idEstudiante = false;
                disponibilidad.mensajes.push('El ID de estudiante ya está registrado');
            }
        }

        // Verificar correo
        if (correo) {
            const existingEmail = await col.findOne({ correo: correo.trim().toLowerCase() });
            if (existingEmail) {
                disponibilidad.correo = false;
                disponibilidad.mensajes.push('El correo electrónico ya está registrado');
            }
        }

        console.log('✅ Resultado de disponibilidad:', disponibilidad);
        return res.json({
            message: 'Verificación de disponibilidad completada',
            disponibilidad,
            todosDisponibles: disponibilidad.cedula && disponibilidad.idEstudiante && disponibilidad.correo,
            infoRegistros: {
                inscritos: infoRegistros.inscritos,
                cupoMaximo: infoRegistros.cupoMaximo,
                mensaje: infoRegistros.mensaje,
                disponible: infoRegistros.disponible
            }
        });
    } catch (err) {
        console.error('❌ Error en /desarrollofullstack/verificar-disponibilidad:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para obtener información de registros (sin verificar disponibilidad)
router.get("/estado-registros", async (req, res) => {
    try {
        const { db } = await connectMongo();
        const infoRegistros = await obtenerInfoRegistros(db);

        return res.json({
            success: true,
            data: {
                inscritos: infoRegistros.inscritos,
                cupoMaximo: infoRegistros.cupoMaximo,
                mensaje: infoRegistros.mensaje,
                disponible: infoRegistros.disponible
            }
        });

    } catch (err) {
        console.error("❌ Error en /desarrollofullstack/estado-registros:", err);
        return res.status(500).json({
            success: false,
            message: "Error obteniendo información de registros",
            error: err.message
        });
    }
});

// ✅ Endpoint para listar inscripciones
router.get('/listar', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('desarrollofullstack');

        console.log('📋 Listando inscripciones de la colección: desarrollofullstack');

        const inscripciones = await col.find({})
            .sort({ created_at: -1 })
            .limit(30)
            .toArray();

        console.log(`✅ Encontradas ${inscripciones.length} inscripciones`);

        return res.json({
            message: 'Inscripciones a Certificación Full Stack encontradas',
            total: inscripciones.length,
            coleccion: 'desarrollofullstack',
            inscripciones: inscripciones.map(insc => ({
                id: insc._id,
                nombre: insc.nombre,
                cedula: insc.cedula,
                correo: insc.correo,
                telefono: insc.telefono,
                rol: insc.rol,
                idEstudiante: insc.idEstudiante,
                facultad: insc.facultad,
                programa: insc.programa,
                semestre: insc.semestre,
                nivelIngles: insc.nivelIngles,
                experienciaProgramacion: insc.experienciaProgramacion,
                conocimientoSpring: insc.conocimientoSpring,
                conocimientoAngular: insc.conocimientoAngular,
                conocimientoAI: insc.conocimientoAI,
                motivacion: insc.motivacion,
                expectativas: insc.expectativas,
                evento: insc.evento,
                created_at: insc.created_at
            }))
        });
    } catch (err) {
        console.error('❌ Error en /desarrollofullstack/listar:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para buscar inscripción
router.get('/buscar/:documento', async (req, res) => {
    try {
        const { documento } = req.params;
        const { db } = await connectMongo();
        const col = db.collection('desarrollofullstack');

        console.log(`🔍 Buscando inscripción: ${documento}`);

        const inscripcion = await col.findOne({
            $or: [
                { cedula: documento },
                { correo: documento },
                { idEstudiante: documento }
            ]
        });

        if (!inscripcion) {
            return res.status(404).json({
                message: 'No se encontró inscripción con esa cédula, email o ID de estudiante'
            });
        }

        return res.json({
            message: 'Inscripción encontrada',
            inscripcion: {
                id: inscripcion._id,
                nombre: inscripcion.nombre,
                cedula: inscripcion.cedula,
                correo: inscripcion.correo,
                telefono: inscripcion.telefono,
                rol: inscripcion.rol,
                idEstudiante: inscripcion.idEstudiante,
                facultad: inscripcion.facultad,
                programa: inscripcion.programa,
                semestre: inscripcion.semestre,
                nivelIngles: inscripcion.nivelIngles,
                experienciaProgramacion: inscripcion.experienciaProgramacion,
                conocimientoSpring: inscripcion.conocimientoSpring,
                conocimientoAngular: inscripcion.conocimientoAngular,
                conocimientoAI: inscripcion.conocimientoAI,
                motivacion: inscripcion.motivacion,
                expectativas: inscripcion.expectativas,
                evento: inscripcion.evento,
                created_at: inscripcion.created_at
            }
        });
    } catch (err) {
        console.error('❌ Error en /desarrollofullstack/buscar:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

export default router;