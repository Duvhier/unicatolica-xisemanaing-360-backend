// organizadorRoutes.js - VERSIÓN CORREGIDA
import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js'; // ← Ruta correcta
import { 
  loginOrganizador, 
  getInscripciones, 
  actualizarAsistencia,
  buscarInscripcionPorId,
  solicitarCodigo2FA,
  verificarCodigo2FA
} from '../controllers/organizadorController.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/login', loginOrganizador);

// Rutas públicas de autenticación 2FA
router.post('/2fa/solicitar', solicitarCodigo2FA);
router.post('/2fa/verificar', verificarCodigo2FA);

// Rutas protegidas
router.get('/inscripciones', authMiddleware, getInscripciones);
router.put('/asistencia/:id', authMiddleware, actualizarAsistencia);
router.get('/buscar-inscripcion/:id', authMiddleware, buscarInscripcionPorId);

// Perfil y stats
router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    success: true,
    usuario: req.user
  });
});

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