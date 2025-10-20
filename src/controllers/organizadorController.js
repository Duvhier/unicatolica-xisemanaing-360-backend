import jwt from 'jsonwebtoken';
import { connectMongo } from '../mongo.js';

/**
 * Controlador para el login de organizadores
 * POST /organizador/login
 */
export const loginOrganizador = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // Validar campos requeridos
    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Conectar a MongoDB
    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');

    // Buscar el organizador por usuario
    const organizador = await organizadoresCollection.findOne({ 
      usuario: usuario.trim() 
    });

    if (!organizador) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña (comparación simple por ahora)
    if (organizador.password !== password.trim()) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: organizador._id,
        usuario: organizador.usuario,
        rol: organizador.rol || 'organizador',
        nombre: organizador.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Token válido por 8 horas
    );

    // Respuesta exitosa
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
 * Controlador para obtener todas las inscripciones
 * GET /organizador/inscripciones
 */
export const getInscripciones = async (req, res) => {
  try {
    // Conectar a MongoDB
    const { db } = await connectMongo();
    const inscripcionesCollection = db.collection('inscripciones');

    // Obtener todas las inscripciones
    const inscripciones = await inscripcionesCollection
      .find({})
      .sort({ created_at: -1 }) // Ordenar por fecha de creación descendente
      .toArray();

    // Formatear respuesta con campos requeridos
    const inscripcionesFormateadas = inscripciones.map(inscripcion => ({
      _id: inscripcion._id,
      nombre: inscripcion.nombre,
      cedula: inscripcion.cedula,
      correo: inscripcion.correo,
      telefono: inscripcion.telefono,
      programa: inscripcion.programa,
      semestre: inscripcion.semestre,
      actividad: inscripcion.actividad,
      created_at: inscripcion.created_at,
      asistencia: inscripcion.asistencia || false // Si no existe, asumir false
    }));

    res.json({
      success: true,
      total: inscripcionesFormateadas.length,
      inscripciones: inscripcionesFormateadas
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
 * Controlador para actualizar asistencia de un inscrito
 * PUT /organizador/asistencia/:id
 */
export const actualizarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { asistencia } = req.body;

    // Validar parámetros
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

    // Conectar a MongoDB
    const { db } = await connectMongo();
    const inscripcionesCollection = db.collection('inscripciones');

    // Convertir string ID a ObjectId si es necesario
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

    // Actualizar el documento
    const resultado = await inscripcionesCollection.findOneAndUpdate(
      { _id: objectId },
      { 
        $set: { 
          asistencia: asistencia,
          actualizado_por: req.user.usuario, // Registrar quién actualizó
          actualizado_at: new Date().toISOString()
        } 
      },
      { returnDocument: 'after' } // Devolver el documento actualizado
    );

    if (!resultado) {
      return res.status(404).json({
        success: false,
        message: 'Inscrito no encontrado'
      });
    }

    // Formatear respuesta
    const inscripcionActualizada = {
      _id: resultado._id,
      nombre: resultado.nombre,
      cedula: resultado.cedula,
      correo: resultado.correo,
      telefono: resultado.telefono,
      programa: resultado.programa,
      semestre: resultado.semestre,
      actividad: resultado.actividad,
      created_at: resultado.created_at,
      asistencia: resultado.asistencia
    };

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
