const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./database/mongo");
const registroRoutes = require("./routes/registroRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a BD
connectDB()
  .then(() => console.log("🚀 MongoDB conectado correctamente"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

// Rutas
app.use("/api", registroRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
