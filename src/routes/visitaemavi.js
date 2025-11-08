// routes/visitaemavi.js
import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from '../controllers/emailController.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = Router();

// ✅ Obtener ruta del directorio actual (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Función para obtener información de registros
async function obtenerInfoRegistros(db) {
    try {
        const actividadesCol = db.collection('actividades');
        const actividad = await actividadesCol.findOne({
            coleccion: 'visitaemavi'
        });

        if (!actividad) {
            return {
                disponible: true,
                mensaje: 'Actividad no configurada - Usando cupo por defecto',
                inscritos: 0,
                cupoMaximo: 40 // Cupo por defecto
            };
        }

        const inscritosCol = db.collection('visitaemavi');
        const totalInscritos = await inscritosCol.countDocuments({});

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
            mensaje: 'Error obteniendo información - Usando valores por defecto',
            inscritos: 0,
            cupoMaximo: 40
        };
    }
}

// ✅ Función para cargar programas académicos desde JSON - IGUAL A ZONA AMÉRICA
async function cargarProgramasAcademicos() {
    try {
        const fs = await import('fs/promises');
        
        // 🔹 MÚLTIPLES RUTAS POSIBLES para encontrar el archivo
        const posiblesRutas = [
            join(__dirname, '..', 'public', 'facultadesyprogramasacademicos.json'),
            join(process.cwd(), 'public', 'facultadesyprogramasacademicos.json'),
            join(process.cwd(), 'src', 'public', 'facultadesyprogramasacademicos.json'),
            join(process.cwd(), 'facultadesyprogramasacademicos.json')
        ];

        let fileContent = null;
        let rutaUsada = null;

        // Intentar cada ruta posible
        for (const ruta of posiblesRutas) {
            try {
                fileContent = await fs.readFile(ruta, 'utf8');
                rutaUsada = ruta;
                console.log(`✅ Archivo JSON encontrado en: ${ruta}`);
                break;
            } catch (error) {
                console.log(`❌ No se encontró en: ${ruta}`);
                continue;
            }
        }

        if (!fileContent) {
            throw new Error('No se pudo encontrar el archivo JSON en ninguna ruta');
        }

        const jsonData = JSON.parse(fileContent);
        
        if (jsonData.facultades && Array.isArray(jsonData.facultades)) {
            const todosLosProgramas = [];
            jsonData.facultades.forEach((facultad) => {
                if (facultad.programas && Array.isArray(facultad.programas)) {
                    todosLosProgramas.push(...facultad.programas);
                }
            });
            
            console.log(`✅ Cargados ${todosLosProgramas.length} programas académicos desde: ${rutaUsada}`);
            return todosLosProgramas;
        }
        
        return [];
    } catch (error) {
        console.error('❌ Error cargando programas académicos:', error);
        
        // 🔹 Datos de respaldo en caso de error
        const programasRespaldo = [
            { id: "1", nombre: "Ingeniería de Sistemas", facultad: "Facultad de Ingeniería" },
            { id: "2", nombre: "Ingeniería Informática", facultad: "Facultad de Ingeniería" },
            { id: "3", nombre: "Ingeniería Industrial", facultad: "Facultad de Ingeniería" },
            { id: "4", nombre: "Administración de Empresas", facultad: "Facultad de Ciencias Administrativas" },
            { id: "5", nombre: "Contaduría Pública", facultad: "Facultad de Ciencias Administrativas" },
            { id: "6", nombre: "Psicología", facultad: "Facultad de Ciencias Humanas y Sociales" },
            { id: "7", nombre: "Derecho", facultad: "Facultad de Derecho" },
            { id: "8", nombre: "Comunicación Social", facultad: "Facultad de Comunicación" }
        ];
        
        console.log('⚠️ Usando datos de respaldo para programas académicos');
        return programasRespaldo;
    }
}

// ✅ Función para validar programa académico
async function validarProgramaAcademico(programaNombre) {
    try {
        const programas = await cargarProgramasAcademicos();
        return programas.some(programa => programa.nombre === programaNombre);
    } catch (error) {
        console.error('❌ Error validando programa académico:', error);
        return false;
    }
}

// ✅ Validación de campos
async function validatePayload(body) {
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
        } else {
            // ✅ NUEVO: Validar programa académico contra la lista dinámica
            const programaValido = await validarProgramaAcademico(body.programa.trim());
            if (!programaValido) {
                const programas = await cargarProgramasAcademicos();
                const programasNombres = programas.map(p => p.nombre);
                errors.push(`Programa académico no válido. Programas válidos: ${programasNombres.slice(0, 5).join(', ')}...`);
            }
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
    const col = db.collection('visitaemavi');
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

// ✅ Endpoint para obtener programas académicos (NUEVO)
router.get('/programas-academicos', async (req, res) => {
    try {
        console.log('📚 Solicitando lista de programas académicos para EMAVI');
        
        const programas = await cargarProgramasAcademicos();
        
        console.log(`✅ Enviando ${programas.length} programas académicos para EMAVI`);
        
        return res.json({
            success: true,
            data: {
                programas: programas,
                total: programas.length,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo programas académicos para EMAVI:', error);
        return res.status(500).json({
            success: false,
            message: 'Error obteniendo programas académicos',
            error: error.message
        });
    }
});

// ✅ Endpoint principal para registro
router.post('/registro', async (req, res) => {
    try {
        const payload = req.body || {};
        console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN VISITAEMAVI');
        console.log('📥 Payload recibido:', JSON.stringify(payload, null, 2));

        // 🔹 Validación básica del payload
        const { ok, errors } = await validatePayload(payload);
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
            console.log('❌ Cupo agotado para Visita EMAVI');
            return res.status(409).json({
                message: 'Cupo agotado',
                error: `Lo sentimos, no hay cupos disponibles para Visita EMAVI. ${infoRegistros.inscritos}/${infoRegistros.cupoMaximo} usuarios registrados.`
            });
        }

        console.log('✅ Información de registros:', infoRegistros.mensaje);

        // ✅ COLECCIÓN VISITAEMAVI
        const col = db.collection('visitaemavi');
        console.log('✅ Conectado a colección: visitaemavi');

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

        // 🔹 Obtener información adicional del programa académico si es estudiante
        let programaInfo = null;
        if (payload.perfil === 'Estudiante' && payload.programa) {
            const programas = await cargarProgramasAcademicos();
            programaInfo = programas.find(p => p.nombre === payload.programa.trim());
            console.log('📚 Información del programa académico para EMAVI:', programaInfo);
        }

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
                programa: payload.programa.trim(),
                // ✅ NUEVO: Guardar información adicional del programa
                programaInfo: programaInfo || {
                    nombre: payload.programa.trim(),
                    facultad: 'No especificada',
                    nivel: 'No especificado'
                }
            }),

            // Campos opcionales
            ...(payload.eps && { eps: payload.eps.trim() }),
            ...(payload.placasVehiculo && { placasVehiculo: payload.placasVehiculo.trim() }),

            // Metadatos del evento
            evento: 'Visita EMAVI',
            actividad: 'visita-emavi',
            horario: '9:00 am a 12:00 pm',
            lugar: 'Escuela Militar de Aviación (EMAVI)',

            // Metadatos del sistema
            created_at: nowIso,
            updated_at: nowIso,
            estado: 'activo'
        };

        console.log('📝 Documento a guardar EN COLECCIÓN VISITAEMAVI:', JSON.stringify(doc, null, 2));

        // 🔹 Inserción en la colección "visitaemavi"
        const insertRes = await col.insertOne(doc);
        const insertedId = insertRes.insertedId;

        console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN VISITAEMAVI CON ID:', insertedId);

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
                    programa: payload.programa,
                    programaInfo: programaInfo
                })
            },
            actividad: 'Visita EMAVI',
            evento: 'Visita EMAVI',
            horario: '9:00 am a 12:00 pm',
            lugar: 'Escuela Militar de Aviación (EMAVI)',
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
                programaInfo: programaInfo, // ✅ NUEVO: Información del programa
                eps: payload.eps?.trim(),
                placasVehiculo: payload.placasVehiculo?.trim(),
                // QR con múltiples nombres para compatibilidad
                qr: qrDataUrl,
                qr_image: qrDataUrl,
                qrDataUrl: qrDataUrl
            };

            console.log("📨 Datos para el correo de EMAVI preparados");

            // Enviar correo
            await enviarCorreoRegistro(datosCorreo, 'visitaemavi');
            emailEnviado = true;
            console.log("✅ Correo de Visita EMAVI enviado exitosamente a:", payload.correo);
        } catch (emailError) {
            console.error("❌ Error al enviar correo:", emailError);
            // No retornamos error aquí, solo logueamos para no afectar el registro
        }

        // 🔹 Obtener información actualizada después del registro
        const infoActualizada = await obtenerInfoRegistros(db);

        // 🔹 Respuesta exitosa
        const response = {
            message: 'Inscripción a Visita EMAVI registrada correctamente',
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
                perfil: payload.perfil,
                ...(payload.perfil === 'Estudiante' && {
                    idEstudiante: payload.id,
                    programa: payload.programa,
                    programaInfo: programaInfo // ✅ NUEVO
                })
            },
            cupo: {
                disponibles: infoActualizada.cuposDisponibles,
                maximo: infoActualizada.cupoMaximo
            },
            coleccion: 'visitaemavi',
            confirmacion: 'DATOS GUARDADOS EN COLECCIÓN VISITAEMAVI'
        };

        console.log('✅ Respuesta exitosa para EMAVI');
        return res.status(201).json(response);
    } catch (err) {
        console.error('❌ Error en /visitaemavi/registro:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para CONFIGURAR la actividad (NUEVO)
router.post('/configurar', async (req, res) => {
    try {
        const { cupoMaximo } = req.body;
        const { db } = await connectMongo();
        
        if (!cupoMaximo || cupoMaximo < 1) {
            return res.status(400).json({
                message: 'El cupo máximo debe ser un número mayor a 0'
            });
        }

        const actividadesCol = db.collection('actividades');
        
        // Configurar o actualizar la actividad
        const resultado = await actividadesCol.updateOne(
            { coleccion: 'visitaemavi' },
            { 
                $set: { 
                    coleccion: 'visitaemavi',
                    cupoMaximo: parseInt(cupoMaximo),
                    nombre: 'Visita Empresarial EMAVI',
                    updated_at: new Date().toISOString()
                } 
            },
            { upsert: true }
        );

        // Obtener información actualizada
        const infoRegistros = await obtenerInfoRegistros(db);

        return res.json({
            message: 'Actividad EMAVI configurada correctamente',
            configuracion: {
                cupoMaximo: parseInt(cupoMaximo),
                inscritos: infoRegistros.inscritos,
                disponibles: infoRegistros.cuposDisponibles
            },
            resultado: {
                matched: resultado.matchedCount,
                modified: resultado.modifiedCount,
                upserted: resultado.upsertedId ? true : false
            }
        });

    } catch (err) {
        console.error('❌ Error en /visitaemavi/configurar:', err);
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
        const col = db.collection('visitaemavi');

        console.log('🔍 Verificando disponibilidad de datos para EMAVI:', { numeroDocumento, idEstudiante, correo, placasVehiculo });

        // 🔹 Obtener información actual de registros
        const infoRegistros = await obtenerInfoRegistros(db);

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

        console.log('✅ Resultado de disponibilidad para EMAVI:', disponibilidad);
        return res.json({
            message: 'Verificación de disponibilidad completada',
            disponibilidad,
            todosDisponibles: disponibilidad.numeroDocumento && disponibilidad.idEstudiante && disponibilidad.correo && disponibilidad.placasVehiculo,
            infoRegistros: {
                inscritos: infoRegistros.inscritos,
                cupoMaximo: infoRegistros.cupoMaximo,
                mensaje: infoRegistros.mensaje,
                disponible: infoRegistros.disponible
            }
        });
    } catch (err) {
        console.error('❌ Error en /visitaemavi/verificar-disponibilidad:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para obtener información de registros
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
                disponible: infoRegistros.disponible,
                actividad: 'Visita Empresarial EMAVI'
            }
        });

    } catch (err) {
        console.error("❌ Error en /visitaemavi/estado-registros:", err);
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
        const col = db.collection('visitaemavi');

        console.log('📋 Listando inscripciones de la colección: visitaemavi');

        const inscripciones = await col.find({})
            .sort({ created_at: -1 })
            .limit(40)
            .toArray();

        console.log(`✅ Encontradas ${inscripciones.length} inscripciones para EMAVI`);

        return res.json({
            message: 'Inscripciones a Visita EMAVI encontradas',
            total: inscripciones.length,
            coleccion: 'visitaemavi',
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
                programaInfo: insc.programaInfo, // ✅ NUEVO
                eps: insc.eps,
                placasVehiculo: insc.placasVehiculo,
                evento: insc.evento,
                horario: insc.horario,
                lugar: insc.lugar,
                created_at: insc.created_at
            }))
        });
    } catch (err) {
        console.error('❌ Error en /visitaemavi/listar:', err);
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
        const col = db.collection('visitaemavi');

        console.log(`🔍 Buscando inscripción en EMAVI: ${documento}`);

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
            message: 'Inscripción encontrada en EMAVI',
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
                programaInfo: inscripcion.programaInfo, // ✅ NUEVO
                eps: inscripcion.eps,
                placasVehiculo: inscripcion.placasVehiculo,
                evento: inscripcion.evento,
                horario: inscripcion.horario,
                lugar: inscripcion.lugar,
                created_at: inscripcion.created_at
            }
        });
    } catch (err) {
        console.error('❌ Error en /visitaemavi/buscar:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

export default router;