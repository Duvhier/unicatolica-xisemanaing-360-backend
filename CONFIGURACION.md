# 🔐 Configuración de Variables de Entorno

Para que el sistema de organizadores funcione correctamente, asegúrate de configurar las siguientes variables de entorno en tu archivo `.env`:

## Variables Requeridas

```env
# Puerto del servidor
PORT=4000

# Conexión a MongoDB Atlas
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/eventoIngenieria?retryWrites=true&w=majority&appName=EventoIngenieria

# Secret para JWT (cambiar por una clave segura)
JWT_SECRET=claveSuperSeguraParaJWT2024

# Orígenes permitidos para CORS (separados por comas)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://tu-dominio-frontend.com
```

## Variables Opcionales

```env
# Configuración de email (para futuras funcionalidades)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-app
```

## 🚀 Pasos de Configuración

1. **Crear archivo `.env`** en la raíz del proyecto con las variables anteriores
2. **Ejecutar script de datos de prueba:**
   ```bash
   node seed-organizadores.js
   ```
3. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

## 🔑 Credenciales de Prueba

Después de ejecutar el script de datos de prueba, tendrás estos usuarios disponibles:

- **Admin:** `usuario=admin`, `password=admin123`
- **Organizador 1:** `usuario=organizador1`, `password=org123`
- **Organizador 2:** `usuario=organizador2`, `password=org456`
- **Supervisor:** `usuario=supervisor`, `password=super123`

## 📡 Endpoints Disponibles

### Autenticación
- `POST /organizador/login` - Login de organizadores

### Gestión de Inscripciones (requieren JWT)
- `GET /organizador/inscripciones` - Listar todas las inscripciones
- `PUT /organizador/asistencia/:id` - Marcar/desmarcar asistencia
- `GET /organizador/profile` - Perfil del organizador autenticado
- `GET /organizador/stats` - Estadísticas básicas

### Inscripciones Públicas
- `POST /inscripciones/registro` - Registrar nueva inscripción
- `GET /inscripciones/listar` - Listar inscripciones (debug)

## 🔒 Uso del JWT

Para acceder a las rutas protegidas, incluye el token en el header:

```
Authorization: Bearer <tu-jwt-token>
```

El token tiene una validez de 8 horas.
