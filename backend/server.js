    import dotenv from "dotenv";
    dotenv.config();


    import express from "express";
    import mysql from "mysql2/promise";
    import bcrypt from "bcryptjs";
    import jwt from "jsonwebtoken";
    import cors from "cors";
    import nodemailer from "nodemailer";



    export const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS,
      },
    });





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


    const verifyToken = require("./middleware");

    app.get("/api/usuarios", verifyToken, async (req, res) => {
      const rows = await db.query("SELECT * FROM usuarios");
      res.json(rows);
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

    app.post("/api/forgot-password", async (req, res) => {
      const { correo } = req.body;

      try {
        // Buscar usuario
        const [user] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [
          correo,
        ]);

        if (!user.length) {
          return res.status(404).json({ error: "El correo no está registrado" });
        }

        // Generar código de 6 dígitos
        const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Guardar el código en la BD
        await db.query(
          "UPDATE usuarios SET codigo_recuperacion = ?, codigo_expira = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE correo = ?",
          [codigo, correo]
        );

        // Enviar correo
        await transporter.sendMail({
          from: "Sistema de Deserción <tu_correo@gmail.com>",
          to: correo,
          subject: "Código de recuperación",
          html: `
            <h2>Recuperación de contraseña</h2>
            <p>Tu código es:</p>
            <h1 style="letter-spacing:5px;">${codigo}</h1>
            <p>Este código expira en <b>10 minutos</b>.</p>
          `,
        });

        res.json({ message: "Código enviado correctamente" });
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error al enviar código" });
      }
    });


    // Eliminar estudiante por ID
    app.delete("/api/estudiantes/:id", async (req, res) => {
      const { id } = req.params;

      // console.log("ID recibido para borrar:", id);

      try {
        // Revisar si existe
        const [existing] = await db.query(
          "SELECT * FROM alumnos WHERE id = ?", 
          [id]
        );

        if (!existing.length) {
          return res.status(404).json({ error: "Estudiante no encontrado" });
        }

        // Eliminar
        await db.query("DELETE FROM alumnos WHERE id = ?", [id]);

        res.json({ message: "Estudiante eliminado correctamente" });

      } catch (error) {
        console.error("ERROR ELIMINANDO:", error);
        res.status(500).json({ error: error.message });
      }
    });

    app.delete("/api/deleteUser/:id", async (req, res) => {
      const { id } = req.params;

      // Evitar borrar admin principal
      if (id === "1") {
        return res.status(400).json({ error: "No se puede eliminar el usuario admin" });
      }

      try {
        const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado correctamente" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor" });
      }
    });



    app.post("/api/verify-code", async (req, res) => {
      const { correo, codigo } = req.body;

      try {
        const [user] = await db.query(
          "SELECT codigo_recuperacion, codigo_expira FROM usuarios WHERE correo = ?",
          [correo]
        );

        if (!user.length)
          return res.status(404).json({ error: "Correo no encontrado" });

        const data = user[0];

        if (data.codigo_recuperacion !== codigo) {
          return res.status(400).json({ error: "Código inválido" });
        }

        if (new Date() > data.codigo_expira) {
          return res.status(400).json({ error: "El código ha expirado" });
        }

        res.json({ message: "Código correcto" });
      } catch (error) {
        res.status(500).json({ error: "Error al verificar código" });
      }
    });



    app.post("/api/reset-password", async (req, res) => {
      const { correo, codigo, contraseña } = req.body;

      try {
        const [user] = await db.query(
          "SELECT codigo_recuperacion FROM usuarios WHERE correo = ?",
          [correo]
        );

        if (!user.length) {
          return res.status(404).json({ error: "Correo no encontrado" });
        }

        if (user[0].codigo_recuperacion !== codigo) {
          return res.status(400).json({ error: "Código incorrecto" });
        }

        const hash = await bcrypt.hash(contraseña, 10);

        await db.query(
          "UPDATE usuarios SET contraseña = ?, codigo_recuperacion = NULL, codigo_expira = NULL WHERE correo = ?",
          [hash, correo]
        );

        res.json({ message: "Contraseña actualizada correctamente" });
      } catch (error) {
        res.status(500).json({ error: "Error al cambiar la contraseña" });
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


    // Obtener todos los estudiantes
    app.get("/api/estudiantes", async (req, res) => {
      try {
        const [rows] = await db.query("SELECT * FROM alumnos");
        res.json(rows);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo alumnos" });
      }
    });

    // Crear nuevo estudiante
    app.post("/api/estudiantes", async (req, res) => {
      try {
        const {
          nombre,
          codigo,
          promedio_ponderado,
          creditos_aprobados,
          creditos_reprobados,
          cursos_reprobados,
          asistencia,
          avance_academico,
          ciclo_actual,
          veces_repitio_curso,
          nivel_socioeconomico,
          tipo_colegio,
          trabaja_actualmente,
          ingresos_familiares,
          edad,
          genero,
          vive_con_familia,
          horas_estudio,
          faltas_totales,
          tardanzas,
          deserta
        } = req.body;

        const sql = `
          INSERT INTO alumnos (
            nombre, codigo, promedio_ponderado, creditos_aprobados, creditos_reprobados,
            cursos_reprobados, asistencia, avance_academico, ciclo_actual, veces_repitio_curso,
            nivel_socioeconomico, tipo_colegio, trabaja_actualmente, ingresos_familiares, edad,
            genero, vive_con_familia, horas_estudio, faltas_totales, tardanzas, deserta
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          nombre,
          codigo,
          promedio_ponderado,
          creditos_aprobados,
          creditos_reprobados,
          cursos_reprobados,
          asistencia,
          avance_academico,
          ciclo_actual,
          veces_repitio_curso,
          nivel_socioeconomico,
          tipo_colegio,
          trabaja_actualmente,
          ingresos_familiares,
          edad,
          genero,
          vive_con_familia,
          horas_estudio,
          faltas_totales,
          tardanzas,
          deserta || 0
        ];

        const [result] = await db.query(sql, values);

        res.json({
          id: result.insertId,     // ⬅ DEVUELVE EL ID AUTOINCREMENTAL
          message: "Estudiante creado correctamente"
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creando estudiante" });
      }
    });




    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
