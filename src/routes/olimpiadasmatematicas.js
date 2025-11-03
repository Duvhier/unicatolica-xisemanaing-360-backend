// routes/olimpiadasmatematicas.js
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
      coleccion: 'olimpiadasmatematicas'
    });

    if (!actividad) {
      return { 
        disponible: true, 
        mensaje: 'Actividad no configurada',
        inscritos: 0,
        cupoMaximo: 0
      };
    }

    const inscritosCol = db.collection('olimpiadasmatematicas');
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
      mensaje: 'Error obteniendo información',
      inscritos: 0,
      cupoMaximo: 0
    };
  }
}

// ✅ CORREGIDO: Validación de campos para Olimpiadas Matemáticas
function validatePayload(body) {
  const errors = [];

  // Campos básicos requeridos para todos (solo estudiantes)
  const basicRequired = ['nombre', 'cedula', 'correo', 'telefono', 'idEstudiante', 'facultad', 'programa', 'semestre'];

  for (const key of basicRequired) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      errors.push(`Campo requerido o inválido: ${key}`);
    }
  }

  // ✅ CORREGIDO: Los campos de olimpiadas vienen directamente en el payload, NO dentro de competencia_logica
  const camposOlimpiadas = ['nivel_matematicas', 'experiencia_competencia', 'modalidad_participacion', 'tiempo_preparacion', 'motivacion_participacion'];
  
  for (const key of camposOlimpiadas) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      errors.push(`Campo requerido para olimpiadas: ${key}`);
    }
  }

  // Validar actividades
  if (!Array.isArray(body.actividades) || body.actividades.length === 0) {
    errors.push('El campo "actividades" debe ser un arreglo con al menos una actividad.');
  }

  // ✅ CORREGIDO: competencia_logica es opcional porque los campos vienen directamente
  // Solo validar si existe competencia_logica, que algunos campos puedan venir de ahí
  if (body.competencia_logica && typeof body.competencia_logica !== 'object') {
    errors.push('Datos de competencia lógica deben ser un objeto válido');
  }

  return { ok: errors.length === 0, errors };
}

// ✅ Función para verificar duplicados
async function checkDuplicates(db, payload) {
  const col = db.collection('olimpiadasmatematicas');
  const duplicates = [];

  // 1. Verificar cédula duplicada
  const existingCedula = await col.findOne({
    cedula: payload.cedula.trim()
  });
  if (existingCedula) {
    duplicates.push(`La cédula ${payload.cedula} ya está registrada`);
  }

  // 2. Verificar ID de estudiante duplicado
  if (payload.idEstudiante) {
    const existingId = await col.findOne({
      idEstudiante: payload.idEstudiante.trim()
    });
    if (existingId) {
      duplicates.push(`El ID de estudiante ${payload.idEstudiante} ya está registrado`);
    }
  }

  // 3. Verificar correo duplicado
  const existingEmail = await col.findOne({
    correo: payload.correo.trim()
  });
  if (existingEmail) {
    duplicates.push(`El correo ${payload.correo} ya está registrado`);
  }

  return duplicates;
}

// ✅ CORREGIDO: Endpoint principal para registro
router.post('/registro', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN OLIMPIADASMATEMATICAS');
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
      console.log('❌ Cupo agotado para Olimpiadas Matemáticas');
      return res.status(409).json({
        message: 'Cupo agotado',
        error: `Lo sentimos, no hay cupos disponibles para Olimpiadas Matemáticas. ${infoRegistros.inscritos}/${infoRegistros.cupoMaximo} usuarios registrados.`
      });
    }

    console.log('✅ Información de registros:', infoRegistros.mensaje);

    // ✅ COLECCIÓN OLIMPIADASMATEMATICAS
    const col = db.collection('olimpiadasmatematicas');
    console.log('✅ Conectado a colección: olimpiadasmatematicas');

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

    // ✅ CORREGIDO: Construcción del documento a guardar
    const doc = {
      // Datos personales básicos (solo estudiantes)
      nombre: payload.nombre.trim(),
      cedula: payload.cedula.trim(),
      correo: payload.correo.trim().toLowerCase(),
      telefono: payload.telefono.trim(),
      rol: 'estudiante', // Siempre será estudiante

      // Datos académicos
      idEstudiante: payload.idEstudiante.trim(),
      facultad: payload.facultad.trim(),
      programa: payload.programa.trim(),
      semestre: payload.semestre.trim(),

      // Información de actividades
      actividades: payload.actividades || ['olimpiadas-logica-matematica'],
      actividad: 'olimpiadas-logica-matematica',

      // ✅ CORREGIDO: Datos específicos de la competencia - usar los campos directos del payload
      competencia_logica: {
        nivel_matematicas: payload.nivel_matematicas,
        experiencia_competencia: payload.experiencia_competencia,
        modalidad_participacion: payload.modalidad_participacion,
        tiempo_preparacion: payload.tiempo_preparacion,
        herramientas_utilizadas: payload.herramientas_utilizadas || '',
        motivacion_participacion: payload.motivacion_participacion
      },

      // Metadatos del evento
      evento: 'Olimpiadas en Lógica Matemática',
      tipo_evento: 'competencia',
      horario: 'Miércoles 13 de Noviembre de 2025, 10:00 am a 12:00 pm',
      lugar: 'Sala 3 de Sistemas - Sede Pance',
      created_at: nowIso,
      updated_at: nowIso,
      estado: 'activo'
    };

    console.log('📝 Documento a guardar EN COLECCIÓN OLIMPIADASMATEMATICAS:', JSON.stringify(doc, null, 2));

    // 🔹 Inserción en la colección "olimpiadasmatematicas"
    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN OLIMPIADASMATEMATICAS CON ID:', insertedId);

    // 🔹 Generar el código QR
    const qrPayload = {
      id: insertedId.toString(),
      participante: {
        nombre: payload.nombre,
        cedula: payload.cedula,
        rol: 'estudiante',
        idEstudiante: payload.idEstudiante,
        programa: payload.programa,
        semestre: payload.semestre
      },
      competencia: {
        nombre: 'Olimpiadas en Lógica Matemática',
        nivel: payload.nivel_matematicas,
        modalidad: payload.modalidad_participacion
      },
      actividad: 'Olimpiadas en Lógica Matemática',
      evento: 'Olimpiadas en Lógica Matemática',
      horario: 'Miércoles 13 de Noviembre de 2025, 10:00 am a 12:00 pm',
      lugar: 'Sala 3 de Sistemas - Sede Pance',
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
      
      // ✅ CORREGIDO: Preparar datos para el correo
      const datosCorreo = {
        nombre: payload.nombre.trim(),
        cedula: payload.cedula.trim(),
        correo: payload.correo.trim().toLowerCase(),
        telefono: payload.telefono.trim(),
        rol: 'estudiante',
        idEstudiante: payload.idEstudiante.trim(),
        programa: payload.programa.trim(),
        facultad: payload.facultad.trim(),
        semestre: payload.semestre.trim(),
        nivel_matematicas: payload.nivel_matematicas,
        experiencia_competencia: payload.experiencia_competencia,
        modalidad_participacion: payload.modalidad_participacion,
        tiempo_preparacion: payload.tiempo_preparacion,
        herramientas_utilizadas: payload.herramientas_utilizadas || '',
        motivacion_participacion: payload.motivacion_participacion,
        qr: qrDataUrl,
        qr_image: qrDataUrl,
        evento: 'Olimpiadas en Lógica Matemática',
        horario: 'Miércoles 13 de Noviembre de 2025, 10:00 am a 12:00 pm',
        lugar: 'Sala 3 de Sistemas - Sede Pance'
      };

      console.log("📨 Datos para el correo:", JSON.stringify({
        ...datosCorreo,
        qr: datosCorreo.qr ? `[QR_DATA_LENGTH: ${datosCorreo.qr.length}]` : 'NO_QR',
        qr_image: datosCorreo.qr_image ? `[QR_IMAGE_LENGTH: ${datosCorreo.qr_image.length}]` : 'NO_QR_IMAGE'
      }, null, 2));
      
      // Enviar correo
      await enviarCorreoRegistro(datosCorreo, 'olimpiadasmatematicas');
      emailEnviado = true;
      console.log("✅ Correo de Olimpiadas Matemáticas enviado exitosamente a:", payload.correo);
    } catch (emailError) {
      console.error("❌ Error al enviar correo:", emailError);
      // No retornamos error aquí, solo logueamos para no afectar el registro
    }

    // 🔹 Obtener información actualizada después del registro
    const infoActualizada = await obtenerInfoRegistros(db);

    // 🔹 Respuesta exitosa
    const response = {
      message: 'Inscripción a Olimpiadas Matemáticas registrada correctamente',
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
        rol: 'estudiante',
        idEstudiante: payload.idEstudiante,
        programa: payload.programa,
        semestre: payload.semestre,
        competencia: {
          nivel_matematicas: payload.nivel_matematicas,
          modalidad_participacion: payload.modalidad_participacion
        }
      },
      coleccion: 'olimpiadasmatematicas',
      confirmacion: 'DATOS GUARDADOS EN COLECCIÓN OLIMPIADASMATEMATICAS'
    };

    console.log('✅ Respuesta exitosa:', JSON.stringify(response, null, 2));
    return res.status(201).json(response);
  } catch (err) {
    console.error('❌ Error en /olimpiadasmatematicas/registro:', err);
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
    const col = db.collection('olimpiadasmatematicas');

    console.log('🔍 Verificando disponibilidad de datos:', { cedula, idEstudiante, correo });

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
    console.error('❌ Error en /olimpiadasmatematicas/verificar-disponibilidad:', err);
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
        disponible: infoRegistros.disponible
      }
    });

  } catch (err) {
    console.error("❌ Error en /olimpiadasmatematicas/estado-registros:", err);
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
    const col = db.collection('olimpiadasmatematicas');

    console.log('📋 Listando inscripciones de la colección: olimpiadasmatematicas');

    const inscripciones = await col.find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    console.log(`✅ Encontradas ${inscripciones.length} inscripciones`);

    return res.json({
      message: 'Inscripciones a Olimpiadas Matemáticas encontradas',
      total: inscripciones.length,
      coleccion: 'olimpiadasmatematicas',
      inscripciones: inscripciones.map(insc => ({
        id: insc._id,
        nombre: insc.nombre,
        cedula: insc.cedula,
        idEstudiante: insc.idEstudiante,
        correo: insc.correo,
        telefono: insc.telefono,
        rol: insc.rol,
        programa: insc.programa,
        semestre: insc.semestre,
        facultad: insc.facultad,
        nivel_matematicas: insc.competencia_logica?.nivel_matematicas,
        experiencia_competencia: insc.competencia_logica?.experiencia_competencia,
        modalidad_participacion: insc.competencia_logica?.modalidad_participacion,
        tiempo_preparacion: insc.competencia_logica?.tiempo_preparacion,
        herramientas_utilizadas: insc.competencia_logica?.herramientas_utilizadas,
        evento: insc.evento,
        actividades: insc.actividades,
        created_at: insc.created_at
      }))
    });
  } catch (err) {
    console.error('❌ Error en /olimpiadasmatematicas/listar:', err);
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
    const col = db.collection('olimpiadasmatematicas');

    console.log(`🔍 Buscando inscripción: ${documento}`);

    const inscripcion = await col.findOne({
      $or: [
        { cedula: documento },
        { correo: documento.toLowerCase() },
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
        idEstudiante: inscripcion.idEstudiante,
        correo: inscripcion.correo,
        telefono: inscripcion.telefono,
        rol: inscripcion.rol,
        programa: inscripcion.programa,
        semestre: inscripcion.semestre,
        facultad: inscripcion.facultad,
        nivel_matematicas: inscripcion.competencia_logica?.nivel_matematicas,
        experiencia_competencia: inscripcion.competencia_logica?.experiencia_competencia,
        modalidad_participacion: inscripcion.competencia_logica?.modalidad_participacion,
        tiempo_preparacion: inscripcion.competencia_logica?.tiempo_preparacion,
        herramientas_utilizadas: inscripcion.competencia_logica?.herramientas_utilizadas,
        motivacion_participacion: inscripcion.competencia_logica?.motivacion_participacion,
        evento: inscripcion.evento,
        actividades: inscripcion.actividades,
        created_at: inscripcion.created_at
      }
    });
  } catch (err) {
    console.error('❌ Error en /olimpiadasmatematicas/buscar:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

export default router;