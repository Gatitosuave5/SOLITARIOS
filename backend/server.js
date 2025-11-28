import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

// configuras tu .env ya sabes como pepepe
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "Acceso denegado" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido" });
  }
};

// Rutas
// petititiciones

app.post("/api/register", async (req, res) => {
  const { nombre, correo, contraseña, rol } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: "Correo electrónico no válido" });
  }

  try {
   
    const [existing] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (existing.length > 0) return res.status(400).json({ error: "El correo ya está registrado" });

   
    const hashedPassword = await bcrypt.hash(contraseña, 10);

   
    await db.query(
      "INSERT INTO usuarios (nombre, correo, contraseña, rol, creado_en) VALUES (?, ?, ?, ?, NOW())",
      [nombre, correo, hashedPassword, rol || "alumno"]
    );

    res.json({ message: "Usuario registrado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});


// Login
app.post("/api/login", async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) return res.status(400).json({ error: "Faltan datos" });

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (rows.length === 0) return res.status(400).json({ error: "Usuario no encontrado" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta protegida ejemplo: obtener usuarios
app.get("/api/users", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, nombre, correo, rol, creado_en FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Ruta protegida ejemplo: obtener alumnos
app.get("/api/alumnos", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM alumnos");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
