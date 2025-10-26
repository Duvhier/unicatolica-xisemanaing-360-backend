import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';

const router = Router();

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
      errors.push('ID/Número de estudiante es requerido');
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

// ✅ Endpoint principal para registro - ACTUALIZADO CON ID
router.post('/registro', async (req, res) => {
  try {
    const payload = req.body || {};
    console.log('🎯 INICIANDO REGISTRO EN COLECCIÓN HACKATHON');
    console.log('📥 Payload recibido:', JSON.stringify(payload, null, 2));
    
    const { ok, errors } = validatePayload(payload);

    if (!ok) {
      console.log('❌ Errores de validación:', errors);
      return res.status(400).json({ message: 'Validación fallida', errors });
    }

    // 🔹 Conexión segura a MongoDB
    const { db } = await connectMongo();
    
    // ✅ COLECCIÓN HACKATHON
    const col = db.collection('hackathon');
    console.log('✅ Conectado a colección: hackathon');

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
      actividades: payload.actividades || ['hackathon-universidades'],
      actividad: 'hackathon-universidades',
      
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
      
      // Metadatos del evento
      evento: 'Hackathon Universidades',
      tipo_evento: 'universidades',
      horario: '6:30 pm - 9:30 pm',
      lugar: 'Sala de 1, 2, 3 - Sede Pance',
      profesores: ['José Hernando Mosquera', 'Kellin', 'Nelson Andrade'],
      created_at: nowIso,
      updated_at: nowIso
    };

    console.log('📝 Documento a guardar EN COLECCIÓN HACKATHON:', JSON.stringify(doc, null, 2));

    // 🔹 Inserción en la colección "hackathon"
    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN HACKATHON CON ID:', insertedId);

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
      actividad: 'Hackathon Universidades',
      evento: 'Hackathon Universidades',
      horario: '6:30 pm - 9:30 pm',
      lugar: 'Sala de 1, 2, 3 - Sede Pance',
      emitido: nowIso
    };

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify(qrPayload), { 
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2
    });

    // 🔹 Respuesta exitosa - ACTUALIZADA CON ID
    const response = {
      message: 'Inscripción al Hackathon Universidades registrada correctamente',
      id: insertedId,
      qr: qrDataUrl,
      qrData: qrPayload,
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
      coleccion: 'hackathon',
      confirmacion: 'DATOS GUARDADOS EN COLECCIÓN HACKATHON'
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

// ✅ Endpoint para listar inscripciones - ACTUALIZADO CON ID
router.get('/listar', async (req, res) => {
  try {
    const { db } = await connectMongo();
    const col = db.collection('hackathon');
    
    console.log('📋 Listando inscripciones de la colección: hackathon');
    
    const inscripciones = await col.find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    console.log(`✅ Encontradas ${inscripciones.length} inscripciones`);

    return res.json({
      message: 'Inscripciones al Hackathon Universidades encontradas',
      total: inscripciones.length,
      coleccion: 'hackathon',
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
    const col = db.collection('hackathon');

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