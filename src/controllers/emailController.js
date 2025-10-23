import nodemailer from "nodemailer";
import QRCode from "qrcode";

export const enviarCorreoRegistro = async (usuario) => {
  try {
    // Generar el QR con los datos del usuario
    const qrData = `Nombre: ${usuario.nombre}\nCédula: ${usuario.cedula}\nCorreo: ${usuario.correo}`;
    const qrImage = await QRCode.toDataURL(qrData);

    // Configuración SMTP (según los datos de tu cPanel)
    const transporter = nodemailer.createTransport({
      host: "mail.si.cidt.unicatolica.edu.co",
      port: 465,
      secure: true, // true para 465
      auth: {
        user: "eventoxisemanaingenieria@si.cidt.unicatolica.edu.co", // tu correo remitente
        pass: process.env.EMAIL_PASSWORD, // define esta variable en tu .env
      },
    });

    // Contenido HTML del correo
    const htmlContent = `
      <div style="font-family: 'Poppins', sans-serif; color: #202124; background-color: #f0f0f0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #00aafb;">🎉 ¡Registro Exitoso!</h2>
        <p>Estimado/a <strong>${usuario.nombre}</strong>,</p>
        <p>Tu registro para la ponencia <strong>"Desarrollo Personal y Liderazgo"</strong> ha sido exitoso.</p>

        <h3 style="color: #202124;">📋 Detalles del Evento:</h3>
        <ul style="list-style:none; padding-left: 0;">
          <li><strong>📅 Fecha:</strong> 10 de Noviembre de 2025</li>
          <li><strong>🕘 Hora:</strong> 3:00 a 5:00 p.m.</li>
          <li><strong>📍 Lugar:</strong> Auditorio 1 - Sede Pance - Unicatólica</li>
        </ul>

        <h3 style="color: #202124;">🧾 Tus Datos de Registro:</h3>
        <ul style="list-style:none; padding-left: 0;">
          <li><strong>Nombre:</strong> ${usuario.nombre}</li>
          <li><strong>Cédula:</strong> ${usuario.cedula}</li>
          <li><strong>Correo:</strong> ${usuario.correo}</li>
          <li><strong>Teléfono:</strong> ${usuario.telefono}</li>
          <li><strong>Área:</strong> ${usuario.area}</li>
          <li><strong>Rol:</strong> ${usuario.rol}</li>
        </ul>

        <p>Presenta el siguiente código QR el día del evento para tu ingreso:</p>
        <img src="${qrImage}" alt="QR de Registro" style="margin-top:10px; width:150px; height:150px;"/>

        <hr style="margin:20px 0; border:none; border-top:1px solid #ccc;">
        <p style="font-size:12px; color:#656565;">Universidad Católica de Cali © 2025 - Coordinación de Eventos</p>
      </div>
    `;

        // 🔹 Convertir el QR Base64 a formato adjunto
        const base64Data = usuario.qr.replace(/^data:image\/png;base64,/, "");

    // Envío del correo
    const mailOptions = {
      from: '"Evento XI Semana de la Ingeniería" <eventoxisemanaingenieria@si.cidt.unicatolica.edu.co>',
      to: usuario.correo,
      subject: "Confirmación de Registro - Ponencia Desarrollo Personal y Liderazgo",
      html: htmlContent,
      attachments: [
        {
            filename: "codigo_qr.png",
            content: Buffer.from(base64Data, "base64"),
            contentType: "image/png",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Correo de confirmación enviado correctamente");
  } catch (error) {
    console.error("❌ Error al enviar el correo:", error);
  }
};
