// organizadorController.js - VERSIÓN CORREGIDA
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { connectMongo } from '../mongo.js';

// ELIMINAR el middleware duplicado que habías agregado
// Mantener solo las funciones del controlador

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

    // CORREGIDO: Usar req.user del middleware
    const resultado = await collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          asistencia: asistencia,
          actualizado_por: req.user?.usuario || 'sistema', // ← Ahora req.user existe
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

/**
 * NUEVO: Buscar inscripción por ID para el scanner QR
 * GET /organizador/buscar-inscripcion/:id
 */
export const buscarInscripcionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const { coleccion } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de inscripción requerido'
      });
    }

    const { db } = await connectMongo();

    // Buscar en todas las colecciones posibles
    const colecciones = coleccion ? [coleccion] : [
      'inscripciones', 
      'asistenciainaugural', 
      'liderazgo', 
      'hackathon', 
      'technologicaltouch',
      'visitazonaamerica'
    ];

    let inscripcionEncontrada = null;
    let coleccionEncontrada = null;

    for (const colName of colecciones) {
      try {
        const collection = db.collection(colName);
        const { ObjectId } = await import('mongodb');
        
        let objectId;
        try {
          objectId = new ObjectId(id);
        } catch {
          // Si no es ObjectId válido, buscar por otros campos
          const resultado = await collection.findOne({
            $or: [
              { _id: id },
              { cedula: id },
              { correo: id }
            ]
          });
          
          if (resultado) {
            inscripcionEncontrada = resultado;
            coleccionEncontrada = colName;
            break;
          }
          continue;
        }

        const resultado = await collection.findOne({ _id: objectId });
        if (resultado) {
          inscripcionEncontrada = resultado;
          coleccionEncontrada = colName;
          break;
        }
      } catch (error) {
        console.log(`Búsqueda en ${colName} falló:`, error.message);
        continue;
      }
    }

    if (!inscripcionEncontrada) {
      return res.status(404).json({
        success: false,
        message: 'Inscripción no encontrada'
      });
    }

    // Formatear respuesta
    const inscripcionFormateada = {
      _id: inscripcionEncontrada._id,
      nombre: inscripcionEncontrada.nombre,
      cedula: inscripcionEncontrada.cedula,
      correo: inscripcionEncontrada.correo,
      telefono: inscripcionEncontrada.telefono,
      programa: inscripcionEncontrada.programa,
      semestre: inscripcionEncontrada.semestre,
      actividad: inscripcionEncontrada.actividad,
      asistencia: inscripcionEncontrada.asistencia ?? false,
      rol: inscripcionEncontrada.rol,
      tipoEstudiante: inscripcionEncontrada.tipoEstudiante,
      facultad: inscripcionEncontrada.facultad,
      coleccion: coleccionEncontrada
    };

    res.json({
      success: true,
      inscripcion: inscripcionFormateada
    });

  } catch (error) {
    console.error('❌ Error buscando inscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Solicitar código de verificación 2FA por WhatsApp
 * POST /organizador/2fa/solicitar
 * Body: { usuarioId: string }
 */
export const solicitarCodigo2FA = async (req, res) => {
  let objectId = null;
  let organizadoresCollection = null;
  
  try {
    const { usuarioId } = req.body;

    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario es requerido'
      });
    }

    const { db } = await connectMongo();
    organizadoresCollection = db.collection('usuariosOrganizadores');

    // Buscar el usuario organizador
    const { ObjectId } = await import('mongodb');
    try {
      objectId = new ObjectId(usuarioId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    const organizador = await organizadoresCollection.findOne({ _id: objectId });

    if (!organizador) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que el usuario tenga un número de teléfono registrado
    if (!organizador.telefono) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene un número de teléfono registrado para enviar WhatsApp'
      });
    }

    // Validar formato básico del teléfono
    const telefono = organizador.telefono.trim();
    if (telefono.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'El número de teléfono registrado es inválido'
      });
    }

    // Verificar rate limiting (máximo 3 solicitudes en 10 minutos)
    const diezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);
    if (organizador.ultimoIntento2FA && organizador.ultimoIntento2FA > diezMinutosAtras) {
      const solicitudesRecientes = await organizadoresCollection.countDocuments({
        _id: objectId,
        'codigo2FA.expiracion': { $gt: diezMinutosAtras }
      });

      if (solicitudesRecientes >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Espera 10 minutos antes de solicitar otro código.'
        });
      }
    }

    // Generar código de 6 dígitos
    const codigo2FA = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos

    // Guardar el código en la base de datos
    await organizadoresCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          codigo2FA: {
            codigo: codigo2FA,
            expiracion: expiracion,
            intentos: 0,
            usado: false
          },
          ultimoIntento2FA: new Date()
        }
      }
    );

    // 📱 ENVIAR WHATSAPP
    console.log(`📱 Intentando enviar WhatsApp a: ${telefono}`);
    const whatsappEnviado = await enviarWhatsApp2FA(telefono, codigo2FA);

    if (!whatsappEnviado) {
      // Revertir la creación del código si falla el envío
      await organizadoresCollection.updateOne(
        { _id: objectId },
        {
          $unset: { codigo2FA: "" }
        }
      );

      return res.status(500).json({
        success: false,
        message: 'Error al enviar el código por WhatsApp. Verifica tu número de teléfono o intenta más tarde.',
        sugerencia: 'Si estás usando el sandbox de Twilio, asegúrate de suscribir tu número enviando "join [palabra-clave]" al número de Twilio desde WhatsApp.'
      });
    }

    console.log(`✅ Código 2FA ${codigo2FA} enviado por WhatsApp a ${telefono}`);

    // Obtener los últimos 4 dígitos para mostrar al usuario
    const ultimosDigitos = telefono.slice(-4);

    res.json({
      success: true,
      message: 'Código de verificación enviado por WhatsApp',
      metodo: 'whatsapp',
      telefono: `••••••${ultimosDigitos}`,
      expiracion: expiracion,
      duracion: '2 minutos'
    });

  } catch (error) {
    console.error('❌ Error solicitando código 2FA:', error);
    console.error('📋 Detalles del error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    // Intentar revertir la creación del código si existe
    try {
      if (objectId) {
        await organizadoresCollection.updateOne(
          { _id: objectId },
          { $unset: { codigo2FA: "" } }
        );
      }
    } catch (cleanupError) {
      console.error('❌ Error limpiando código 2FA:', cleanupError);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Error interno del servidor al solicitar código de verificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verificar código 2FA y generar token de acceso
 * POST /organizador/2fa/verificar
 * Body: { usuarioId: string, codigo: string }
 */
export const verificarCodigo2FA = async (req, res) => {
  try {
    const { usuarioId, codigo } = req.body;

    if (!usuarioId || !codigo) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario y código son requeridos'
      });
    }

    if (codigo.length !== 6 || !/^\d+$/.test(codigo)) {
      return res.status(400).json({
        success: false,
        message: 'El código debe ser de 6 dígitos numéricos'
      });
    }

    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');

    const { ObjectId } = await import('mongodb');
    let objectId;
    try {
      objectId = new ObjectId(usuarioId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario inválido'
      });
    }

    const organizador = await organizadoresCollection.findOne({ _id: objectId });

    if (!organizador) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si existe código 2FA
    if (!organizador.codigo2FA) {
      return res.status(400).json({
        success: false,
        message: 'No hay código de verificación pendiente. Solicita uno nuevo.'
      });
    }

    const { codigo: codigoGuardado, expiracion, intentos, usado } = organizador.codigo2FA;

    // Verificar si el código ya fue usado
    if (usado) {
      return res.status(400).json({
        success: false,
        message: 'Este código ya fue utilizado. Solicita uno nuevo.'
      });
    }

    // Verificar expiración
    if (new Date() > new Date(expiracion)) {
      return res.status(400).json({
        success: false,
        message: 'El código ha expirado. Solicita uno nuevo.'
      });
    }

    // Verificar intentos máximos (3 intentos)
    if (intentos >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Demasiados intentos fallidos. Solicita un nuevo código.'
      });
    }

    // Verificar código
    if (codigo !== codigoGuardado) {
      // Incrementar contador de intentos fallidos
      await organizadoresCollection.updateOne(
        { _id: objectId },
        {
          $inc: { 'codigo2FA.intentos': 1 },
          $set: { ultimoIntento2FA: new Date() }
        }
      );

      const intentosRestantes = 3 - (intentos + 1);

      return res.status(400).json({
        success: false,
        message: `Código incorrecto. Te quedan ${intentosRestantes} intentos.`,
        intentosRestantes
      });
    }

    // ✅ Código válido - Generar token de acceso
    const token = jwt.sign(
      {
        id: organizador._id,
        usuario: organizador.usuario,
        rol: organizador.rol || 'organizador',
        nombre: organizador.nombre,
        authMethod: '2fa' // Indicar que se autenticó con 2FA
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Marcar código como usado y limpiar datos 2FA
    // Usar solo $unset para eliminar codigo2FA y $set para los otros campos
    // (No se pueden usar $set y $unset en el mismo campo simultáneamente)
    await organizadoresCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          ultimoAcceso: new Date(),
          ultimoLogin2FA: new Date()
        },
        $unset: {
          codigo2FA: "" // Limpiar el código después de uso exitoso
        }
      }
    );

    // Registrar el acceso exitoso
    await registrarAcceso(organizador._id, '2fa_login', true, req);

    console.log(`✅ Login 2FA exitoso para usuario: ${organizador.usuario}`);

    res.json({
      success: true,
      token,
      usuario: {
        id: organizador._id,
        usuario: organizador.usuario,
        nombre: organizador.nombre,
        rol: organizador.rol || 'organizador',
        telefono: organizador.telefono ? organizador.telefono.slice(-4) : null
      },
      message: 'Autenticación exitosa'
    });

  } catch (error) {
    console.error('❌ Error verificando código 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al verificar código'
    });
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Función para enviar código 2FA por WhatsApp
 * @param {string} telefono - Número de teléfono
 * @param {string} codigo - Código de 6 dígitos
 */
async function enviarWhatsApp2FA(telefono, codigo) {
  try {

    // Validar configuración de Twilio
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM) {
      console.error('❌ Configuración de Twilio WhatsApp incompleta');
      console.error('📋 Variables faltantes:', {
        TWILIO_ACCOUNT_SID: !process.env.TWILIO_ACCOUNT_SID ? 'FALTA' : 'OK',
        TWILIO_AUTH_TOKEN: !process.env.TWILIO_AUTH_TOKEN ? 'FALTA' : 'OK',
        TWILIO_WHATSAPP_FROM: !process.env.TWILIO_WHATSAPP_FROM ? 'FALTA' : 'OK'
      });
      return false;
    }

    // Verificar que las credenciales no estén vacías
    const accountSid = process.env.TWILIO_ACCOUNT_SID.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN.trim();
    
    if (accountSid === '' || authToken === '') {
      console.error('❌ Credenciales de Twilio están vacías');
      return false;
    }

    // Validar formato básico de las credenciales
    if (accountSid.length < 30 || authToken.length < 30) {
      console.error('❌ Credenciales de Twilio parecen estar incompletas');
      console.error('💡 Verifica que hayas copiado completamente el Account SID y Auth Token desde Twilio');
      console.error('📋 Account SID debe empezar con "AC" y tener ~34 caracteres');
      console.error('📋 Auth Token debe tener ~32 caracteres');
      return false;
    }

    // Inicializar cliente de Twilio
    const client = twilio(
      accountSid.trim(),
      authToken.trim()
    );

    // Formatear número de teléfono para WhatsApp
    let numeroFormateado = telefono.trim();
    
    // Formatear número para WhatsApp (debe empezar con whatsapp:+)
    if (!numeroFormateado.startsWith('whatsapp:+')) {
      // Remover cualquier espacio, guión, paréntesis, y el símbolo +
      numeroFormateado = numeroFormateado.replace(/\D/g, '');
      
      // Si empieza con 0, removerlo y agregar código de país
      if (numeroFormateado.startsWith('0')) {
        numeroFormateado = 'whatsapp:+57' + numeroFormateado.substring(1);
      }
      // Si ya tiene el código de país 57 al inicio (12 dígitos: 57 + 10 dígitos)
      else if (numeroFormateado.startsWith('57') && numeroFormateado.length === 12) {
        numeroFormateado = 'whatsapp:+' + numeroFormateado;
      }
      // Si empieza con código de país pero no es 57, agregar whatsapp:+
      else if (numeroFormateado.length > 10 && numeroFormateado.length <= 15) {
        numeroFormateado = 'whatsapp:+' + numeroFormateado;
      }
      // Si tiene 10 dígitos (número colombiano sin código), agregar +57
      else if (numeroFormateado.length === 10) {
        numeroFormateado = 'whatsapp:+57' + numeroFormateado;
      }
      // Si tiene otro formato, agregar whatsapp:+ (intentar enviar tal cual)
      else {
        console.warn('⚠️ Formato de teléfono no reconocido, intentando enviar:', numeroFormateado);
        numeroFormateado = 'whatsapp:+' + numeroFormateado;
      }
    }

    // Validar formato final del número
    if (!/^whatsapp:\+\d{10,15}$/.test(numeroFormateado)) {
      console.error('❌ Formato de WhatsApp inválido:', numeroFormateado);
      console.error('📱 Número original recibido:', telefono);
      return false;
    }

    console.log(`📱 Formateando número: ${telefono} → ${numeroFormateado}`);

    // Mensaje personalizado para WhatsApp
    const mensaje = `🔐 *Semana de la Ingeniería UC*

Tu código de verificación es:
*${codigo}*

⏰ *Válido por 2 minutos*

⚠️ *No compartas este código con nadie.*

_Sistema de Confirmación de Asistencia_`;

    // Enviar mensaje por WhatsApp
    const message = await client.messages.create({
      body: mensaje,
      from: process.env.TWILIO_WHATSAPP_FROM, // Número de WhatsApp de Twilio
      to: numeroFormateado
    });

    console.log(`✅ WhatsApp enviado exitosamente:`, {
      messageId: message.sid,
      to: numeroFormateado,
      status: message.status,
      codigo: codigo,
      timestamp: new Date().toISOString()
    });

    return message.sid !== undefined;

  } catch (error) {
    console.error('❌ Error enviando WhatsApp:', error);
    console.error('📋 Detalles del error de Twilio:', {
      code: error.code,
      message: error.message,
      status: error.status,
      moreInfo: error.moreInfo
    });
    
    // Manejar errores específicos de Twilio WhatsApp
    if (error.code === 20003) {
      console.error('❌ ERROR DE AUTENTICACIÓN DE TWILIO');
      console.error('🔑 El Account SID o Auth Token son incorrectos');
      console.error('💡 Verifica tus credenciales en: https://console.twilio.com/');
      console.error('📋 Asegúrate de copiar las credenciales correctas desde tu consola de Twilio');
    } else if (error.code === 21211) {
      console.error('❌ Número de WhatsApp inválido:', numeroFormateado);
    } else if (error.code === 21408) {
      console.error('❌ No tien permisos para enviar WhatsApp a este número');
    } else if (error.code === 21610) {
      console.error('❌ Número bloqueado o no suscrito al sandbox');
      console.error('💡 Tip: El número debe estar suscrito al sandbox de Twilio WhatsApp');
    } else if (error.code === 30007) {
      console.error('❌ Límite de mensajes de WhatsApp excedido');
    } else if (error.code === 63016) {
      console.error('❌ El número no está suscrito al sandbox de WhatsApp');
      console.error('💡 Tip: Envía "join [palabra-clave]" al número de Twilio desde tu WhatsApp');
    } else {
      console.error('❌ Error desconocido de Twilio:', error.code || 'Sin código');
    }
    
    return false;
  }
}

/**
 * Registrar acceso en logs de auditoría
 * @param {string} usuarioId - ID del usuario
 * @param {string} accion - Tipo de acción
 * @param {boolean} exitoso - Si fue exitoso
 * @param {object} req - Request object para obtener IP y User-Agent
 */
async function registrarAcceso(usuarioId, accion, exitoso, req) {
  try {
    const { db } = await connectMongo();
    const logsCollection = db.collection('logsAcceso');

    await logsCollection.insertOne({
      usuarioId: usuarioId,
      accion: accion,
      exitoso: exitoso,
      fecha: new Date(),
      ip: req?.ip || req?.socket?.remoteAddress || 'Desconocida',
      userAgent: req?.headers?.['user-agent'] || 'Desconocido'
    });
  } catch (error) {
    console.error('❌ Error registrando acceso:', error);
  }
}

/**
 * Limpiar códigos 2FA expirados (ejecutar periódicamente)
 */
export const limpiarCodigos2FAExpirados = async () => {
  try {
    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');

    const resultado = await organizadoresCollection.updateMany(
      {
        'codigo2FA.expiracion': { $lt: new Date() }
      },
      {
        $unset: { codigo2FA: "" }
      }
    );

    console.log(`🧹 Limpiados ${resultado.modifiedCount} códigos 2FA expirados`);
    
    return resultado.modifiedCount;
  } catch (error) {
    console.error('❌ Error limpiando códigos 2FA expirados:', error);
    return 0;
  }
};

/**
 * Obtener resumen completo de todos los eventos con todos los usuarios
 * GET /organizador/resumen-completo-eventos
 */
export const getResumenCompletoEventos = async (req, res) => {
  try {
    const { db } = await connectMongo();

    // 1. Obtener todas las actividades/eventos disponibles
    const actividadesCollection = db.collection('actividades');
    const actividades = await actividadesCollection.find({}).toArray();

    // 2. Obtener inscripciones de todas las colecciones
    const coleccionesEventos = [
      'inscripciones', 
      'asistenciainaugural', 
      'liderazgo', 
      'hackathon', 
      'technologicaltouch',
      'visitazonaamerica'
    ];

    let eventosConInscripciones = [];
    let totalInscripciones = 0;
    let usuariosUnicos = new Set();
    let totalAsistieron = 0;

    // Procesar cada colección de eventos
    for (const coleccion of coleccionesEventos) {
      try {
        const collection = db.collection(coleccion);
        const inscripciones = await collection.find({}).toArray();

        if (inscripciones.length > 0) {
          // Encontrar información de la actividad correspondiente
          const actividadInfo = actividades.find(a => a.coleccion === coleccion) || {
            nombre: coleccion,
            tipo: 'evento',
            coleccion: coleccion
          };

          const inscripcionesFormateadas = inscripciones.map(insc => ({
            _id: insc._id,
            nombre: insc.nombre,
            cedula: insc.cedula,
            correo: insc.correo,
            telefono: insc.telefono,
            programa: insc.programa,
            semestre: insc.semestre,
            actividad: insc.actividad,
            rol: insc.rol,
            tipoEstudiante: insc.tipoEstudiante,
            facultad: insc.facultad,
            empresa: insc.empresa,
            cargo: insc.cargo,
            equipo: insc.grupo?.nombre,
            proyecto: insc.grupo?.proyecto?.nombre,
            evento: insc.evento,
            asistencia: insc.asistencia ?? false,
            fecha_inscripcion: insc.created_at,
            updated_at: insc.updated_at,
            coleccion: coleccion
          }));

          const totalInscritosColeccion = inscripciones.length;
          const totalAsistieronColeccion = inscripciones.filter(i => i.asistencia === true).length;
          const tasaAsistencia = totalInscritosColeccion > 0 
            ? ((totalAsistieronColeccion / totalInscritosColeccion) * 100).toFixed(1)
            : '0.0';

          eventosConInscripciones.push({
            nombre: actividadInfo.nombre,
            tipo: actividadInfo.tipo || 'evento',
            coleccion: coleccion,
            total_inscritos: totalInscritosColeccion,
            total_asistieron: totalAsistieronColeccion,
            tasa_asistencia: tasaAsistencia,
            inscripciones: inscripcionesFormateadas
          });

          totalInscripciones += totalInscritosColeccion;
          totalAsistieron += totalAsistieronColeccion;

          // Agregar usuarios únicos (por cédula)
          inscripciones.forEach(insc => {
            if (insc.cedula) {
              usuariosUnicos.add(insc.cedula);
            }
          });
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo acceder a la colección ${coleccion}:`, error.message);
        continue;
      }
    }

    // 3. Calcular estadísticas generales
    const tasaAsistenciaGeneral = totalInscripciones > 0 
      ? ((totalAsistieron / totalInscripciones) * 100).toFixed(1)
      : '0.0';

    const resumenCompleto = {
      total_eventos: eventosConInscripciones.length,
      total_inscripciones: totalInscripciones,
      total_usuarios_unicos: usuariosUnicos.size,
      total_asistieron: totalAsistieron,
      tasa_asistencia_general: tasaAsistenciaGeneral,
      eventos: eventosConInscripciones,
      fecha_generacion: new Date().toISOString()
    };

    res.json({
      success: true,
      resumen: resumenCompleto,
      message: 'Resumen completo generado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error generando resumen completo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar resumen completo'
    });
  }
};

/**
 * Obtener estadísticas generales de todos los eventos
 * GET /organizador/estadisticas-generales
 */
export const getEstadisticasGenerales = async (req, res) => {
  try {
    const { db } = await connectMongo();

    const coleccionesEventos = [
      'inscripciones', 
      'asistenciainaugural', 
      'liderazgo', 
      'hackathon', 
      'technologicaltouch',
      'visitazonaamerica'
    ];

    let estadisticas = {
      total_eventos: 0,
      total_inscripciones: 0,
      total_asistieron: 0,
      total_usuarios_unicos: new Set(),
      eventos_detalle: [],
      resumen_por_tipo: {},
      fecha_actualizacion: new Date().toISOString()
    };

    for (const coleccion of coleccionesEventos) {
      try {
        const collection = db.collection(coleccion);
        const inscripciones = await collection.find({}).toArray();

        if (inscripciones.length > 0) {
          const totalInscritos = inscripciones.length;
          const totalAsistieron = inscripciones.filter(i => i.asistencia === true).length;
          const tasaAsistencia = totalInscritos > 0 
            ? ((totalAsistieron / totalInscritos) * 100).toFixed(1)
            : '0.0';

          // Agregar usuarios únicos
          inscripciones.forEach(insc => {
            if (insc.cedula) {
              estadisticas.total_usuarios_unicos.add(insc.cedula);
            }
          });

          estadisticas.eventos_detalle.push({
            coleccion: coleccion,
            total_inscritos: totalInscritos,
            total_asistieron: totalAsistieron,
            tasa_asistencia: tasaAsistencia,
            ultima_actualizacion: new Date().toISOString()
          });

          estadisticas.total_inscripciones += totalInscritos;
          estadisticas.total_asistieron += totalAsistieron;
          estadisticas.total_eventos++;
        }
      } catch (error) {
        console.warn(`⚠️ No se pudo procesar estadísticas para ${coleccion}:`, error.message);
        continue;
      }
    }

    // Convertir Set a número
    estadisticas.total_usuarios_unicos = estadisticas.total_usuarios_unicos.size;

    // Calcular tasas generales
    estadisticas.tasa_asistencia_general = estadisticas.total_inscripciones > 0 
      ? ((estadisticas.total_asistieron / estadisticas.total_inscripciones) * 100).toFixed(1)
      : '0.0';

    estadisticas.tasa_participacion_unica = estadisticas.total_inscripciones > 0 
      ? ((estadisticas.total_usuarios_unicos / estadisticas.total_inscripciones) * 100).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      estadisticas: estadisticas,
      message: 'Estadísticas generales generadas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error generando estadísticas generales:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al generar estadísticas'
    });
  }
};

/**
 * Exportar datos completos en diferentes formatos
 * GET /organizador/exportar-datos-completos?formato=json|csv|excel
 */
export const exportarDatosCompletos = async (req, res) => {
  try {
    const { formato = 'json' } = req.query;

    if (!['json', 'csv', 'excel'].includes(formato)) {
      return res.status(400).json({
        success: false,
        message: 'Formato no válido. Use: json, csv o excel'
      });
    }

    const { db } = await connectMongo();

    // Obtener todos los datos usando la función de resumen completo
    const coleccionesEventos = [
      'inscripciones', 
      'asistenciainaugural', 
      'liderazgo', 
      'hackathon', 
      'technologicaltouch',
      'visitazonaamerica'
    ];

    let todosLosDatos = [];

    for (const coleccion of coleccionesEventos) {
      try {
        const collection = db.collection(coleccion);
        const datos = await collection.find({}).toArray();

        const datosFormateados = datos.map(item => ({
          coleccion: coleccion,
          id: item._id,
          nombre: item.nombre,
          cedula: item.cedula,
          correo: item.correo,
          telefono: item.telefono,
          programa: item.programa,
          semestre: item.semestre,
          actividad: item.actividad,
          rol: item.rol,
          tipoEstudiante: item.tipoEstudiante,
          facultad: item.facultad,
          empresa: item.empresa,
          cargo: item.cargo,
          equipo: item.grupo?.nombre,
          proyecto: item.grupo?.proyecto?.nombre,
          evento: item.evento,
          asistencia: item.asistencia ?? false,
          fecha_inscripcion: item.created_at,
          fecha_actualizacion: item.updated_at,
          estado: item.estado || 'activo'
        }));

        todosLosDatos = todosLosDatos.concat(datosFormateados);
      } catch (error) {
        console.warn(`⚠️ No se pudieron exportar datos de ${coleccion}:`, error.message);
        continue;
      }
    }

    switch (formato) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="datos-completos-${new Date().toISOString().split('T')[0]}.json"`);
        res.json({
          success: true,
          total_registros: todosLosDatos.length,
          fecha_exportacion: new Date().toISOString(),
          datos: todosLosDatos
        });
        break;

      case 'csv':
        // Convertir a CSV
        if (todosLosDatos.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No hay datos para exportar'
          });
        }

        const headers = Object.keys(todosLosDatos[0]);
        const csvRows = [];

        // Encabezados
        csvRows.push(headers.join(','));

        // Datos
        todosLosDatos.forEach(item => {
          const row = headers.map(header => {
            const value = item[header];
            // Escapar comas y comillas para CSV
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            return `"${stringValue.replace(/"/g, '""')}"`;
          });
          csvRows.push(row.join(','));
        });

        const csvContent = csvRows.join('\n');

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="datos-completos-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
        break;

      case 'excel':
        // Para Excel, podrías usar una librería como exceljs
        // Por ahora devolvemos JSON y el frontend puede usar SheetJS
        res.json({
          success: true,
          message: 'Para exportar a Excel, use la función de exportación CSV y ábralo en Excel',
          total_registros: todosLosDatos.length,
          datos: todosLosDatos
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Formato no soportado'
        });
    }

  } catch (error) {
    console.error('❌ Error exportando datos completos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al exportar datos'
    });
  }
};

/**
 * Obtener detalles específicos de un evento
 * GET /organizador/evento/:coleccion/detalles
 */
export const getDetallesEvento = async (req, res) => {
  try {
    const { coleccion } = req.params;

    if (!coleccion) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de colección requerido'
      });
    }

    const { db } = await connectMongo();

    // Verificar si la colección existe
    const actividadesCollection = db.collection('actividades');
    const actividadInfo = await actividadesCollection.findOne({ coleccion });

    if (!actividadInfo) {
      return res.status(404).json({
        success: false,
        message: 'Evento no encontrado'
      });
    }

    // Obtener inscripciones de la colección
    const eventCollection = db.collection(coleccion);
    const inscripciones = await eventCollection.find({}).toArray();

    const estadisticas = {
      total_inscritos: inscripciones.length,
      total_asistieron: inscripciones.filter(i => i.asistencia === true).length,
      total_no_asistieron: inscripciones.filter(i => i.asistencia === false).length,
      total_sin_confirmar: inscripciones.filter(i => i.asistencia === undefined || i.asistencia === null).length,
      tasa_asistencia: inscripciones.length > 0 
        ? ((inscripciones.filter(i => i.asistencia === true).length / inscripciones.length) * 100).toFixed(1)
        : '0.0'
    };

    // Estadísticas por rol
    const porRol = {};
    inscripciones.forEach(insc => {
      const rol = insc.rol || 'no-especificado';
      if (!porRol[rol]) {
        porRol[rol] = { total: 0, asistieron: 0 };
      }
      porRol[rol].total++;
      if (insc.asistencia === true) {
        porRol[rol].asistieron++;
      }
    });

    // Estadísticas por facultad/programa
    const porPrograma = {};
    inscripciones.forEach(insc => {
      const programa = insc.programa || 'no-especificado';
      if (!porPrograma[programa]) {
        porPrograma[programa] = { total: 0, asistieron: 0 };
      }
      porPrograma[programa].total++;
      if (insc.asistencia === true) {
        porPrograma[programa].asistieron++;
      }
    });

    res.json({
      success: true,
      evento: actividadInfo,
      estadisticas: estadisticas,
      desglose: {
        por_rol: porRol,
        por_programa: porPrograma
      },
      total_inscripciones: inscripciones.length,
      inscripciones: inscripciones.map(insc => ({
        _id: insc._id,
        nombre: insc.nombre,
        cedula: insc.cedula,
        correo: insc.correo,
        telefono: insc.telefono,
        programa: insc.programa,
        rol: insc.rol,
        asistencia: insc.asistencia ?? false,
        fecha_inscripcion: insc.created_at
      }))
    });

  } catch (error) {
    console.error('❌ Error obteniendo detalles del evento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};