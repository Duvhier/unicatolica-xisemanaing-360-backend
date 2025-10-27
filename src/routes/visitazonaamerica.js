// routes/visitazonaamerica.js
import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from '../controllers/emailController.js';

const router = Router();

// ✅ Función para verificar disponibilidad de cupos
async function verificarCupos(db) {
    try {
        const actividadesCol = db.collection('actividades');
        const actividad = await actividadesCol.findOne({
            coleccion: 'visitazonaamerica'
        });

        if (!actividad) {
            return { 
                disponible: true, 
                mensaje: 'Actividad no configurada',
                cupoMaximo: 40 // Cupo por defecto
            };
        }

        const inscritosCol = db.collection('visitazonaamerica');
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
        return { 
            disponible: true, 
            mensaje: 'Error verificando cupos',
            cupoMaximo: 40
        };
    }
}

// ✅ Validación de campos
function validatePayload(body) {
    const errors = [];

    // Campos básicos requeridos para todos
    const requiredFields = [
        'nombre', 
        'tipoDocumento', 
        'numeroDocumento', 
        'correo', 
        'telefono', 
        'perfil'
    ];

    for (const field of requiredFields) {
        if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
            errors.push(`Campo requerido o inválido: ${field}`);
        }
    }

    // ✅ Validar tipo de documento
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

    // ✅ Validar perfil
    const perfilesValidos = ['Estudiante', 'Docente', 'Administrativo'];
    if (body.perfil && !perfilesValidos.includes(body.perfil)) {
        errors.push('Perfil no válido');
    }

    // ✅ Validaciones específicas por perfil
    if (body.perfil === 'Estudiante') {
        if (!body.id || !body.id.trim()) {
            errors.push('ID de estudiante es requerido');
        }
        if (!body.programa || !body.programa.trim()) {
            errors.push('Programa académico es requerido para estudiantes');
        }
        
        // Validar programa académico
        const programasValidos = [
            'Ingeniería de Sistemas',
            'Tecnología en Desarrollo de Software'
        ];
        if (body.programa && !programasValidos.includes(body.programa)) {
            errors.push('Programa académico no válido');
        }
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

    return { ok: errors.length === 0, errors };
}

// ✅ Función para verificar duplicados
async function checkDuplicates(db, payload) {
    const col = db.collection('visitazonaamerica');
    const duplicates = [];

    // 1. Verificar número de documento duplicado
    const existingDocumento = await col.findOne({
        numeroDocumento: payload.numeroDocumento.trim()
    });
    if (existingDocumento) {
        duplicates.push(`El número de documento ${payload.numeroDocumento} ya está registrado`);
    }

    // 2. Verificar ID de estudiante duplicado (solo para estudiantes)
    if (payload.perfil === 'Estudiante' && payload.id) {
        const existingId = await col.findOne({
            id: payload.id.trim()
        });
        if (existingId) {
            duplicates.push(`El ID de estudiante ${payload.id} ya está registrado`);
        }
    }

    // 3. Verificar correo duplicado
    const existingEmail = await col.findOne({
        correo: payload.correo.trim()
    });
    if (existingEmail) {
        duplicates.push(`El correo ${payload.correo} ya está registrado`);
    }

    // 4. Verificar placa de vehículo duplicada (si se proporciona)
    if (payload.placasVehiculo && payload.placasVehiculo.trim()) {
        const existingPlaca = await col.findOne({
            placasVehiculo: payload.placasVehiculo.trim()
        });
        if (existingPlaca) {
            duplicates.push(`La placa de vehículo ${payload.placasVehiculo} ya está registrada`);
        }
    }

    return duplicates;
}

// ✅ Endpoint principal para registro
router.post('/registro', async (req, res) => {
    try {
        const payload = req.body || {};
        console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN VISITAZONAAMERICA');
        console.log('📥 Payload recibido:', JSON.stringify(payload, null, 2));

        // 🔹 Validación básica del payload
        const { ok, errors } = validatePayload(payload);
        if (!ok) {
            console.log('❌ Errores de validación:', errors);
            return res.status(400).json({ message: 'Validación fallida', errors });
        }

        // 🔹 Conexión segura a MongoDB
        const { db } = await connectMongo();

        // ✅ VERIFICAR CUPOS DISPONIBLES ANTES DE CONTINUAR
        console.log('🔍 Verificando cupos disponibles...');
        const estadoCupos = await verificarCupos(db);

        if (!estadoCupos.disponible) {
            console.log('❌ Cupo agotado para Visita Zona América');
            return res.status(409).json({
                message: 'Cupo agotado',
                error: `Lo sentimos, no hay cupos disponibles para Visita Zona América. ${estadoCupos.inscritos}/${estadoCupos.cupoMaximo} inscritos.`
            });
        }

        console.log('✅ Cupos disponibles:', estadoCupos.cuposDisponibles);

        // ✅ COLECCIÓN VISITAZONAAMERICA
        const col = db.collection('visitazonaamerica');
        console.log('✅ Conectado a colección: visitazonaamerica');

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
            tipoDocumento: payload.tipoDocumento.trim(),
            numeroDocumento: payload.numeroDocumento.trim(),
            correo: payload.correo.trim().toLowerCase(),
            telefono: payload.telefono.trim(),
            perfil: payload.perfil.trim(),

            // Campos específicos por perfil
            ...(payload.perfil === 'Estudiante' && {
                id: payload.id.trim(),
                programa: payload.programa.trim()
            }),

            // Campos opcionales
            ...(payload.eps && { eps: payload.eps.trim() }),
            ...(payload.placasVehiculo && { placasVehiculo: payload.placasVehiculo.trim() }),

            // Metadatos del evento
            evento: 'Visita Zona América',
            actividad: 'visita-zona-america',
            horario: '10:00 am a 11:30 am',
            lugar: 'Zona América',
            
            // Metadatos del sistema
            created_at: nowIso,
            updated_at: nowIso,
            estado: 'activo'
        };

        console.log('📝 Documento a guardar EN COLECCIÓN VISITAZONAAMERICA:', JSON.stringify(doc, null, 2));

        // 🔹 Inserción en la colección "visitazonaamerica"
        const insertRes = await col.insertOne(doc);
        const insertedId = insertRes.insertedId;

        console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN VISITAZONAAMERICA CON ID:', insertedId);

        // 🔹 Generar el código QR
        const qrPayload = {
            id: insertedId.toString(),
            participante: {
                nombre: payload.nombre,
                tipoDocumento: payload.tipoDocumento,
                numeroDocumento: payload.numeroDocumento,
                perfil: payload.perfil,
                ...(payload.perfil === 'Estudiante' && {
                    idEstudiante: payload.id,
                    programa: payload.programa
                })
            },
            actividad: 'Visita Zona América',
            evento: 'Visita Zona América',
            horario: '10:00 am a 11:30 am',
            lugar: 'Zona América',
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
                tipoDocumento: payload.tipoDocumento.trim(),
                numeroDocumento: payload.numeroDocumento.trim(),
                correo: payload.correo.trim().toLowerCase(),
                telefono: payload.telefono.trim(),
                perfil: payload.perfil.trim(),
                idEstudiante: payload.id?.trim(),
                programa: payload.programa?.trim(),
                eps: payload.eps?.trim(),
                placasVehiculo: payload.placasVehiculo?.trim(),
                qr_image: qrDataUrl
            };

            console.log("📨 Datos para el correo:", JSON.stringify(datosCorreo, null, 2));
            
            // Enviar correo
            await enviarCorreoRegistro(datosCorreo, 'visitazonaamerica');
            emailEnviado = true;
            console.log("✅ Correo de Visita Zona América enviado exitosamente a:", payload.correo);
        } catch (emailError) {
            console.error("❌ Error al enviar correo:", emailError);
            // No retornamos error aquí, solo logueamos para no afectar el registro
        }

        // 🔹 Respuesta exitosa
        const response = {
            message: 'Inscripción a Visita Zona América registrada correctamente',
            id: insertedId,
            qr: qrDataUrl,
            qrData: qrPayload,
            emailEnviado: emailEnviado,
            participante: {
                nombre: payload.nombre,
                perfil: payload.perfil,
                ...(payload.perfil === 'Estudiante' && {
                    idEstudiante: payload.id,
                    programa: payload.programa
                })
            },
            cupo: {
                disponibles: estadoCupos.cuposDisponibles - 1,
                maximo: estadoCupos.cupoMaximo
            },
            coleccion: 'visitazonaamerica',
            confirmacion: 'DATOS GUARDADOS EN COLECCIÓN VISITAZONAAMERICA'
        };

        console.log('✅ Respuesta exitosa:', JSON.stringify(response, null, 2));
        return res.status(201).json(response);
    } catch (err) {
        console.error('❌ Error en /visitazonaamerica/registro:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para verificar disponibilidad de datos
router.post('/verificar-disponibilidad', async (req, res) => {
    try {
        const { numeroDocumento, idEstudiante, correo, placasVehiculo } = req.body;
        const { db } = await connectMongo();
        const col = db.collection('visitazonaamerica');

        console.log('🔍 Verificando disponibilidad de datos:', { numeroDocumento, idEstudiante, correo, placasVehiculo });

        const disponibilidad = {
            numeroDocumento: true,
            idEstudiante: true,
            correo: true,
            placasVehiculo: true,
            mensajes: []
        };

        // Verificar número de documento
        if (numeroDocumento) {
            const existingDocumento = await col.findOne({ numeroDocumento: numeroDocumento.trim() });
            if (existingDocumento) {
                disponibilidad.numeroDocumento = false;
                disponibilidad.mensajes.push('El número de documento ya está registrado');
            }
        }

        // Verificar ID de estudiante
        if (idEstudiante) {
            const existingId = await col.findOne({ id: idEstudiante.trim() });
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

        // Verificar placa de vehículo
        if (placasVehiculo) {
            const existingPlaca = await col.findOne({ placasVehiculo: placasVehiculo.trim() });
            if (existingPlaca) {
                disponibilidad.placasVehiculo = false;
                disponibilidad.mensajes.push('La placa de vehículo ya está registrada');
            }
        }

        console.log('✅ Resultado de disponibilidad:', disponibilidad);
        return res.json({
            message: 'Verificación de disponibilidad completada',
            disponibilidad,
            todosDisponibles: disponibilidad.numeroDocumento && disponibilidad.idEstudiante && disponibilidad.correo && disponibilidad.placasVehiculo
        });
    } catch (err) {
        console.error('❌ Error en /visitazonaamerica/verificar-disponibilidad:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para verificar cupos disponibles
router.get('/cupos', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const estadoCupos = await verificarCupos(db);

        return res.json({
            message: 'Estado de cupos obtenido correctamente',
            cupos: estadoCupos
        });
    } catch (err) {
        console.error('❌ Error en /visitazonaamerica/cupos:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para listar inscripciones
router.get('/listar', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('visitazonaamerica');

        console.log('📋 Listando inscripciones de la colección: visitazonaamerica');

        const inscripciones = await col.find({})
            .sort({ created_at: -1 })
            .limit(40)
            .toArray();

        console.log(`✅ Encontradas ${inscripciones.length} inscripciones`);

        return res.json({
            message: 'Inscripciones a Visita Zona América encontradas',
            total: inscripciones.length,
            coleccion: 'visitazonaamerica',
            inscripciones: inscripciones.map(insc => ({
                id: insc._id,
                nombre: insc.nombre,
                tipoDocumento: insc.tipoDocumento,
                numeroDocumento: insc.numeroDocumento,
                correo: insc.correo,
                telefono: insc.telefono,
                perfil: insc.perfil,
                idEstudiante: insc.id,
                programa: insc.programa,
                eps: insc.eps,
                placasVehiculo: insc.placasVehiculo,
                evento: insc.evento,
                created_at: insc.created_at
            }))
        });
    } catch (err) {
        console.error('❌ Error en /visitazonaamerica/listar:', err);
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
        const col = db.collection('visitazonaamerica');

        console.log(`🔍 Buscando inscripción: ${documento}`);

        const inscripcion = await col.findOne({
            $or: [
                { numeroDocumento: documento },
                { correo: documento },
                { id: documento }
            ]
        });

        if (!inscripcion) {
            return res.status(404).json({
                message: 'No se encontró inscripción con ese documento, email o ID de estudiante'
            });
        }

        return res.json({
            message: 'Inscripción encontrada',
            inscripcion: {
                id: inscripcion._id,
                nombre: inscripcion.nombre,
                tipoDocumento: inscripcion.tipoDocumento,
                numeroDocumento: inscripcion.numeroDocumento,
                correo: inscripcion.correo,
                telefono: inscripcion.telefono,
                perfil: inscripcion.perfil,
                idEstudiante: inscripcion.id,
                programa: inscripcion.programa,
                eps: inscripcion.eps,
                placasVehiculo: inscripcion.placasVehiculo,
                evento: inscripcion.evento,
                created_at: inscripcion.created_at
            }
        });
    } catch (err) {
        console.error('❌ Error en /visitazonaamerica/buscar:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

export default router;