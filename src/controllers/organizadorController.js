import jwt from 'jsonwebtoken';
import { connectMongo } from '../mongo.js';

/**
 * Controlador para el login de organizadores
 * POST /organizador/login
 */
export const loginOrganizador = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');

    let organizador = await organizadoresCollection.findOne({ usuario: usuario.trim() });

    // Usuario demo por si no existe
    if (!organizador && usuario.trim() === 'organizadorDemo' && password.trim() === 'org123') {
      const usuarioDemo = {
        usuario: 'organizadorDemo',
        password: 'org123',
        nombre: 'Organizador Demo',
        rol: 'organizador',
        email: 'organizador.demo@unicatolica.edu.co',
        activo: true,
        created_at: new Date().toISOString()
      };
      const resultado = await organizadoresCollection.insertOne(usuarioDemo);
      organizador = { ...usuarioDemo, _id: resultado.insertedId };
    }

    if (!organizador) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    if (organizador.password !== password.trim()) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      {
        id: organizador._id,
        usuario: organizador.usuario,
        rol: organizador.rol || 'organizador',
        nombre: organizador.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      usuario: {
        id: organizador._id,
        usuario: organizador.usuario,
        nombre: organizador.nombre,
        rol: organizador.rol || 'organizador'
      }
    });
  } catch (error) {
    console.error('❌ Error en login de organizador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para obtener inscripciones de cualquier colección de evento
 * GET /organizador/inscripciones?coleccion=asistenciainaugural
 */
export const getInscripciones = async (req, res) => {
  try {
    const { coleccion } = req.query;
    const { db } = await connectMongo();

    // Por defecto, listar 'inscripciones' si no pasa coleccion
    let collectionName = 'inscripciones';
    let actividadInfo = null;

    if (coleccion) {
      actividadInfo = await db.collection('actividades').findOne({ coleccion });
      if (!actividadInfo) {
        return res.status(404).json({
          success: false,
          message: 'La colección de actividades no existe'
        });
      }
      collectionName = coleccion;
    }

    const inscripcionesCollection = db.collection(collectionName);
    const inscripciones = await inscripcionesCollection
      .find({})
      .sort({ created_at: -1 })
      .toArray();

    const inscripcionesFormateadas = inscripciones.map(insc => ({
      _id: insc._id,
      nombre: insc.nombre,
      cedula: insc.cedula,
      correo: insc.correo,
      telefono: insc.telefono,
      programa: insc.programa,
      semestre: insc.semestre,
      actividad: insc.actividad,
      created_at: insc.created_at,
      asistencia: insc.asistencia ?? false,
      rol: insc.rol,
      tipoEstudiante: insc.tipoEstudiante,
      facultad: insc.facultad,
      empresa: insc.empresa,
      cargo: insc.cargo,
      equipo: insc.grupo?.nombre,
      proyecto: insc.grupo?.proyecto?.nombre,
      evento: insc.evento
    }));

    res.json({
      success: true,
      total: inscripcionesFormateadas.length,
      inscripciones: inscripcionesFormateadas,
      actividad: actividadInfo
    });
  } catch (error) {
    console.error('❌ Error obteniendo inscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Controlador para actualizar asistencia en una colección dinámica
 * PUT /organizador/asistencia/:id?coleccion=asistenciainaugural
 */
export const actualizarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { asistencia } = req.body;
    const { coleccion } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID del inscrito es requerido'
      });
    }
    if (typeof asistencia !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'El campo asistencia debe ser un valor booleano'
      });
    }

    const { db } = await connectMongo();

    // Si especifica coleccion válida (que exista en actividades), usar esa
    let collectionName = 'inscripciones';
    if (coleccion) {
      const actividadInfo = await db.collection('actividades').findOne({ coleccion });
      if (!actividadInfo) {
        return res.status(404).json({
          success: false,
          message: 'La colección de actividades no existe'
        });
      }
      collectionName = coleccion;
    }

    const collection = db.collection(collectionName);
    const { ObjectId } = await import('mongodb');
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido'
      });
    }

    const resultado = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          asistencia: asistencia,
          actualizado_por: req.user.usuario,
          actualizado_at: new Date().toISOString()
        }
      },
      { returnDocument: 'after' }
    );

    if (!resultado.value) {
      return res.status(404).json({
        success: false,
        message: 'Inscrito no encontrado'
      });
    }

    const inscripcionActualizada = resultado.value;

    res.json({
      success: true,
      message: `Asistencia ${asistencia ? 'marcada' : 'desmarcada'} correctamente`,
      inscripcion: inscripcionActualizada
    });
  } catch (error) {
    console.error('❌ Error actualizando asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};