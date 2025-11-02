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
            coleccion: 'doblalumen'
        });

        if (!actividad) {
            return {
                disponible: true,
                mensaje: 'Actividad no configurada',
                inscritos: 0,
                cupoMaximo: 0
            };
        }

        const inscritosCol = db.collection('doblalumen');
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
            cupoMaximo: 0
        };
    }
}

// ✅ Validación de campos ACTUALIZADA - Incluye validación del ID
function validatePayload(body) {
    const errors = [];

    // Campos básicos requeridos para todos
    const basicRequired = ['nombre', 'cedula', 'correo', 'telefono', 'rol'];

    for (const key of basicRequired) {
        if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
            errors.push(`Campo requerido o inválido: ${key}`);
        }
    }

    // ✅ NUEVO: Validar ID para estudiantes
    if (body.rol === 'estudiante') {
        if (!body.id || typeof body.id !== 'string' || !body.id.trim()) {
            errors.push('ID de estudiante es requerido');
        }
    }

    // Validar campos específicos por rol
    if (body.rol === 'estudiante') {
        if (!body.tipoEstudiante || !body.tipoEstudiante.trim()) {
            errors.push('Tipo de estudiante es requerido');
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

        // Solo validar campos de equipo si es PARTICIPANTE
        if (body.tipoEstudiante === 'participante') {
            if (!body.grupo || !body.grupo.nombre || !body.grupo.nombre.trim()) {
                errors.push('Nombre del equipo es requerido para participantes');
            }
            if (!body.grupo || !body.grupo.proyecto || !body.grupo.proyecto.nombre || !body.grupo.proyecto.nombre.trim()) {
                errors.push('Nombre del proyecto es requerido para participantes');
            }
            if (!body.grupo || !body.grupo.proyecto || !body.grupo.proyecto.descripcion || !body.grupo.proyecto.descripcion.trim()) {
                errors.push('Descripción del proyecto es requerida para participantes');
            }
            if (!body.grupo || !body.grupo.proyecto || !body.grupo.proyecto.categoria || !body.grupo.proyecto.categoria.trim()) {
                errors.push('Categoría de participación es requerida para participantes');
            }
            if (!body.grupo || !body.grupo.institucion || !body.grupo.institucion.trim()) {
                errors.push('Institución o empresa es requerida para participantes');
            }
            if (!body.grupo || !body.grupo.correo || !body.grupo.correo.trim()) {
                errors.push('Correo electrónico del equipo es requerido para participantes');
            }
        }
    }
    else if (body.rol === 'egresado') {
        if (!body.programa || !body.programa.trim()) {
            errors.push('Programa de egreso es requerido para egresados');
        }
        // Empresa es opcional para egresados
    }
    else if (body.rol === 'docente' || body.rol === 'administrativo' || body.rol === 'directivo') {
        if (!body.area || !body.area.trim()) {
            errors.push('Área es requerida');
        }
        if (!body.cargo || !body.cargo.trim()) {
            errors.push('Cargo es requerido');
        }
    }
    else if (body.rol === 'externo') {
        if (!body.empresa || !body.empresa.trim()) {
            errors.push('Empresa/Institución es requerida para externos');
        }
        if (!body.cargo || !body.cargo.trim()) {
            errors.push('Cargo es requerido para externos');
        }
    }

    // Validar actividades
    if (!Array.isArray(body.actividades) || body.actividades.length === 0) {
        errors.push('El campo "actividades" debe ser un arreglo con al menos una actividad.');
    }

    return { ok: errors.length === 0, errors };
}

// ✅ Función para verificar duplicados en la base de datos
async function checkDuplicates(db, payload) {
    const col = db.collection('doblalumen');
    const duplicates = [];

    // 1. Verificar cédula duplicada
    const existingCedula = await col.findOne({
        cedula: payload.cedula.trim()
    });
    if (existingCedula) {
        duplicates.push(`La cédula ${payload.cedula} ya está registrada`);
    }

    // 2. Verificar ID de estudiante duplicado (solo para estudiantes)
    if (payload.rol === 'estudiante' && payload.id) {
        const existingId = await col.findOne({
            id: payload.id.trim()
        });
        if (existingId) {
            duplicates.push(`El ID de estudiante ${payload.id} ya está registrado`);
        }
    }

    // 3. Verificar nombre de equipo duplicado (solo para participantes)
    if (payload.rol === 'estudiante' && payload.tipoEstudiante === 'participante' && payload.grupo && payload.grupo.nombre) {
        const existingTeam = await col.findOne({
            'grupo.nombre': payload.grupo.nombre.trim()
        });
        if (existingTeam) {
            duplicates.push(`El nombre de equipo "${payload.grupo.nombre}" ya está registrado`);
        }
    }

    // 4. Verificar nombre de proyecto duplicado (solo para participantes)
    if (payload.rol === 'estudiante' && payload.tipoEstudiante === 'participante' && payload.grupo && payload.grupo.proyecto && payload.grupo.proyecto.nombre) {
        const existingProject = await col.findOne({
            'grupo.proyecto.nombre': payload.grupo.proyecto.nombre.trim()
        });
        if (existingProject) {
            duplicates.push(`El nombre de proyecto "${payload.grupo.proyecto.nombre}" ya está registrado`);
        }
    }

    // 5. Verificar correo duplicado
    const existingEmail = await col.findOne({
        correo: payload.correo.trim()
    });
    if (existingEmail) {
        duplicates.push(`El correo ${payload.correo} ya está registrado`);
    }

    return duplicates;
}

// ✅ Endpoint principal para registro - CON VALIDACIÓN DE DUPLICADOS Y CUPOS
router.post('/registro', async (req, res) => {
    try {
        const payload = req.body || {};
        console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN DOBLALUMEN');
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
            console.log('❌ Cupo agotado para Doble Lumen');
            return res.status(409).json({
                message: 'Cupo agotado',
                error: `Lo sentimos, no hay cupos disponibles para Doble Lumen. ${infoRegistros.inscritos}/${infoRegistros.cupoMaximo} usuarios registrados.`
            });
        }

        console.log('✅ Información de registros:', infoRegistros.mensaje);

        // ✅ COLECCIÓN DOBLALUMEN
        const col = db.collection('doblalumen');
        console.log('✅ Conectado a colección: doblalumen');

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

        // 🔹 Construcción del documento a guardar - ACTUALIZADO CON ID
        const doc = {
            // Datos personales básicos
            nombre: payload.nombre.trim(),
            cedula: payload.cedula.trim(),
            correo: payload.correo.trim(),
            telefono: payload.telefono.trim(),
            rol: payload.rol.trim(),

            // ✅ NUEVO: Incluir ID para estudiantes
            ...(payload.rol === 'estudiante' && {
                id: payload.id.trim() // ID del estudiante
            }),

            // Campos específicos por rol
            ...(payload.rol === 'estudiante' && {
                tipoEstudiante: payload.tipoEstudiante.trim(),
                facultad: payload.facultad.trim(),
                programa: payload.programa.trim(),
                semestre: payload.semestre.trim()
            }),

            ...(payload.rol === 'egresado' && {
                programa: payload.programa.trim(),
                ...(payload.empresa && { empresa: payload.empresa.trim() })
            }),

            ...((payload.rol === 'docente' || payload.rol === 'administrativo' || payload.rol === 'directivo') && {
                area: payload.area.trim(),
                cargo: payload.cargo.trim()
            }),

            ...(payload.rol === 'externo' && {
                empresa: payload.empresa.trim(),
                cargo: payload.cargo.trim()
            }),

            // Información de actividades
            actividades: payload.actividades || ['doble-lumen'],
            actividad: 'doble-lumen',

            // Información del equipo SOLO para estudiantes participantes
            ...(payload.rol === 'estudiante' && payload.tipoEstudiante === 'participante' && payload.grupo && {
                grupo: {
                    nombre: payload.grupo.nombre.trim(),
                    integrantes: payload.grupo.integrantes || [payload.nombre.trim()],
                    proyecto: {
                        nombre: payload.grupo.proyecto.nombre.trim(),
                        descripcion: payload.grupo.proyecto.descripcion.trim(),
                        categoria: payload.grupo.proyecto.categoria.trim()
                    },
                    institucion: payload.grupo.institucion.trim(),
                    correo: payload.grupo.correo.trim(),
                    ...(payload.grupo.telefono && { telefono: payload.grupo.telefono.trim() })
                }
            }),

            // Metadatos del evento - ACTUALIZADO PARA DOBLE LUMEN
            evento: 'Doble Lumen',
            tipo_evento: 'conferencia-innovacion',
            horario: '6:30 pm - 9:30 pm',
            lugar: 'Sede Melendez Auditorio Principal',
            ponentes: ['Conferencistas Internacionales', 'Expertos en Innovación'],
            created_at: nowIso,
            updated_at: nowIso
        };

        console.log('📝 Documento a guardar EN COLECCIÓN DOBLALUMEN:', JSON.stringify(doc, null, 2));

        // 🔹 Inserción en la colección "doblalumen"
        const insertRes = await col.insertOne(doc);
        const insertedId = insertRes.insertedId;

        console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN DOBLALUMEN CON ID:', insertedId);

        // 🔹 Generar el código QR - ACTUALIZADO CON ID
        const qrPayload = {
            id: insertedId.toString(),
            participante: {
                nombre: payload.nombre,
                cedula: payload.cedula,
                rol: payload.rol,
                ...(payload.rol === 'estudiante' && {
                    tipoEstudiante: payload.tipoEstudiante,
                    idEstudiante: payload.id // ✅ INCLUIR ID EN EL QR
                })
            },
            ...(payload.rol === 'estudiante' && payload.tipoEstudiante === 'participante' && payload.grupo && {
                equipo: payload.grupo.nombre,
                proyecto: payload.grupo.proyecto.nombre
            }),
            actividad: 'Doble Lumen',
            evento: 'Doble Lumen - Conferencia de Innovación',
            horario: '6:30 pm - 9:30 pm',
            lugar: 'Sede Melendez Auditorio Principal',
            emitido: nowIso
        };

        // 🔹 Generar QR como base64
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
                    qr_image: qrDataUrl // Opcional: guardar también la imagen base64
                }
            }
        );

        console.log('✅ QR guardado en la base de datos');

        // 🔹 ENVÍO DE CORREO ELECTRÓNICO
        let emailEnviado = false;
        try {
            console.log("📧 Preparando envío de correo de confirmación...");

            // Preparar datos para el correo - VERSIÓN CORREGIDA CON MÚLTIPLES PROPIEDADES QR
            const datosCorreo = {
                nombre: payload.nombre.trim(),
                cedula: payload.cedula.trim(),
                correo: payload.correo.trim(),
                telefono: payload.telefono.trim(),
                rol: payload.rol.trim(),
                idEstudiante: payload.id?.trim(),
                tipoEstudiante: payload.tipoEstudiante?.trim(),
                programa: payload.programa?.trim(),
                facultad: payload.facultad?.trim(),
                semestre: payload.semestre?.trim(),
                // QR con múltiples nombres para compatibilidad
                qr: qrDataUrl,
                qr_image: qrDataUrl,
                qrDataUrl: qrDataUrl
            };

            // Agregar información del equipo si es participante
            if (payload.rol === 'estudiante' && payload.tipoEstudiante === 'participante' && payload.grupo) {
                datosCorreo.equipo = payload.grupo.nombre?.trim();
                datosCorreo.proyecto = payload.grupo.proyecto?.nombre?.trim();
                datosCorreo.categoria = payload.grupo.proyecto?.categoria?.trim();
                datosCorreo.institucion = payload.grupo.institucion?.trim();
            }

            // Agregar información adicional según el rol
            if (payload.rol === 'egresado' && payload.empresa) {
                datosCorreo.empresa = payload.empresa.trim();
            }

            if ((payload.rol === 'docente' || payload.rol === 'administrativo' || payload.rol === 'directivo') && payload.area) {
                datosCorreo.area = payload.area.trim();
                datosCorreo.cargo = payload.cargo.trim();
            }

            if (payload.rol === 'externo' && payload.empresa) {
                datosCorreo.empresa = payload.empresa.trim();
                datosCorreo.cargo = payload.cargo.trim();
            }

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
            await enviarCorreoRegistro(datosCorreo, 'doblalumen');
            emailEnviado = true;
            console.log("✅ Correo de Doble Lumen enviado exitosamente a:", payload.correo);
        } catch (emailError) {
            console.error("❌ Error al enviar correo:", emailError);
            // No retornamos error aquí, solo logueamos para no afectar el registro
        }
        // 🔹 Obtener información actualizada después del registro
        const infoActualizada = await obtenerInfoRegistros(db);

        // 🔹 Respuesta exitosa - ACTUALIZADA CON ID Y ESTADO DE CORREO
        const response = {
            message: 'Inscripción al Doble Lumen registrada correctamente',
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
                    tipoEstudiante: payload.tipoEstudiante,
                    idEstudiante: payload.id, // ✅ INCLUIR ID EN RESPUESTA
                    programa: payload.programa,
                    semestre: payload.semestre
                }),
                ...(payload.rol === 'estudiante' && payload.tipoEstudiante === 'participante' && payload.grupo && {
                    equipo: payload.grupo.nombre
                })
            },
            coleccion: 'doblalumen',
            confirmacion: 'DATOS GUARDADOS EN COLECCIÓN DOBLALUMEN'
        };

        console.log('✅ Respuesta exitosa:', JSON.stringify(response, null, 2));
        return res.status(201).json(response);
    } catch (err) {
        console.error('❌ Error en /inscripciones/registro:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para verificar disponibilidad de datos
router.post('/verificar-disponibilidad', async (req, res) => {
    try {
        const { cedula, idEstudiante, nombreEquipo, nombreProyecto, correo } = req.body;
        const { db } = await connectMongo();
        const col = db.collection('doblalumen');

        console.log('🔍 Verificando disponibilidad de datos:', { cedula, idEstudiante, nombreEquipo, nombreProyecto, correo });

        // 🔹 Obtener información actual de registros
        const infoRegistros = await obtenerInfoRegistros(db);

        const disponibilidad = {
            cedula: true,
            idEstudiante: true,
            nombreEquipo: true,
            nombreProyecto: true,
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
            const existingId = await col.findOne({ id: idEstudiante.trim() });
            if (existingId) {
                disponibilidad.idEstudiante = false;
                disponibilidad.mensajes.push('El ID de estudiante ya está registrado');
            }
        }

        // Verificar nombre de equipo
        if (nombreEquipo) {
            const existingTeam = await col.findOne({ 'grupo.nombre': nombreEquipo.trim() });
            if (existingTeam) {
                disponibilidad.nombreEquipo = false;
                disponibilidad.mensajes.push('El nombre del equipo ya está registrado');
            }
        }

        // Verificar nombre de proyecto
        if (nombreProyecto) {
            const existingProject = await col.findOne({ 'grupo.proyecto.nombre': nombreProyecto.trim() });
            if (existingProject) {
                disponibilidad.nombreProyecto = false;
                disponibilidad.mensajes.push('El nombre del proyecto ya está registrado');
            }
        }

        // Verificar correo
        if (correo) {
            const existingEmail = await col.findOne({ correo: correo.trim() });
            if (existingEmail) {
                disponibilidad.correo = false;
                disponibilidad.mensajes.push('El correo electrónico ya está registrado');
            }
        }

        console.log('✅ Resultado de disponibilidad:', disponibilidad);
        return res.json({
            message: 'Verificación de disponibilidad completada',
            disponibilidad,
            todosDisponibles: disponibilidad.cedula && disponibilidad.idEstudiante && disponibilidad.nombreEquipo && disponibilidad.nombreProyecto && disponibilidad.correo,
            infoRegistros: {
                inscritos: infoRegistros.inscritos,
                cupoMaximo: infoRegistros.cupoMaximo,
                mensaje: infoRegistros.mensaje,
                disponible: infoRegistros.disponible
            }
        });
    } catch (err) {
        console.error('❌ Error en /inscripciones/verificar-disponibilidad:', err);
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
        console.error("❌ Error en /doblalumen/estado-registros:", err);
        return res.status(500).json({
            success: false,
            message: "Error obteniendo información de registros",
            error: err.message
        });
    }
});

// ✅ Endpoint para listar inscripciones - ACTUALIZADO CON ID
router.get('/listar', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('doblalumen');

        console.log('📋 Listando inscripciones de la colección: doblalumen');

        const inscripciones = await col.find({})
            .sort({ created_at: -1 })
            .limit(50)
            .toArray();

        console.log(`✅ Encontradas ${inscripciones.length} inscripciones`);

        return res.json({
            message: 'Inscripciones al Doble Lumen encontradas',
            total: inscripciones.length,
            coleccion: 'doblalumen',
            inscripciones: inscripciones.map(insc => ({
                id: insc._id,
                nombre: insc.nombre,
                cedula: insc.cedula,
                idEstudiante: insc.id, // ✅ INCLUIR ID EN LISTADO
                correo: insc.correo,
                telefono: insc.telefono,
                rol: insc.rol,
                tipoEstudiante: insc.tipoEstudiante,
                programa: insc.programa,
                semestre: insc.semestre,
                facultad: insc.facultad,
                area: insc.area,
                cargo: insc.cargo,
                empresa: insc.empresa,
                equipo: insc.grupo?.nombre,
                proyecto: insc.grupo?.proyecto?.nombre,
                categoria: insc.grupo?.proyecto?.categoria,
                evento: insc.evento,
                actividades: insc.actividades,
                created_at: insc.created_at
            }))
        });
    } catch (err) {
        console.error('❌ Error en /inscripciones/listar:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

// ✅ Endpoint para buscar inscripción - ACTUALIZADO CON ID
router.get('/buscar/:cedula', async (req, res) => {
    try {
        const { cedula } = req.params;
        const { db } = await connectMongo();
        const col = db.collection('doblalumen');

        console.log(`🔍 Buscando inscripción: ${cedula}`);

        const inscripcion = await col.findOne({
            $or: [
                { cedula: cedula },
                { correo: cedula },
                { id: cedula } // ✅ BUSCAR TAMBIÉN POR ID DE ESTUDIANTE
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
                idEstudiante: inscripcion.id, // ✅ INCLUIR ID EN BÚSQUEDA
                correo: inscripcion.correo,
                telefono: inscripcion.telefono,
                rol: inscripcion.rol,
                tipoEstudiante: inscripcion.tipoEstudiante,
                programa: inscripcion.programa,
                semestre: inscripcion.semestre,
                facultad: inscripcion.facultad,
                area: inscripcion.area,
                cargo: inscripcion.cargo,
                empresa: inscripcion.empresa,
                equipo: inscripcion.grupo?.nombre,
                proyecto: inscripcion.grupo?.proyecto?.nombre,
                categoria: inscripcion.grupo?.proyecto?.categoria,
                institucion: inscripcion.grupo?.institucion,
                evento: inscripcion.evento,
                actividades: inscripcion.actividades,
                created_at: inscripcion.created_at
            }
        });
    } catch (err) {
        console.error('❌ Error en /inscripciones/buscar:', err);
        return res.status(500).json({
            message: 'Error interno del servidor',
            error: err.message
        });
    }
});

export default router;