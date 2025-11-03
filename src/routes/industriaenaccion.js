// industriaenaccion.js
import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';
import { enviarCorreoRegistro } from '../controllers/emailController.js';

const router = Router();

// ✅ Función para obtener información de registros - MODIFICADA PARA industriaenaccion
async function obtenerInfoRegistros(db) {
  try {
    const actividadesCol = db.collection('actividades');
    const actividad = await actividadesCol.findOne({
      coleccion: 'industriaenaccion'
    });

    if (!actividad) {
      return { 
        disponible: true, 
        mensaje: 'Actividad no configurada',
        inscritos: 0,
        cupoMaximo: 0
      };
    }

    const inscritosCol = db.collection('industriaenaccion');
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

// ✅ Validación de campos ACTUALIZADA - Eliminada validación de tipoEstudiante y grupo
function validatePayload(body) {
  const errors = [];

  // Campos básicos requeridos para todos
  const basicRequired = ['nombre', 'cedula', 'correo', 'telefono', 'rol'];

  for (const key of basicRequired) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      errors.push(`Campo requerido o inválido: ${key}`);
    }
  }

  // ✅ MODIFICADO: Validar ID para estudiantes (sin tipoEstudiante)
  if (body.rol === 'estudiante') {
    if (!body.id || typeof body.id !== 'string' || !body.id.trim()) {
      errors.push('ID/Número de estudiante es requerido');
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

// ✅ Función para verificar duplicados en la base de datos - MODIFICADA (eliminada verificación de equipo y proyecto)
async function checkDuplicates(db, payload) {
  const col = db.collection('industriaenaccion');
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

  // ✅ ELIMINADO: Verificación de nombre de equipo y proyecto (ya no aplica)

  // 3. Verificar correo duplicado
  const existingEmail = await col.findOne({
    correo: payload.correo.trim()
  });
  if (existingEmail) {
    duplicates.push(`El correo ${payload.correo} ya está registrado`);
  }

  return duplicates;
}

// ✅ Endpoint principal para registro - MODIFICADO PARA industriaenaccion (sin tipoEstudiante ni grupo)
router.post('/registro', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN INDUSTRIAENACCION');
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
      console.log('❌ Cupo agotado para Industria en Acción');
      return res.status(409).json({
        message: 'Cupo agotado',
        error: `Lo sentimos, no hay cupos disponibles para Industria en Acción. ${infoRegistros.inscritos}/${infoRegistros.cupoMaximo} usuarios registrados.`
      });
    }

    console.log('✅ Información de registros:', infoRegistros.mensaje);

    // ✅ COLECCIÓN INDUSTRIAENACCION
    const col = db.collection('industriaenaccion');
    console.log('✅ Conectado a colección: industriaenaccion');

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

    // 🔹 Construcción del documento a guardar - ACTUALIZADO SIN tipoEstudiante NI grupo
    const doc = {
      // Datos personales básicos
      nombre: payload.nombre.trim(),
      cedula: payload.cedula.trim(),
      correo: payload.correo.trim(),
      telefono: payload.telefono.trim(),
      rol: payload.rol.trim(),

      // ✅ MODIFICADO: Incluir ID para estudiantes (sin tipoEstudiante)
      ...(payload.rol === 'estudiante' && {
        id: payload.id.trim(), // ID del estudiante
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
      actividades: payload.actividades || ['industria-en-accion'],
      actividad: 'industria-en-accion',

      // ✅ ELIMINADO: Información del equipo (ya no aplica para participantes)

      // Metadatos del evento - ACTUALIZADO PARA INDUSTRIA EN ACCIÓN
      evento: 'Industria en Acción',
      tipo_evento: 'industria',
      horario: 'Miércoles 12 de Noviembre de 2025, 8:00 am a 12:00 pm',
      lugar: 'Sede Melendez - Auditorio Lumen',
      created_at: nowIso,
      updated_at: nowIso
    };

    console.log('📝 Documento a guardar EN COLECCIÓN INDUSTRIAENACCION:', JSON.stringify(doc, null, 2));

    // 🔹 Inserción en la colección "industriaenaccion"
    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN INDUSTRIAENACCION CON ID:', insertedId);

    // 🔹 Generar el código QR - ACTUALIZADO SIN tipoEstudiante
    const qrPayload = {
      id: insertedId.toString(),
      participante: {
        nombre: payload.nombre,
        cedula: payload.cedula,
        rol: payload.rol,
        ...(payload.rol === 'estudiante' && {
          idEstudiante: payload.id // ✅ INCLUIR ID EN EL QR (sin tipoEstudiante)
        })
      },
      actividad: 'Industria en Acción',
      evento: 'Industria en Acción',
      horario: 'Miércoles 12 de Noviembre de 2025, 8:00 am a 12:00 pm',
      lugar: 'Sede Melendez - Auditorio Lumen',
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
        correo: payload.correo.trim(),
        telefono: payload.telefono.trim(),
        rol: payload.rol.trim(),
        idEstudiante: payload.id?.trim(),
        programa: payload.programa?.trim(),
        facultad: payload.facultad?.trim(),
        semestre: payload.semestre?.trim(),
        qr: qrDataUrl,
        qr_image: qrDataUrl,
        evento: 'Industria en Acción',
        horario: 'Miércoles 12 de Noviembre de 2025, 8:00 am a 12:00 pm',
        lugar: 'Sede Melendez - Auditorio Lumen'
      };

      // ✅ ELIMINADO: Información del equipo (ya no aplica)

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

      console.log("📨 Datos para el correo:", JSON.stringify(datosCorreo, null, 2));
      
      // Enviar correo
      await enviarCorreoRegistro(datosCorreo, 'industriaenaccion');
      emailEnviado = true;
      console.log("✅ Correo de Industria en Acción enviado exitosamente a:", payload.correo);
    } catch (emailError) {
      console.error("❌ Error al enviar correo:", emailError);
      // No retornamos error aquí, solo logueamos para no afectar el registro
    }

    // 🔹 Obtener información actualizada después del registro
    const infoActualizada = await obtenerInfoRegistros(db);

    // 🔹 Respuesta exitosa - ACTUALIZADA SIN tipoEstudiante NI EQUIPO
    const response = {
      message: 'Inscripción a Industria en Acción registrada correctamente',
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
          idEstudiante: payload.id, // ✅ INCLUIR ID EN RESPUESTA (sin tipoEstudiante)
          programa: payload.programa,
          semestre: payload.semestre
        })
      },
      coleccion: 'industriaenaccion',
      confirmacion: 'DATOS GUARDADOS EN COLECCIÓN INDUSTRIAENACCION'
    };

    console.log('✅ Respuesta exitosa:', JSON.stringify(response, null, 2));
    return res.status(201).json(response);
  } catch (err) {
    console.error('❌ Error en /industriaenaccion/registro:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// ✅ Endpoint para verificar disponibilidad de datos - MODIFICADO (eliminada verificación de equipo y proyecto)
router.post('/verificar-disponibilidad', async (req, res) => {
  try {
    const { cedula, idEstudiante, correo } = req.body; // ✅ ELIMINADOS: nombreEquipo, nombreProyecto
    const { db } = await connectMongo();
    const col = db.collection('industriaenaccion');

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
      const existingId = await col.findOne({ id: idEstudiante.trim() });
      if (existingId) {
        disponibilidad.idEstudiante = false;
        disponibilidad.mensajes.push('El ID de estudiante ya está registrado');
      }
    }

    // ✅ ELIMINADO: Verificación de nombre de equipo y proyecto

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
      todosDisponibles: disponibilidad.cedula && disponibilidad.idEstudiante && disponibilidad.correo,
      infoRegistros: {
        inscritos: infoRegistros.inscritos,
        cupoMaximo: infoRegistros.cupoMaximo,
        mensaje: infoRegistros.mensaje,
        disponible: infoRegistros.disponible
      }
    });
  } catch (err) {
    console.error('❌ Error en /industriaenaccion/verificar-disponibilidad:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// ✅ Endpoint para obtener información de registros (sin verificar disponibilidad) - MODIFICADO
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
    console.error("❌ Error en /industriaenaccion/estado-registros:", err);
    return res.status(500).json({
      success: false,
      message: "Error obteniendo información de registros",
      error: err.message
    });
  }
});

// ✅ Endpoint para listar inscripciones - MODIFICADO PARA industriaenaccion (sin tipoEstudiante ni equipo)
router.get('/listar', async (req, res) => {
  try {
    const { db } = await connectMongo();
    const col = db.collection('industriaenaccion');

    console.log('📋 Listando inscripciones de la colección: industriaenaccion');

    const inscripciones = await col.find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    console.log(`✅ Encontradas ${inscripciones.length} inscripciones`);

    return res.json({
      message: 'Inscripciones a Industria en Acción encontradas',
      total: inscripciones.length,
      coleccion: 'industriaenaccion',
      inscripciones: inscripciones.map(insc => ({
        id: insc._id,
        nombre: insc.nombre,
        cedula: insc.cedula,
        idEstudiante: insc.id, // ✅ INCLUIR ID EN LISTADO
        correo: insc.correo,
        telefono: insc.telefono,
        rol: insc.rol,
        programa: insc.programa,
        semestre: insc.semestre,
        facultad: insc.facultad,
        area: insc.area,
        cargo: insc.cargo,
        empresa: insc.empresa,
        evento: insc.evento,
        actividades: insc.actividades,
        created_at: insc.created_at
      }))
    });
  } catch (err) {
    console.error('❌ Error en /industriaenaccion/listar:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// ✅ Endpoint para buscar inscripción - MODIFICADO PARA industriaenaccion (sin tipoEstudiante ni equipo)
router.get('/buscar/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const { db } = await connectMongo();
    const col = db.collection('industriaenaccion');

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
        programa: inscripcion.programa,
        semestre: inscripcion.semestre,
        facultad: inscripcion.facultad,
        area: inscripcion.area,
        cargo: inscripcion.cargo,
        empresa: inscripcion.empresa,
        evento: inscripcion.evento,
        actividades: inscripcion.actividades,
        created_at: inscripcion.created_at
      }
    });
  } catch (err) {
    console.error('❌ Error en /industriaenaccion/buscar:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

export default router;