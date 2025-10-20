import dotenv from 'dotenv';
import { connectMongo } from './src/mongo.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para crear datos de prueba de organizadores
 * Ejecutar con: node seed-organizadores.js
 */
async function seedOrganizadores() {
  try {
    console.log('🌱 Iniciando inserción de datos de prueba...');
    
    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');

    // Datos de organizadores de prueba
    const organizadoresPrueba = [
      {
        usuario: 'admin',
        password: 'admin123',
        nombre: 'Administrador Principal',
        rol: 'admin',
        email: 'admin@unicatolica.edu.co',
        activo: true,
        created_at: new Date().toISOString()
      },
      {
        usuario: 'organizador1',
        password: 'org123',
        nombre: 'María González',
        rol: 'organizador',
        email: 'maria.gonzalez@unicatolica.edu.co',
        activo: true,
        created_at: new Date().toISOString()
      },
      {
        usuario: 'organizador2',
        password: 'org456',
        nombre: 'Carlos Rodríguez',
        rol: 'organizador',
        email: 'carlos.rodriguez@unicatolica.edu.co',
        activo: true,
        created_at: new Date().toISOString()
      },
      {
        usuario: 'supervisor',
        password: 'super123',
        nombre: 'Ana Martínez',
        rol: 'supervisor',
        email: 'ana.martinez@unicatolica.edu.co',
        activo: true,
        created_at: new Date().toISOString()
      }
    ];

    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await organizadoresCollection.deleteMany({});

    // Insertar nuevos datos
    console.log('📝 Insertando organizadores de prueba...');
    const resultado = await organizadoresCollection.insertMany(organizadoresPrueba);

    console.log(`✅ Se insertaron ${resultado.insertedCount} organizadores:`);
    organizadoresPrueba.forEach((org, index) => {
      console.log(`   ${index + 1}. Usuario: ${org.usuario} | Contraseña: ${org.password} | Rol: ${org.rol}`);
    });

    console.log('\n🔐 Credenciales de prueba:');
    console.log('   Admin: usuario=admin, password=admin123');
    console.log('   Organizador 1: usuario=organizador1, password=org123');
    console.log('   Organizador 2: usuario=organizador2, password=org456');
    console.log('   Supervisor: usuario=supervisor, password=super123');

    console.log('\n🚀 ¡Datos de prueba creados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOrganizadores();
}
