import { Router } from 'express';
import { connectMongo } from '../src/mongo.js';

const router = Router();

// Datos iniciales de actividades con cupos - ACTUALIZADO CON FULL STACK
const actividadesIniciales = [
  {
    id: 1,
    nombre: "Desarrollo Personal y Liderazgo",
    cupoMaximo: 80,
    tipo: "Conferencia",
    coleccion: "liderazgo"
  },
  {
    id: 6,
    nombre: "Visita EMAVI",
    cupoMaximo: 40,
    tipo: "Visita Empresarial", 
    coleccion: "visitaemavi"
  },
  {
    id: 9,
    nombre: "Hackathon Universidades",
    cupoMaximo: 150,
    tipo: "Competencia", 
    coleccion: "hackathon"
  },
  {
    id: 11,
    nombre: "Doble Lumen",
    cupoMaximo: 100,
    tipo: "Conferencia",
    coleccion: "doblalumen"
  },
  {
    id: 15,
    nombre: "Technological Touch 2025",
    cupoMaximo: 200,
    tipo: "Evento",
    coleccion: "technologicaltouch"
  },
  {
    id: 22,
    nombre: "Certificación Full Stack: Spring Boot, Angular & AI",
    cupoMaximo: 30,
    tipo: "Curso",
    coleccion: "desarrollofullstack"
  },
  {
    id: 10,
    nombre: "Industria en Acción",
    cupoMaximo: 40,
    tipo: "Taller",
    coleccion: "industriaenaccion"
  },
  {
    id: 6,
    nombre: "Visita EMAVI",
    cupoMaximo: 40,
    tipo: "Visita Empresarial",
    coleccion: "visitaemavi"
  },
  {
    id: 13,
    nombre: "Visita Zona America",
    cupoMaximo: 40,
    tipo: "Visita Empresarial",
    coleccion: "visitazonaamerica"
  },
  {
    id: 21,
    nombre: "Visita CDI Alimentos Cárnicos",
    cupoMaximo: 20,
    tipo: "Visita Empresarial",
    coleccion: "visitacarnicos"
  },
  {
    id: 14,
    nombre: "Olimpiadas en Lógica Matemáticas",
    cupoMaximo: 100,
    tipo: "Competencia",
    coleccion: "olimpiadasmatematicas"
  },
];

// Inicializar actividades en la base de datos
router.post('/inicializar', async (req, res) => {
  try {
    const { db } = await connectMongo();
    const col = db.collection('actividades');
    
    // Limpiar actividades existentes
    await col.deleteMany({});
    
    // Insertar actividades iniciales
    const result = await col.insertMany(actividadesIniciales);
    
    console.log('✅ Actividades inicializadas:', result.insertedCount);
    
    return res.json({
      message: 'Actividades inicializadas correctamente',
      actividades: result.insertedCount
    });
  } catch (err) {
    console.error('❌ Error inicializando actividades:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// Obtener estadísticas de inscripciones por actividad
router.get('/estadisticas/:idActividad', async (req, res) => {
  try {
    const { idActividad } = req.params;
    const { db } = await connectMongo();
    
    // Obtener información de la actividad
    const actividadesCol = db.collection('actividades');
    const actividad = await actividadesCol.findOne({ id: parseInt(idActividad) });
    
    if (!actividad) {
      return res.status(404).json({
        message: 'Actividad no encontrada'
      });
    }
    
    // Contar inscritos en la colección correspondiente
    const inscritosCol = db.collection(actividad.coleccion);
    const totalInscritos = await inscritosCol.countDocuments({});
    
    const cuposDisponibles = Math.max(0, actividad.cupoMaximo - totalInscritos);
    
    return res.json({
      actividad: actividad.nombre,
      cupoMaximo: actividad.cupoMaximo,
      inscritos: totalInscritos,
      cuposDisponibles: cuposDisponibles,
      disponible: cuposDisponibles > 0
    });
  } catch (err) {
    console.error('❌ Error obteniendo estadísticas:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// Obtener todas las actividades con estadísticas
router.get('/todas', async (req, res) => {
  try {
    const { db } = await connectMongo();
    const actividadesCol = db.collection('actividades');
    
    const actividades = await actividadesCol.find({}).toArray();
    
    // Obtener estadísticas para cada actividad
    const actividadesConEstadisticas = await Promise.all(
      actividades.map(async (actividad) => {
        try {
          const inscritosCol = db.collection(actividad.coleccion);
          const totalInscritos = await inscritosCol.countDocuments({});
          const cuposDisponibles = Math.max(0, actividad.cupoMaximo - totalInscritos);
          
          return {
            ...actividad,
            inscritos: totalInscritos,
            cuposDisponibles: cuposDisponibles,
            disponible: cuposDisponibles > 0
          };
        } catch (error) {
          console.error(`Error procesando actividad ${actividad.id}:`, error);
          return {
            ...actividad,
            inscritos: 0,
            cuposDisponibles: actividad.cupoMaximo,
            disponible: true,
            error: true
          };
        }
      })
    );
    
    return res.json({
      message: 'Actividades obtenidas correctamente',
      actividades: actividadesConEstadisticas
    });
  } catch (err) {
    console.error('❌ Error obteniendo actividades:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message
    });
  }
});

// Verificar disponibilidad de cupo para una actividad
router.get('/verificar-cupo/:idActividad', async (req, res) => {
  try {
    const { idActividad } = req.params;
    const { db } = await connectMongo();
    
    const actividadesCol = db.collection('actividades');
    const actividad = await actividadesCol.findOne({ id: parseInt(idActividad) });
    
    if (!actividad) {
      return res.status(404).json({
        message: 'Actividad no encontrada',
        disponible: false
      });
    }
    
    const inscritosCol = db.collection(actividad.coleccion);
    const totalInscritos = await inscritosCol.countDocuments({});
    const cuposDisponibles = Math.max(0, actividad.cupoMaximo - totalInscritos);
    
    return res.json({
      actividad: actividad.nombre,
      disponible: cuposDisponibles > 0,
      cuposDisponibles: cuposDisponibles,
      cupoMaximo: actividad.cupoMaximo,
      inscritos: totalInscritos
    });
  } catch (err) {
    console.error('❌ Error verificando cupo:', err);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: err.message,
      disponible: false
    });
  }
});

export default router;