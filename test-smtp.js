// test-smtp.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function testSMTP() {
  console.log('🔧 Probando conexión SMTP...');
  console.log('📧 Usuario:', 'eventoxisemanaingenieria@si.cidt.unicatolica.edu.co');
  console.log('🔑 Password:', process.env.EMAIL_PASSWORD ? '✅ Existe' : '❌ No existe');

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
  });

  try {
    console.log('🔍 Verificando conexión...');
    await transporter.verify();
    console.log('✅ Conexión SMTP exitosa!');

    // Intentar enviar correo de prueba
    const info = await transporter.sendMail({
      from: '"Prueba SMTP" <eventoxisemanaingenieria@si.cidt.unicatolica.edu.co>',
      to: 'tu_correo_personal@gmail.com', // 🔹 CAMBIA POR TU CORREO REAL
      subject: 'Prueba SMTP - XI Semana Ingeniería',
      text: 'Este es un correo de prueba',
      html: '<h1>✅ Prueba exitosa</h1><p>El servidor SMTP funciona correctamente</p>'
    });

    console.log('📨 Correo de prueba enviado:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error SMTP:');
    console.error('🔴 Código:', error.code);
    console.error('🔴 Mensaje:', error.message);
    
    if (error.command) {
      console.error('🔴 Comando:', error.command);
    }
  }
}

testSMTP();