# 🌐 UniCatólica XI Semana Ingeniería 360°

Aplicación web desarrollada para gestionar las **inscripciones** a los eventos de la  
**XI Semana de la Ingeniería 360°: Innovación, Liderazgo y Futuro**  
de la **Universidad Católica Lumen Gentium (UniCatólica)**.

---

## 🚀 Tecnologías utilizadas

### 🖥️ Frontend
<div align="left">
  <img src="https://skillicons.dev/icons?i=react,typescript,vite,html,css,tailwind" alt="Frontend stack" />
</div>

### ⚙️ Backend
<div align="left">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb,js" alt="Backend stack" />
</div>

### 🛠️ Herramientas adicionales
<div align="left">
  <img src="https://skillicons.dev/icons?i=git,github,vercel,postman,vscode" alt="Tools" />
</div>

---

## 🧭 Descripción del proyecto

Esta plataforma permite registrar estudiantes y equipos en los distintos eventos académicos y tecnológicos de la **Semana de Ingeniería 360°**.  
Cuenta con un **frontend interactivo en React** y un **backend en Express + MongoDB**, el cual genera un **código QR único** para cada inscripción.

---

## ✨ Características principales

- ✅ Formulario dinámico con validaciones de campos obligatorios.  
- 🧩 Inscripción individual o por equipo (según la actividad).  
- 🧾 Generación de código QR con datos del participante.  
- 💾 Almacenamiento en base de datos MongoDB.  
- 🛡️ Validación y protección mediante CORS y `.env`.  
- 📱 Interfaz adaptable a dispositivos móviles.  

---

## 📁 Estructura del repositorio

```
.
├── backend/
│   ├── routes/
│   │   └── inscripciones.js
│   ├── mongo.js
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   └── App.tsx
│   ├── public/
│   └── .env
└── README.md
```

---

## ⚙️ Instalación y ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/Duvhier/unicatolica-xisemanaing-360-.git
cd unicatolica-xisemanaing-360-
```

---

### 2️⃣ Configurar el backend
```bash
cd backend
npm install
```

Ejecutar el servidor:
```bash
npm run dev
```

Verificar que funcione:
👉 http://localhost:4000/health

---

### 3️⃣ Configurar el frontend
```bash
cd frontend
npm install
```

Crear un archivo `.env`:
```
VITE_API_URL=http://localhost:4000
```

Ejecutar el cliente:
```bash
npm run dev
```

Abrir en el navegador:  
👉 http://localhost:5173

---

## 🔁 Flujo de funcionamiento

1. El usuario completa el formulario seleccionando el evento deseado.  
2. Si la actividad requiere equipo, se activan campos adicionales (nombre de equipo, integrantes, etc.).  
3. El frontend envía los datos a:  
   ```
   POST /inscripciones/registro
   ```
4. El backend valida los datos, guarda el registro en MongoDB y genera un **QR**.  
5. El usuario recibe confirmación visual y puede visualizar el código QR asociado a su registro.  

---

## 🧩 Endpoints principales

| Método | Ruta | Descripción |
|--------|------|--------------|
| `POST` | `/inscripciones/registro` | Registra una nueva inscripción |
| `GET`  | `/inscripciones/listar`   | Muestra las últimas inscripciones registradas |
| `GET`  | `/health`                 | Verifica el estado del servidor |

---

## ✅ Buenas prácticas

- No subir el archivo `.env` al repositorio (ya está en `.gitignore`).  
- Usar siempre URLs absolutas definidas en `VITE_API_URL`.  
- En producción, incluir el dominio de Vercel en `ALLOWED_ORIGINS`.  
- Validar campos en frontend antes de enviar el formulario.  
- Mantener logs controlados y limpiar `console.log` en producción.  

---

## 🧠 Dependencias principales

### Backend
- **Express** — servidor web.  
- **MongoDB Driver** — conexión directa a la base de datos.  
- **QRCode** — generación de códigos QR.  
- **Cors & Dotenv** — seguridad y configuración de entorno.

### Frontend
- **React + Vite + TypeScript** — entorno rápido y modular.  
- **TailwindCSS** — diseño responsivo y moderno.  

---

## 🧪 Pruebas locales

- Correr simultáneamente frontend (`5173`) y backend (`4000`).  
- Probar distintas actividades y verificar que se guarden en la colección `inscripciones`.  
- Revisar el QR generado en la respuesta JSON del servidor.  
- Consultar inscripciones:  
  ```
  GET http://localhost:4000/inscripciones/listar
  ```

---

## 🧑‍💻 Autor

**Duvier Tavera**  
📧 [duvier.tavera01@unicatolica.edu.co](mailto:duvier.tavera01@unicatolica.edu.co)  
🎓 Proyecto académico — Universidad Católica Lumen Gentium

---

## 🖼️ Capturas (opcional)

```

![Formulario de inscripción](https://drive.google.com/uc?export=view&id=1_tNSnUwUrRjgnQPodIfxRDxjy5MMALHN)

![Código QR generado](https://drive.google.com/uc?export=view&id=1lSUFYWvq3Ry5xaJwlunD-WeHyOWsXpeR)


```

---

## 🏁 Licencia

Este proyecto fue desarrollado con fines académicos para la  
**XI Semana de la Ingeniería 360°** — UniCatólica.

© 2025 — Todos los derechos reservados.
