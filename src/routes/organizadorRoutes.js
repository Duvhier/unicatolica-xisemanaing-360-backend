import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  loginOrganizador, 
  getInscripciones, 
  actualizarAsistencia 
} from '../controllers/organizadorController.js';

const router = Router();

/**
 * POST /organizador/login
 * Endpoint público para autenticación de organizadores
 */
router.post('/login', loginOrganizador);

/**
 * GET /organizador/inscripciones
 * Endpoint protegido para obtener inscripciones de un evento/colección específica
 * Requiere: ?coleccion=nombreColeccion (por ejemplo: ?coleccion=asistenciainaugural)
 */
router.get('/inscripciones', authMiddleware, getInscripciones);

/**
 * PUT /organizador/asistencia/:id
 * Endpoint protegido para actualizar asistencia de un inscrito en la colección indicada
 * Requiere: ?coleccion=nombreColeccion (por ejemplo: ?coleccion=asistenciainaugural)
 * Body: { asistencia: true|false }
 */
router.put('/asistencia/:id', authMiddleware, actualizarAsistencia);

/**
 * GET /organizador/profile
 * Endpoint protegido para obtener información del organizador autenticado
 */
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    usuario: req.user
  });
});

/**
 * GET /organizador/stats
 * Estadísticas básicas de la colección indicada (o de inscripciones por defecto)
 * Requiere: ?coleccion=nombreColeccion (opcional)
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { connectMongo } = await import('../mongo.js');
    const { db } = await connectMongo();
    const { coleccion } = req.query;
    let collectionName = 'inscripciones';
    if (coleccion) {
      // Valida que la colección exista
      const actividad = await db.collection('actividades').findOne({ coleccion });
      if (!actividad) {
        return res.status(404).json({
          success: false,
          message: 'La colección de actividades no existe'
        });
      }
      collectionName = coleccion;
    }
    const inscripcionesCollection = db.collection(collectionName);

    // Estadísticas
    const totalInscripciones = await inscripcionesCollection.countDocuments();
    const totalAsistencia = await inscripcionesCollection.countDocuments({ asistencia: true });
    const totalSinAsistencia = await inscripcionesCollection.countDocuments({ asistencia: false });

    res.json({
      success: true,
      estadisticas: {
        totalInscripciones,
        totalAsistencia,
        totalSinAsistencia,
        porcentajeAsistencia: totalInscripciones > 0 
          ? Math.round((totalAsistencia / totalInscripciones) * 100) 
          : 0
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;