// routes/hackathonmonitoria.js
import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from '../controllers/emailController.js';

const router = Router();

// ✅ Función para obtener información de registros para hackathonmonitoria
async function obtenerInfoRegistros(db) {
  try {
    console.log('🔍 Buscando configuración de hackathonmonitoria en colección actividades...');

    const actividadesCol = db.collection('actividades');

    // 🔹 BUSCAR CONFIGURACIÓN ESPECÍFICA PARA MONITORÍA REMOTA
    const actividad = await actividadesCol.findOne({
      $or: [
        { coleccion: 'hackathonmonitoria' },
        { nombre: 'hackathon-monitoria-remota' },
        { evento: 'Hackathon - Monitoría Remota' },
        { 'actividad': 'hackathon-monitoria-remota' }
      ]
    });

    console.log('📋 Resultado de búsqueda de actividad hackathonmonitoria:', actividad);

    if (!actividad) {
      console.log('⚠️ No se encontró configuración de hackathonmonitoria, usando valores por defecto');
      // Obtener el conteo actual de inscritos
      const inscritosCol = db.collection('hackathonmonitoria');
      const totalInscritos = await inscritosCol.countDocuments({});

      return {
        disponible: true,
        mensaje: `Actividad no configurada - Usuarios registrados: ${totalInscritos}`,
        inscritos: totalInscritos,
        cupoMaximo: 100 // Cupo por defecto para monitoría
      };
    }

    const inscritosCol = db.collection('hackathonmonitoria');
    const totalInscritos = await inscritosCol.countDocuments({});

    // 🔹 OBTENER CUPO MÁXIMO
    const cupoMaximo = actividad.cupoMaximo || actividad.cupo || actividad.capacidad || 100;

    console.log(`📊 Estadísticas HackathonMonitoria: Inscritos=${totalInscritos}, CupoMaximo=${cupoMaximo}`);

    const cuposDisponibles = Math.max(0, cupoMaximo - totalInscritos);
    const disponible = cuposDisponibles > 0;

    return {
      disponible: disponible,
      cuposDisponibles: cuposDisponibles,
      cupoMaximo: cupoMaximo,
      inscritos: totalInscritos,
      mensaje: `Usuarios registrados: ${totalInscritos}/${cupoMaximo}`
    };
  } catch (err) {
    console.error('❌ Error obteniendo información de registros hackathonmonitoria:', err);

    // En caso de error, intentar al menos obtener el conteo de inscritos
    try {
      const inscritosCol = db.collection('hackathonmonitoria');
      const totalInscritos = await inscritosCol.countDocuments({});

      return {
        disponible: true,
        mensaje: `Error en configuración - Usuarios registrados: ${totalInscritos}`,
        inscritos: totalInscritos,
        cupoMaximo: 100
      };
    } catch (countError) {
      return {
        disponible: true,
        mensaje: 'Error obteniendo información',
        inscritos: 0,
        cupoMaximo: 100
      };
    }
  }
}

// ✅ Validación de campos ESPECÍFICA para hackathonmonitoria
function validatePayload(body) {
  const errors = [];

  // Campos básicos requeridos para todos (solo estudiantes)
  const basicRequired = ['nombre', 'cedula', 'correo', 'telefono', 'idEstudiante', 'facultad', 'programa', 'semestre'];

  for (const key of basicRequired) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      errors.push(`Campo requerido o inválido: ${key}`);
    }
  }

  // Campos específicos de experiencia en programación
  const camposExperiencia = ['experiencia_programacion', 'nivel_conocimiento', 'participado_hackathon', 'motivacion_participar'];
  
  for (const key of camposExperiencia) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      errors.push(`Campo requerido para hackathon: ${key}`);
    }
  }

  // Validar que sea estudiante (solo estudiantes pueden participar en monitoría)
  if (body.rol !== 'estudiante') {
    errors.push('Solo estudiantes pueden participar en la monitoría remota del hackathon');
  }

  // Validar actividades
  if (!Array.isArray(body.actividades) || body.actividades.length === 0) {
    errors.push('El campo "actividades" debe ser un arreglo con al menos una actividad.');
  }

  return { ok: errors.length === 0, errors };
}

// ✅ Función para verificar duplicados en hackathonmonitoria
async function checkDuplicates(db, payload) {
  const col = db.collection('hackathonmonitoria');
  const duplicates = [];

  // 1. Verificar cédula duplicada
  const existingCedula = await col.findOne({
    cedula: payload.cedula.trim()
  });
  if (existingCedula) {
    duplicates.push(`La cédula ${payload.cedula} ya está registrada en la monitoría`);
  }

  // 2. Verificar ID de estudiante duplicado
  if (payload.idEstudiante) {
    const existingId = await col.findOne({
      idEstudiante: payload.idEstudiante.trim()
    });
    if (existingId) {
      duplicates.push(`El ID de estudiante ${payload.idEstudiante} ya está registrado en la monitoría`);
    }
  }

  // 3. Verificar correo duplicado
  const existingEmail = await col.findOne({
    correo: payload.correo.trim()
  });
  if (existingEmail) {
    duplicates.push(`El correo ${payload.correo} ya está registrado en la monitoría`);
  }

  return duplicates;
}

// ✅ Endpoint principal para registro en hackathonmonitoria
router.post('/registro', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN HACKATHONMONITORIA');
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
    console.log('🔍 Obteniendo información de registros para hackathonmonitoria...');
    const infoRegistros = await obtenerInfoRegistros(db);

    if (!infoRegistros.disponible) {
      console.log('❌ Cupo agotado para Hackathon Monitoría Remota');
      return res.status(409).json({
        message: 'Cupo agotado',
        error: `Lo sentimos, no hay cupos disponibles para la Monitoría Remota del Hackathon. ${infoRegistros.inscritos}/${infoRegistros.cupoMaximo} usuarios registrados.`
      });
    }

    console.log('✅ Información de registros:', infoRegistros.mensaje);

    // ✅ COLECCIÓN HACKATHONMONITORIA
    const col = db.collection('hackathonmonitoria');
    console.log('✅ Conectado a colección: hackathonmonitoria');

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

    // 🔹 Construcción del documento a guardar - ESPECÍFICO PARA MONITORÍA
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

      // ✅ EXPERIENCIA EN PROGRAMACIÓN Y HACKATHON
      experiencia_hackathon: {
        experiencia_programacion: payload.experiencia_programacion,
        nivel_conocimiento: payload.nivel_conocimiento,
        tecnologias_dominio: payload.tecnologias_dominio || '',
        participado_hackathon: payload.participado_hackathon,
        motivacion_participar: payload.motivacion_participar,
        expectativas: payload.expectativas || ''
      },

      // ✅ INFORMACIÓN DEL EQUIPO (OPCIONAL)
      ...(payload.equipo && {
        equipo: {
          nombre_equipo: payload.equipo.nombre_equipo?.trim() || '',
          integrantes: payload.equipo.integrantes?.trim() || '',
          idea_proyecto: payload.equipo.idea_proyecto?.trim() || ''
        }
      }),

      // Información de actividades
      actividades: payload.actividades || ['hackathon-monitoria-remota'],
      actividad: 'hackathon-monitoria-remota',

      // Metadatos del evento
      evento: 'Hackathon - Monitoría Remota (Clasificación)',
      tipo_evento: 'competencia',
      horario: 'Miércoles 12 de Noviembre de 2025, 2:00 pm a 5:00 pm',
      lugar: 'Monitoría Remota',
      modalidad: 'virtual',
      objetivo: 'Clasificación para Hackathon Universidades',
      created_at: nowIso,
      updated_at: nowIso,
      estado: 'activo'
    };

    console.log('📝 Documento a guardar EN COLECCIÓN HACKATHONMONITORIA:', JSON.stringify(doc, null, 2));

    // 🔹 Inserción en la colección "hackathonmonitoria"
    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN HACKATHONMONITORIA CON ID:', insertedId);

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
      experiencia: {
        nivel: payload.nivel_conocimiento,
        participado_antes: payload.participado_hackathon
      },
      ...(payload.equipo?.nombre_equipo && {
        equipo: payload.equipo.nombre_equipo
      }),
      actividad: 'Hackathon - Monitoría Remota',
      evento: 'Hackathon - Monitoría Remota (Clasificación)',
      horario: 'Miércoles 12 de Noviembre de 2025, 2:00 pm a 5:00 pm',
      lugar: 'Monitoría Remota',
      modalidad: 'virtual',
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
        rol: 'estudiante',
        idEstudiante: payload.idEstudiante.trim(),
        programa: payload.programa.trim(),
        facultad: payload.facultad.trim(),
        semestre: payload.semestre.trim(),
        experiencia_programacion: payload.experiencia_programacion,
        nivel_conocimiento: payload.nivel_conocimiento,
        tecnologias_dominio: payload.tecnologias_dominio || '',
        participado_hackathon: payload.participado_hackathon,
        motivacion_participar: payload.motivacion_participar,
        expectativas: payload.expectativas || '',
        // Información del equipo
        ...(payload.equipo?.nombre_equipo && { nombre_equipo: payload.equipo.nombre_equipo }),
        ...(payload.equipo?.integrantes && { integrantes_equipo: payload.equipo.integrantes }),
        ...(payload.equipo?.idea_proyecto && { idea_proyecto: payload.equipo.idea_proyecto }),
        // QR
        qr: qrDataUrl,
        qr_image: qrDataUrl,
        // Información del evento
        evento: 'Hackathon - Monitoría Remota (Clasificación)',
        horario: 'Miércoles 12 de Noviembre de 2025, 2:00 pm a 5:00 pm',
        lugar: 'Monitoría Remota',
        modalidad: 'virtual'
      };

      console.log("📨 Datos para el correo hackathonmonitoria:", JSON.stringify({
        ...datosCorreo,
        qr: datosCorreo.qr ? `[QR_DATA_LENGTH: ${datosCorreo.qr.length}]` : 'NO_QR',
        qr_image: datosCorreo.qr_image ? `[QR_IMAGE_LENGTH: ${datosCorreo.qr_image.length}]` : 'NO_QR_IMAGE'
      }, null, 2));
      
      // Enviar correo
      await enviarCorreoRegistro(datosCorreo, 'hackathonmonitoria');
      emailEnviado = true;
      console.log("✅ Correo de Hackathon Monitoría enviado exitosamente a:", payload.correo);
    } catch (emailError) {
      console.error("❌ Error al enviar correo:", emailError);
      // No retornamos error aquí, solo logueamos para no afectar el registro
    }

    // 🔹 Obtener información actualizada después del registro
    const infoActualizada = await obtenerInfoRegistros(db);

    // 🔹 Respuesta exitosa
    const response = {
      message: 'Inscripción a la Monitoría Remota del Hackathon registrada correctamente',
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
        experiencia: {
          nivel: payload.nivel_conocimiento,
          participado_antes: payload.participado_hackathon
        },
        ...(payload.equipo?.nombre_equipo && {
          equipo: payload.equipo.nombre_equipo
        })
      },
      coleccion: 'hackathonmonitoria',
      confirmacion: 'DATOS GUARDADOS EN COLECCIÓN HACKATHONMONITORIA'
    };

    console.log('✅ Respuesta exitosa:', JSON.stringify(response, null, 2));
    return res.status(201).json(response);
  } catch (err) {
    console.error('❌ Error en /hackathonmonitoria/registro:', err);
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
    const col = db.collection('hackathonmonitoria');

    console.log('🔍 Verificando disponibilidad de datos en hackathonmonitoria:', { cedula, idEstudiante, correo });

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
        disponibilidad.mensajes.push('La cédula ya está registrada en la monitoría');
      }
    }

    // Verificar ID de estudiante
    if (idEstudiante) {
      const existingId = await col.findOne({ idEstudiante: idEstudiante.trim() });
      if (existingId) {
        disponibilidad.idEstudiante = false;
        disponibilidad.mensajes.push('El ID de estudiante ya está registrado en la monitoría');
      }
    }

    // Verificar correo
    if (correo) {
      const existingEmail = await col.findOne({ correo: correo.trim().toLowerCase() });
      if (existingEmail) {
        disponibilidad.correo = false;
        disponibilidad.mensajes.push('El correo electrónico ya está registrado en la monitoría');
      }
    }

    console.log('✅ Resultado de disponibilidad hackathonmonitoria:', disponibilidad);
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
    console.error('❌ Error en /hackathonmonitoria/verificar-disponibilidad:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// ✅ Endpoint para obtener información de registros
router.get("/estado-registros", async (req, res) => {
  try {
    console.log('🔍 Solicitando estado de registros de hackathonmonitoria...');
    const { db } = await connectMongo();
    const infoRegistros = await obtenerInfoRegistros(db);

    console.log('📊 Estado de registros hackathonmonitoria obtenido:', infoRegistros);

    return res.json({
      success: true,
      data: {
        inscritos: infoRegistros.inscritos,
        cupoMaximo: infoRegistros.cupoMaximo,
        cuposDisponibles: infoRegistros.cuposDisponibles,
        disponible: infoRegistros.disponible,
        mensaje: infoRegistros.mensaje
      }
    });

  } catch (err) {
    console.error("❌ Error en /hackathonmonitoria/estado-registros:", err);
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
    const col = db.collection('hackathonmonitoria');

    console.log('📋 Listando inscripciones de la colección: hackathonmonitoria');

    const inscripciones = await col.find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    console.log(`✅ Encontradas ${inscripciones.length} inscripciones en hackathonmonitoria`);

    return res.json({
      message: 'Inscripciones a la Monitoría Remota del Hackathon encontradas',
      total: inscripciones.length,
      coleccion: 'hackathonmonitoria',
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
        experiencia_programacion: insc.experiencia_hackathon?.experiencia_programacion,
        nivel_conocimiento: insc.experiencia_hackathon?.nivel_conocimiento,
        participado_hackathon: insc.experiencia_hackathon?.participado_hackathon,
        nombre_equipo: insc.equipo?.nombre_equipo,
        integrantes: insc.equipo?.integrantes,
        evento: insc.evento,
        actividades: insc.actividades,
        created_at: insc.created_at
      }))
    });
  } catch (err) {
    console.error('❌ Error en /hackathonmonitoria/listar:', err);
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
    const col = db.collection('hackathonmonitoria');

    console.log(`🔍 Buscando inscripción en hackathonmonitoria: ${documento}`);

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
        experiencia_programacion: inscripcion.experiencia_hackathon?.experiencia_programacion,
        nivel_conocimiento: inscripcion.experiencia_hackathon?.nivel_conocimiento,
        tecnologias_dominio: inscripcion.experiencia_hackathon?.tecnologias_dominio,
        participado_hackathon: inscripcion.experiencia_hackathon?.participado_hackathon,
        motivacion_participar: inscripcion.experiencia_hackathon?.motivacion_participar,
        expectativas: inscripcion.experiencia_hackathon?.expectativas,
        nombre_equipo: inscripcion.equipo?.nombre_equipo,
        integrantes: inscripcion.equipo?.integrantes,
        idea_proyecto: inscripcion.equipo?.idea_proyecto,
        evento: inscripcion.evento,
        actividades: inscripcion.actividades,
        created_at: inscripcion.created_at
      }
    });
  } catch (err) {
    console.error('❌ Error en /hackathonmonitoria/buscar:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

export default router;