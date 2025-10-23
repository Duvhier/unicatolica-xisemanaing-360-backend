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

    // 🔹 URLs de las imágenes en Cloudinary
    const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
    const imagenConferencia = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203705/CONFERENCIA_COACHING-8_wf68kj.png";

    // Contenido HTML MEJORADO con diseño profesional
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Registro</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
            
            /* RESET Y BASE */
            body {
                font-family: 'Poppins', Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            
            .container {
                max-width: 650px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            
            /* HEADER RESPONSIVO */
            .header {
                background: linear-gradient(135deg, #2b97ed 0%, #0033a0 100%);
                padding: 25px 20px;
                text-align: center;
            }
            
            .logo {
                max-width: 200px;
                width: 80%;
                height: auto;
                margin-bottom: 15px;
            }
            
            .header-title {
                color: white;
                font-size: 20px;
                font-weight: 600;
                margin: 10px 0 5px 0;
                line-height: 1.3;
            }
            
            .header-subtitle {
                color: #a0c4ff;
                font-size: 14px;
                font-weight: 400;
                line-height: 1.4;
            }
            
            /* IMAGEN CONFERENCIA */
            .conferencia-image {
                width: 100%;
                max-height: 250px;
                object-fit: cover;
                display: block;
            }
            
            /* CONTENIDO PRINCIPAL */
            .content {
                padding: 30px 25px;
            }
            
            .welcome-section {
                text-align: center;
                margin-bottom: 25px;
            }
            
            .welcome-title {
                color: #001b5e;
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 15px;
                line-height: 1.3;
            }
            
            .welcome-text {
                color: #666;
                font-size: 16px;
                line-height: 1.6;
                margin: 0;
            }
            
            /* GRID DE INFORMACIÓN */
            .info-grid {
                display: block;
                margin: 30px 0;
            }
            
            .info-card {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #001b5e;
                margin-bottom: 20px;
            }
            
            .info-card:last-child {
                margin-bottom: 0;
            }
            
            .card-title {
                color: #001b5e;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .info-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .info-list li {
                padding: 10px 0;
                border-bottom: 1px solid #e9ecef;
                color: #555;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .info-list li:last-child {
                border-bottom: none;
            }
            
            .info-list strong {
                color: #001b5e;
                font-weight: 600;
            }
            
            /* SECCIÓN QR */
            .qr-section {
                text-align: center;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 25px 20px;
                border-radius: 12px;
                margin: 25px 0;
            }
            
            .qr-title {
                color: #001b5e;
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .qr-image {
                width: 180px;
                height: 180px;
                max-width: 100%;
                border: 3px solid #001b5e;
                border-radius: 12px;
                padding: 8px;
                background: white;
            }
            
            .qr-instructions {
                color: #666;
                font-size: 14px;
                margin-top: 15px;
                line-height: 1.5;
            }
            
            /* DETALLES DEL EVENTO */
            .event-details {
                background: #001b5e;
                color: white;
                padding: 20px;
                border-radius: 12px;
                text-align: center;
                margin: 25px 0;
            }
            
            .event-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 15px;
            }
            
            .event-info {
                display: block;
            }
            
            .event-item {
                text-align: center;
                margin-bottom: 15px;
                padding: 10px;
            }
            
            .event-item:last-child {
                margin-bottom: 0;
            }
            
            .event-icon {
                font-size: 20px;
                margin-bottom: 5px;
            }
            
            .event-label {
                font-size: 11px;
                opacity: 0.8;
                margin-bottom: 3px;
                text-transform: uppercase;
            }
            
            .event-value {
                font-size: 13px;
                font-weight: 600;
            }
            
            /* RECOMENDACIONES */
            .recommendations {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin-top: 25px;
            }
            
            .recommendations-title {
                color: #856404;
                margin: 0 0 12px 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .recommendations-list {
                color: #856404;
                margin: 0;
                padding-left: 20px;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .recommendations-list li {
                margin-bottom: 8px;
            }
            
            .recommendations-list li:last-child {
                margin-bottom: 0;
            }
            
            /* FOOTER */
            .footer {
                text-align: center;
                padding: 25px 20px;
                background: linear-gradient(135deg, #2b97ed 0%, #0033a0 100%);
                color: #e9ecef;
                font-size: 12px;
            }
            
            .footer-logo {
                max-width: 180px;
                width: 70%;
                height: auto;
                margin-bottom: 15px;
            }
            
            .footer p {
                margin: 8px 0;
                line-height: 1.5;
            }
            
            /* MEDIA QUERIES PARA ESCRITORIO */
            @media screen and (min-width: 600px) {
                .header {
                    padding: 30px 40px;
                }
                
                .logo {
                    max-width: 250px;
                }
                
                .header-title {
                    font-size: 24px;
                }
                
                .header-subtitle {
                    font-size: 16px;
                }
                
                .content {
                    padding: 40px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 40px 0;
                }
                
                .info-card {
                    margin-bottom: 0;
                    padding: 25px;
                }
                
                .event-info {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: 15px;
                }
                
                .event-item {
                    margin-bottom: 0;
                }
                
                .qr-image {
                    width: 200px;
                    height: 200px;
                }
            }
            
            /* MEDIA QUERIES PARA MÓVILES PEQUEÑOS */
            @media screen and (max-width: 480px) {
                .header {
                    padding: 20px 15px;
                }
                
                .logo {
                    max-width: 150px;
                }
                
                .header-title {
                    font-size: 18px;
                }
                
                .header-subtitle {
                    font-size: 13px;
                }
                
                .content {
                    padding: 20px 15px;
                }
                
                .welcome-title {
                    font-size: 22px;
                }
                
                .welcome-text {
                    font-size: 15px;
                }
                
                .info-card {
                    padding: 15px;
                }
                
                .card-title {
                    font-size: 16px;
                }
                
                .info-list li {
                    font-size: 13px;
                    padding: 8px 0;
                }
                
                .qr-section {
                    padding: 20px 15px;
                }
                
                .qr-image {
                    width: 160px;
                    height: 160px;
                }
                
                .event-details {
                    padding: 15px;
                }
                
                .recommendations {
                    padding: 15px;
                }
                
                .footer {
                    padding: 20px 15px;
                }
                
                .footer-logo {
                    max-width: 150px;
                }
            }
            
            /* COMPATIBILIDAD CON CLIENTES DE EMAIL */
            .mobile-break {
                display: none;
            }
            
            @media screen and (max-width: 600px) {
                .mobile-break {
                    display: block;
                }
            }
            
            /* FALLBACKS PARA OUTLOOK */
            .outlook-fix {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Encabezado con logo -->
            <div class="header">
                <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo" style="border:0; display:block;">
                <div class="header-title">XI Semana de la Ingeniería</div>
                <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
            </div>
            
            <!-- Imagen de la conferencia -->
            <img src="${imagenConferencia}" alt="Conferencia Coaching en Habilidades Gerenciales" class="conferencia-image" style="border:0; display:block;">
            
            <!-- Contenido principal -->
            <div class="content">
                <!-- Mensaje de bienvenida -->
                <div class="welcome-section">
                    <h1 class="welcome-title">¡Confirmación de Registro Exitosa!</h1>
                    <p class="welcome-text">
                        Estimado/a <strong>${usuario.nombre}</strong>,<br class="mobile-break">
                        Tu registro para la conferencia <strong>"Desarrollo Personal y Liderazgo"</strong> ha sido procesado exitosamente.
                    </p>
                </div>
                
                <!-- Información en grid -->
                <div class="info-grid">
                    <!-- Información personal -->
                    <div class="info-card">
                        <h3 class="card-title">👤 Información Personal</h3>
                        <ul class="info-list">
                            <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                            <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                            <li><strong>Correo:</strong> ${usuario.correo}</li>
                            <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                            <li><strong>Área:</strong> ${usuario.area}</li>
                            <li><strong>Rol:</strong> ${usuario.rol}</li>
                        </ul>
                    </div>
                    
                    <!-- Detalles del evento -->
                    <div class="info-card">
                        <h3 class="card-title">📅 Detalles del Evento</h3>
                        <ul class="info-list">
                            <li><strong>Conferencia:</strong> Desarrollo Personal y Liderazgo</li>
                            <li><strong>Ponente:</strong> Ximena Otero Pilonieta</li>
                            <li><strong>Fecha:</strong> 10 de Noviembre 2025</li>
                            <li><strong>Hora:</strong> 3:00 pm - 5:00 pm</li>
                            <li><strong>Lugar:</strong> Auditorio 1</li>
                            <li><strong>Sede:</strong> Campus Pance</li>
                        </ul>
                    </div>
                </div>
                
                <!-- Instrucciones adicionales -->
                <div class="recommendations">
                    <h4 class="recommendations-title">📋 Recomendaciones:</h4>
                    <ul class="recommendations-list">
                        <li>Llega 15 minutos antes del inicio del evento</li>
                        <li>Mantén este correo para cualquier consulta</li>
                    </ul>
                </div>
            </div>
            
            <!-- Pie de página -->
            <div class="footer">
                <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo" style="border:0; display:block; margin:0 auto;">
                <p>
                    <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                    – Resolución No. 944 de 1996 MEN – SNIES 2731
                    <br>
                    Sede Principal Cra. 122 No. 12-459 Pance, Cali – Colombia
                </p>
                <p style="margin-top: 15px; font-size: 11px; opacity: 0.7;">
                    Este es un correo automático de confirmación. Por favor no responder.<br>
                    © 2025 XI Semana de la Ingeniería - Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    // Preparar adjuntos
    let attachments = [];
    if (usuario.qr && usuario.qr.startsWith('data:image/png;base64,')) {
      try {
        const base64Data = usuario.qr.replace(/^data:image\/png;base64,/, "");
        attachments.push({
          filename: "codigo_qr_acceso.png",
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
      from: '"XI Semana Ingeniería UNICATÓLICA" <eventoxisemanaingenieria@si.cidt.unicatolica.edu.co>',
      to: usuario.correo,
      subject: "✅ Confirmación de Registro - Conferencia Desarrollo Personal y Liderazgo",
      html: htmlContent,
      text: textContent,
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