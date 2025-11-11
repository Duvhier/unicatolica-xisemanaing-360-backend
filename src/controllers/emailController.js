// controllers/emailController.js
import nodemailer from "nodemailer";

// 🔹 Configuración común del transporter
const createTransporter = () => {
    console.log("📧 Configurando transporter...");

    if (!process.env.EMAIL_PASSWORD) {
        throw new Error("EMAIL_PASSWORD no está configurada en las variables de entorno");
    }

    return nodemailer.createTransport({
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
};

// 🔹 Plantillas específicas para cada evento
const plantillasEventos = {
    // ✅ PLANTILLA PARA DESARROLLO PERSONAL Y LIDERAZGO
    liderazgo: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenConferencia = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203705/CONFERENCIA_COACHING-8_wf68kj.png";

        return {
            asunto: "✅ Confirmación de Registro - Conferencia Desarrollo Personal y Liderazgo",
            html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de Registro - Desarrollo Personal y Liderazgo</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                }
                
                .container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #2b97ed 0%, #0033a0 100%);
                    padding: 30px 40px;
                    text-align: center;
                }
                
                .logo {
                    max-width: 250px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                .header-title {
                    color: white;
                    font-family: 'Poppins', Arial, sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 10px 0 5px 0;
                }
                
                .header-subtitle {
                    color: #a0c4ff;
                    font-size: 16px;
                    font-weight: 400;
                }
                
                .conferencia-image {
                    width: 100%;
                    max-height: 300px;
                    object-fit: cover;
                }
                
                .content {
                    padding: 40px;
                }
                
                .welcome-section {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .welcome-title {
                    color: #001b5e;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                
                .welcome-text {
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 40px 0;
                }
                
                .info-card {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 12px;
                    border-left: 4px solid #001b5e;
                }
                
                .card-title {
                    color: #001b5e;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                }
                
                .info-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .info-list li {
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                    color: #555;
                    font-size: 14px;
                }
                
                .info-list li:last-child {
                    border-bottom: none;
                }
                
                .info-list li strong {
                    color: #001b5e;
                    font-weight: 600;
                }
                
                .qr-section {
                    text-align: center;
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 30px;
                    border-radius: 12px;
                    margin: 30px 0;
                }
                
                .qr-image {
                    width: 200px;
                    height: 200px;
                    border: 3px solid #001b5e;
                    border-radius: 12px;
                    padding: 10px;
                    background: white;
                }
                
                .event-details {
                    background: #001b5e;
                    color: white;
                    padding: 25px;
                    border-radius: 12px;
                    text-align: center;
                }
                
                .footer {
                    text-align: center;
                    padding: 25px;
                    background: linear-gradient(135deg, #2b97ed 0%, #0033a0 100%);
                    color: #e9ecef;
                    font-size: 12px;
                }
                
                .footer-logo {
                    max-width: 200px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                @media screen and (max-width: 480px) {
                    .header { padding: 20px 15px; }
                    .logo { max-width: 200px; }
                    .content { padding: 20px 15px; }
                    .info-grid { grid-template-columns: 1fr; gap: 20px; }
                    .qr-image { width: 160px; height: 160px; }
                    .conferencia-image { max-height: 200px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
                    <div class="header-title">XI Semana de la Ingeniería</div>
                    <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
                </div>
                
                <img src="${imagenConferencia}" alt="Conferencia Desarrollo Personal y Liderazgo" class="conferencia-image">
                
                <div class="content">
                    <div class="welcome-section">
                        <h1 class="welcome-title">¡Confirmación de Registro Exitosa!</h1>
                        <p class="welcome-text">
                            Estimado/a <strong>${usuario.nombre}</strong>,<br>
                            Tu registro para la conferencia <strong>"Desarrollo Personal y Liderazgo"</strong> ha sido procesado exitosamente.
                        </p>
                    </div>
                    
                    <div class="info-grid">
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

                    ${usuario.qr_image ? `
                    <div class="qr-section">
                        <h3 class="card-title">🎫 Código QR de Acceso</h3>
                        <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                        <p class="welcome-text">Presenta este código QR en la entrada del evento</p>
                    </div>
                    ` : ''}

                    <div class="event-details">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px;">📍 Recomendaciones</h3>
                        <p style="margin: 0; opacity: 0.9; font-size: 14px;">
                            • Llega 15 minutos antes del inicio del evento<br>
                            • Presenta tu código QR o documento de identidad<br>
                            • Conserva este correo para cualquier consulta
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
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
      `,
            texto: `
CONFIRMACIÓN DE REGISTRO - XI SEMANA DE LA INGENIERÍA
"360°: Innovación, Liderazgo y Futuro"

¡REGISTRO EXITOSO!

Estimado/a ${usuario.nombre},

Su registro para la conferencia "Desarrollo Personal y Liderazgo" ha sido procesado exitosamente.

📋 INFORMACIÓN PERSONAL:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Área: ${usuario.area}
- Rol: ${usuario.rol}

📅 DETALLES DEL EVENTO:
- Conferencia: Desarrollo Personal y Liderazgo
- Ponente: Ximena Otero Pilonieta
- Fecha: 10 de Noviembre de 2025
- Hora: 3:00 pm - 5:00 pm
- Lugar: Auditorio 1, Sede Pance

📍 RECOMENDACIONES:
• Llegue 15 minutos antes del inicio
• Presente su código QR o documento de identidad
• Conserve este correo para cualquier consulta

--
Fundación Universitaria Católica Lumen Gentium
SNIES 2731 • Cali, Colombia

© 2025 XI Semana de la Ingeniería - Todos los derechos reservados.
      `
        };
    },

    // ✅ PLANTILLA PARA HACKATHON UNIVERSIDADES
    hackathon: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenHackathon = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761543310/HACKATON_copia-8_pphi6j.png";

        return {
            asunto: "🚀 Confirmación de Registro - Hackathon Universidades",
            html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de Registro - Hackathon</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                }
                
                .container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    padding: 30px 40px;
                    text-align: center;
                }
                
                .logo {
                    max-width: 250px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                .header-title {
                    color: white;
                    font-family: 'Poppins', Arial, sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 10px 0 5px 0;
                }
                
                .header-subtitle {
                    color: #ffd8d8;
                    font-size: 16px;
                    font-weight: 400;
                }
                
                .conferencia-image {
                    width: 100%;
                    max-height: 300px;
                    object-fit: cover;
                }
                
                .content {
                    padding: 40px;
                }
                
                .welcome-section {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .welcome-title {
                    color: #cc2e2e;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                
                .welcome-text {
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 40px 0;
                }
                
                .info-card {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 12px;
                    border-left: 4px solid #ee5a24;
                }
                
                .card-title {
                    color: #ee5a24;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                }
                
                .info-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .info-list li {
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                    color: #555;
                    font-size: 14px;
                }
                
                .info-list li:last-child {
                    border-bottom: none;
                }
                
                .info-list li strong {
                    color: #ee5a24;
                    font-weight: 600;
                }
                
                .qr-section {
                    text-align: center;
                    background: linear-gradient(135deg, #fff5f5 0%, #ffecec 100%);
                    padding: 30px;
                    border-radius: 12px;
                    margin: 30px 0;
                    border: 2px dashed #ee5a24;
                }
                
                .qr-image {
                    width: 200px;
                    height: 200px;
                    border: 3px solid #ee5a24;
                    border-radius: 12px;
                    padding: 10px;
                    background: white;
                }
                
                .preparacion-section {
                    background: #ffeaa7;
                    border: 1px solid #fdcb6e;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                }
                
                .footer {
                    text-align: center;
                    padding: 25px;
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    color: #ffecec;
                    font-size: 12px;
                }
                
                .footer-logo {
                    max-width: 200px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                @media screen and (max-width: 480px) {
                    .header { padding: 20px 15px; }
                    .logo { max-width: 200px; }
                    .content { padding: 20px 15px; }
                    .info-grid { grid-template-columns: 1fr; gap: 20px; }
                    .qr-image { width: 160px; height: 160px; }
                    .conferencia-image { max-height: 200px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
                    <div class="header-title">XI Semana de la Ingeniería</div>
                    <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
                </div>
                
                <img src="${imagenHackathon}" alt="Hackathon Universidades" class="conferencia-image">
                
                <div class="content">
                    <div class="welcome-section">
                        <h1 class="welcome-title">¡Registro al Hackathon Confirmado!</h1>
                        <p class="welcome-text">
                            Hola <strong>${usuario.nombre}</strong>,<br>
                            Tu inscripción al <strong>Hackathon Universidades</strong> ha sido procesada exitosamente.
                        </p>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-card">
                            <h3 class="card-title">👤 Información del Participante</h3>
                            <ul class="info-list">
                                <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                                <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                                <li><strong>Correo:</strong> ${usuario.correo}</li>
                                <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                                <li><strong>Rol:</strong> ${usuario.rol}</li>
                                ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                                ${usuario.tipoEstudiante ? `<li><strong>Tipo:</strong> ${usuario.tipoEstudiante}</li>` : ''}
                                ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                            </ul>
                        </div>
                        
                        <div class="info-card">
                            <h3 class="card-title">📅 Detalles del Hackathon</h3>
                            <ul class="info-list">
                                <li><strong>Evento:</strong> Hackathon Universidades</li>
                                <li><strong>Fecha:</strong> 10 de Noviembre 2025</li>
                                <li><strong>Hora:</strong> 6:30 pm - 9:30 pm</li>
                                <li><strong>Lugar:</strong> Salas 1, 2, 3 - Sede Pance</li>
                                <li><strong>Modalidad:</strong> Presencial</li>
                                <li><strong>Organizadores:</strong> José Hernando Mosquera, Kellin, Nelson Andrade</li>
                            </ul>
                        </div>
                    </div>

                    ${usuario.equipo ? `
                    <div class="info-card">
                        <h3 class="card-title">👥 Información del Equipo</h3>
                        <ul class="info-list">
                            <li><strong>Nombre del equipo:</strong> ${usuario.equipo}</li>
                            <li><strong>Proyecto:</strong> ${usuario.proyecto}</li>
                            <li><strong>Categoría:</strong> ${usuario.categoria}</li>
                            ${usuario.institucion ? `<li><strong>Institución:</strong> ${usuario.institucion}</li>` : ''}
                        </ul>
                    </div>
                    ` : ''}

                    ${usuario.qr_image ? `
                    <div class="qr-section">
                        <h3 class="card-title">🎫 Código QR de Acceso</h3>
                        <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                        <p class="welcome-text">Presenta este código QR en el registro del hackathon</p>
                    </div>
                    ` : ''}

                    <div class="preparacion-section">
                        <h3 style="color: #e17055; margin: 0 0 15px 0; font-size: 18px;">💡 Preparación para el Hackathon</h3>
                        <ul style="color: #e17055; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Llega 30 minutos antes para el registro del equipo</li>
                            <li>Trae tu computador portátil y cargador</li>
                            <li>Prepara tu entorno de desarrollo favorito</li>
                            <li>Revisa las bases y criterios de evaluación</li>
                            <li>Coordinación previa con tu equipo</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
                    <p>
                        <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                        – Resolución No. 944 de 1996 MEN – SNIES 2731
                    </p>
                    <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                        © 2025 XI Semana de la Ingeniería - Hackathon Universidades
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
            texto: `
CONFIRMACIÓN DE REGISTRO - HACKATHON UNIVERSIDADES
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🚀 ¡REGISTRO AL HACKATHON CONFIRMADO!

Hola ${usuario.nombre},

Tu inscripción al Hackathon Universidades ha sido procesada exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.tipoEstudiante ? `- Tipo: ${usuario.tipoEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}

📅 DETALLES DEL HACKATHON:
- Evento: Hackathon Universidades
- Fecha: 10 de Noviembre de 2025
- Hora: 6:30 pm - 9:30 pm
- Lugar: Salas 1, 2, 3 - Sede Pance
- Organizadores: José Hernando Mosquera, Kellin, Nelson Andrade

${usuario.equipo ? `
👥 INFORMACIÓN DEL EQUIPO:
- Equipo: ${usuario.equipo}
- Proyecto: ${usuario.proyecto}
- Categoría: ${usuario.categoria}
${usuario.institucion ? `- Institución: ${usuario.institucion}\n` : ''}
` : ''}

💡 PREPARACIÓN:
• Llega 30 minutos antes para registro
• Trae tu computador portátil y cargador
• Prepara tu entorno de desarrollo
• Revisa las bases del concurso
• Coordinación con tu equipo

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Hackathon Universidades
      `
        };
    },
    // ✅ PLANTILLA PARA HACKATHON MONITORÍA REMOTA
    hackathonmonitoria: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenHackathon = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761543310/HACKATON_copia-8_pphi6j.png";

        return {
            asunto: "🎯 Confirmación de Registro - Hackathon Monitoría Remota",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Registro - Hackathon Monitoría</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #e3f2fd;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #1976d2;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #2196f3;
        }
        
        .card-title {
            color: #1976d2;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #1976d2;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #2196f3;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #2196f3;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .preparacion-section {
            background: #e8f5e9;
            border: 1px solid #c8e6c9;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .experiencia-section {
            background: #fff3e0;
            border: 1px solid #ffe0b2;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            color: #e3f2fd;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            background: #2196f3;
            color: white;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-right: 8px;
            margin-bottom: 8px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenHackathon}" alt="Hackathon Monitoría Remota" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a la Monitoría Remota Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu inscripción a la <strong>Monitoría Remota del Hackathon</strong> ha sido procesada exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>
                        <li><strong>Programa:</strong> ${usuario.programa}</li>
                        <li><strong>Facultad:</strong> ${usuario.facultad}</li>
                        <li><strong>Semestre:</strong> ${usuario.semestre}</li>
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">📅 Detalles de la Monitoría</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Hackathon - Monitoría Remota</li>
                        <li><strong>Fecha:</strong> 12 de Noviembre 2025</li>
                        <li><strong>Hora:</strong> 2:00 pm - 5:00 pm</li>
                        <li><strong>Modalidad:</strong> 
                            <span class="badge">Virtual</span>
                            <span class="badge" style="background: #ff9800;">Monitoría Remota</span>
                        </li>
                        <li><strong>Objetivo:</strong> Clasificación para Hackathon</li>
                        <li><strong>Lugar:</strong> Plataforma Virtual</li>
                    </ul>
                </div>
            </div>

            <!-- Sección de Experiencia en Programación -->
            <div class="experiencia-section">
                <h3 class="card-title" style="color: #f57c00;">💻 Experiencia en Programación</h3>
                <div class="info-grid">
                    <div class="info-card" style="background: #fff8e1; border-left-color: #ffb300;">
                        <h4 style="color: #f57c00; margin-bottom: 10px; font-size: 14px;">Nivel de Conocimiento</h4>
                        <ul class="info-list">
                            <li><strong>Experiencia:</strong> ${usuario.experiencia_programacion}</li>
                            <li><strong>Nivel Técnico:</strong> ${usuario.nivel_conocimiento}</li>
                            <li><strong>Hackathons Previos:</strong> ${usuario.participado_hackathon}</li>
                        </ul>
                    </div>
                    ${usuario.tecnologias_dominio ? `
                    <div class="info-card" style="background: #fff8e1; border-left-color: #ffb300;">
                        <h4 style="color: #f57c00; margin-bottom: 10px; font-size: 14px;">Tecnologías</h4>
                        <p style="color: #555; font-size: 14px; margin: 0;">${usuario.tecnologias_dominio}</p>
                    </div>
                    ` : ''}
                </div>
                ${usuario.motivacion_participar ? `
                <div style="margin-top: 15px;">
                    <h4 style="color: #f57c00; margin-bottom: 10px; font-size: 14px;">🎯 Motivación</h4>
                    <p style="color: #555; font-size: 14px; font-style: italic; margin: 0; background: white; padding: 15px; border-radius: 8px; border-left: 3px solid #ffb300;">
                        "${usuario.motivacion_participar}"
                    </p>
                </div>
                ` : ''}
            </div>

            ${usuario.nombre_equipo ? `
            <div class="info-card">
                <h3 class="card-title">👥 Información del Equipo</h3>
                <ul class="info-list">
                    <li><strong>Nombre del equipo:</strong> ${usuario.nombre_equipo}</li>
                    ${usuario.integrantes_equipo ? `<li><strong>Integrantes:</strong> ${usuario.integrantes_equipo}</li>` : ''}
                    ${usuario.idea_proyecto ? `<li><strong>Idea de Proyecto:</strong> ${usuario.idea_proyecto}</li>` : ''}
                </ul>
            </div>
            ` : `
            <div class="info-card">
                <h3 class="card-title">👥 Información del Equipo</h3>
                <p style="color: #666; font-style: italic; margin: 0;">
                    No has registrado información de equipo. Podrás formar equipo durante la monitoría.
                </p>
            </div>
            `}

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Confirmación</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR al ingresar a la plataforma virtual</p>
            </div>
            ` : ''}

            <div class="preparacion-section">
                <h3 style="color: #388e3c; margin: 0 0 15px 0; font-size: 18px;">💡 Preparación para la Monitoría</h3>
                <ul style="color: #388e3c; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Conéctate 15 minutos antes del inicio</li>
                    <li>Asegura una conexión estable a internet</li>
                    <li>Prepara tu entorno de desarrollo</li>
                    <li>Ten listo tu computador y cargador</li>
                    <li>Revisa el enlace de acceso que recibirás</li>
                    <li>Prepárate para desafíos de programación</li>
                </ul>
            </div>

            <!-- Información de Clasificación -->
            <div class="info-card" style="background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%); border-left-color: #0288d1;">
                <h3 class="card-title">🏆 Proceso de Clasificación</h3>
                <ul class="info-list">
                    <li><strong>Fase Actual:</strong> Monitoría Remota (Clasificación)</li>
                    <li><strong>Siguiente Fase:</strong> Hackathon Universidades Presencial</li>
                    <li><strong>Criterios:</strong> Resolución de problemas, creatividad, trabajo en equipo</li>
                    <li><strong>Resultados:</strong> Se anunciarán al finalizar la monitoría</li>
                    <li><strong>Premio:</strong> Pase al Hackathon principal + reconocimientos</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Hackathon Monitoría Remota
            </p>
        </div>
    </div>
</body>
</html>
  `,
            texto: `
CONFIRMACIÓN DE REGISTRO - HACKATHON MONITORÍA REMOTA
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🎯 ¡REGISTRO A LA MONITORÍA REMOTA CONFIRMADO!

Hola ${usuario.nombre},

Tu inscripción a la Monitoría Remota del Hackathon ha sido procesada exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- ID Estudiante: ${usuario.idEstudiante}
- Programa: ${usuario.programa}
- Facultad: ${usuario.facultad}
- Semestre: ${usuario.semestre}

📅 DETALLES DE LA MONITORÍA:
- Evento: Hackathon - Monitoría Remota
- Fecha: 12 de Noviembre de 2025
- Hora: 2:00 pm - 5:00 pm
- Modalidad: Virtual - Monitoría Remota
- Objetivo: Clasificación para Hackathon Universidades
- Lugar: Plataforma Virtual

💻 EXPERIENCIA EN PROGRAMACIÓN:
- Nivel de Experiencia: ${usuario.experiencia_programacion}
- Conocimiento Técnico: ${usuario.nivel_conocimiento}
- Hackathons Previos: ${usuario.participado_hackathon}
${usuario.tecnologias_dominio ? `- Tecnologías: ${usuario.tecnologias_dominio}\n` : ''}
${usuario.motivacion_participar ? `- Motivación: "${usuario.motivacion_participar}"\n` : ''}

${usuario.nombre_equipo ? `
👥 INFORMACIÓN DEL EQUIPO:
- Equipo: ${usuario.nombre_equipo}
${usuario.integrantes_equipo ? `- Integrantes: ${usuario.integrantes_equipo}\n` : ''}
${usuario.idea_proyecto ? `- Idea de Proyecto: ${usuario.idea_proyecto}\n` : ''}
` : '👥 INFORMACIÓN DEL EQUIPO: Podrás formar equipo durante la monitoría\n'}

🏆 PROCESO DE CLASIFICACIÓN:
- Fase Actual: Monitoría Remota (Clasificación)
- Siguiente Fase: Hackathon Universidades Presencial
- Criterios: Resolución de problemas, creatividad, trabajo en equipo
- Resultados: Se anunciarán al finalizar la monitoría
- Premio: Pase al Hackathon principal + reconocimientos

💡 PREPARACIÓN:
• Conéctate 15 minutos antes del inicio
• Asegura conexión estable a internet
• Prepara tu entorno de desarrollo
• Ten listo tu computador y cargador
• Revisa el enlace de acceso que recibirás
• Prepárate para desafíos de programación

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Hackathon Monitoría Remota
        `
        };
    },

    // ✅ PLANTILLA PARA TECHNOLOGICAL TOUCH
    technologicaltouch: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenTech = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761543548/TECNOLOGICAL_TOUCH-8_qy1rks.png";

        return {
            asunto: "🔬 Confirmación de Registro - Technological Touch",
            html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación - Technological Touch</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                }
                
                .container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
                    padding: 30px 40px;
                    text-align: center;
                }
                
                .logo {
                    max-width: 250px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                .header-title {
                    color: white;
                    font-family: 'Poppins', Arial, sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 10px 0 5px 0;
                }
                
                .header-subtitle {
                    color: #d6d4ff;
                    font-size: 16px;
                    font-weight: 400;
                }
                
                .conferencia-image {
                    width: 100%;
                    max-height: 300px;
                    object-fit: cover;
                }
                
                .content {
                    padding: 40px;
                }
                
                .welcome-section {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .welcome-title {
                    color: #6c5ce7;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                
                .welcome-text {
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 40px 0;
                }
                
                .info-card {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 12px;
                    border-left: 4px solid #6c5ce7;
                }
                
                .card-title {
                    color: #6c5ce7;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                }
                
                .info-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .info-list li {
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                    color: #555;
                    font-size: 14px;
                }
                
                .info-list li:last-child {
                    border-bottom: none;
                }
                
                .info-list li strong {
                    color: #6c5ce7;
                    font-weight: 600;
                }
                
                .qr-section {
                    text-align: center;
                    background: linear-gradient(135deg, #f7f5ff 0%, #edebff 100%);
                    padding: 30px;
                    border-radius: 12px;
                    margin: 30px 0;
                    border: 2px dashed #6c5ce7;
                }
                
                .qr-image {
                    width: 200px;
                    height: 200px;
                    border: 3px solid #6c5ce7;
                    border-radius: 12px;
                    padding: 10px;
                    background: white;
                }
                
                .investigacion-section {
                    background: #dfe6ff;
                    border: 1px solid #a29bfe;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                }
                
                .footer {
                    text-align: center;
                    padding: 25px;
                    background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
                    color: #edebff;
                    font-size: 12px;
                }
                
                .footer-logo {
                    max-width: 200px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                @media screen and (max-width: 480px) {
                    .header { padding: 20px 15px; }
                    .logo { max-width: 200px; }
                    .content { padding: 20px 15px; }
                    .info-grid { grid-template-columns: 1fr; gap: 20px; }
                    .qr-image { width: 160px; height: 160px; }
                    .conferencia-image { max-height: 200px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
                    <div class="header-title">XI Semana de la Ingeniería</div>
                    <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
                </div>
                
                <img src="${imagenTech}" alt="Technological Touch" class="conferencia-image">
                
                <div class="content">
                    <div class="welcome-section">
                        <h1 class="welcome-title">¡Registro a Technological Touch Confirmado!</h1>
                        <p class="welcome-text">
                            Hola <strong>${usuario.nombre}</strong>,<br>
                            Te has registrado exitosamente a <strong>Technological Touch</strong> - Ponencia de Investigación.
                        </p>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-card">
                            <h3 class="card-title">👤 Tu Información</h3>
                            <ul class="info-list">
                                <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                                <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                                <li><strong>Correo:</strong> ${usuario.correo}</li>
                                <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                                <li><strong>Rol:</strong> ${usuario.rol}</li>
                                ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                                ${usuario.tipoEstudiante ? `<li><strong>Tipo:</strong> ${usuario.tipoEstudiante}</li>` : ''}
                                ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                            </ul>
                        </div>
                        
                        <div class="info-card">
                            <h3 class="card-title">🔬 Detalles del Evento</h3>
                            <ul class="info-list">
                                <li><strong>Evento:</strong> Technological Touch</li>
                                <li><strong>Tipo:</strong> Ponencia de Investigación</li>
                                <li><strong>Fecha:</strong> 10 de Noviembre 2025</li>
                                <li><strong>Hora:</strong> 6:30 pm - 9:30 pm</li>
                                <li><strong>Lugar:</strong> Auditorio Lumen</li>
                                <li><strong>Sede:</strong> Meléndez</li>
                                <li><strong>Ponentes:</strong> Estudiantes Semilleros de Investigación</li>
                            </ul>
                        </div>
                    </div>

                    ${usuario.equipo ? `
                    <div class="info-card">
                        <h3 class="card-title">👥 Proyecto de Investigación</h3>
                        <ul class="info-list">
                            <li><strong>Equipo:</strong> ${usuario.equipo}</li>
                            <li><strong>Proyecto:</strong> ${usuario.proyecto}</li>
                            <li><strong>Categoría:</strong> ${usuario.categoria}</li>
                            <li><strong>Descripción:</strong> Ponencia de investigación estudiantil</li>
                        </ul>
                    </div>
                    ` : ''}

                    ${usuario.qr_image ? `
                    <div class="qr-section">
                        <h3 class="card-title">🎫 Código QR de Acceso</h3>
                        <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                        <p class="welcome-text">Presenta este código QR en la entrada del auditorio</p>
                    </div>
                    ` : ''}

                    <div class="investigacion-section">
                        <h3 style="color: #6c5ce7; margin: 0 0 15px 0; font-size: 18px;">📚 Sobre Technological Touch</h3>
                        <p style="color: #6c5ce7; margin: 0; font-size: 14px; line-height: 1.5;">
                            Este evento presenta los proyectos más innovadores de nuestros semilleros de investigación. 
                            Una oportunidad única para conocer el trabajo de estudiantes investigadores y conectar con 
                            los avances tecnológicos desarrollados en la universidad.
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
                    <p>
                        <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                        – Resolución No. 944 de 1996 MEN – SNIES 2731
                    </p>
                    <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                        © 2025 XI Semana de la Ingeniería - Technological Touch
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
            texto: `
CONFIRMACIÓN DE REGISTRO - TECHNOLOGICAL TOUCH
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🔬 ¡REGISTRO A TECHNOLOGICAL TOUCH CONFIRMADO!

Hola ${usuario.nombre},

Te has registrado exitosamente a Technological Touch - Ponencia de Investigación.

👤 TU INFORMACIÓN:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.tipoEstudiante ? `- Tipo: ${usuario.tipoEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}

🔬 DETALLES DEL EVENTO:
- Evento: Technological Touch
- Tipo: Ponencia de Investigación
- Fecha: 13 de Noviembre de 2025
- Hora: 6:30 pm - 9:30 pm
- Lugar: Auditorio Lumen - Sede Meléndez
- Ponentes: Estudiantes Semilleros de Investigación

${usuario.equipo ? `
👥 PROYECTO DE INVESTIGACIÓN:
- Equipo: ${usuario.equipo}
- Proyecto: ${usuario.proyecto}
- Categoría: ${usuario.categoria}
` : ''}

📚 SOBRE TECHNOLOGICAL TOUCH:
Presentación de proyectos innovadores de semilleros de investigación. 
Oportunidad para conocer el trabajo de estudiantes investigadores y 
conectar con avances tecnológicos desarrollados en la universidad.

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Technological Touch
      `
        };
    },
    // ✅ PLANTILLA PARA VISITA ZONA AMÉRICA
    visitazonaamerica: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenVisita = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761553231/VISITA_-_EMPRESARIAL_-8_ZONAAMERICA_hqedva.png";

        return {
            asunto: "🏢 Confirmación de Registro - Visita Zona América",
            html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación - Visita Zona América</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                
                body {
                    font-family: 'Poppins', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f9fa;
                }
                
                .container {
                    max-width: 650px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                    background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                    padding: 30px 40px;
                    text-align: center;
                }
                
                .logo {
                    max-width: 250px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                .header-title {
                    color: white;
                    font-family: 'Poppins', Arial, sans-serif;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 10px 0 5px 0;
                }
                
                .header-subtitle {
                    color: #b2f2e6;
                    font-size: 16px;
                    font-weight: 400;
                }
                
                .conferencia-image {
                    width: 100%;
                    max-height: 300px;
                    object-fit: cover;
                }
                
                .content {
                    padding: 40px;
                }
                
                .welcome-section {
                    text-align: center;
                    margin-bottom: 30px;
                }
                
                .welcome-title {
                    color: #00a085;
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                }
                
                .welcome-text {
                    color: #666;
                    font-size: 16px;
                    line-height: 1.6;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin: 40px 0;
                }
                
                .info-card {
                    background: #f8f9fa;
                    padding: 25px;
                    border-radius: 12px;
                    border-left: 4px solid #00b894;
                }
                
                .card-title {
                    color: #00a085;
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 15px;
                }
                
                .info-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .info-list li {
                    padding: 8px 0;
                    border-bottom: 1px solid #e9ecef;
                    color: #555;
                    font-size: 14px;
                }
                
                .info-list li:last-child {
                    border-bottom: none;
                }
                
                .info-list li strong {
                    color: #00a085;
                    font-weight: 600;
                }
                
                .qr-section {
                    text-align: center;
                    background: linear-gradient(135deg, #e8f8f5 0%, #d1f2eb 100%);
                    padding: 30px;
                    border-radius: 12px;
                    margin: 30px 0;
                    border: 2px dashed #00b894;
                }
                
                .qr-image {
                    width: 200px;
                    height: 200px;
                    border: 3px solid #00b894;
                    border-radius: 12px;
                    padding: 10px;
                    background: white;
                }
                
                .vehiculo-section {
                    background: #ffeaa7;
                    border: 1px solid #fdcb6e;
                    border-radius: 12px;
                    padding: 25px;
                    margin: 25px 0;
                }
                
                .footer {
                    text-align: center;
                    padding: 25px;
                    background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                    color: #e8f8f5;
                    font-size: 12px;
                }
                
                .footer-logo {
                    max-width: 200px;
                    height: auto;
                    margin-bottom: 15px;
                }
                
                @media screen and (max-width: 480px) {
                    .header { padding: 20px 15px; }
                    .logo { max-width: 200px; }
                    .content { padding: 20px 15px; }
                    .info-grid { grid-template-columns: 1fr; gap: 20px; }
                    .qr-image { width: 160px; height: 160px; }
                    .conferencia-image { max-height: 200px; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
                    <div class="header-title">XI Semana de la Ingeniería</div>
                    <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
                </div>
                
                <img src="${imagenVisita}" alt="Visita Zona América" class="conferencia-image">
                
                <div class="content">
                    <div class="welcome-section">
                        <h1 class="welcome-title">¡Registro a Visita Zona América Confirmado!</h1>
                        <p class="welcome-text">
                            Hola <strong>${usuario.nombre}</strong>,<br>
                            Tu registro para la <strong>Visita Zona América</strong> ha sido procesado exitosamente.
                        </p>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-card">
                            <h3 class="card-title">👤 Información Personal</h3>
                            <ul class="info-list">
                                <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                                <li><strong>Tipo Documento:</strong> ${usuario.tipoDocumento}</li>
                                <li><strong>N° Documento:</strong> ${usuario.numeroDocumento}</li>
                                <li><strong>Correo:</strong> ${usuario.correo}</li>
                                <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                                <li><strong>Perfil:</strong> ${usuario.perfil}</li>
                                ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                                ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                                ${usuario.eps ? `<li><strong>EPS:</strong> ${usuario.eps}</li>` : ''}
                            </ul>
                        </div>
                        
                        <div class="info-card">
                            <h3 class="card-title">🏢 Detalles de la Visita</h3>
                            <ul class="info-list">
                                <li><strong>Evento:</strong> Visita Zona América</li>
                                <li><strong>Tipo:</strong> Visita Empresarial</li>
                                <li><strong>Fecha:</strong> 14 de Noviembre de 2025</li>
                                <li><strong>Hora:</strong> 9:30 am - 11:00 pm am</li>
                                <li><strong>Lugar:</strong> Zona América</li>
                                <li><strong>Cupo:</strong> 40 personas máximo</li>
                            </ul>
                        </div>
                    </div>

                    ${usuario.placasVehiculo ? `
                    <div class="vehiculo-section">
                        <h3 style="color: #e17055; margin: 0 0 15px 0; font-size: 18px;">🚗 Información de Vehículo</h3>
                        <p style="color: #e17055; margin: 0; font-size: 14px;">
                            <strong>Placas del vehículo:</strong> ${usuario.placasVehiculo}<br>
                            Recuerda que el estacionamiento es sujeto a disponibilidad.
                        </p>
                    </div>
                    ` : ''}

                    ${usuario.qr_image ? `
                    <div class="qr-section">
                        <h3 class="card-title">🎫 Código QR de Acceso</h3>
                        <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                        <p class="welcome-text">Presenta este código QR en el punto de encuentro</p>
                    </div>
                    ` : ''}

                    <div style="background: #d1f2eb; border: 1px solid #00b894; border-radius: 12px; padding: 25px; margin: 25px 0;">
                        <h3 style="color: #00a085; margin: 0 0 15px 0; font-size: 18px;">📋 Información Importante</h3>
                        <ul style="color: #00a085; margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Lleva tu documento de identidad original</li>
                            <li>Puntualidad en el punto de encuentro</li>
                            <li>Vestimenta casual formal</li>
                            <li>Sigue las indicaciones del personal</li>
                            ${usuario.placasVehiculo ? `<li>Estacionamiento sujeto a disponibilidad</li>` : ''}
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
                    <p>
                        <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                        – Resolución No. 944 de 1996 MEN – SNIES 2731
                    </p>
                    <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                        © 2025 XI Semana de la Ingeniería - Visita Zona América
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
            texto: `
CONFIRMACIÓN DE REGISTRO - VISITA ZONA AMÉRICA
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🏢 ¡REGISTRO A VISITA ZONA AMÉRICA CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para la Visita Zona América ha sido procesado exitosamente.

👤 INFORMACIÓN PERSONAL:
- Nombre: ${usuario.nombre}
- Tipo Documento: ${usuario.tipoDocumento}
- N° Documento: ${usuario.numeroDocumento}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Perfil: ${usuario.perfil}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.eps ? `- EPS: ${usuario.eps}\n` : ''}

🏢 DETALLES DE LA VISITA:
- Evento: Visita Zona América
- Tipo: Visita Empresarial
- Fecha: 14 de Noviembre de 2025
- Hora: 9:30 am - 11:00 pm
- Lugar: Zona América
- Cupo: 40 personas máximo

${usuario.placasVehiculo ? `
🚗 INFORMACIÓN DE VEHÍCULO:
- Placas: ${usuario.placasVehiculo}
- Estacionamiento sujeto a disponibilidad
` : ''}

📋 INFORMACIÓN IMPORTANTE:
• Lleva tu documento de identidad original
• Puntualidad en el punto de encuentro
• Vestimenta casual formal
• Sigue las indicaciones del personal
${usuario.placasVehiculo ? `• Estacionamiento sujeto a disponibilidad\n` : ''}

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Visita Zona América
      `
        };
    },
    // ✅ PLANTILLA PARA DOBLE LUMEN - COMPETENCIA DE INGLÉS
    doblalumen: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenDobleLumen = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762091474/DOBLALUMEN-8_toblne.png";

        return {
            asunto: "🏆 Confirmación de Registro - Competencia Doble Lumen",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Competencia Doble Lumen</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #ff9f43 0%, #e84118 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #ffd8d8;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #e84118;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #e84118;
        }
        
        .card-title {
            color: #e84118;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #e84118;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #fff5f5 0%, #ffecec 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #e84118;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #e84118;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .competencia-section {
            background: #ffeaa7;
            border: 1px solid #fdcb6e;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #ff9f43 0%, #e84118 100%);
            color: #ffecec;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenDobleLumen}" alt="Competencia Doble Lumen" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a Doble Lumen Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Te has registrado exitosamente a la <strong>Competencia Doble Lumen</strong>.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.tipoEstudiante ? `<li><strong>Tipo de Participación:</strong> ${usuario.tipoEstudiante === 'participante' ? 'Participante Activo' : 'Asistente'}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                        ${usuario.area ? `<li><strong>Área:</strong> ${usuario.area}</li>` : ''}
                        ${usuario.cargo ? `<li><strong>Cargo:</strong> ${usuario.cargo}</li>` : ''}
                        ${usuario.empresa ? `<li><strong>Empresa:</strong> ${usuario.empresa}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">🏆 Detalles de la Competencia</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Competencia de Inglés</li>
                        <li><strong>Nombre:</strong> Doble Lumen</li>
                        <li><strong>Fecha:</strong> 12 de Noviembre 2025</li>
                        <li><strong>Hora:</strong> 6:30 pm - 9:30 pm</li>
                        <li><strong>Lugar:</strong> Auditorio 1</li>
                        <li><strong>Sede:</strong> Pance</li>
                        <li><strong>Modalidad:</strong> Presencial</li>
                        <li><strong>Tipo:</strong> Competencia Lingüística</li>
                    </ul>
                </div>
            </div>

            ${(usuario.rol === 'estudiante' && usuario.tipoEstudiante === 'participante' && (usuario.competencia_ingles || usuario.nivel_ingles)) ? `
            <div class="info-card">
                <h3 class="card-title">🗣️ Información de la Competencia de Inglés</h3>
                <ul class="info-list">
                    <li><strong>Nivel de inglés:</strong> ${usuario.nivel_ingles || usuario.competencia_ingles?.nivel || 'No especificado'}</li>
                    <li><strong>Experiencia:</strong> ${usuario.experiencia_ingles || usuario.competencia_ingles?.experiencia || 'No especificada'}</li>
                    <li><strong>Modalidad:</strong> ${usuario.modalidad_participacion || usuario.competencia_ingles?.modalidad || 'No especificada'}</li>
                    <li><strong>Tema de presentación:</strong> ${usuario.tema_presentacion || usuario.competencia_ingles?.tema || 'No especificado'}</li>
                    <li><strong>Duración:</strong> ${usuario.duracion_participacion || usuario.competencia_ingles?.duracion || 'No especificada'}</li>
                    ${(usuario.recursos_adicionales || usuario.competencia_ingles?.recursos) ? `<li><strong>Recursos adicionales:</strong> ${usuario.recursos_adicionales || usuario.competencia_ingles?.recursos}</li>` : ''}
                </ul>
            </div>
            ` : ''}

            ${(usuario.rol === 'estudiante' && usuario.tipoEstudiante === 'asistente') ? `
            <div class="info-card">
                <h3 class="card-title">👀 Modalidad de Participación</h3>
                <ul class="info-list">
                    <li><strong>Tipo:</strong> Asistente (Observación)</li>
                    <li><strong>Descripción:</strong> Podrás observar la competencia sin participar activamente</li>
                </ul>
            </div>
            ` : ''}

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en el registro de la competencia</p>
            </div>
            ` : ''}

            <div class="competencia-section">
                <h3 style="color: #e84118; margin: 0 0 15px 0; font-size: 18px;">🗣️ Sobre la Competencia de Inglés</h3>
                <p style="color: #e84118; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Doble Lumen</strong> es una competencia diseñada para poner a prueba tus habilidades en el idioma inglés. 
                    Los participantes demostrarán sus competencias en speaking, presentation, debate y storytelling
                    en un ambiente de sana competencia y aprendizaje intercultural.
                </p>
            </div>

            <div style="background: #dfe6ff; border: 1px solid #74b9ff; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #0984e3; margin: 0 0 15px 0; font-size: 18px;">📝 Preparación para la Competencia</h3>
                <ul style="color: #0984e3; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Llega 30 minutos antes</strong> para el registro (6:00 pm)</li>
                    <li><strong>Prepara tu material</strong> de presentación si aplica</li>
                    <li><strong>Revisa las bases</strong> y criterios de evaluación</li>
                    <li><strong>Practica tu pronunciación</strong> y fluidez</li>
                    <li><strong>Mantén una actitud positiva</strong> y de aprendizaje</li>
                    <li><strong>Trae tu documento de identidad</strong> original</li>
                </ul>
            </div>

            <div style="background: #d1f2eb; border: 1px solid #00b894; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #00a085; margin: 0 0 15px 0; font-size: 18px;">🎯 Criterios de Evaluación</h3>
                <ul style="color: #00a085; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Fluidez y pronunciación</strong> en inglés</li>
                    <li><strong>Vocabulario y gramática</strong> adecuados</li>
                    <li><strong>Coherencia y estructura</strong> del discurso</li>
                    <li><strong>Creatividad y originalidad</strong> en la presentación</li>
                    <li><strong>Habilidades de comunicación</strong> efectiva</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Competencia de Inglés Doble Lumen
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - COMPETENCIA DE INGLÉS DOBLE LUMEN
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🏆 ¡REGISTRO A COMPETENCIA DE INGLÉS CONFIRMADO!

Hola ${usuario.nombre},

Te has registrado exitosamente a la Competencia de Inglés Doble Lumen.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.tipoEstudiante ? `- Tipo de Participación: ${usuario.tipoEstudiante === 'participante' ? 'Participante Activo' : 'Asistente'}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}
${usuario.area ? `- Área: ${usuario.area}\n` : ''}
${usuario.cargo ? `- Cargo: ${usuario.cargo}\n` : ''}
${usuario.empresa ? `- Empresa: ${usuario.empresa}\n` : ''}

🏆 DETALLES DE LA COMPETENCIA:
- Evento: Competencia de Inglés
- Nombre: Doble Lumen
- Fecha: 12 de Noviembre de 2025
- Hora: 6:30 pm - 9:30 pm
- Lugar: Auditorio 1 - Sede Pance
- Modalidad: Presencial
- Tipo: Competencia Lingüística

${(usuario.rol === 'estudiante' && usuario.tipoEstudiante === 'participante' && (usuario.competencia_ingles || usuario.nivel_ingles)) ? `
🗣️ INFORMACIÓN DE LA COMPETENCIA DE INGLÉS:
- Nivel de inglés: ${usuario.nivel_ingles || usuario.competencia_ingles?.nivel || 'No especificado'}
- Experiencia: ${usuario.experiencia_ingles || usuario.competencia_ingles?.experiencia || 'No especificada'}
- Modalidad: ${usuario.modalidad_participacion || usuario.competencia_ingles?.modalidad || 'No especificada'}
- Tema de presentación: ${usuario.tema_presentacion || usuario.competencia_ingles?.tema || 'No especificado'}
- Duración: ${usuario.duracion_participacion || usuario.competencia_ingles?.duracion || 'No especificada'}
${(usuario.recursos_adicionales || usuario.competencia_ingles?.recursos) ? `- Recursos adicionales: ${usuario.recursos_adicionales || usuario.competencia_ingles?.recursos}\n` : ''}
` : ''}

${(usuario.rol === 'estudiante' && usuario.tipoEstudiante === 'asistente') ? `
👀 MODALIDAD DE PARTICIPACIÓN:
- Tipo: Asistente (Observación)
- Descripción: Podrás observar la competencia sin participar activamente
` : ''}

🗣️ SOBRE LA COMPETENCIA DE INGLÉS:
Doble Lumen es una competencia diseñada para poner a prueba tus habilidades en el idioma inglés. 
Los participantes demostrarán sus competencias en speaking, presentation, debate y storytelling
en un ambiente de sana competencia y aprendizaje intercultural.

📝 PREPARACIÓN PARA LA COMPETENCIA:
• Llega 30 minutos antes para registro (6:00 pm)
• Prepara tu material de presentación si aplica
• Revisa las bases y criterios de evaluación
• Practica tu pronunciación y fluidez
• Mantén una actitud positiva y de aprendizaje
• Trae tu documento de identidad original

🎯 CRITERIOS DE EVALUACIÓN:
• Fluidez y pronunciación en inglés
• Vocabulario y gramática adecuados
• Coherencia y estructura del discurso
• Creatividad y originalidad en la presentación
• Habilidades de comunicación efectiva

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Competencia de Inglés Doble Lumen
        `
        };
    },
    // ✅ PLANTILLA PARA VISITA EMAVI
    visitaemavi: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenVisita = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762178284/VISITA_EMPRESARIAL_-12-8_rbboti.png";

        return {
            asunto: "✈️ Confirmación de Registro - Visita EMAVI",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Visita EMAVI</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #c5d5ff;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #1e3c72;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #1e3c72;
        }
        
        .card-title {
            color: #1e3c72;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #1e3c72;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #e8f0ff 0%, #d1e0ff 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #1e3c72;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #1e3c72;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .vehiculo-section {
            background: #ffeaa7;
            border: 1px solid #fdcb6e;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: #e8f0ff;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenVisita}" alt="Visita EMAVI" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a Visita EMAVI Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para la <strong>Visita EMAVI</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información Personal</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Tipo Documento:</strong> ${usuario.tipoDocumento}</li>
                        <li><strong>N° Documento:</strong> ${usuario.numeroDocumento}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Perfil:</strong> ${usuario.perfil}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.eps ? `<li><strong>EPS:</strong> ${usuario.eps}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">✈️ Detalles de la Visita</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Visita EMAVI</li>
                        <li><strong>Tipo:</strong> Visita Empresarial</li>
                        <li><strong>Fecha:</strong> 13 de Noviembre de 2025</li>
                        <li><strong>Hora:</strong> 8:00 am a 12:00 pm</li>
                        <li><strong>Lugar:</strong> Escuela Militar de Aviación (EMAVI)</li>
                        <li><strong>Cupo:</strong> 40 personas máximo</li>
                    </ul>
                </div>
            </div>

            ${usuario.placasVehiculo ? `
            <div class="vehiculo-section">
                <h3 style="color: #e17055; margin: 0 0 15px 0; font-size: 18px;">🚗 Información de Vehículo</h3>
                <p style="color: #e17055; margin: 0; font-size: 14px;">
                    <strong>Placas del vehículo:</strong> ${usuario.placasVehiculo}<br>
                    Recuerda que el estacionamiento es sujeto a disponibilidad.
                </p>
            </div>
            ` : ''}

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en el punto de encuentro</p>
            </div>
            ` : ''}

            <div style="background: #d1f2eb; border: 1px solid #1e3c72; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #1e3c72; margin: 0 0 15px 0; font-size: 18px;">📋 Información Importante</h3>
                <ul style="color: #1e3c72; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Lleva tu documento de identidad original</li>
                    <li>Puntualidad en el punto de encuentro</li>
                    <li>Vestimenta casual formal apropiada</li>
                    <li>Sigue las indicaciones del personal</li>
                    <li>No tomar fotografías sin autorización</li>
                    ${usuario.placasVehiculo ? `<li>Estacionamiento sujeto a disponibilidad</li>` : ''}
                </ul>
            </div>

            <div style="background: #e8f4ff; border: 1px solid #3498db; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #2980b9; margin: 0 0 15px 0; font-size: 18px;">✈️ Sobre la Visita a EMAVI</h3>
                <p style="color: #2980b9; margin: 0; font-size: 14px; line-height: 1.5;">
                    La Escuela Militar de Aviación (EMAVI) es una institución de educación superior 
                    de las Fuerzas Militares de Colombia. Durante esta visita podrás conocer 
                    sus instalaciones, procesos de formación y tecnología aeronáutica.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Visita EMAVI
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - VISITA EMAVI
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

✈️ ¡REGISTRO A VISITA EMAVI CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para la Visita EMAVI ha sido procesado exitosamente.

👤 INFORMACIÓN PERSONAL:
- Nombre: ${usuario.nombre}
- Tipo Documento: ${usuario.tipoDocumento}
- N° Documento: ${usuario.numeroDocumento}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Perfil: ${usuario.perfil}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.eps ? `- EPS: ${usuario.eps}\n` : ''}

✈️ DETALLES DE LA VISITA:
- Evento: Visita EMAVI
- Tipo: Visita Empresarial
- Fecha: 12 de Noviembre de 2025
- Hora: 8:00 am a 12:00 pm
- Lugar: Escuela Militar de Aviación (EMAVI)
- Cupo: 40 personas máximo

${usuario.placasVehiculo ? `
🚗 INFORMACIÓN DE VEHÍCULO:
- Placas: ${usuario.placasVehiculo}
- Estacionamiento sujeto a disponibilidad
` : ''}

📋 INFORMACIÓN IMPORTANTE:
• Lleva tu documento de identidad original
• Puntualidad en el punto de encuentro
• Vestimenta casual formal apropiada
• Sigue las indicaciones del personal
• No tomar fotografías sin autorización
${usuario.placasVehiculo ? `• Estacionamiento sujeto a disponibilidad\n` : ''}

✈️ SOBRE LA VISITA A EMAVI:
La Escuela Militar de Aviación (EMAVI) es una institución de educación superior 
de las Fuerzas Militares de Colombia. Durante esta visita podrás conocer 
sus instalaciones, procesos de formación y tecnología aeronáutica.

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Visita EMAVI
        `
        };
    },
    tallerwordpress: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenTaller = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762243272/WORDPRESS_qjoich.jpg";

        return {
            asunto: "🖥️ Confirmación de Registro - Taller de WordPress",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Taller WordPress</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #21759b 0%, #1e8cbe 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #e1f5fe;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #21759b;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #21759b;
        }
        
        .card-title {
            color: #21759b;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #21759b;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #21759b;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #21759b;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .requisitos-section {
            background: #e8f5e9;
            border: 1px solid #4caf50;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #21759b 0%, #1e8cbe 100%);
            color: #e1f5fe;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenTaller}" alt="Taller de WordPress" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro al Taller de WordPress Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para el <strong>Taller de Instalación de WordPress</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.tipoEstudiante ? `<li><strong>Tipo:</strong> ${usuario.tipoEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">🖥️ Detalles del Taller</h3>
                    <ul class="info-list">
                        <li><strong>Taller:</strong> Instalación de WordPress</li>
                        <li><strong>Fecha:</strong> Viernes 14 de Noviembre 2025</li>
                        <li><strong>Horario:</strong> 10:00 am – 11:00 am</li>
                        <li><strong>Duración:</strong> 1 hora</li>
                        <li><strong>Ponente:</strong> Mag. Carlos Molina</li>
                        <li><strong>Lugar:</strong> Sala 2 de Sistemas</li>
                        <li><strong>Sede:</strong> Pance</li>
                    </ul>
                </div>
            </div>

            <div class="requisitos-section">
                <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">💻 Requisitos del Taller</h3>
                <p style="color: #2e7d32; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Taller Práctico:</strong> Instalación de WordPress en entorno Linux (Ubuntu) usando WSL en Windows, 
                    configurando MySQL, Apache y PHP. Trae tu computador personal para seguir el taller paso a paso.
                </p>
            </div>

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en la entrada de la Sala 2 de Sistemas</p>
            </div>
            ` : ''}

            <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">🎯 Lo que Aprenderás en el Taller</h3>
                <ul style="color: #1565c0; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Configuración de WSL</strong> (Windows Subsystem for Linux) con Ubuntu</li>
                    <li><strong>Instalación y configuración</strong> de Apache, MySQL y PHP (Stack LAMP)</li>
                    <li><strong>Descarga e instalación</strong> de WordPress desde cero</li>
                    <li><strong>Configuración de base de datos</strong> MySQL para WordPress</li>
                    <li><strong>Configuración de permisos</strong> y archivos de WordPress</li>
                    <li><strong>Primeros pasos</strong> con el panel de administración de WordPress</li>
                </ul>
            </div>

            <div style="background: #fff3e0; border: 1px solid #ff9800; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #ef6c00; margin: 0 0 15px 0; font-size: 18px;">📝 Recomendaciones para el Taller</h3>
                <ul style="color: #ef6c00; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Trae tu computador portátil personal con Windows 10/11</li>
                    <li>Verifica que tengas al menos 10GB de espacio libre en disco</li>
                    <li>Llega 10 minutos antes del inicio (9:50 am)</li>
                    <li>Conexión a internet estable (recomendado)</li>
                    <li>Cargador para tu computador portátil</li>
                    <li>Actitud de aprendizaje y preguntas</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Taller de WordPress
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - TALLER DE WORDPRESS
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🖥️ ¡REGISTRO AL TALLER DE WORDPRESS CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para el Taller de Instalación de WordPress ha sido procesado exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.tipoEstudiante ? `- Tipo: ${usuario.tipoEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}

🖥️ DETALLES DEL TALLER:
- Taller: Instalación de WordPress
- Fecha: Viernes 14 de Noviembre de 2025
- Horario: 10:00 am – 11:00 am
- Duración: 1 hora
- Ponente: Mag. Carlos Molina
- Lugar: Sala 2 de Sistemas
- Sede: Pance

💻 REQUISITOS DEL TALLER:
Taller Práctico: Instalación de WordPress en entorno Linux (Ubuntu) usando WSL en Windows, 
configurando MySQL, Apache y PHP. Trae tu computador personal para seguir el taller paso a paso.

🎯 LO QUE APRENDERÁS:
• Configuración de WSL (Windows Subsystem for Linux) con Ubuntu
• Instalación y configuración de Apache, MySQL y PHP (Stack LAMP)
• Descarga e instalación de WordPress desde cero
• Configuración de base de datos MySQL para WordPress
• Configuración de permisos y archivos de WordPress
• Primeros pasos con el panel de administración de WordPress

📝 RECOMENDACIONES:
• Trae tu computador portátil personal con Windows 10/11
• Verifica que tengas al menos 10GB de espacio libre en disco
• Llega 10 minutos antes (9:50 am)
• Conexión a internet estable (recomendado)
• Cargador para tu computador portátil
• Actitud de aprendizaje y preguntas

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Taller de WordPress
        `
        };
    },
    // ✅ PLANTILLA PARA INDUSTRIA EN ACCIÓN
    industriaenaccion: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenIndustria = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762191991/OLIMPIADAS_LOGICA_MATEMATICA_qtptvj.jpg";

        return {
            asunto: "🏭 Confirmación de Registro - Industria en Acción",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Industria en Acción</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #bdc3c7;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #2c3e50;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #2c3e50;
        }
        
        .card-title {
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #2c3e50;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #2c3e50;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .oportunidades-section {
            background: #d5dbdb;
            border: 1px solid #a6acaf;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ecf0f1;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenIndustria}" alt="Industria en Acción" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a Industria en Acción Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para <strong>Industria en Acción</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.tipoEstudiante ? `<li><strong>Tipo:</strong> ${usuario.tipoEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">🏭 Detalles del Evento</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Industria en Acción</li>
                        <li><strong>Fecha:</strong> 12 de Noviembre 2025</li>
                        <li><strong>Horario:</strong> 6:30 pm – 9:30 pm</li>
                        <li><strong>Duración:</strong> 4 horas</li>
                        <li><strong>Lugar:</strong> Laboratorio de Ingeniería e Innovación</li>
                        <li><strong>Sede:</strong> Pance</li>
                        <li><strong>Tipo:</strong> Encuentro Empresarial</li>
                    </ul>
                </div>
            </div>

            <div class="oportunidades-section">
                <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;">💼 Espacio de Interacción Empresarial</h3>
                <p style="color: #2c3e50; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>Industria en Acción</strong> es un espacio diseñado para facilitar la interacción entre estudiantes 
                    y empresas del sector industrial. Podrás conocer oportunidades laborales, proyectos de innovación 
                    y establecer contactos directos con representantes empresariales del sector.
                </p>
            </div>

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en la entrada del laboratorio</p>
            </div>
            ` : ''}

            <div style="background: #e8f6f3; border: 1px solid #1abc9c; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #16a085; margin: 0 0 15px 0; font-size: 18px;">🎯 Lo que encontrarás en Industria en Acción</h3>
                <ul style="color: #16a085; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Oportunidades laborales</strong> en empresas líderes del sector industrial</li>
                    <li><strong>Proyectos de innovación</strong> en desarrollo y oportunidades de participación</li>
                    <li><strong>Networking directo</strong> con representantes empresariales</li>
                    <li><strong>Conocimiento del mercado laboral</strong> actual del sector industrial</li>
                    <li><strong>Posibilidades de prácticas</strong> y proyectos de grado</li>
                    <li><strong>Tendencias tecnológicas</strong> en la industria</li>
                </ul>
            </div>

            <div style="background: #fef9e7; border: 1px solid #f39c12; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #e67e22; margin: 0 0 15px 0; font-size: 18px;">📝 Recomendaciones para el Evento</h3>
                <ul style="color: #e67e22; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Llega 15 minutos antes del inicio (6:15 pm)</li>
                    <li>Prepara tu hoja de vida actualizada (opcional)</li>
                    <li>Vestimenta casual formal apropiada para entorno empresarial</li>
                    <li>Prepara preguntas para los representantes empresariales</li>
                    <li>Trae tu documento de identidad original</li>
                    <li>Actitud proactiva para networking</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Industria en Acción
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - INDUSTRIA EN ACCIÓN
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🏭 ¡REGISTRO A INDUSTRIA EN ACCIÓN CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para Industria en Acción ha sido procesado exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.tipoEstudiante ? `- Tipo: ${usuario.tipoEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}

🏭 DETALLES DEL EVENTO:
- Evento: Industria en Acción
- Fecha: 12 de Noviembre de 2025
- Horario: 6:30 pm – 9:30 pm
- Duración: 4 horas
- Lugar: Laboratorio de Ingeniería e Innovación
- Sede: Pance
- Tipo: Encuentro Empresarial

💼 ESPACIO DE INTERACCIÓN EMPRESARIAL:
Industria en Acción es un espacio diseñado para facilitar la interacción entre estudiantes 
y empresas del sector industrial. Podrás conocer oportunidades laborales, proyectos de innovación 
y establecer contactos directos con representantes empresariales del sector.

🎯 LO QUE ENCONTRARÁS:
• Oportunidades laborales en empresas líderes del sector industrial
• Proyectos de innovación en desarrollo
• Networking directo con representantes empresariales
• Conocimiento del mercado laboral actual
• Posibilidades de prácticas y proyectos de grado
• Tendencias tecnológicas en la industria

📝 RECOMENDACIONES:
• Llega 15 minutos antes (6:15 pm)
• Prepara tu hoja de vida actualizada (opcional)
• Vestimenta casual formal apropiada
• Prepara preguntas para los representantes
• Trae tu documento de identidad original
• Actitud proactiva para networking

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Industria en Acción
        `
        };
    },
    // ✅ PLANTILLA PARA IA EN LA PRÁCTICA Y CASOS DE USO
    'ia-practica': (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenIAPractica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762241359/CONFERENCIA-IAPRACTICA-8_ede3cj.png";

        return {
            asunto: "🤖 Confirmación de Registro - IA en la Práctica y Casos de Uso",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - IA en la Práctica</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #e1bee7;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #4a148c;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #4a148c;
        }
        
        .card-title {
            color: #4a148c;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #4a148c;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #4a148c;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #4a148c;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .ponente-section {
            background: #ede7f6;
            border: 1px solid #7e57c2;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%);
            color: #f3e5f5;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenIAPractica}" alt="IA en la Práctica y Casos de Uso" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a IA en la Práctica y Casos de Uso Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para la conferencia <strong>IA en la Práctica y Casos de Uso</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                        ${usuario.area ? `<li><strong>Área:</strong> ${usuario.area}</li>` : ''}
                        ${usuario.cargo ? `<li><strong>Cargo:</strong> ${usuario.cargo}</li>` : ''}
                        ${usuario.empresa ? `<li><strong>Empresa:</strong> ${usuario.empresa}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">🤖 Detalles de la Conferencia</h3>
                    <ul class="info-list">
                        <li><strong>Conferencia:</strong> IA en la Práctica y Casos de Uso</li>
                        <li><strong>Fecha:</strong> 12 de Noviembre 2025</li>
                        <li><strong>Horario:</strong> 7:00 pm – 8:00 pm</li>
                        <li><strong>Duración:</strong> 1 hora</li>
                        <li><strong>Lugar:</strong> Salón A201</li>
                        <li><strong>Sede:</strong> Pance</li>
                        <li><strong>Tipo:</strong> Conferencia Especializada</li>
                    </ul>
                </div>
            </div>

            <div class="ponente-section">
                <h3 style="color: #4a148c; margin: 0 0 15px 0; font-size: 18px;">👩‍🏫 Ponente de la Conferencia</h3>
                <p style="color: #4a148c; margin: 0; font-size: 16px; line-height: 1.5;">
                    <strong>Mag. Lorena Cerón</strong><br>
                    Especialista en Inteligencia Artificial con amplia experiencia en implementación 
                    de soluciones basadas en IA en diversos sectores empresariales e industriales.
                </p>
            </div>

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en la entrada del salón</p>
            </div>
            ` : ''}

            <div style="background: #e8f5e8; border: 1px solid #4caf50; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">🚀 Lo que aprenderás en la Conferencia</h3>
                <ul style="color: #2e7d32; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Aplicaciones reales</strong> de IA en diferentes industrias</li>
                    <li><strong>Casos de éxito</strong> en implementación de soluciones de IA</li>
                    <li><strong>Mejores prácticas</strong> para proyectos de inteligencia artificial</li>
                    <li><strong>Tendencias actuales</strong> en machine learning y deep learning</li>
                    <li><strong>Herramientas y frameworks</strong> más utilizados en IA</li>
                    <li><strong>Retos y oportunidades</strong> en el campo de la inteligencia artificial</li>
                </ul>
            </div>

            <div style="background: #e3f2fd; border: 1px solid #2196f3; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #1565c0; margin: 0 0 15px 0; font-size: 18px;">💡 Temas Clave que se Abordarán</h3>
                <ul style="color: #1565c0; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Procesamiento de lenguaje natural (NLP) en aplicaciones empresariales</li>
                    <li>Visión por computadora y reconocimiento de imágenes</li>
                    <li>Sistemas de recomendación y personalización</li>
                    <li>Análisis predictivo y forecasting con IA</li>
                    <li>Automatización de procesos con machine learning</li>
                    <li>Ética y responsabilidad en el desarrollo de IA</li>
                </ul>
            </div>

            <div style="background: #fff3e0; border: 1px solid #ff9800; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #ef6c00; margin: 0 0 15px 0; font-size: 18px;">📝 Recomendaciones para la Conferencia</h3>
                <ul style="color: #ef6c00; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Llega 10 minutos antes del inicio (6:50 pm)</li>
                    <li>Trae cuaderno o dispositivo para tomar apuntes</li>
                    <li>Prepara preguntas sobre aplicaciones específicas de IA</li>
                    <li>Vestimenta casual formal apropiada</li>
                    <li>Actitud participativa y curiosa</li>
                    <li>Trae tu documento de identidad original</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - IA en la Práctica y Casos de Uso
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - IA EN LA PRÁCTICA Y CASOS DE USO
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🤖 ¡REGISTRO A IA EN LA PRÁCTICA Y CASOS DE USO CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para la conferencia IA en la Práctica y Casos de Uso ha sido procesado exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}
${usuario.area ? `- Área: ${usuario.area}\n` : ''}
${usuario.cargo ? `- Cargo: ${usuario.cargo}\n` : ''}
${usuario.empresa ? `- Empresa: ${usuario.empresa}\n` : ''}

🤖 DETALLES DE LA CONFERENCIA:
- Conferencia: IA en la Práctica y Casos de Uso
- Fecha: 12 de Noviembre de 2025
- Horario: 7:00 pm – 8:00 pm
- Duración: 1 hora
- Lugar: Salón A201
- Sede: Pance
- Tipo: Conferencia Especializada

👩‍🏫 PONENTE DE LA CONFERENCIA:
Mag. Lorena Cerón
Especialista en Inteligencia Artificial con amplia experiencia en implementación 
de soluciones basadas en IA en diversos sectores empresariales e industriales.

🚀 LO QUE APRENDERÁS:
• Aplicaciones reales de IA en diferentes industrias
• Casos de éxito en implementación de soluciones de IA
• Mejores prácticas para proyectos de inteligencia artificial
• Tendencias actuales en machine learning y deep learning
• Herramientas y frameworks más utilizados en IA
• Retos y oportunidades en el campo de la inteligencia artificial

💡 TEMAS CLAVE QUE SE ABORDARÁN:
• Procesamiento de lenguaje natural (NLP) en aplicaciones empresariales
• Visión por computadora y reconocimiento de imágenes
• Sistemas de recomendación y personalización
• Análisis predictivo y forecasting con IA
• Automatización de procesos con machine learning
• Ética y responsabilidad en el desarrollo de IA

📝 RECOMENDACIONES:
• Llega 10 minutos antes (6:50 pm)
• Trae cuaderno o dispositivo para tomar apuntes
• Prepara preguntas sobre aplicaciones específicas de IA
• Vestimenta casual formal apropiada
• Actitud participativa y curiosa
• Trae tu documento de identidad original

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - IA en la Práctica y Casos de Uso
        `
        };
    },
    // ✅ PLANTILLA PARA TALLER DE VUELO Y COHETERÍA
    tallervuelo: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenTallerVuelo = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762238592/INICIACION_AL_VUELO-8_eppiuv.png";

        return {
            asunto: "🚀 Confirmación de Registro - Taller de Vuelo y Cohetería",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Taller de Vuelo y Cohetería</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #bdc3c7;
            font-size: 16px;
            font-weight: 400;
        }
        
        .taller-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #1a237e;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #1a237e;
        }
        
        .card-title {
            color: #1a237e;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #1a237e;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #1a237e;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #1a237e;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .ponente-section {
            background: #e8eaf6;
            border: 1px solid #7986cb;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
            color: #e3f2fd;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .taller-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenTallerVuelo}" alt="Taller de Vuelo y Cohetería" class="taller-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro al Taller de Vuelo y Cohetería Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para el <strong>Taller Teórico-Práctico de Iniciación al Vuelo y a La Cohetería</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                        ${usuario.area ? `<li><strong>Área:</strong> ${usuario.area}</li>` : ''}
                        ${usuario.cargo ? `<li><strong>Cargo:</strong> ${usuario.cargo}</li>` : ''}
                        ${usuario.empresa ? `<li><strong>Empresa:</strong> ${usuario.empresa}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">🚀 Detalles del Taller</h3>
                    <ul class="info-list">
                        <li><strong>Taller:</strong> Iniciación al Vuelo y Cohetería</li>
                        <li><strong>Fecha:</strong> 12 de Noviembre 2025</li>
                        <li><strong>Horario:</strong> 10:00 am – 11:00 am</li>
                        <li><strong>Duración:</strong> 1 hora</li>
                        <li><strong>Lugar:</strong> Auditorio 1</li>
                        <li><strong>Sede:</strong> Pance</li>
                        <li><strong>Tipo:</strong> Taller Teórico-Práctico</li>
                    </ul>
                </div>
            </div>

            <div class="ponente-section">
                <h3 style="color: #1a237e; margin: 0 0 15px 0; font-size: 18px;">👨‍🏫 Ponente del Taller</h3>
                <p style="color: #1a237e; margin: 0; font-size: 16px; line-height: 1.5;">
                    <strong>P&D Julián Portocarrero Hermann</strong><br>
                    Experto en aerodinámica y propulsión, con amplia experiencia en proyectos 
                    educativos de cohetería y vuelo experimental.
                </p>
            </div>

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en la entrada del auditorio</p>
            </div>
            ` : ''}

            <div style="background: #e8f5e9; border: 1px solid #4caf50; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #2e7d32; margin: 0 0 15px 0; font-size: 18px;">🎯 Lo que aprenderás en el Taller</h3>
                <ul style="color: #2e7d32; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Fundamentos básicos</strong> de aerodinámica y propulsión</li>
                    <li><strong>Principios físicos</strong> del vuelo y la cohetería</li>
                    <li><strong>Diseño básico</strong> de cohetes experimentales</li>
                    <li><strong>Conceptos de estabilidad</strong> y control de vuelo</li>
                    <li><strong>Materiales y técnicas</strong> de construcción</li>
                    <li><strong>Seguridad en experimentación</strong> con cohetes</li>
                </ul>
            </div>

            <div style="background: #fff3e0; border: 1px solid #ff9800; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #ef6c00; margin: 0 0 15px 0; font-size: 18px;">🔬 Componente Práctico</h3>
                <ul style="color: #ef6c00; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Demostraciones en vivo de principios aerodinámicos</li>
                    <li>Exhibición de modelos de cohetes educativos</li>
                    <li>Simulaciones básicas de trayectorias de vuelo</li>
                    <li>Análisis de casos de estudio reales</li>
                    <li>Espacio para preguntas y respuestas interactivas</li>
                </ul>
            </div>

            <div style="background: #f3e5f5; border: 1px solid #8e24aa; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #6a1b9a; margin: 0 0 15px 0; font-size: 18px;">📝 Recomendaciones para el Taller</h3>
                <ul style="color: #6a1b9a; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Llega 10 minutos antes del inicio (9:50 am)</li>
                    <li>Trae cuaderno para tomar apuntes</li>
                    <li>Vestimenta cómoda y adecuada</li>
                    <li>Actitud participativa y curiosa</li>
                    <li>Prepara preguntas sobre vuelo y cohetería</li>
                    <li>Trae tu documento de identidad original</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Taller de Vuelo y Cohetería
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - TALLER DE VUELO Y COHETERÍA
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🚀 ¡REGISTRO AL TALLER DE VUELO Y COHETERÍA CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para el Taller Teórico-Práctico de Iniciación al Vuelo y a La Cohetería ha sido procesado exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}
${usuario.area ? `- Área: ${usuario.area}\n` : ''}
${usuario.cargo ? `- Cargo: ${usuario.cargo}\n` : ''}
${usuario.empresa ? `- Empresa: ${usuario.empresa}\n` : ''}

🚀 DETALLES DEL TALLER:
- Taller: Iniciación al Vuelo y Cohetería
- Fecha: 12 de Noviembre de 2025
- Horario: 10:00 am – 11:00 am
- Duración: 1 hora
- Lugar: Auditorio 1
- Sede: Pance
- Tipo: Taller Teórico-Práctico

👨‍🏫 PONENTE DEL TALLER:
P&D Julián Portocarrero Hermann
Experto en aerodinámica y propulsión, con amplia experiencia en proyectos 
educativos de cohetería y vuelo experimental.

🎯 LO QUE APRENDERÁS:
• Fundamentos básicos de aerodinámica y propulsión
• Principios físicos del vuelo y la cohetería
• Diseño básico de cohetes experimentales
• Conceptos de estabilidad y control de vuelo
• Materiales y técnicas de construcción
• Seguridad en experimentación con cohetes

🔬 COMPONENTE PRÁCTICO:
• Demostraciones en vivo de principios aerodinámicos
• Exhibición de modelos de cohetes educativos
• Simulaciones básicas de trayectorias de vuelo
• Análisis de casos de estudio reales
• Espacio para preguntas y respuestas interactivas

📝 RECOMENDACIONES:
• Llega 10 minutos antes (9:50 am)
• Trae cuaderno para tomar apuntes
• Vestimenta cómoda y adecuada
• Actitud participativa y curiosa
• Prepara preguntas sobre vuelo y cohetería
• Trae tu documento de identidad original

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Taller de Vuelo y Cohetería
        `
        };
    },
    // ✅ PLANTILLA PARA CERTIFICACIÓN FULL STACK - MODALIDAD VIRTUAL
    desarrollofullstack: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenFullStack = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762105982/devseniologo_vhjhlv.png";

        return {
            asunto: "🚀 Confirmación de Inscripción - Certificación Full Stack Virtual DevSenior",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Certificación Full Stack Virtual</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #e0e7ff;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #667eea;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }
        
        .card-title {
            color: #667eea;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #667eea;
            font-weight: 600;
        }
        
        .virtual-badge {
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            display: inline-block;
            margin-bottom: 15px;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #667eea;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #667eea;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .certificacion-section {
            background: #e6f7ff;
            border: 1px solid #91d5ff;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .sesiones-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        
        .sesion-card {
            background: white;
            border: 1px solid #d6e4ff;
            border-radius: 8px;
            padding: 15px;
        }
        
        .plataforma-info {
            background: #fff7e6;
            border: 1px solid #ffd591;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #e0e7ff;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenFullStack}" alt="Certificación Full Stack Virtual" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <div class="virtual-badge">🎯 MODALIDAD 100% VIRTUAL</div>
                <h1 class="welcome-title">¡Inscripción a Certificación FullStack DevSenior Confirmada!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Te has inscrito exitosamente a la <strong>Certificación Full Stack DevSenior: Spring Boot, Angular & AI</strong>.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol === 'estudiante' ? 'Estudiante' : 'Egresado'}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">💻 Información Técnica</h3>
                    <ul class="info-list">
                        <li><strong>Nivel de inglés:</strong> ${usuario.nivelIngles}</li>
                        <li><strong>Experiencia programación:</strong> ${usuario.experienciaProgramacion}</li>
                        ${usuario.conocimientoSpring ? `<li><strong>Spring Boot:</strong> ${usuario.conocimientoSpring}</li>` : ''}
                        ${usuario.conocimientoAngular ? `<li><strong>Angular:</strong> ${usuario.conocimientoAngular}</li>` : ''}
                        ${usuario.conocimientoAI ? `<li><strong>AI/ML:</strong> ${usuario.conocimientoAI}</li>` : ''}
                    </ul>
                </div>
            </div>

            <div class="info-card">
                <h3 class="card-title">🎯 Detalles de la Certificación DevSenior</h3>
                <ul class="info-list">
                    <li><strong>Evento:</strong> Certificación Full Stack Virtual</li>
                    <li><strong>Nombre:</strong> Spring Boot, Angular & AI</li>
                    <li><strong>Fechas:</strong> 10, 12, 14 Noviembre 2025</li>
                    <li><strong>Horario:</strong> 8:00 pm - 10:00 pm</li>
                    <li><strong>Modalidad:</strong> 100% Virtual - En Vivo</li>
                    <li><strong>Plataforma:</strong> Microsoft Teams</li>
                    <li><strong>Certificado:</strong> Internacional DevSeniorCode</li>
                    <li><strong>Duración:</strong> 3 sesiones (6 horas total)</li>
                    <li><strong>Acceso:</strong> Desde cualquier dispositivo</li>
                </ul>
            </div>

            <div class="plataforma-info">
                <h3 style="color: #fa8c16; margin: 0 0 15px 0; font-size: 18px;">💻 Información de la Plataforma Virtual</h3>
                <p style="color: #fa8c16; margin: 0 0 10px 0; font-size: 14px;">
                    <strong>Plataforma:</strong> Microsoft Teams<br>
                    <strong>Enlace de acceso:</strong> Se enviará 1 hora antes de cada sesión<br>
                    <strong>Requisitos técnicos:</strong> Conexión a internet estable, audio y micrófono<br>
                    <strong>Compatibilidad:</strong> Windows, Mac, Linux, iOS, Android
                </p>
            </div>

            <div class="sesiones-grid">
                <div class="sesion-card">
                    <h4 style="color: #667eea; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">📚 Sesión 1 - 10 Nov (Virtual)</h4>
                    <p style="color: #555; margin: 0; font-size: 14px;">
                        <strong>Backend Empresarial con Spring Boot + AI</strong><br>
                        APIs RESTful, PostgreSQL, Arquitectura empresarial, Conexión con APIs de AI
                    </p>
                </div>
                
                <div class="sesion-card">
                    <h4 style="color: #667eea; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🎨 Sesión 2 - 12 Nov (Virtual)</h4>
                    <p style="color: #555; margin: 0; font-size: 14px;">
                        <strong>Frontend Empresarial con Angular + AI</strong><br>
                        Fundamentos de Angular, Componentes, Consumo de APIs, Integración con AI
                    </p>
                </div>
                
                <div class="sesion-card">
                    <h4 style="color: #667eea; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🔗 Sesión 3 - 14 Nov (Virtual)</h4>
                    <p style="color: #555; margin: 0; font-size: 14px;">
                        <strong>Integración Full Stack con AI</strong><br>
                        Integración backend-frontend, Flujo de datos, Casos reales con AI
                    </p>
                </div>
            </div>

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso Virtual</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Este código contiene tu información de acceso a la plataforma virtual</p>
            </div>
            ` : ''}

            <div class="certificacion-section">
                <h3 style="color: #1890ff; margin: 0 0 15px 0; font-size: 18px;">🚀 Certificación Full Stack Virtual</h3>
                <p style="color: #1890ff; margin: 0; font-size: 14px; line-height: 1.5;">
                    <strong>DevSeniorCode Academy</strong> te ofrece esta certificación intensiva <strong>100% virtual</strong> donde aprenderás 
                    a construir aplicaciones inteligentes con las tecnologías más demandadas del mercado. Desde la comodidad 
                    de tu hogar, desarrollarás habilidades en backend empresarial con Spring Boot, frontend moderno con Angular 
                    e integración con Inteligencia Artificial.
                </p>
            </div>

            <div style="background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #52c41a; margin: 0 0 15px 0; font-size: 18px;">📝 Preparación para la Certificación Virtual</h3>
                <ul style="color: #52c41a; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Conéctate 10 minutos antes</strong> para verificar tu acceso</li>
                    <li><strong>Prepara tu portátil</strong> con Node.js y Java instalados</li>
                    <li><strong>Verifica tu conexión a internet</strong> y equipo de audio</li>
                    <li><strong>Configura tu entorno</strong> de desarrollo (VS Code recomendado)</li>
                    <li><strong>Espacio tranquilo</strong> sin interrupciones</li>
                    <li><strong>Participación activa</strong> con micrófono y cámara opcional</li>
                    <li><strong>Descarga Microsoft Teams</strong> o usa la versión web</li>
                </ul>
            </div>

            <div style="background: #fff7e6; border: 1px solid #ffd591; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #fa8c16; margin: 0 0 15px 0; font-size: 18px;">🎯 Lo que Aprenderás</h3>
                <ul style="color: #fa8c16; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Desarrollo backend</strong> con Spring Boot y PostgreSQL</li>
                    <li><strong>Desarrollo frontend</strong> con Angular y TypeScript</li>
                    <li><strong>Integración de APIs</strong> de Inteligencia Artificial</li>
                    <li><strong>Arquitectura empresarial</strong> escalable y mantenible</li>
                    <li><strong>Despliegue de aplicaciones</strong> full stack</li>
                    <li><strong>Mejores prácticas</strong> de desarrollo moderno</li>
                    <li><strong>Trabajo remoto</strong> eficiente en equipos de desarrollo</li>
                </ul>
            </div>

            <div style="background: #f0f8ff; border: 1px solid #87ceeb; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #1890ff; margin: 0 0 15px 0; font-size: 18px;">💡 Beneficios de la Modalidad Virtual</h3>
                <ul style="color: #1890ff; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Flexibilidad horaria</strong> desde cualquier ubicación</li>
                    <li><strong>Acceso desde cualquier dispositivo</strong> con internet</li>
                    <li><strong>Grabación de sesiones</strong> disponible por 30 días</li>
                    <li><strong>Material digital</strong> descargable</li>
                    <li><strong>Interacción directa</strong> con instructores especializados</li>
                    <li><strong>Networking virtual</strong> con otros participantes</li>
                    <li><strong>Sin desplazamientos</strong> - Ahorro de tiempo y costos</li>
                </ul>
            </div>

            ${usuario.motivacion ? `
            <div style="background: #f9f0ff; border: 1px solid #d3adf7; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #722ed1; margin: 0 0 15px 0; font-size: 18px;">💫 Tu Motivación</h3>
                <p style="color: #722ed1; margin: 0; font-size: 14px; line-height: 1.5; font-style: italic;">
                    "${usuario.motivacion}"
                </p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Certificación Full Stack Virtual: Spring Boot, Angular & AI
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE INSCRIPCIÓN - CERTIFICACIÓN FULL STACK VIRTUAL
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🚀 ¡INSCRIPCIÓN A CERTIFICACIÓN FULL STACK VIRTUAL CONFIRMADA!

Hola ${usuario.nombre},

Te has inscrito exitosamente a la Certificación Full Stack Virtual: Spring Boot, Angular & AI.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol === 'estudiante' ? 'Estudiante' : 'Egresado'}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}

💻 INFORMACIÓN TÉCNICA:
- Nivel de inglés: ${usuario.nivelIngles}
- Experiencia en programación: ${usuario.experienciaProgramacion}
${usuario.conocimientoSpring ? `- Conocimiento Spring Boot: ${usuario.conocimientoSpring}\n` : ''}
${usuario.conocimientoAngular ? `- Conocimiento Angular: ${usuario.conocimientoAngular}\n` : ''}
${usuario.conocimientoAI ? `- Conocimiento AI/ML: ${usuario.conocimientoAI}\n` : ''}

🎯 DETALLES DE LA CERTIFICACIÓN VIRTUAL:
- Evento: Certificación Full Stack Virtual
- Nombre: Spring Boot, Angular & AI
- Fechas: 10, 12, 14 Noviembre 2025
- Horario: 8:00 pm - 10:00 pm
- Modalidad: 100% Virtual - En Vivo
- Plataforma: Microsoft Teams
- Certificado: Internacional DevSeniorCode
- Duración: 3 sesiones (6 horas total)
- Acceso: Desde cualquier dispositivo con internet

💻 INFORMACIÓN DE LA PLATAFORMA VIRTUAL:
- Plataforma: Microsoft Teams
- Enlace de acceso: Se enviará 1 hora antes de cada sesión
- Requisitos técnicos: Conexión a internet estable, audio y micrófono
- Compatibilidad: Windows, Mac, Linux, iOS, Android

📚 SESIONES VIRTUALES:

Sesión 1 - 10 Nov (8:00 pm - 10:00 pm) - VIRTUAL
Backend Empresarial con Spring Boot + AI
- APIs RESTful con PostgreSQL
- Arquitectura empresarial
- Conexión con APIs de AI

Sesión 2 - 12 Nov (8:00 pm - 10:00 pm) - VIRTUAL
Frontend Empresarial con Angular + AI
- Fundamentos de Angular
- Componentes y consumo de APIs
- Integración con AI

Sesión 3 - 14 Nov (8:00 pm - 10:00 pm) - VIRTUAL
Integración Full Stack con AI
- Integración backend-frontend
- Flujo de datos y lógica empresarial
- Casos reales con AI

🚀 CERTIFICACIÓN FULL STACK VIRTUAL:
DevSeniorCode Academy te ofrece esta certificación intensiva 100% virtual donde aprenderás 
a construir aplicaciones inteligentes con las tecnologías más demandadas del mercado. Desde 
la comodidad de tu hogar, desarrollarás habilidades en backend empresarial con Spring Boot, 
frontend moderno con Angular e integración con Inteligencia Artificial.

📝 PREPARACIÓN PARA LA CERTIFICACIÓN VIRTUAL:
• Conéctate 10 minutos antes para verificar tu acceso
• Prepara tu portátil con Node.js y Java instalados
• Verifica tu conexión a internet y equipo de audio
• Configura tu entorno de desarrollo (VS Code recomendado)
• Espacio tranquilo sin interrupciones
• Participación activa con micrófono y cámara opcional
• Descarga Microsoft Teams o usa la versión web

🎯 LO QUE APRENDERÁS:
• Desarrollo backend con Spring Boot y PostgreSQL
• Desarrollo frontend con Angular y TypeScript
• Integración de APIs de Inteligencia Artificial
• Arquitectura empresarial escalable y mantenible
• Despliegue de aplicaciones full stack
• Mejores prácticas de desarrollo moderno
• Trabajo remoto eficiente en equipos de desarrollo

💡 BENEFICIOS DE LA MODALIDAD VIRTUAL:
• Flexibilidad horaria desde cualquier ubicación
• Acceso desde cualquier dispositivo con internet
• Grabación de sesiones disponible por 30 días
• Material digital descargable
• Interacción directa con instructores especializados
• Networking virtual con otros participantes
• Sin desplazamientos - Ahorro de tiempo y costos

${usuario.motivacion ? `
💫 TU MOTIVACIÓN:
"${usuario.motivacion}"
` : ''}

IMPORTANTE: El enlace de acceso a Microsoft Teams se enviará a este correo 1 hora antes de cada sesión.

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Certificación Full Stack Virtual: Spring Boot, Angular & AI
        `
        };
    },
    // ✅ PLANTILLA PARA VISITA CÁRNICOS
    visitacarnicos: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenVisita = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762186754/VISITA_EMPRESARIAL_-8_dmebly.png";

        return {
            asunto: "🥩 Confirmación de Registro - Visita CDI Alimentos Cárnicos",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Visita Cárnicos</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #8B0000 0%, #B22222 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #ffb3b3;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #8B0000;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #8B0000;
        }
        
        .card-title {
            color: #8B0000;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #8B0000;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #ffe6e6 0%, #ffcccc 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #8B0000;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #8B0000;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .vehiculo-section {
            background: #ffeaa7;
            border: 1px solid #fdcb6e;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #8B0000 0%, #B22222 100%);
            color: #ffe6e6;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenVisita}" alt="Visita CDI Alimentos Cárnicos" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a Visita CDI Alimentos Cárnicos Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para la <strong>Visita Cárnicos</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información Personal</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Tipo Documento:</strong> ${usuario.tipoDocumento}</li>
                        <li><strong>N° Documento:</strong> ${usuario.numeroDocumento}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Perfil:</strong> ${usuario.perfil}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.eps ? `<li><strong>EPS:</strong> ${usuario.eps}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">🥩 Detalles de la Visita</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Visita Cárnicos</li>
                        <li><strong>Tipo:</strong> Visita Empresarial</li>
                        <li><strong>Fecha:</strong> 15 de Noviembre de 2025</li>
                        <li><strong>Hora:</strong> 9:00 am a 12:00 pm</li>
                        <li><strong>Lugar:</strong> CDI Alimentos Cárnicos</li>
                        <li><strong>Cupo:</strong> 40 personas máximo</li>
                    </ul>
                </div>
            </div>

            ${usuario.placasVehiculo ? `
            <div class="vehiculo-section">
                <h3 style="color: #e17055; margin: 0 0 15px 0; font-size: 18px;">🚗 Información de Vehículo</h3>
                <p style="color: #e17055; margin: 0; font-size: 14px;">
                    <strong>Placas del vehículo:</strong> ${usuario.placasVehiculo}<br>
                    Recuerda que el estacionamiento es sujeto a disponibilidad.
                </p>
            </div>
            ` : ''}

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en el punto de encuentro</p>
            </div>
            ` : ''}

            <div style="background: #ffe6e6; border: 1px solid #8B0000; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #8B0000; margin: 0 0 15px 0; font-size: 18px;">📋 Información Importante</h3>
                <ul style="color: #8B0000; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Lleva tu documento de identidad original</li>
                    <li>Puntualidad en el punto de encuentro</li>
                    <li>Vestimenta casual formal apropiada</li>
                    <li>Sigue las indicaciones del personal</li>
                    <li>Usa el equipo de protección proporcionado</li>
                    ${usuario.placasVehiculo ? `<li>Estacionamiento sujeto a disponibilidad</li>` : ''}
                </ul>
            </div>

            <div style="background: #fff5e6; border: 1px solid #e67e22; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #e67e22; margin: 0 0 15px 0; font-size: 18px;">🥩 Sobre la Visita al Sector Cárnico</h3>
                <p style="color: #e67e22; margin: 0; font-size: 14px; line-height: 1.5;">
                    Esta visita te permitirá conocer los procesos industriales del sector cárnico, 
                    desde la recepción de materia prima hasta el producto final. Podrás observar 
                    tecnologías de procesamiento, control de calidad y buenas prácticas de manufactura.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Visita Cárnicos
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - VISITA CÁRNICOS
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🥩 ¡REGISTRO A VISITA CÁRNICOS CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para la Visita Cárnicos ha sido procesado exitosamente.

👤 INFORMACIÓN PERSONAL:
- Nombre: ${usuario.nombre}
- Tipo Documento: ${usuario.tipoDocumento}
- N° Documento: ${usuario.numeroDocumento}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Perfil: ${usuario.perfil}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.eps ? `- EPS: ${usuario.eps}\n` : ''}

🥩 DETALLES DE LA VISITA:
- Evento: Visita CDI Alimentos Cárnicos
- Tipo: Visita Empresarial
- Fecha: 15 de Noviembre de 2025
- Hora: 9:00 am a 12:00 pm
- Lugar: CDI Alimentos Cárnicos 
- Cupo: 20 personas máximo

${usuario.placasVehiculo ? `
🚗 INFORMACIÓN DE VEHÍCULO:
- Placas: ${usuario.placasVehiculo}
- Estacionamiento sujeto a disponibilidad
` : ''}

📋 INFORMACIÓN IMPORTANTE:
• Lleva tu documento de identidad original
• Puntualidad en el punto de encuentro
• Vestimenta casual formal apropiada
• Sigue las indicaciones del personal
• Usa el equipo de protección proporcionado
${usuario.placasVehiculo ? `• Estacionamiento sujeto a disponibilidad\n` : ''}

🥩 SOBRE LA VISITA AL SECTOR CÁRNICO:
Esta visita te permitirá conocer los procesos industriales del sector cárnico, 
desde la recepción de materia prima hasta el producto final. Podrás observar 
tecnologías de procesamiento, control de calidad y buenas prácticas de manufactura.

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Visita Cárnicos
        `
        };
    },
    // ✅ PLANTILLA PARA OLIMPIADAS LÓGICA MATEMÁTICA
    olimpiadasmatematica: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenOlimpiadas = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762200198/OLIMPIADAS_MATEMATICAS_-8_cmnovu.png";

        return {
            asunto: "🧮 Confirmación de Registro - Olimpiadas en Lógica Matemática",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Olimpiadas Lógica Matemática</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #ddd6fe;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #7C3AED;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #8B5CF6;
        }
        
        .card-title {
            color: #7C3AED;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #7C3AED;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #8B5CF6;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #8B5CF6;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .competencia-section {
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
            color: #f3f4f6;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenOlimpiadas}" alt="Olimpiadas en Lógica Matemática" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a Olimpiadas en Lógica Matemática Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para las <strong>Olimpiadas en Lógica Matemática</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Estudiante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> Estudiante</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">🧮 Detalles de las Olimpiadas</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Olimpiadas en Lógica Matemática</li>
                        <li><strong>Fecha:</strong> 13 de Noviembre 2025</li>
                        <li><strong>Horario:</strong> 10:00 am - 12:00 pm</li>
                        <li><strong>Lugar:</strong> Sala 3 de Sistemas</li>
                        <li><strong>Sede:</strong> Pance</li>
                        <li><strong>Duración:</strong> 3 horas</li>
                        <li><strong>Tipo:</strong> Competencia Académica</li>
                    </ul>
                </div>
            </div>

            ${usuario.competencia_logica ? `
            <div class="competencia-section">
                <h3 style="color: #7C3AED; margin: 0 0 15px 0; font-size: 18px;">📊 Información de la Competencia</h3>
                <ul class="info-list">
                    <li><strong>Nivel en Matemáticas:</strong> ${usuario.competencia_logica.nivel_matematicas || usuario.nivel_matematicas || 'No especificado'}</li>
                    <li><strong>Experiencia en Competencias:</strong> ${usuario.competencia_logica.experiencia_competencia || usuario.experiencia_competencia || 'No especificada'}</li>
                    <li><strong>Modalidad de Participación:</strong> ${usuario.competencia_logica.modalidad_participacion || usuario.modalidad_participacion || 'No especificada'}</li>
                    <li><strong>Tiempo de Preparación:</strong> ${usuario.competencia_logica.tiempo_preparacion || usuario.tiempo_preparacion || 'No especificado'}</li>
                    ${(usuario.competencia_logica.herramientas_utilizadas || usuario.herramientas_utilizadas) ? `<li><strong>Herramientas Utilizadas:</strong> ${usuario.competencia_logica.herramientas_utilizadas || usuario.herramientas_utilizadas}</li>` : ''}
                </ul>
            </div>
            ` : ''}

            ${usuario.qr_image ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr_image}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en el registro de las olimpiadas</p>
            </div>
            ` : ''}

            <div style="background: #f0f9ff; border: 1px solid #7dd3fc; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 18px;">🎯 Preparación para las Olimpiadas</h3>
                <ul style="color: #0369a1; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Llega 30 minutos antes del inicio (6:00 pm)</li>
                    <li>Trae calculadora científica (permitida)</li>
                    <li>Prepara lápiz, borrador y lapicero</li>
                    <li>Revisa conceptos de lógica proposicional y teoría de conjuntos</li>
                    <li>Mantén una actitud positiva y competitiva</li>
                    <li>Trae tu documento de identidad original</li>
                </ul>
            </div>

            <div style="background: #fdf4ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #7C3AED; margin: 0 0 15px 0; font-size: 18px;">🧠 Sobre las Olimpiadas de Lógica Matemática</h3>
                <p style="color: #7C3AED; margin: 0; font-size: 14px; line-height: 1.5;">
                    Las Olimpiadas en Lógica Matemática son una competencia diseñada para poner a prueba tus habilidades 
                    en resolución de problemas, pensamiento lógico y razonamiento abstracto. Participarás en desafíos 
                    que evalúan tu capacidad para analizar, deducir y resolver problemas matemáticos complejos.
                </p>
            </div>

            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #d97706; margin: 0 0 15px 0; font-size: 18px;">🏆 Áreas de Evaluación</h3>
                <ul style="color: #d97706; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li><strong>Lógica Proposicional:</strong> Tablas de verdad, inferencias lógicas</li>
                    <li><strong>Teoría de Conjuntos:</strong> Operaciones, relaciones y propiedades</li>
                    <li><strong>Razonamiento Abstracto:</strong> Secuencias, patrones y analogías</li>
                    <li><strong>Problemas de Optimización:</strong> Toma de decisiones y estrategias</li>
                    <li><strong>Pensamiento Crítico:</strong> Análisis y evaluación de argumentos</li>
                </ul>
            </div>

            ${usuario.motivacion_participacion ? `
            <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #047857; margin: 0 0 15px 0; font-size: 18px;">💫 Tu Motivación</h3>
                <p style="color: #047857; margin: 0; font-size: 14px; line-height: 1.5; font-style: italic;">
                    "${usuario.motivacion_participacion}"
                </p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Olimpiadas en Lógica Matemática
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - OLIMPIADAS EN LÓGICA MATEMÁTICA
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🧮 ¡REGISTRO A OLIMPIADAS EN LÓGICA MATEMÁTICA CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para las Olimpiadas en Lógica Matemática ha sido procesado exitosamente.

👤 INFORMACIÓN DEL ESTUDIANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: Estudiante
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}

🧮 DETALLES DE LAS OLIMPIADAS:
- Evento: Olimpiadas en Lógica Matemática
- Fecha: 12 de Noviembre de 2025
- Horario: 10:00 am - 12:00 pm
- Lugar: Sala 3 de Sistemas - Sede Pance
- Duración: 3 horas
- Tipo: Competencia Académica

${usuario.competencia_logica ? `
📊 INFORMACIÓN DE LA COMPETENCIA:
- Nivel en Matemáticas: ${usuario.competencia_logica.nivel_matematicas || usuario.nivel_matematicas || 'No especificado'}
- Experiencia en Competencias: ${usuario.competencia_logica.experiencia_competencia || usuario.experiencia_competencia || 'No especificada'}
- Modalidad de Participación: ${usuario.competencia_logica.modalidad_participacion || usuario.modalidad_participacion || 'No especificada'}
- Tiempo de Preparación: ${usuario.competencia_logica.tiempo_preparacion || usuario.tiempo_preparacion || 'No especificado'}
${(usuario.competencia_logica.herramientas_utilizadas || usuario.herramientas_utilizadas) ? `- Herramientas Utilizadas: ${usuario.competencia_logica.herramientas_utilizadas || usuario.herramientas_utilizadas}\n` : ''}
` : ''}

🎯 PREPARACIÓN PARA LAS OLIMPIADAS:
• Llega 30 minutos antes del inicio (6:00 pm)
• Trae calculadora científica (permitida)
• Prepara lápiz, borrador y lapicero
• Revisa conceptos de lógica proposicional y teoría de conjuntos
• Mantén una actitud positiva y competitiva
• Trae tu documento de identidad original

🧠 SOBRE LAS OLIMPIADAS DE LÓGICA MATEMÁTICA:
Las Olimpiadas en Lógica Matemática son una competencia diseñada para poner a prueba tus habilidades 
en resolución de problemas, pensamiento lógico y razonamiento abstracto. Participarás en desafíos 
que evalúan tu capacidad para analizar, deducir y resolver problemas matemáticos complejos.

🏆 ÁREAS DE EVALUACIÓN:
• Lógica Proposicional: Tablas de verdad, inferencias lógicas
• Teoría de Conjuntos: Operaciones, relaciones y propiedades
• Razonamiento Abstracto: Secuencias, patrones y analogías
• Problemas de Optimización: Toma de decisiones y estrategias
• Pensamiento Crítico: Análisis y evaluación de argumentos

${usuario.motivacion_participacion ? `
💫 TU MOTIVACIÓN:
"${usuario.motivacion_participacion}"
` : ''}

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Olimpiadas en Lógica Matemática
        `
        };
    },
    // ✅ PLANTILLA PARA CLAUSURA
    clausura: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenClausura = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762456332/ACTO_CLAUSURA-8_z7niyw.png";

        return {
            asunto: "🏆 Confirmación de Registro - Acto de Clausura XI Semana de la Ingeniería",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Acto de Clausura</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #d6eaff;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #0984e3;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #0984e3;
        }
        
        .card-title {
            color: #0984e3;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #0984e3;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #e8f4ff 0%, #d6eaff 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #0984e3;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #0984e3;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .clausura-section {
            background: #ffeaa7;
            border: 1px solid #fdcb6e;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: #e8f4ff;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenClausura}" alt="Acto de Clausura XI Semana de la Ingeniería" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro al Acto de Clausura Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para el <strong>Acto de Clausura</strong> de la XI Semana de la Ingeniería ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Asistente</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                        ${usuario.area ? `<li><strong>Área:</strong> ${usuario.area}</li>` : ''}
                        ${usuario.cargo ? `<li><strong>Cargo:</strong> ${usuario.cargo}</li>` : ''}
                        ${usuario.empresa ? `<li><strong>Empresa:</strong> ${usuario.empresa}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">📅 Detalles del Acto de Clausura</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Acto de Clausura</li>
                        <li><strong>XI Semana de la Ingeniería:</strong> "360°: Innovación, Liderazgo y Futuro"</li>
                        <li><strong>Fecha:</strong> 15 de Noviembre 2025</li>
                        <li><strong>Hora:</strong> 6:30 pm - 8:00 pm</li>
                        <li><strong>Lugar:</strong> Auditorio Lumen</li>
                        <li><strong>Sede:</strong> Meléndez</li>
                        <li><strong>Duración:</strong> 90 minutos</li>
                        <li><strong>Actividades:</strong> Entrega de reconocimientos y cierre oficial</li>
                    </ul>
                </div>
            </div>

            ${usuario.qr ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en la entrada del auditorio</p>
            </div>
            ` : ''}

            <div class="clausura-section">
                <h3 style="color: #e17055; margin: 0 0 15px 0; font-size: 18px;">🏆 ¡Únete a Nuestra Gran Clausura!</h3>
                <p style="color: #e17055; margin: 0; font-size: 14px; line-height: 1.5;">
                    El Acto de Clausura marca el cierre de una semana increíble llena de innovación, aprendizaje y logros. 
                    Serás testigo de la entrega de reconocimientos a los participantes destacados y de la ceremonia oficial 
                    de cierre de la XI Semana de la Ingeniería.
                </p>
            </div>

            <div style="background: #e8f4ff; border: 1px solid #74b9ff; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #0984e3; margin: 0 0 15px 0; font-size: 18px;">📍 Recomendaciones para el Evento</h3>
                <ul style="color: #0984e3; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Llega 20 minutos antes del inicio (6:10 pm)</li>
                    <li>Presenta tu código QR o documento de identidad</li>
                    <li>Vestimenta casual formal</li>
                    <li>Prepárate para la entrega de reconocimientos</li>
                    <li>Desactiva tu celular o ponlo en modo silencio</li>
                    <li>Conserva este correo para cualquier consulta</li>
                </ul>
            </div>

            <div style="background: #d5f4e6; border: 1px solid #2ecc71; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #27ae60; margin: 0 0 15px 0; font-size: 18px;">🎊 Actividades Especiales de Clausura</h3>
                <ul style="color: #27ae60; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Ceremonia oficial de clausura</li>
                    <li>Entrega de reconocimientos a participantes destacados</li>
                    <li>Presentación de resultados y logros de la semana</li>
                    <li>Mensaje de cierre de autoridades académicas</li>
                    <li>Brindis de despedida (opcional)</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Acto de Clausura
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - ACTO DE CLAUSURA
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🏆 ¡REGISTRO AL ACTO DE CLAUSURA CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para el Acto de Clausura de la XI Semana de la Ingeniería ha sido procesado exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}
${usuario.area ? `- Área: ${usuario.area}\n` : ''}
${usuario.cargo ? `- Cargo: ${usuario.cargo}\n` : ''}
${usuario.empresa ? `- Empresa: ${usuario.empresa}\n` : ''}

📅 DETALLES DEL ACTO DE CLAUSURA:
- Evento: Acto de Clausura
- XI Semana de la Ingeniería: "360°: Innovación, Liderazgo y Futuro"
- Fecha: 15 de Noviembre de 2025
- Hora: 6:30 pm - 8:00 pm
- Lugar: Auditorio Lumen - Sede Meléndez
- Duración: 90 minutos
- Actividades: Entrega de reconocimientos y cierre oficial

🏆 ¡ÚNETE A NUESTRA GRAN CLAUSURA!
El Acto de Clausura marca el cierre de una semana increíble llena de innovación, aprendizaje y logros. 
Serás testigo de la entrega de reconocimientos a los participantes destacados y de la ceremonia oficial 
de cierre de la XI Semana de la Ingeniería.

📍 RECOMENDACIONES:
• Llega 20 minutos antes (6:10 pm)
• Presenta tu código QR o documento de identidad
• Prepárate para la entrega de reconocimientos
• Vestimenta casual formal
• Conserva este correo para consultas

🎊 ACTIVIDADES ESPECIALES:
• Ceremonia oficial de clausura
• Entrega de reconocimientos a participantes destacados
• Presentación de resultados y logros de la semana
• Mensaje de cierre de autoridades académicas
• Brindis de despedida (opcional)

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Acto de Clausura
        `
        };
    },
    // ✅ PLANTILLA PARA CONSTRUCCIÓN
construccion: (usuario) => {
    const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
    const imagenConstruccion = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1762856931/CONSTRUCCION-RED_8_fpekgz.jpg";

    return {
        asunto: "🌐 Confirmación de Registro - Construcción Red de Ingenieros Integrados",
        html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Construcción Red de Ingenieros</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #d6eaff;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #4f46e5;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #4f46e5;
        }
        
        .card-title {
            color: #4f46e5;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #4f46e5;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #4f46e5;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #4f46e5;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .networking-section {
            background: #e0e7ff;
            border: 1px solid #818cf8;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #e0e7ff;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenConstruccion}" alt="Construcción Red de Ingenieros Integrados" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro a Construcción de Red Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para la <strong>Construcción Red de Ingenieros Integrados</strong> ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Participante</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                        ${usuario.area ? `<li><strong>Área:</strong> ${usuario.area}</li>` : ''}
                        ${usuario.cargo ? `<li><strong>Cargo:</strong> ${usuario.cargo}</li>` : ''}
                        ${usuario.empresa ? `<li><strong>Empresa:</strong> ${usuario.empresa}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">📅 Detalles del Evento de Networking</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Construcción Red de Ingenieros</li>
                        <li><strong>XI Semana de la Ingeniería:</strong> "360°: Innovación, Liderazgo y Futuro"</li>
                        <li><strong>Fecha:</strong> 14 de Noviembre 2025</li>
                        <li><strong>Hora:</strong> 6:30 pm - 8:00 pm</li>
                        <li><strong>Lugar:</strong> Auditorio Lumen</li>
                        <li><strong>Sede:</strong> Meléndez</li>
                        <li><strong>Duración:</strong> 90 minutos</li>
                        <li><strong>Tipo:</strong> Networking Profesional</li>
                        <li><strong>Enfoque:</strong> Construcción de redes profesionales</li>
                    </ul>
                </div>
            </div>

            ${usuario.qr ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en la entrada del auditorio</p>
            </div>
            ` : ''}

            <div class="networking-section">
                <h3 style="color: #4f46e5; margin: 0 0 15px 0; font-size: 18px;">🌐 ¡Construye Tu Red Profesional!</h3>
                <p style="color: #4f46e5; margin: 0; font-size: 14px; line-height: 1.5;">
                    Este evento está diseñado específicamente para que conectes con profesionales, 
                    compartas experiencias y construyas relaciones valiosas en el campo de la ingeniería. 
                    Una oportunidad única para expandir tu red de contactos profesionales.
                </p>
            </div>

            <div style="background: #eef2ff; border: 1px solid #818cf8; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #4f46e5; margin: 0 0 15px 0; font-size: 18px;">💼 Prepárate para el Networking</h3>
                <ul style="color: #4f46e5; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Llega 15 minutos antes del inicio (6:15 pm)</li>
                    <li>Trae tus tarjetas de presentación (opcional)</li>
                    <li>Prepara tu pitch profesional de 30 segundos</li>
                    <li>Vestimenta business casual</li>
                    <li>Actitud abierta para conversar y conectar</li>
                    <li>Desactiva tu celular o ponlo en modo silencio</li>
                </ul>
            </div>

            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 18px;">🤝 Dinámicas de Conexión</h3>
                <ul style="color: #0369a1; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Sesiones de networking dirigido</li>
                    <li>Intercambio de experiencias profesionales</li>
                    <li>Mesas de conversación por áreas de interés</li>
                    <li>Actividades de ice-breaking</li>
                    <li>Espacios para intercambio de contactos</li>
                    <li>Oportunidades de colaboración futura</li>
                </ul>
            </div>

            <div style="background: #f3e8ff; border: 1px solid #a855f7; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #7c3aed; margin: 0 0 15px 0; font-size: 18px;">🎯 Beneficios de Participar</h3>
                <ul style="color: #7c3aed; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Amplía tu red de contactos profesionales</li>
                    <li>Conoce oportunidades de colaboración</li>
                    <li>Comparte experiencias con colegas</li>
                    <li>Fortalece tu presencia profesional</li>
                    <li>Accede a posibles oportunidades laborales</li>
                    <li>Construye relaciones duraderas</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Construcción Red de Ingenieros Integrados
            </p>
        </div>
    </div>
</body>
</html>
        `,
        texto: `
CONFIRMACIÓN DE REGISTRO - CONSTRUCCIÓN RED DE INGENIEROS INTEGRADOS
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🌐 ¡REGISTRO A CONSTRUCCIÓN DE RED CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para la Construcción Red de Ingenieros Integrados ha sido procesado exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}
${usuario.area ? `- Área: ${usuario.area}\n` : ''}
${usuario.cargo ? `- Cargo: ${usuario.cargo}\n` : ''}
${usuario.empresa ? `- Empresa: ${usuario.empresa}\n` : ''}

📅 DETALLES DEL EVENTO DE NETWORKING:
- Evento: Construcción Red de Ingenieros
- XI Semana de la Ingeniería: "360°: Innovación, Liderazgo y Futuro"
- Fecha: 14 de Noviembre de 2025
- Hora: 6:30 pm - 8:00 pm
- Lugar: Auditorio Lumen - Sede Meléndez
- Duración: 90 minutos
- Tipo: Networking Profesional
- Enfoque: Construcción de redes profesionales

🌐 ¡CONSTRUYE TU RED PROFESIONAL!
Este evento está diseñado específicamente para que conectes con profesionales, 
compartas experiencias y construyas relaciones valiosas en el campo de la ingeniería. 
Una oportunidad única para expandir tu red de contactos profesionales.

💼 PREPÁRATE PARA EL NETWORKING:
• Llega 15 minutos antes (6:15 pm)
• Trae tus tarjetas de presentación (opcional)
• Prepara tu pitch profesional de 30 segundos
• Vestimenta business casual
• Actitud abierta para conversar y conectar

🤝 DINÁMICAS DE CONEXIÓN:
• Sesiones de networking dirigido
• Intercambio de experiencias profesionales
• Mesas de conversación por áreas de interés
• Actividades de ice-breaking
• Espacios para intercambio de contactos
• Oportunidades de colaboración futura

🎯 BENEFICIOS DE PARTICIPAR:
• Amplía tu red de contactos profesionales
• Conoce oportunidades de colaboración
• Comparte experiencias con colegas
• Fortalece tu presencia profesional
• Accede a posibles oportunidades laborales
• Construye relaciones duraderas

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Construcción Red de Ingenieros Integrados
        `
    };
},
    // ✅ PLANTILLA PARA ASISTENCIA INAUGURAL
    asistenciainaugural: (usuario) => {
        const logoUnicatolica = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761203793/unnamed_guotmp.png";
        const imagenInaugural = "https://res.cloudinary.com/dufzjm2mn/image/upload/v1761602295/ACTO_INAUGURAL-8_yu6nbj.png";

        return {
            asunto: "🎉 Confirmación de Registro - Acto Inaugural XI Semana de la Ingeniería",
            html: `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación - Acto Inaugural</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Poppins', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%);
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo {
            max-width: 250px;
            height: auto;
            margin-bottom: 15px;
        }
        
        .header-title {
            color: white;
            font-family: 'Poppins', Arial, sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 10px 0 5px 0;
        }
        
        .header-subtitle {
            color: #ffd6f7;
            font-size: 16px;
            font-weight: 400;
        }
        
        .conferencia-image {
            width: 100%;
            max-height: 300px;
            object-fit: cover;
        }
        
        .content {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-title {
            color: #f368e0;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 40px 0;
        }
        
        .info-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #f368e0;
        }
        
        .card-title {
            color: #f368e0;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .info-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .info-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            color: #555;
            font-size: 14px;
        }
        
        .info-list li:last-child {
            border-bottom: none;
        }
        
        .info-list li strong {
            color: #f368e0;
            font-weight: 600;
        }
        
        .qr-section {
            text-align: center;
            background: linear-gradient(135deg, #fff0fd 0%, #ffe0f7 100%);
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
            border: 2px dashed #f368e0;
        }
        
        .qr-image {
            width: 200px;
            height: 200px;
            border: 3px solid #f368e0;
            border-radius: 12px;
            padding: 10px;
            background: white;
        }
        
        .inaugural-section {
            background: #ffeaa7;
            border: 1px solid #fdcb6e;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .footer {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%);
            color: #fff0fd;
            font-size: 12px;
        }
        
        .footer-logo {
            max-width: 200px;
            height: auto;
            margin-bottom: 15px;
        }
        
        @media screen and (max-width: 480px) {
            .header { padding: 20px 15px; }
            .logo { max-width: 200px; }
            .content { padding: 20px 15px; }
            .info-grid { grid-template-columns: 1fr; gap: 20px; }
            .qr-image { width: 160px; height: 160px; }
            .conferencia-image { max-height: 200px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="logo">
            <div class="header-title">XI Semana de la Ingeniería</div>
            <div class="header-subtitle">"360°: Innovación, Liderazgo y Futuro"</div>
        </div>
        
        <img src="${imagenInaugural}" alt="Acto Inaugural XI Semana de la Ingeniería" class="conferencia-image">
        
        <div class="content">
            <div class="welcome-section">
                <h1 class="welcome-title">¡Registro al Acto Inaugural Confirmado!</h1>
                <p class="welcome-text">
                    Hola <strong>${usuario.nombre}</strong>,<br>
                    Tu registro para el <strong>Acto Inaugural</strong> de la XI Semana de la Ingeniería ha sido procesado exitosamente.
                </p>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h3 class="card-title">👤 Información del Asistente</h3>
                    <ul class="info-list">
                        <li><strong>Nombre:</strong> ${usuario.nombre}</li>
                        <li><strong>Cédula:</strong> ${usuario.cedula}</li>
                        <li><strong>Correo:</strong> ${usuario.correo}</li>
                        <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
                        <li><strong>Rol:</strong> ${usuario.rol}</li>
                        ${usuario.idEstudiante ? `<li><strong>ID Estudiante:</strong> ${usuario.idEstudiante}</li>` : ''}
                        ${usuario.tipoEstudiante ? `<li><strong>Tipo:</strong> ${usuario.tipoEstudiante}</li>` : ''}
                        ${usuario.programa ? `<li><strong>Programa:</strong> ${usuario.programa}</li>` : ''}
                        ${usuario.facultad ? `<li><strong>Facultad:</strong> ${usuario.facultad}</li>` : ''}
                        ${usuario.semestre ? `<li><strong>Semestre:</strong> ${usuario.semestre}</li>` : ''}
                    </ul>
                </div>
                
                <div class="info-card">
                    <h3 class="card-title">📅 Detalles del Acto Inaugural</h3>
                    <ul class="info-list">
                        <li><strong>Evento:</strong> Acto Inaugural</li>
                        <li><strong>XI Semana de la Ingeniería:</strong> "360°: Innovación, Liderazgo y Futuro"</li>
                        <li><strong>Fecha:</strong> 11 de Noviembre 2025</li>
                        <li><strong>Hora:</strong> 6:30 pm - 7:15 pm</li>
                        <li><strong>Lugar:</strong> Auditorio Lumen</li>
                        <li><strong>Sede:</strong> Meléndez</li>
                        <li><strong>Duración:</strong> 45 minutos</li>
                    </ul>
                </div>
            </div>

            ${usuario.equipo ? `
            <div class="info-card">
                <h3 class="card-title">👥 Información del Equipo</h3>
                <ul class="info-list">
                    <li><strong>Nombre del equipo:</strong> ${usuario.equipo}</li>
                    <li><strong>Proyecto:</strong> ${usuario.proyecto}</li>
                    <li><strong>Categoría:</strong> ${usuario.categoria}</li>
                    ${usuario.institucion ? `<li><strong>Institución:</strong> ${usuario.institucion}</li>` : ''}
                </ul>
            </div>
            ` : ''}

            ${usuario.qr ? `
            <div class="qr-section">
                <h3 class="card-title">🎫 Código QR de Acceso</h3>
                <img src="${usuario.qr}" alt="Código QR" class="qr-image">
                <p class="welcome-text">Presenta este código QR en la entrada del auditorio</p>
            </div>
            ` : ''}

            <div class="inaugural-section">
                <h3 style="color: #e17055; margin: 0 0 15px 0; font-size: 18px;">🎊 ¡Bienvenido a la XI Semana de la Ingeniería!</h3>
                <p style="color: #e17055; margin: 0; font-size: 14px; line-height: 1.5;">
                    El Acto Inaugural marca el inicio de una semana llena de innovación, aprendizaje y oportunidades. 
                    Serás parte de la ceremonia oficial de apertura donde conocerás la programación completa, 
                    los invitados especiales y las actividades que tenemos preparadas para ti.
                </p>
            </div>

            <div style="background: #dfe6ff; border: 1px solid #74b9ff; border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #0984e3; margin: 0 0 15px 0; font-size: 18px;">📍 Recomendaciones para el Evento</h3>
                <ul style="color: #0984e3; margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Llega 15 minutos antes del inicio (6:15 pm)</li>
                    <li>Presenta tu código QR o documento de identidad</li>
                    <li>Vestimenta casual formal</li>
                    <li>Desactiva tu celular o ponlo en modo silencio</li>
                    <li>Conserva este correo para cualquier consulta</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <img src="${logoUnicatolica}" alt="UNICATÓLICA" class="footer-logo">
            <p>
                <strong>Fundación Universitaria Católica Lumen Gentium</strong><br>
                – Resolución No. 944 de 1996 MEN – SNIES 2731
            </p>
            <p style="margin-top: 15px; font-size: 11px; opacity: 0.8;">
                © 2025 XI Semana de la Ingeniería - Acto Inaugural
            </p>
        </div>
    </div>
</body>
</html>
        `,
            texto: `
CONFIRMACIÓN DE REGISTRO - ACTO INAUGURAL
XI Semana de la Ingeniería "360°: Innovación, Liderazgo y Futuro"

🎉 ¡REGISTRO AL ACTO INAUGURAL CONFIRMADO!

Hola ${usuario.nombre},

Tu registro para el Acto Inaugural de la XI Semana de la Ingeniería ha sido procesado exitosamente.

👤 INFORMACIÓN DEL PARTICIPANTE:
- Nombre: ${usuario.nombre}
- Cédula: ${usuario.cedula}
- Correo: ${usuario.correo}
- Teléfono: ${usuario.telefono}
- Rol: ${usuario.rol}
${usuario.idEstudiante ? `- ID Estudiante: ${usuario.idEstudiante}\n` : ''}
${usuario.tipoEstudiante ? `- Tipo: ${usuario.tipoEstudiante}\n` : ''}
${usuario.programa ? `- Programa: ${usuario.programa}\n` : ''}
${usuario.facultad ? `- Facultad: ${usuario.facultad}\n` : ''}
${usuario.semestre ? `- Semestre: ${usuario.semestre}\n` : ''}

📅 DETALLES DEL ACTO INAUGURAL:
- Evento: Acto Inaugural
- XI Semana de la Ingeniería: "360°: Innovación, Liderazgo y Futuro"
- Fecha: 11 de Noviembre de 2025
- Hora: 6:30 pm - 7:15 pm
- Lugar: Auditorio Lumen - Sede Meléndez
- Duración: 45 minutos


🎊 ¡BIENVENIDO A LA XI SEMANA DE LA INGENIERÍA!
El Acto Inaugural marca el inicio de una semana llena de innovación, aprendizaje y oportunidades. 
Serás parte de la ceremonia oficial de apertura donde conocerás la programación completa, 
los invitados especiales y las actividades preparadas.

📍 RECOMENDACIONES:
• Llega 15 minutos antes (6:15 pm)
• Conserva este correo para consultas

--
Fundación Universitaria Católica Lumen Gentium
© 2025 XI Semana de la Ingeniería - Acto Inaugural
        `
        };
    },
};

// 🔹 Función para procesar QR específicamente
const procesarQRParaCorreo = (usuario, htmlOriginal) => {
    const qrData = usuario.qr_image || usuario.qr || usuario.qrDataUrl;

    console.log("🔍 Buscando QR en propiedades:", {
        qr_image: !!usuario.qr_image,
        qr: !!usuario.qr,
        qrDataUrl: !!usuario.qrDataUrl,
        tieneQR: !!qrData
    });

    if (!qrData || !qrData.startsWith('data:image/png;base64,')) {
        console.warn("⚠️ QR no disponible o formato incorrecto");
        return {
            html: htmlOriginal.replace(/<div class="qr-section[\s\S]*?<\/div>/, ''),
            attachments: []
        };
    }

    try {
        console.log("📸 Procesando QR como adjunto...");
        const base64Data = qrData.split(',')[1];

        const attachments = [{
            filename: "codigo_qr.png",
            content: base64Data,
            encoding: 'base64',
            contentType: "image/png",
            cid: "codigoQR"
        }];

        // ✅ Reemplazar SOLO la imagen que tiene la clase "qr-image"
        const htmlConQR = htmlOriginal.replace(
            /<img[^>]*class="[^"]*qr-image[^"]*"[^>]*>/g,
            '<img src="cid:codigoQR" alt="Código QR" class="qr-image">'
        );

        console.log("✅ QR procesado correctamente");
        return { html: htmlConQR, attachments };

    } catch (error) {
        console.error("❌ Error procesando QR:", error);
        return {
            html: htmlOriginal.replace(/<div class="qr-section[\s\S]*?<\/div>/, ''),
            attachments: []
        };
    }
};

// 🔹 Función principal para enviar correos
export const enviarCorreoRegistro = async (usuario, tipoEvento = 'liderazgo') => {
    console.log(`🚀 INICIANDO ENVÍO DE CORREO PARA: ${usuario.correo} - Evento: ${tipoEvento}`);

    try {
        // Validar datos esenciales
        if (!usuario.correo || !usuario.nombre) {
            throw new Error("Datos de usuario incompletos para enviar correo");
        }

        // Obtener la plantilla correspondiente al evento
        const plantilla = plantillasEventos[tipoEvento];
        if (!plantilla) {
            throw new Error(`Tipo de evento no soportado: ${tipoEvento}`);
        }

        const { asunto, html, texto } = plantilla(usuario);

        // Configurar transporter
        const transporter = createTransporter();
        console.log("🔍 Verificando conexión SMTP...");
        await transporter.verify();
        console.log("✅ Conexión SMTP verificada");

        // ✅ CORRECCIÓN: Usar la función especializada para procesar QR
        const { html: htmlFinal, attachments } = procesarQRParaCorreo(usuario, html);

        // Configurar correo
        const mailOptions = {
            from: '"XI Semana Ingeniería UNICATÓLICA" <eventoxisemanaingenieria@si.cidt.unicatolica.edu.co>',
            to: usuario.correo,
            subject: asunto,
            html: htmlFinal,
            text: texto,
            attachments: attachments
        };

        console.log("📤 Enviando correo a:", usuario.correo);
        console.log("📎 Adjuntos:", attachments.length);

        const info = await transporter.sendMail(mailOptions);

        console.log("✅ CORREO ENVIADO EXITOSAMENTE");
        console.log("📨 Message ID:", info.messageId);
        console.log("👤 Destinatario:", usuario.correo);
        console.log("🎯 Evento:", tipoEvento);

        return info;

    } catch (error) {
        console.error("❌ ERROR AL ENVIAR CORREO:");
        console.error("🔴 Tipo de evento:", tipoEvento);
        console.error("🔴 Mensaje:", error.message);
        throw error;
    }
};
// 🔹 Función para verificar el servicio de correo
export const verificarServicioCorreo = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return { ok: true, message: "Servicio de correo funcionando correctamente" };
    } catch (error) {
        return { ok: false, message: error.message };
    }
};