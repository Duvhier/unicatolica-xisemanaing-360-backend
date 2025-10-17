<!-- 45b1e682-9df5-495f-b6e3-f573a8591272 a666103b-5e4d-43de-8bfe-9992bed03913 -->
# Configurar MongoDB Atlas y arrancar servidor

## Problema

El servidor no encuentra la variable de entorno `MONGO_URI` porque no existe archivo `.env`.

## Solución

### 1. Crear archivo `.env`

Crear `.env` en la raíz con:

```
PORT=4000
MONGO_URI=mongodb+srv://duviertavera01:3SK6o5HM3g46zXSQ@cluster0.0bbblsp.mongodb.net/eventoIngenieria
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=production
```

**Nota**: Agregué `/eventoIngenieria` al final de la URI para especificar el nombre de la base de datos.

### 2. Reiniciar servidor

- Detener el proceso `nodemon` actual (Ctrl+C)
- Ejecutar `npm run dev`
- Verificar que conecte exitosamente a MongoDB Atlas

### 3. Probar endpoint de salud

- Hacer request a `http://localhost:4000/health`
- Debería responder `{"ok":true,"uptime":...}`

### 4. Crear `.env.example` (opcional)

Crear plantilla sin credenciales para documentación:

```
PORT=4000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nombreDB
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

## Archivos a modificar

- `.env` (crear nuevo)
- `.env.example` (crear nuevo, opcional)

### To-dos

- [ ] Crear archivo .env con MONGO_URI de Atlas
- [ ] Reiniciar servidor y verificar conexión a MongoDB
- [ ] Probar endpoint /health
- [ ] Crear .env.example como plantilla