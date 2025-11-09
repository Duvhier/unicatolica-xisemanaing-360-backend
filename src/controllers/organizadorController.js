import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { connectMongo } from '../mongo.js';

export const loginOrganizador = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    console.log('📥 Login attempt:', { usuario, passwordLength: password?.length });

    // ✅ VALIDACIÓN MEJORADA - Verificar que existan Y tengan contenido después del trim
    if (!usuario?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');

    // Buscar usuario con trim
    let organizador = await organizadoresCollection.findOne({
      usuario: usuario.trim()
    });

    // Usuario demo por si no existe
    if (!organizador && usuario.trim() === 'organizadorDemo' && password.trim() === 'org123') {
      const usuarioDemo = {
        usuario: 'organizadorDemo',
        password: 'org123',
        nombre: 'Organizador Demo',
        rol: 'organizador',
        email: 'organizador.demo@unicatolica.edu.co',
        telefono: '+573013376768', // ✅ NÚMERO REAL ACTUALIZADO
        activo: true,
        created_at: new Date().toISOString()
      };
      const resultado = await organizadoresCollection.insertOne(usuarioDemo);
      organizador = { ...usuarioDemo, _id: resultado.insertedId };
      console.log('✅ Usuario demo creado con número real');
    }

    if (!organizador) {
      console.log('❌ Usuario no encontrado:', usuario);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // ✅ COMPARACIÓN DE CONTRASEÑA MEJORADA
    if (organizador.password.trim() !== password.trim()) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    console.log('✅ Credenciales válidas para:', organizador.usuario);

    // ✅ DEVOLVER user en lugar de usuario para consistencia con el frontend
    res.json({
      success: true,
      user: {
        id: organizador._id,
        _id: organizador._id, // Ambos por compatibilidad
        usuario: organizador.usuario,
        nombre: organizador.nombre,
        rol: organizador.rol || 'organizador',
        email: organizador.email,
        correo: organizador.email,
        telefono: organizador.telefono
      },
      message: 'Login exitoso. Solicite código 2FA.'
    });

  } catch (error) {
    console.error('❌ Error en login de organizador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getInscripciones = async (req, res) => {
  try {
    const { coleccion } = req.query;
    const { db } = await connectMongo();

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
          actualizado_por: req.user?.usuario || 'sistema',
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

    res.json({
      success: true,
      message: `Asistencia ${asistencia ? 'marcada' : 'desmarcada'} correctamente`,
      inscripcion: resultado.value
    });
  } catch (error) {
    console.error('❌ Error actualizando asistencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

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

    res.json({
      success: true,
      inscripcion: {
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
      }
    });

  } catch (error) {
    console.error('❌ Error buscando inscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

export const solicitarCodigo2FA = async (req, res) => {
  let objectId = null;
  let organizadoresCollection = null;

  try {
    const { usuarioId } = req.body;

    console.log('📱 Solicitud 2FA para usuario:', usuarioId);

    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        message: 'ID de usuario es requerido'
      });
    }

    const { db } = await connectMongo();
    organizadoresCollection = db.collection('usuariosOrganizadores');

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

    if (!organizador.telefono) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene un número de teléfono registrado'
      });
    }

    // Rate limiting
    const diezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);
    if (organizador.ultimoIntento2FA && organizador.ultimoIntento2FA > diezMinutosAtras) {
      const solicitudesRecientes = await organizadoresCollection.countDocuments({
        _id: objectId,
        'codigo2FA.expiracion': { $gt: diezMinutosAtras }
      });

      if (solicitudesRecientes >= 3) {
        return res.status(429).json({
          success: false,
          message: 'Demasiadas solicitudes. Espera 10 minutos.'
        });
      }
    }

    const codigo2FA = Math.floor(100000 + Math.random() * 900000).toString();
    const expiracion = new Date(Date.now() + 2 * 60 * 1000);

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

    console.log(`📱 Código generado: ${codigo2FA} para ${organizador.telefono}`);

    // ✅ MODO PRODUCCIÓN - Twilio activado (tu número ya está configurado)
    console.log('🚀 Enviando código por WhatsApp a número real...');
    const whatsappEnviado = await enviarWhatsApp2FA(organizador.telefono, codigo2FA);

    if (!whatsappEnviado) {
      await organizadoresCollection.updateOne(
        { _id: objectId },
        { $unset: { codigo2FA: "" } }
      );

      return res.status(500).json({
        success: false,
        message: 'Error al enviar el código por WhatsApp',
        sugerencia: 'Verifica que tu número esté suscrito al sandbox de Twilio'
      });
    }

    const ultimosDigitos = organizador.telefono.slice(-4);

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

    try {
      if (objectId && organizadoresCollection) {
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
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const verificarCodigo2FA = async (req, res) => {
  try {
    const { usuarioId, codigo } = req.body;

    console.log('🔐 Verificando código 2FA:', { usuarioId, codigo });

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

    if (!organizador.codigo2FA) {
      return res.status(400).json({
        success: false,
        message: 'No hay código de verificación pendiente'
      });
    }

    const { codigo: codigoGuardado, expiracion, intentos, usado } = organizador.codigo2FA;

    if (usado) {
      return res.status(400).json({
        success: false,
        message: 'Este código ya fue utilizado'
      });
    }

    if (new Date() > new Date(expiracion)) {
      return res.status(400).json({
        success: false,
        message: 'El código ha expirado'
      });
    }

    if (intentos >= 3) {
      return res.status(400).json({
        success: false,
        message: 'Demasiados intentos fallidos'
      });
    }

    if (codigo !== codigoGuardado) {
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
        message: `Código incorrecto. Te quedan ${intentosRestantes} intentos`,
        intentosRestantes
      });
    }

    // ✅ Código válido
    const token = jwt.sign(
      {
        id: organizador._id,
        usuario: organizador.usuario,
        rol: organizador.rol || 'organizador',
        nombre: organizador.nombre,
        authMethod: '2fa'
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    await organizadoresCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          ultimoAcceso: new Date(),
          ultimoLogin2FA: new Date()
        },
        $unset: {
          codigo2FA: ""
        }
      }
    );

    await registrarAcceso(organizador._id, '2fa_login', true, req);

    console.log(`✅ Login 2FA exitoso para: ${organizador.usuario}`);

    res.json({
      success: true,
      token,
      user: {
        id: organizador._id,
        usuario: organizador.usuario,
        nombre: organizador.nombre,
        rol: organizador.rol || 'organizador'
      },
      usuario: {
        id: organizador._id,
        usuario: organizador.usuario,
        nombre: organizador.nombre,
        rol: organizador.rol || 'organizador'
      },
      message: 'Autenticación exitosa'
    });

  } catch (error) {
    console.error('❌ Error verificando código 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// ===== FUNCIONES AUXILIARES =====

async function enviarWhatsApp2FA(telefono, codigo) {
  try {
    console.log('🔧 Configurando Twilio...');

    // Verificar variables de entorno con más detalle
    if (!process.env.TWILIO_ACCOUNT_SID) {
      console.error('❌ TWILIO_ACCOUNT_SID no está definida');
      return false;
    }

    if (!process.env.TWILIO_AUTH_TOKEN) {
      console.error('❌ TWILIO_AUTH_TOKEN no está definida');
      return false;
    }

    if (!process.env.TWILIO_WHATSAPP_FROM) {
      console.error('❌ TWILIO_WHATSAPP_FROM no está definida');
      return false;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN.trim();
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM.trim();

    console.log('🔧 Twilio config:', {
      accountSid: accountSid ? '✅ Definida' : '❌ No definida',
      authToken: authToken ? '✅ Definida' : '❌ No definida',
      fromNumber: fromNumber ? '✅ Definida' : '❌ No definida'
    });

    if (!accountSid || !authToken || !fromNumber) {
      console.error('❌ Credenciales de Twilio incompletas');
      return false;
    }

    const client = twilio(accountSid, authToken);

    // Formatear número (tu número real +573013376768)
    let numeroFormateado = telefono.trim().replace(/\D/g, '');

    if (numeroFormateado.startsWith('0')) {
      numeroFormateado = 'whatsapp:+57' + numeroFormateado.substring(1);
    } else if (numeroFormateado.startsWith('57') && numeroFormateado.length === 12) {
      numeroFormateado = 'whatsapp:+' + numeroFormateado;
    } else if (numeroFormateado.length === 10) {
      numeroFormateado = 'whatsapp:+57' + numeroFormateado;
    } else {
      numeroFormateado = 'whatsapp:+' + numeroFormateado;
    }

    console.log(`📱 Enviando WhatsApp:`, {
      from: fromNumber,
      to: numeroFormateado,
      codigo: codigo
    });

    const mensaje = `🔐 *Semana de la Ingeniería UC*

Tu código de verificación es:
*${codigo}*

⏰ *Válido por 2 minutos*

⚠️ *No compartas este código.*`;

    const message = await client.messages.create({
      body: mensaje,
      from: fromNumber,
      to: numeroFormateado
    });

    console.log(`✅ WhatsApp enviado exitosamente:`, {
      messageId: message.sid,
      status: message.status,
      to: message.to
    });

    return true;

  } catch (error) {
    console.error('❌ Error detallado enviando WhatsApp:', {
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      stack: error.stack
    });

    // Errores específicos de Twilio
    if (error.code === 21211) {
      console.error('❌ Número de teléfono inválido');
    } else if (error.code === 21408) {
      console.error('❌ No tienes permisos para enviar a este número');
    } else if (error.code === 21610) {
      console.error('❌ El número no está en el sandbox de Twilio');
    } else if (error.code === 20404) {
      console.error('❌ Account SID o Auth Token incorrectos');
    }

    return false;
  }
}

async function registrarAcceso(usuarioId, accion, exitoso, req) {
  try {
    const { db } = await connectMongo();
    const logsCollection = db.collection('logsAcceso');

    await logsCollection.insertOne({
      usuarioId: usuarioId,
      accion: accion,
      exitoso: exitoso,
      fecha: new Date(),
      ip: req?.ip || 'Desconocida',
      userAgent: req?.headers?.['user-agent'] || 'Desconocido'
    });
  } catch (error) {
    console.error('❌ Error registrando acceso:', error);
  }
}

// ===== FUNCIONES ADICIONALES PARA ACTUALIZACIÓN =====

export const actualizarTelefonoDemo = async (req, res) => {
  try {
    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');
    
    // Tu número real
    const nuevoTelefono = '+573013376768';
    
    const resultado = await organizadoresCollection.updateOne(
      { usuario: 'organizadorDemo' },
      { $set: { telefono: nuevoTelefono } }
    );
    
    console.log('✅ Número actualizado:', { nuevoTelefono, modifiedCount: resultado.modifiedCount });
    
    res.json({
      success: true,
      message: 'Número actualizado exitosamente',
      telefono: nuevoTelefono,
      modifiedCount: resultado.modifiedCount
    });
  } catch (error) {
    console.error('❌ Error actualizando teléfono:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const diagnosticoTwilio = async (req, res) => {
  try {
    const { db } = await connectMongo();
    const organizadoresCollection = db.collection('usuariosOrganizadores');
    
    const usuarioDemo = await organizadoresCollection.findOne({ 
      usuario: 'organizadorDemo' 
    });
    
    // Probar Twilio
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    res.json({
      success: true,
      usuarioDemo: {
        usuario: usuarioDemo?.usuario,
        telefono: usuarioDemo?.telefono,
        existe: !!usuarioDemo
      },
      twilio: {
        accountStatus: account.status,
        friendlyName: account.friendlyName
      },
      config: {
        accountSid: process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌',
        authToken: process.env.TWILIO_AUTH_TOKEN ? '✅' : '❌',
        whatsappFrom: process.env.TWILIO_WHATSAPP_FROM ? '✅' : '❌'
      }
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      config: {
        accountSid: process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌',
        authToken: process.env.TWILIO_AUTH_TOKEN ? '✅' : '❌',
        whatsappFrom: process.env.TWILIO_WHATSAPP_FROM ? '✅' : '❌'
      }
    });
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