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
                                <li><strong>Fecha:</strong> 13 de Noviembre de 2025</li>
                                <li><strong>Hora:</strong> 10:00 am a 11:30 am</li>
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
- Fecha: 13 de Noviembre de 2025
- Hora: 10:00 am a 11:30 am
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