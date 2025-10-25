import { Router } from 'express';
import QRCode from 'qrcode';
import { connectMongo } from '../mongo.js';

const router = Router();

// ✅ Validación de campos actualizada (con semestre y programa)
function validatePayload(body) {
  const errors = [];
  const required = ['nombre', 'cedula', 'id', 'correo', 'telefono', 'rol', 'programa', 'semestre'];

  for (const key of required) {
    if (!body[key] || typeof body[key] !== 'string' || !body[key].trim()) {
      errors.push(`Campo requerido o inválido: ${key}`);
    }
  }

  // Validar campos condicionales según el rol
  if (body.rol === 'estudiante' || body.rol === 'egresado') {
    if (!body.facultad || !body.facultad.trim()) {
      errors.push('Facultad es requerida para estudiantes y egresados');
    }
  }

  if (body.rol === 'docente' || body.rol === 'administrativo' || body.rol === 'directivo') {
    if (!body.area || !body.area.trim()) {
      errors.push('Área es requerida para docentes, administrativos y directivos');
    }
  }

  // Validar campos del equipo (siempre requeridos para hackathon)
  if (!body.grupo || !body.grupo.nombre || !body.grupo.nombre.trim()) {
    errors.push('Nombre del equipo es requerido');
  }
  if (!body.grupo || !body.grupo.proyecto || !body.grupo.proyecto.nombre || !body.grupo.proyecto.nombre.trim()) {
    errors.push('Nombre del proyecto es requerido');
  }
  if (!body.grupo || !body.grupo.proyecto || !body.grupo.proyecto.descripcion || !body.grupo.proyecto.descripcion.trim()) {
    errors.push('Descripción del proyecto es requerida');
  }
  if (!body.grupo || !body.grupo.proyecto || !body.grupo.proyecto.categoria || !body.grupo.proyecto.categoria.trim()) {
    errors.push('Categoría de participación es requerida');
  }
  if (!body.grupo || !body.grupo.institucion || !body.grupo.institucion.trim()) {
    errors.push('Institución o empresa es requerida');
  }
  if (!body.grupo || !body.grupo.correo || !body.grupo.correo.trim()) {
    errors.push('Correo electrónico del equipo es requerido');
  }

  if (!Array.isArray(body.actividades) || body.actividades.length === 0) {
    errors.push('El campo "actividades" debe ser un arreglo con al menos una actividad.');
  }

  return { ok: errors.length === 0, errors };
}

// ✅ Endpoint principal para registro - 100% GARANTIZADO EN COLECCIÓN HACKATHON
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
    
    // ✅ 100% GARANTIZADO - COLECCIÓN HACKATHON
    const col = db.collection('hackathon');
    console.log('✅ Conectado a colección: hackathon');

    const nowIso = new Date().toISOString();

    // 🔹 Construcción del documento a guardar
    const doc = {
      // Datos personales
      nombre: payload.nombre.trim(),
      cedula: payload.cedula.trim(),
      id: payload.id.trim(),
      correo: payload.correo.trim(),
      telefono: payload.telefono.trim(),
      rol: payload.rol.trim(),
      programa: payload.programa.trim(),
      semestre: payload.semestre.trim(),
      
      // Campos condicionales según el rol
      ...(payload.rol === 'estudiante' || payload.rol === 'egresado') && {
        facultad: payload.facultad?.trim()
      },
      
      ...(payload.rol === 'docente' || payload.rol === 'administrativo' || payload.rol === 'directivo') && {
        area: payload.area?.trim()
      },
      
      // Información de actividades - ACTUALIZADO A HACKATHON UNIVERSIDADES
      actividades: ['hackathon-universidades'],
      actividad: 'hackathon-universidades',
      
      // Información del equipo
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
      },
      
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

    // 🔹 Inserción en la colección "hackathon" - 100% GARANTIZADO
    const insertRes = await col.insertOne(doc);
    const insertedId = insertRes.insertedId;

    console.log('✅✅✅ DOCUMENTO GUARDADO EN COLECCIÓN HACKATHON CON ID:', insertedId);

    // 🔹 Generar el código QR
    const qrPayload = {
      id: insertedId.toString(),
      participante: { 
        nombre: payload.nombre, 
        cedula: payload.cedula,
        rol: payload.rol
      },
      equipo: payload.grupo.nombre,
      proyecto: payload.grupo.proyecto.nombre,
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

    // 🔹 Respuesta exitosa
    return res.status(201).json({
      message: 'Inscripción al Hackathon Universidades registrada correctamente',
      id: insertedId,
      qr: qrDataUrl,
      qrData: qrPayload,
      participante: {
        nombre: payload.nombre,
        rol: payload.rol,
        equipo: payload.grupo.nombre,
        programa: payload.programa,
        semestre: payload.semestre
      },
      coleccion: 'hackathon',
      confirmacion: 'DATOS GUARDADOS EN COLECCIÓN HACKATHON'
    });
  } catch (err) {
    console.error('❌ Error en /inscripciones/registro:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// ✅ Endpoint para verificar las inscripciones del hackathon
router.get('/listar', async (req, res) => {
  try {
    const { db } = await connectMongo();
    
    // ✅ 100% GARANTIZADO - COLECCIÓN HACKATHON
    const col = db.collection('hackathon');
    
    console.log('📋 Listando inscripciones EXCLUSIVAMENTE de la colección: hackathon');
    
    const inscripciones = await col.find({})
      .sort({ created_at: -1 })
      .limit(50)
      .toArray();

    console.log(`✅ Encontradas ${inscripciones.length} inscripciones en la colección hackathon`);

    return res.json({
      message: 'Inscripciones al Hackathon Universidades encontradas',
      total: inscripciones.length,
      coleccion: 'hackathon',
      confirmacion: 'DATOS OBTENIDOS DE COLECCIÓN HACKATHON',
      inscripciones: inscripciones.map(insc => ({
        id: insc._id,
        nombre: insc.nombre,
        cedula: insc.cedula,
        id: insc.id,
        rol: insc.rol,
        programa: insc.programa,
        semestre: insc.semestre,
        equipo: insc.grupo?.nombre,
        proyecto: insc.grupo?.proyecto?.nombre,
        facultad: insc.facultad,
        area: insc.area,
        evento: insc.evento,
        horario: insc.horario,
        lugar: insc.lugar,
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

// ✅ Endpoint para obtener estadísticas del hackathon
router.get('/estadisticas', async (req, res) => {
  try {
    const { db } = await connectMongo();
    
    // ✅ 100% GARANTIZADO - COLECCIÓN HACKATHON
    const col = db.collection('hackathon');

    console.log('📊 Obteniendo estadísticas EXCLUSIVAMENTE de la colección: hackathon');

    const totalInscritos = await col.countDocuments();
    
    const porRol = await col.aggregate([
      { $group: { _id: '$rol', count: { $sum: 1 } } }
    ]).toArray();

    const porCategoria = await col.aggregate([
      { $group: { _id: '$grupo.proyecto.categoria', count: { $sum: 1 } } }
    ]).toArray();

    const porPrograma = await col.aggregate([
      { $group: { _id: '$programa', count: { $sum: 1 } } }
    ]).toArray();

    const equiposUnicos = await col.distinct('grupo.nombre');

    console.log(`📊 Estadísticas COLECCIÓN HACKATHON - Total: ${totalInscritos}, Equipos: ${equiposUnicos.length}`);

    return res.json({
      message: 'Estadísticas del Hackathon Universidades',
      coleccion: 'hackathon',
      confirmacion: 'ESTADÍSTICAS OBTENIDAS DE COLECCIÓN HACKATHON',
      estadisticas: {
        total_inscritos: totalInscritos,
        total_equipos: equiposUnicos.length,
        por_rol: porRol,
        por_categoria: porCategoria,
        por_programa: porPrograma
      }
    });
  } catch (err) {
    console.error('❌ Error en /inscripciones/estadisticas:', err);
    return res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: err.message 
    });
  }
});

// ✅ Endpoint para buscar inscripción por cédula o ID
router.get('/buscar/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const { db } = await connectMongo();
    
    // ✅ 100% GARANTIZADO - COLECCIÓN HACKATHON
    const col = db.collection('hackathon');

    console.log(`🔍 Buscando inscripción EXCLUSIVAMENTE en colección hackathon: ${cedula}`);

    const inscripcion = await col.findOne({
      $or: [
        { cedula: cedula },
        { id: cedula }
      ]
    });

    if (!inscripcion) {
      console.log('❌ No se encontró inscripción con esa cédula o ID en colección hackathon');
      return res.status(404).json({ 
        message: 'No se encontró inscripción con esa cédula o ID',
        coleccion: 'hackathon',
        busqueda_en: 'colección hackathon'
      });
    }

    console.log('✅ Inscripción encontrada EXCLUSIVAMENTE en colección hackathon');

    return res.json({
      message: 'Inscripción encontrada',
      coleccion: 'hackathon',
      confirmacion: 'BÚSQUEDA REALIZADA EN COLECCIÓN HACKATHON',
      inscripcion: {
        id: inscripcion._id,
        nombre: inscripcion.nombre,
        cedula: inscripcion.cedula,
        id: inscripcion.id,
        rol: inscripcion.rol,
        correo: inscripcion.correo,
        telefono: inscripcion.telefono,
        programa: inscripcion.programa,
        semestre: inscripcion.semestre,
        facultad: inscripcion.facultad,
        area: inscripcion.area,
        equipo: inscripcion.grupo?.nombre,
        proyecto: inscripcion.grupo?.proyecto?.nombre,
        categoria: inscripcion.grupo?.proyecto?.categoria,
        institucion: inscripcion.grupo?.institucion,
        evento: inscripcion.evento,
        horario: inscripcion.horario,
        lugar: inscripcion.lugar,
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

// ✅ Endpoint para verificar la conexión y colección
router.get('/estado', async (req, res) => {
  try {
    const { db } = await connectMongo();
    
    // ✅ 100% GARANTIZADO - COLECCIÓN HACKATHON
    const col = db.collection('hackathon');
    
    // Verificar que la colección existe
    const collections = await db.listCollections({ name: 'hackathon' }).toArray();
    const coleccionExiste = collections.length > 0;
    
    const totalDocumentos = await col.countDocuments();
    
    // Verificar también la colección "inscripciones" para confirmar que NO se usa
    const colInscripciones = db.collection('inscripciones');
    const totalInscripciones = await colInscripciones.countDocuments();
    
    console.log(`🔍 Estado - Colección hackathon: ${coleccionExiste ? 'EXISTE' : 'NO EXISTE'}, Documentos: ${totalDocumentos}`);
    console.log(`🔍 Estado - Colección inscripciones: Documentos: ${totalInscripciones} (NO DEBE USARSE)`);

    return res.json({
      message: 'Estado del sistema - HACKATHON UNIVERSIDADES',
      database: 'MongoDB - eventoIngenieria',
      coleccion_activa: 'hackathon',
      coleccion_hackathon: {
        existe: coleccionExiste,
        total_documentos: totalDocumentos,
        estado: 'ACTIVA'
      },
      coleccion_inscripciones: {
        total_documentos: totalInscripciones,
        estado: 'NO ACTIVA - SOLO LECTURA'
      },
      estado: 'operacional',
      confirmacion: 'SISTEMA CONFIGURADO PARA USAR EXCLUSIVAMENTE COLECCIÓN HACKATHON'
    });
  } catch (err) {
    console.error('❌ Error en /inscripciones/estado:', err);
    return res.status(500).json({ 
      message: 'Error en la conexión a la base de datos', 
      error: err.message 
    });
  }
});

// ✅ Endpoint para limpiar datos de prueba (OPCIONAL - SOLO DESARROLLO)
router.delete('/limpiar-pruebas', async (req, res) => {
  try {
    const { db } = await connectMongo();
    
    // ✅ 100% GARANTIZADO - COLECCIÓN HACKATHON
    const col = db.collection('hackathon');
    
    const result = await col.deleteMany({ 
      $or: [
        { nombre: { $regex: 'prueba', $options: 'i' } },
        { correo: { $regex: 'test', $options: 'i' } }
      ]
    });

    console.log(`🧹 Limpiados ${result.deletedCount} documentos de prueba de la colección hackathon`);

    return res.json({
      message: 'Datos de prueba limpiados',
      coleccion: 'hackathon',
      documentos_eliminados: result.deletedCount
    });
  } catch (err) {
    console.error('❌ Error en /inscripciones/limpiar-pruebas:', err);
    return res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: err.message 
    });
  }
});

export default router;