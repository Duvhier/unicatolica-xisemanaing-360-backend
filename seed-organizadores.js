import dotenv from 'dotenv';
import { connectMongo } from './src/mongo.js';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para crear datos de prueba de organizadores
 * Ejecutar con: node seed-organizadores.js
 * Opcional upsert único: node seed-organizadores.js --upsert --usuario=organizadorDemo --password=org123 --rol=organizador --nombre="Organizador Demo"
 */
async function seedOrganizadores() {
  try {
    console.log('🌱 Iniciando inserción de datos de prueba...');
    
    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');

    const args = process.argv.slice(2);
    const isUpsert = args.includes('--upsert');

    if (isUpsert) {
      // Parseo simple de argumentos --clave=valor
      const params = Object.fromEntries(
        args
          .filter(a => a.startsWith('--') && a.includes('='))
          .map(a => {
            const [k, v] = a.replace(/^--/, '').split('=');
            return [k, v];
          })
      );

      const usuario = params.usuario || 'organizadorDemo';
      const password = params.password || 'org123';
      const nombre = params.nombre || 'Organizador Demo';
      const rol = params.rol || 'organizador';
      const email = params.email || 'organizador.demo@unicatolica.edu.co';

      const doc = {
        usuario,
        password,
        nombre,
        rol,
        email,
        activo: true,
        updated_at: new Date().toISOString(),
      };

      const res = await organizadoresCollection.updateOne(
        { usuario },
        { $set: doc, $setOnInsert: { created_at: new Date().toISOString() } },
        { upsert: true }
      );

      if (res.upsertedCount === 1) {
        console.log(`✅ Insertado usuario de prueba: ${usuario} / ${password}`);
      } else if (res.matchedCount === 1) {
        console.log(`✅ Actualizado usuario existente: ${usuario} / ${password}`);
      } else {
        console.log('ℹ️ No se realizaron cambios');
      }

      return;
    }

    // Modo por defecto: re-seed controlado (borrar e insertar nuevos)
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
