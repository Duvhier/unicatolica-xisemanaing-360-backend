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
 * No requiere middleware de autenticación
 */
router.post('/login', loginOrganizador);

/**
 * GET /organizador/inscripciones
 * Endpoint protegido para obtener todas las inscripciones
 * Requiere token JWT válido
 */
router.get('/inscripciones', authMiddleware, getInscripciones);

/**
 * PUT /organizador/asistencia/:id
 * Endpoint protegido para actualizar asistencia de un inscrito
 * Requiere token JWT válido
 */
router.put('/asistencia/:id', authMiddleware, actualizarAsistencia);

/**
 * GET /organizador/profile
 * Endpoint protegido para obtener información del organizador autenticado
 * Requiere token JWT válido
 */
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    usuario: req.user
  });
});

/**
 * GET /organizador/stats
 * Endpoint protegido para obtener estadísticas básicas
 * Requiere token JWT válido
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { connectMongo } = await import('../mongo.js');
    const { db } = await connectMongo();
    const inscripcionesCollection = db.collection('inscripciones');

    // Obtener estadísticas básicas
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
