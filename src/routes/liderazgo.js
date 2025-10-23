// controllers/emailController.js
import nodemailer from "nodemailer";

export const enviarCorreoRegistro = async (usuario) => {
  console.log("🚀 INICIANDO ENVÍO DE CORREO PARA:", usuario.correo);
  
  try {
    // 🔹 VERIFICAR VARIABLES DE ENTORNO
    console.log("🔑 Verificando variables de entorno...");
    console.log("📧 Email user:", "eventoxisemanaingenieria@si.cidt.unicatolica.edu.co");
    console.log("🔐 Password disponible:", process.env.EMAIL_PASSWORD ? "✅ SÍ" : "❌ NO");
    
    if (!process.env.EMAIL_PASSWORD) {
      throw new Error("EMAIL_PASSWORD no está configurada en las variables de entorno");
    }

    // Validar datos esenciales
    if (!usuario.correo || !usuario.nombre) {
      throw new Error("Datos de usuario incompletos");
    }

    console.log("📧 Configurando transporter...");
    
    const transporter = nodemailer.createTransport({
      host: "mail.si.cidt.unicatolica.edu.co",
      port: 465,
      secure: true,
      auth: {
        user: "eventoxisemanaingenieria@si.cidt.unicatolica.edu.co",
        pass: process.env.EMAIL_PASSWORD,
      },
      debug: true,
      logger: true,
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log("🔍 Verificando conexión SMTP...");
    await transporter.verify();
    console.log("✅ Conexión SMTP verificada");

    // Contenido HTML (igual que antes)
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #001b5e; color: white; padding: 20px; text-align: center;">
          <h1>🎉 ¡Registro Exitoso!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Estimado/a <strong>${usuario.nombre}</strong>,</p>
          <p>Tu registro para la ponencia <strong>"Desarrollo Personal y Liderazgo"</strong> ha sido exitoso.</p>
          
          <h3>📋 Tus Datos de Registro:</h3>
          <ul>
            <li><strong>Nombre:</strong> ${usuario.nombre}</li>
            <li><strong>Cédula:</strong> ${usuario.cedula}</li>
            <li><strong>Correo:</strong> ${usuario.correo}</li>
            <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
            <li><strong>Área:</strong> ${usuario.area}</li>
            <li><strong>Rol:</strong> ${usuario.rol}</li>
          </ul>

          <h3>📅 Información del Evento:</h3>
          <p><strong>Fecha:</strong> 10 de Noviembre de 2025</p>
          <p><strong>Hora:</strong> 3:00 p.m. - 5:00 p.m.</p>
          <p><strong>Lugar:</strong> Auditorio 1 - Sede Pance, Unicatólica</p>
          
          ${usuario.qr ? `
          <div style="text-align: center; margin: 20px 0;">
            <p><strong>Presenta este código QR el día del evento:</strong></p>
            <img src="${usuario.qr}" alt="QR de Registro" style="width: 200px; height: 200px; border: 2px solid #ddd; border-radius: 10px;"/>
          </div>
          ` : '<p>💡 Presenta tu documento de identidad el día del evento.</p>'}
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
          <p>Universidad Católica de Cali © 2025 - XI Semana de la Ingeniería</p>
        </div>
      </div>
    `;

    // Preparar adjuntos si existe QR
    let attachments = [];
    if (usuario.qr && usuario.qr.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = usuario.qr.replace(/^data:image\/png;base64,/, "");
        attachments.push({
          filename: "codigo_qr_registro.png",
          content: base64Data,
          encoding: 'base64',
          contentType: "image/png",
        });
        console.log("📎 QR preparado como adjunto");
      } catch (qrError) {
        console.warn("⚠️ Error procesando QR:", qrError.message);
      }
    }

    // Configurar correo
    const mailOptions = {
      from: '"Evento XI Semana Ingeniería" <eventoxisemanaingenieria@si.cidt.unicatolica.edu.co>',
      to: usuario.correo,
      subject: "✅ Confirmación de Registro - Ponencia Desarrollo Personal y Liderazgo",
      html: htmlContent,
      text: `
        Registro Exitoso - Ponencia Desarrollo Personal y Liderazgo
        
        Estimado/a ${usuario.nombre},
        
        Tu registro ha sido exitoso.
        
        📋 Tus datos:
        - Nombre: ${usuario.nombre}
        - Cédula: ${usuario.cedula} 
        - Correo: ${usuario.correo}
        - Teléfono: ${usuario.telefono}
        - Área: ${usuario.area}
        - Rol: ${usuario.rol}
        
        📅 Información del evento:
        - Fecha: 10 de Noviembre de 2025
        - Hora: 3:00 p.m. - 5:00 p.m.
        - Lugar: Auditorio 1 - Sede Pance
        
        Universidad Católica de Cali © 2025
      `,
      attachments: attachments
    };

    console.log("📤 Enviando correo a:", usuario.correo);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ CORREO ENVIADO EXITOSAMENTE");
    console.log("📨 Message ID:", info.messageId);
    console.log("👤 Destinatario:", usuario.correo);
    console.log("🆔 ID del servidor:", info.response);
    
    return info;

  } catch (error) {
    console.error("❌ ERROR AL ENVIAR CORREO:");
    console.error("🔴 Mensaje:", error.message);
    console.error("🔴 Código:", error.code);
    console.error("🔴 Stack:", error.stack);
    throw error;
  }
};