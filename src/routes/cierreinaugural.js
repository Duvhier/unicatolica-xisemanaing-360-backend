// routes/cierreinaugural.js - VERSIÓN MEJORADA CON GESTIÓN DE NÚMEROS
import { Router } from 'express';
import QRCode from 'qrcode';
import { ObjectId } from 'mongodb';
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from '../controllers/emailController.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/* 🧩 FUNCIONES AUXILIARES MEJORADAS                                         */
/* -------------------------------------------------------------------------- */

// ✅ FUNCIÓN MEJORADA: Generar número de rifa único con gestión de disponibilidad
async function generarNumeroRifaUnico(db) {
    const col = db.collection('cierreinaugural');
    
    // Obtener TODOS los números posibles (0-500)
    const todosLosNumeros = Array.from({ length: 501 }, (_, i) => 
        i.toString().padStart(3, '0')
    );
    
    // Obtener números actualmente en uso (solo registros activos)
    const registrosActivos = await col.find(
        { estado: 'activo' }, // ✅ Solo registros activos
        { projection: { numeroRifa: 1 } }
    ).toArray();
    
    const numerosEnUso = registrosActivos.map(r => r.numeroRifa).filter(Boolean);
    
    // Encontrar números disponibles
    const numerosDisponibles = todosLosNumeros.filter(
        numero => !numerosEnUso.includes(numero)
    );
    
    console.log(`📊 Estadísticas Rifas: ${numerosEnUso.length} en uso, ${numerosDisponibles.length} disponibles`);
    
    if (numerosDisponibles.length === 0) {
        throw new Error('No hay números de rifa disponibles (0-500 todos ocupados)');
    }
    
    // Seleccionar aleatoriamente de los disponibles
    const numeroAleatorio = numerosDisponibles[
        Math.floor(Math.random() * numerosDisponibles.length)
    ];
    
    console.log(`🎲 Número asignado: ${numeroAleatorio} (de ${numerosDisponibles.length} disponibles)`);
    return numeroAleatorio;
}

// ✅ Función para verificar duplicados (ACTUALIZADA)
async function checkDuplicates(db, payload) {
    const col = db.collection('cierreinaugural');
    const duplicates = [];

    // Solo verificar en registros activos
    const existingDocumento = await col.findOne({
        numeroDocumento: payload.numeroDocumento.trim(),
        estado: 'activo'
    });
    if (existingDocumento) {
        duplicates.push(`El número de documento ${payload.numeroDocumento} ya está registrado`);
    }

    const existingEmail = await col.findOne({
        email: payload.email.trim().toLowerCase(),
        estado: 'activo'
    });
    if (existingEmail) {
        duplicates.push(`El correo ${payload.email} ya está registrado`);
    }

    if (payload.idEstudiante && payload.idEstudiante.trim()) {
        const existingId = await col.findOne({
            idEstudiante: payload.idEstudiante.trim(),
            estado: 'activo'
        });
        if (existingId) {
            duplicates.push(`El ID de estudiante ${payload.idEstudiante} ya está registrado`);
        }
    }

    return duplicates;
}

// ✅ Obtener información de registros (ACTUALIZADA para contar solo activos)
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
                cupoMaximo: 300
            };
        }

        const inscritosCol = db.collection('cierreinaugural');
        // ✅ Solo contar registros activos
        const totalInscritos = await inscritosCol.countDocuments({ estado: 'activo' });
        const cuposDisponibles = Math.max(0, actividad.cupoMaximo - totalInscritos);

        return {
            disponible: cuposDisponibles > 0,
            cuposDisponibles,
            cupoMaximo: actividad.cupoMaximo,
            inscritos: totalInscritos,
            mensaje: `Registros activos: ${totalInscritos}/${actividad.cupoMaximo}`
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

// ✅ Validación de los datos recibidos (MANTENER igual)
async function validatePayload(body) {
    const errors = [];
    // ... (mantener el mismo código de validación)
    // [Código idéntico al anterior]
    return { ok: errors.length === 0, errors };
}

/* -------------------------------------------------------------------------- */
// 🧾 ENDPOINT PRINCIPAL: REGISTRO DE CIERRE INAUGURAL (ACTUALIZADO)
/* -------------------------------------------------------------------------- */

router.post('/registro', async (req, res) => {
    try {
        const payload = req.body || {};
        console.log('🎯 Iniciando registro de Asistencia a La Clausura');

        // ✅ Validar datos
        const { ok, errors } = await validatePayload(payload);
        if (!ok) return res.status(400).json({ message: 'Validación fallida', errors });

        // ✅ Conexión MongoDB
        const { db } = await connectMongo();

        // ✅ Revisar cupos (solo registros activos)
        const infoRegistros = await obtenerInfoRegistros(db);
        if (!infoRegistros.disponible) {
            return res.status(409).json({
                message: 'Cupo agotado',
                error: `No hay cupos disponibles (${infoRegistros.inscritos}/${infoRegistros.cupoMaximo})`
            });
        }

        // ✅ Verificar duplicados (solo en registros activos)
        const duplicateErrors = await checkDuplicates(db, payload);
        if (duplicateErrors.length > 0) {
            return res.status(409).json({
                message: 'Datos duplicados encontrados',
                errors: duplicateErrors
            });
        }

        // ✅ GENERAR NÚMERO DE RIFA ÚNICO (MEJORADO)
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

        // ✅ Construir documento con estado ACTIVO
        const nowIso = new Date().toISOString();
        
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
            // ✅ NUEVO: Estado activo por defecto
            estado: 'activo',
            esPerfilAcademico: esPerfilAcademico,
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

        // ✅ Enviar correo
        try {
            const datosCorreo = {
                ...doc,
                qr: qrDataUrl,
                evento: 'CONFIRMACION DE ASISTENCIA',
                numeroRifa: numeroRifa,
                destinatario: 'duvier.tavera01@unicatolica.edu.co'
            };
            await enviarCorreoRegistro(datosCorreo, 'cierreinaugural');
        } catch (err) {
            console.error('⚠️ Error enviando correo:', err);
        }

        // ✅ Respuesta
        const infoActualizada = await obtenerInfoRegistros(db);
        res.status(201).json({
            message: 'Registro para el Acto de Clausura realizado correctamente',
            id: insertedId,
            qr: qrDataUrl,
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
/* 🆕 ENDPOINTS DE GESTIÓN DE NÚMEROS DE RIFA                                */
/* -------------------------------------------------------------------------- */

// 🎯 ELIMINAR REGISTRO Y LIBERAR NÚMERO
router.delete('/eliminar-registro/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        // Verificar que el registro existe
        const registro = await col.findOne({ _id: new ObjectId(id) });
        
        if (!registro) {
            return res.status(404).json({
                success: false,
                message: 'Registro no encontrado'
            });
        }
        
        // Eliminar físicamente el registro
        const resultado = await col.deleteOne({ _id: new ObjectId(id) });
        
        if (resultado.deletedCount === 1) {
            console.log(`🗑️ Registro eliminado: ${id}, Número liberado: ${registro.numeroRifa}`);
            
            res.json({
                success: true,
                message: `Registro eliminado correctamente - Número ${registro.numeroRifa} liberado`,
                numeroLiberado: registro.numeroRifa,
                participante: `${registro.nombres} ${registro.apellido}`
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el registro'
            });
        }
    } catch (err) {
        console.error('❌ Error en /eliminar-registro:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 📊 VER NÚMEROS DISPONIBLES Y OCUPADOS
router.get('/estado-numeros-rifa', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        // Obtener todos los registros activos con sus números
        const registrosActivos = await col.find(
            { estado: 'activo' },
            { projection: { numeroRifa: 1, nombres: 1, apellido: 1, perfil: 1 } }
        ).sort({ numeroRifa: 1 }).toArray();
        
        // Generar array de todos los números posibles
        const todosLosNumeros = Array.from({ length: 501 }, (_, i) => 
            i.toString().padStart(3, '0')
        );
        
        const numerosOcupados = registrosActivos.map(r => r.numeroRifa);
        const numerosDisponibles = todosLosNumeros.filter(
            numero => !numerosOcupados.includes(numero)
        );
        
        // Estadísticas detalladas
        const estadisticas = {
            totalNumeros: 501,
            ocupados: numerosOcupados.length,
            disponibles: numerosDisponibles.length,
            porcentajeOcupado: ((numerosOcupados.length / 501) * 100).toFixed(1)
        };
        
        res.json({
            success: true,
            estadisticas,
            numerosOcupados: registrosActivos.map(r => ({
                numero: r.numeroRifa,
                participante: `${r.nombres} ${r.apellido}`,
                perfil: r.perfil
            })),
            numerosDisponibles,
            rango: '000-500'
        });
    } catch (err) {
        console.error('❌ Error en /estado-numeros-rifa:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// 🔄 REASIGNAR TODOS LOS NÚMEROS (ÚTIL PARA CORREGIR PROBLEMAS)
router.post('/reasignar-numeros-global', async (req, res) => {
    try {
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        // Obtener todos los registros activos
        const registrosActivos = await col.find({ estado: 'activo' }).toArray();
        
        if (registrosActivos.length > 501) {
            return res.status(400).json({
                success: false,
                message: `Demasiados registros (${registrosActivos.length}) para solo 501 números disponibles`
            });
        }
        
        // Generar números aleatorios únicos
        const todosLosNumeros = Array.from({ length: 501 }, (_, i) => 
            i.toString().padStart(3, '0')
        );
        const numerosMezclados = [...todosLosNumeros].sort(() => Math.random() - 0.5);
        
        // Reasignar números
        const operaciones = registrosActivos.map((registro, index) => {
            return col.updateOne(
                { _id: registro._id },
                { $set: { numeroRifa: numerosMezclados[index] } }
            );
        });
        
        await Promise.all(operaciones);
        
        console.log(`🔄 Reasignados ${registrosActivos.length} números de rifa`);
        
        res.json({
            success: true,
            message: `Números de rifa reasignados para ${registrosActivos.length} participantes`,
            totalReasignados: registrosActivos.length
        });
        
    } catch (err) {
        console.error('❌ Error en /reasignar-numeros-global:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

/* -------------------------------------------------------------------------- */
/* 🧭 ENDPOINTS EXISTENTES (ACTUALIZADOS para usar estado 'activo')          */
/* -------------------------------------------------------------------------- */

// Obtener estado general (ACTUALIZADO)
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

// Listar registros (ACTUALIZADO - solo activos por defecto)
router.get('/listar', async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        const filtro = includeInactive === 'true' ? {} : { estado: 'activo' };
        
        const registros = await col.find(filtro).sort({ fechaRegistro: -1 }).limit(100).toArray();
        res.json({
            message: 'Registros de cierre inaugural encontrados',
            total: registros.length,
            incluyeInactivos: includeInactive === 'true',
            evento: 'CONFIRMACION DE ASISTENCIA',
            registros
        });
    } catch (err) {
        console.error('❌ Error en /listar:', err);
        res.status(500).json({ message: 'Error listando registros', error: err.message });
    }
});

// Buscar registro (ACTUALIZADO - prioriza activos)
router.get('/buscar/:documento', async (req, res) => {
    try {
        const { documento } = req.params;
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');

        const registro = await col.findOne({
            $or: [
                { numeroDocumento: documento, estado: 'activo' },
                { email: documento, estado: 'activo' },
                { idEstudiante: documento, estado: 'activo' }
            ]
        });

        if (!registro) {
            return res.status(404).json({ message: 'No se encontró registro activo para el acto de clausura' });
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

// 🎲 ENDPOINT: Realizar sorteo (ACTUALIZADO con más campos)
router.get('/realizar-sorteo/:cantidad?', async (req, res) => {
    try {
        const cantidad = parseInt(req.params.cantidad) || 5;
        const { db } = await connectMongo();
        const col = db.collection('cierreinaugural');
        
        // Obtener registros activos con números de rifa - INCLUYENDO MÁS CAMPOS
        const participantes = await col.find(
            { 
                numeroRifa: { $exists: true },
                estado: 'activo'
            },
            { 
                projection: { 
                    numeroRifa: 1, 
                    nombres: 1, 
                    apellido: 1, 
                    programaAcademico: 1,
                    idEstudiante: 1,
                    perfil: 1,
                    email: 1,
                    telefono: 1,
                    facultadArea: 1,
                    tipoDocumento: 1,
                    numeroDocumento: 1
                } 
            }
        ).toArray();

        if (participantes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No hay participantes activos para el sorteo'
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

// 🆕 ENDPOINT: Reiniciar sorteo completo
router.post('/reiniciar-sorteo', async (req, res) => {
  try {
    const { db } = await connectMongo();
    const col = db.collection('cierreinaugural');
    
    console.log('🔄 Iniciando reinicio de sorteo...');
    
    // Obtener todos los registros activos
    const registrosActivos = await col.find({ estado: 'activo' }).toArray();
    
    if (registrosActivos.length === 0) {
      return res.json({
        success: true,
        message: 'No hay registros activos para resetear',
        registrosAfectados: 0
      });
    }
    
    // Contar participantes únicos
    const participantesUnicos = new Set(registrosActivos.map(r => r.numeroDocumento)).size;
    
    console.log(`📊 Estadísticas antes del reset: ${registrosActivos.length} registros, ${participantesUnicos} participantes únicos`);
    
    // Aquí podrías agregar lógica para guardar historial si lo necesitas
    // Por ahora simplemente retornamos éxito ya que el sorteo es aleatorio cada vez
    
    console.log(`✅ Sorteo reiniciado - ${registrosActivos.length} participantes pueden volver a participar`);
    
    res.json({
      success: true,
      message: `Sorteo reiniciado correctamente. ${registrosActivos.length} participantes pueden volver a participar en el próximo sorteo.`,
      registrosAfectados: registrosActivos.length,
      participantesUnicos: participantesUnicos,
      fechaReinicio: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('❌ Error en /reiniciar-sorteo:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor al resetear el sorteo',
      error: err.message 
    });
  }
});

export default router;