// scripts/limpiar2FA.js
import { limpiarCodigos2FAExpirados } from '../src/controllers/organizadorController.js';

// Ejecutar limpieza
limpiarCodigos2FAExpirados()
  .then(count => {
    console.log(`✅ Limpieza completada. ${count} códigos eliminados.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error en limpieza:', error);
    process.exit(1);
  });

