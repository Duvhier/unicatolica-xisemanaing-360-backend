// routes/cierreinaugural.js
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
            coleccion: 'cierreinaugural'
        });

        if (!actividad) {
            return {
                disponible: true,
                mensaje: 'Actividad no configurada - Usando cupo por defecto',
                inscritos: 0,
                cupoMaximo: 300 // Cupo por defecto
            };
        }

        const inscritosCol = db.collection('cierreinaugural');
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

    // 🔥 NUEVA LÓGICA: Validaciones condicionales por perfil
    const perfilesAcademicos = ['Estudiante', 'Docente', 'Egresado'];
    const perfilesNoAcademicos = ['Administrativo', 'Invitado'];

    // Validar que el perfil sea válido
    const perfilesValidos = [...perfilesAcademicos, ...perfilesNoAcademicos];
    if (body.perfil && !perfilesValidos.includes(body.perfil)) {
        errors.push('Perfil no válido');
    }

    // 🔥 FACULTAD: Requerida solo para perfiles académicos
    if (perfilesAcademicos.includes(body.perfil)) {
        if (!body.facultadArea?.trim()) {
            errors.push('Facultad/Área es requerida para estudiantes, docentes y egresados');
        }
        
        // Validar que la facultad sea válida si está presente
        if (body.facultadArea) {
            const facultadesValidas = [
                "Facultad de Educación, Ciencias Sociales, Humanas y Derecho",
                "Facultad de Ciencias Administrativas", 
                "Facultad de Ingeniería"
            ];
            
            if (!facultadesValidas.includes(body.facultadArea)) {
                errors.push('Facultad no válida');
            }
        }
    }

    // 🔥 PROGRAMA ACADÉMICO: Requerido solo para perfiles académicos
    if (perfilesAcademicos.includes(body.perfil)) {
        if (!body.programaAcademico?.trim()) {
            errors.push('Programa académico es requerido para estudiantes, docentes y egresados');
        }
    }

    // 🔥 ID ESTUDIANTE: Requerido solo para estudiantes
    if (body.perfil === 'Estudiante') {
        if (!body.idEstudiante?.trim()) {
            errors.push('ID de estudiante es requerido para estudiantes');
        }
    }

    // Para perfiles no académicos, limpiar campos académicos si vienen vacíos
    if (perfilesNoAcademicos.includes(body.perfil)) {
        if (!body.facultadArea?.trim()) {
            body.facultadArea = 'No aplica';
        }
        if (!body.programaAcademico?.trim()) {
            body.programaAcademico = 'No aplica';
        }
        if (!body.idEstudiante?.trim()) {
            body.idEstudiante = '';
        }
    }

    return { ok: errors.length === 0, errors };
}

// ✅ Verificación de duplicados
async function checkDuplicates(db, payload) {
    const col = db.collection('cierreinaugural');
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

    if (payload.idEstudiante && payload.idEstudiante.trim()) {
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
// 🧾 ENDPOINT PRINCIPAL: REGISTRO DE CIERRE INAUGURAL (ACTUALIZADO)
router.post('/registro', async (req, res) => {
    try {
        const payload = req.body || {};
        console.log('🎯 Iniciando registro de Asistencia a La Clausura');
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

        // ✅ GENERAR NÚMERO DE RIFA ÚNICO
        let numeroRifa;
        try {
            numeroRifa = await generarNumeroRifaUnico(db);
            console.log(`🎲 Número de rifa asignado: ${numeroRifa}`);
        } catch (error) {
            console.error('❌ Error generando número de rifa:', error);
            return res.status(500).json({
                message: 'Error asignando número de participación',
                error: error.message
            });
        }

        // ✅ Construir documento con lógica condicional
        const nowIso = new Date().toISOString();
        
        // Determinar valores para campos académicos basados en el perfil
        const perfilesAcademicos = ['Estudiante', 'Docente', 'Egresado'];
        const esPerfilAcademico = perfilesAcademicos.includes(payload.perfil);
        
        const facultadArea = esPerfilAcademico 
            ? payload.facultadArea.trim() 
            : (payload.facultadArea?.trim() || 'No aplica');
            
        const programaAcademico = esPerfilAcademico 
            ? payload.programaAcademico.trim() 
            : (payload.programaAcademico?.trim() || 'No aplica');

        const doc = {
            nombres: payload.nombres.trim(),
            apellido: payload.apellido.trim(),
            tipoDocumento: payload.tipoDocumento.trim(),
            numeroDocumento: payload.numeroDocumento.trim(),
            telefono: payload.telefono.trim(),
            facultadArea: facultadArea,
            perfil: payload.perfil.trim(),
            programaAcademico: programaAcademico,
            idEstudiante: payload.idEstudiante?.trim() || '',
            email: payload.email.trim().toLowerCase(),
            evento: 'CONFIRMACION DE ASISTENCIA',
            actividad: 'cierre-inaugural',
            fechaRegistro: nowIso,
            estado: 'activo',
            esPerfilAcademico: esPerfilAcademico,
            // 🔥 NUEVO CAMPO: Número de rifa único
            numeroRifa: numeroRifa,
            participaRifa: true
        };

        const col = db.collection('cierreinaugural');
        const insertRes = await col.insertOne(doc);
        const insertedId = insertRes.insertedId;

        // ✅ Generar QR (ACTUALIZADO con número de rifa)
        const qrPayload = {
            id: insertedId.toString(),
            participante: {
                nombres: payload.nombres,
                apellido: payload.apellido,
                tipoDocumento: payload.tipoDocumento,
                numeroDocumento: payload.numeroDocumento,
                perfil: payload.perfil,
                programaAcademico: programaAcademico,
                idEstudiante: payload.idEstudiante || '',
                // 🔥 NUEVO: Incluir número de rifa en el QR
                numeroRifa: numeroRifa
            },
            actividad: 'Cierre Inaugural',
            evento: 'CONFIRMACION DE ASISTENCIA',
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

        // ✅ Enviar correo (ACTUALIZADO con número de rifa)
        try {
            const datosCorreo = {
                ...doc,
                qr: qrDataUrl,
                evento: 'CONFIRMACION DE ASISTENCIA',
                numeroRifa: numeroRifa, // 🔥 NUEVO
                destinatario: 'duvier.tavera01@unicatolica.edu.co'
            };
            await enviarCorreoRegistro(datosCorreo, 'cierreinaugural');
        } catch (err) {
            console.error('⚠️ Error enviando correo:', err);
        }

        // ✅ Respuesta (ACTUALIZADA con número de rifa)
        const infoActualizada = await obtenerInfoRegistros(db);
        res.status(201).json({
            message: 'Registro para el Acto de Clausura realizado correctamente',
            id: insertedId,
            qr: qrDataUrl,
            // 🔥 NUEVO: Incluir número de rifa en la respuesta
            numeroRifa: numeroRifa,
            participaRifa: true,
            cupo: {
                disponibles: infoActualizada.cuposDisponibles,
                maximo: infoRegistros.cupoMaximo,
                inscritos: infoActualizada.inscritos
            },
            evento: 'CONFIRMACION DE ASISTENCIA',
            perfil: payload.perfil
        });

    } catch (err) {
        console.error('❌ Error en /cierreinaugural/registro:', err);
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
                actividad: 'Cierre Inaugural - Acto de Clausura',
                evento: 'XI SEMANA DE LA INGENIERÍA'
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
        const col = db.collection('cierreinaugural');
        const registros = await col.find({}).sort({ fechaRegistro: -1 }).limit(100).toArray();
        res.json({
            message: 'Registros de cierre inaugural encontrados',
            total: registros.length,
            evento: 'CONFIRMACION DE ASISTENCIA',
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
        const col = db.collection('cierreinaugural');

        const registro = await col.findOne({
            $or: [
                { numeroDocumento: documento },
                { email: documento },
                { idEstudiante: documento }
            ]
        });

        if (!registro) {
            return res.status(404).json({ message: 'No se encontró registro para el acto de clausura' });
        }

        res.json({ 
            message: 'Registro encontrado', 
            evento: 'CONFIRMACION DE ASISTENCIA',
            registro 
        });
    } catch (err) {
        console.error('❌ Error en /buscar:', err);
        res.status(500).json({ message: 'Error interno', error: err.message });
    }
});

// Estadísticas por facultad
router.get('/estadisticas-facultades', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        const stats = await col.aggregate([
            {
                $group: {
                    _id: '$facultadArea',
                    total: { $sum: 1 },
                    estudiantes: {
                        $sum: { $cond: [{ $eq: ['$perfil', 'Estudiante'] }, 1, 0] }
                    },
                    docentes: {
                        $sum: { $cond: [{ $eq: ['$perfil', 'Docente'] }, 1, 0] }
                    },
                    egresados: {
                        $sum: { $cond: [{ $eq: ['$perfil', 'Egresado'] }, 1, 0] }
                    },
                    administrativos: {
                        $sum: { $cond: [{ $eq: ['$perfil', 'Administrativo'] }, 1, 0] }
                    },
                    invitados: {
                        $sum: { $cond: [{ $eq: ['$perfil', 'Invitado'] }, 1, 0] }
                    }
                }
            },
            { $sort: { total: -1 } }
        ]).toArray();

        res.json({
            success: true,
            evento: 'CONFIRMACION DE ASISTENCIA',
            estadisticas: stats
        });
    } catch (err) {
        console.error('❌ Error en /estadisticas-facultades:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Estadísticas por perfil
router.get('/estadisticas-perfiles', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        const stats = await col.aggregate([
            {
                $group: {
                    _id: '$perfil',
                    total: { $sum: 1 },
                    conFacultad: {
                        $sum: { 
                            $cond: [{ 
                                $and: [
                                    { $ne: ['$facultadArea', 'No aplica'] },
                                    { $ne: ['$facultadArea', ''] }
                                ]
                            }, 1, 0] 
                        }
                    },
                    conPrograma: {
                        $sum: { 
                            $cond: [{ 
                                $and: [
                                    { $ne: ['$programaAcademico', 'No aplica'] },
                                    { $ne: ['$programaAcademico', ''] }
                                ]
                            }, 1, 0] 
                        }
                    }
                }
            },
            { $sort: { total: -1 } }
        ]).toArray();

        res.json({
            success: true,
            evento: 'CONFIRMACION DE ASISTENCIA',
            estadisticas: stats
        });
    } catch (err) {
        console.error('❌ Error en /estadisticas-perfiles:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// routes/cierreinaugural.js - AGREGAR ESTAS FUNCIONES

// ✅ Función para generar número de rifa único (000-500)
async function generarNumeroRifaUnico(db) {
    const col = db.collection('cierreinaugural');
    
    // Obtener todos los números de rifa ya asignados
    const registrosConRifa = await col.find(
        { numeroRifa: { $exists: true } },
        { projection: { numeroRifa: 1 } }
    ).toArray();
    
    const numerosUsados = registrosConRifa.map(r => r.numeroRifa);
    const numerosDisponibles = [];
    
    // Generar array de números del 0 al 500
    for (let i = 0; i <= 500; i++) {
        const numeroFormateado = i.toString().padStart(3, '0');
        if (!numerosUsados.includes(numeroFormateado)) {
            numerosDisponibles.push(numeroFormateado);
        }
    }
    
    // Si no hay números disponibles
    if (numerosDisponibles.length === 0) {
        throw new Error('No hay números de rifa disponibles');
    }
    
    // Seleccionar un número aleatorio de los disponibles
    const numeroAleatorio = numerosDisponibles[Math.floor(Math.random() * numerosDisponibles.length)];
    
    return numeroAleatorio;
}

// ✅ Función para verificar duplicados (ACTUALIZADA)
async function checkDuplicates(db, payload) {
    const col = db.collection('cierreinaugural');
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

    if (payload.idEstudiante && payload.idEstudiante.trim()) {
        const existingId = await col.findOne({
            idEstudiante: payload.idEstudiante.trim()
        });
        if (existingId) {
            duplicates.push(`El ID de estudiante ${payload.idEstudiante} ya está registrado`);
        }
    }

    return duplicates;
}

// 🎲 NUEVO ENDPOINT: Consultar números de rifa asignados
router.get('/numeros-rifa', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        const numerosRifa = await col.find(
            { numeroRifa: { $exists: true } },
            { 
                projection: { 
                    numeroRifa: 1, 
                    nombres: 1, 
                    apellido: 1, 
                    numeroDocumento: 1,
                    perfil: 1,
                    facultadArea: 1,
                    programaAcademico: 1
                } 
            }
        ).sort({ numeroRifa: 1 }).toArray();

        // Calcular números disponibles
        const numerosAsignados = numerosRifa.map(r => parseInt(r.numeroRifa));
        const numerosDisponibles = [];
        
        for (let i = 0; i <= 500; i++) {
            const numeroFormateado = i.toString().padStart(3, '0');
            if (!numerosAsignados.includes(i)) {
                numerosDisponibles.push(numeroFormateado);
            }
        }

        res.json({
            success: true,
            totalAsignados: numerosRifa.length,
            totalDisponibles: numerosDisponibles.length,
            numerosAsignados: numerosRifa,
            numerosDisponibles: numerosDisponibles,
            rango: '000-500'
        });
    } catch (err) {
        console.error('❌ Error en /numeros-rifa:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🎲 NUEVO ENDPOINT: Realizar sorteo
router.get('/realizar-sorteo/:cantidad?', async (req, res) => {
    try {
        const cantidad = parseInt(req.params.cantidad) || 5;
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        // Obtener registros con números de rifa
        const participantes = await col.find(
            { numeroRifa: { $exists: true } },
            { 
                projection: { 
                    numeroRifa: 1, 
                    nombres: 1, 
                    apellido: 1, 
                    numeroDocumento: 1,
                    perfil: 1,
                    email: 1,
                    telefono: 1
                } 
            }
        ).toArray();

        if (participantes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay participantes para el sorteo'
            });
        }

        // Realizar sorteo aleatorio
        const ganadores = [];
        const participantesCopia = [...participantes];
        
        for (let i = 0; i < Math.min(cantidad, participantes.length); i++) {
            const indiceAleatorio = Math.floor(Math.random() * participantesCopia.length);
            ganadores.push(participantesCopia.splice(indiceAleatorio, 1)[0]);
        }

        res.json({
            success: true,
            totalParticipantes: participantes.length,
            ganadoresSeleccionados: ganadores.length,
            ganadores: ganadores,
            fechaSorteo: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Error en /realizar-sorteo:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;