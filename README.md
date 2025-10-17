## Backend - Unicatólica Semana Ingeniería

API REST para gestionar inscripciones. Incluye persistencia en SQLite y generación de QR.

### Requisitos
- Node.js 18+

### Instalación

```bash
cd backend
npm install
```

La primera instalación crea/migra la base de datos automáticamente (script `postinstall`). Si necesitas forzar la migración:

```bash
node ./src/db.js --migrate
```

### Ejecutar en desarrollo

```bash
npm run dev
```

La API quedará en `http://localhost:4000` (si `PORT=4000`).

### Endpoint principal

- POST `/inscripciones/registro`
  - Body esperado (ejemplo mínimo):

```json
{
  "nombre": "Juan Pérez",
  "cedula": "12345678",
  "correo": "juan@unicatolica.edu.co",
  "telefono": "3000000000",
  "programa": "ingenieria-sistemas",
  "semestre": "VI",
  "actividades": ["hackathon"],
  "grupo": {
    "nombre": "Team Alfa",
    "integrantes": ["Juan Pérez"],
    "proyecto": {"nombre": "App X", "descripcion": "Desc", "categoria": "programacion"},
    "institucion": "Unicatólica",
    "correo": "team@correo.com",
    "telefono": "3001112222"
  }
}
```

Respuesta exitosa `201`:

```json
{
  "message": "Inscripción registrada",
  "id": 1,
  "qr": "data:image/png;base64,....",
  "qrData": {"id":1, "estudiante":{"nombre":"Juan Pérez","cedula":"12345678"}, "actividad":"hackathon", "emitido":"..."},
  "estudiante": {"nombre":"Juan Pérez","cedula":"12345678"}
}
```

### Conectar con el frontend

En el frontend, asegúrate de que la URL base de la API esté disponible como variable de entorno. Si ya usas `process.env.REACT_APP_API_URL`, define en el entorno del build (o `.env`) del frontend:

```
REACT_APP_API_URL=http://localhost:4000
```

Si usas Vite, también puedes usar `VITE_API_URL` e inyectarla como `import.meta.env.VITE_API_URL` desde el código del frontend.


# unicatolica-xisemanaing-360-backend
