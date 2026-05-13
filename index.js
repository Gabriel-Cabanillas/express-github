const express = require('express');
const pool = require('./db');
const app = express();
const connectMongoDB = require("./mongoConnection");
const Vehiculo = require("./Vehiculo");

app.use(express.json());

// Conexión a MongoDB
connectMongoDB();

// ============================================================
// RUTAS ORIGINALES DEL PROYECTO (no tocar)
// ============================================================

// Ruta base
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// GET todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM usuario');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

// GET usuario por id
app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }
    const resultado = await pool.query('SELECT * FROM usuario WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al consultar usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// GET alumnos (ruta original)
app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar alumnos:', error);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// POST alumnos (ruta original)
app.post('/alumnos', async (req, res) => {
  try {
    const { nombre, apellido, edad, correo } = req.body;
    if (!nombre || !apellido || !edad || !correo) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const resultado = await pool.query(
      'INSERT INTO alumno (nombre, apellido, edad, correo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, apellido, edad, correo]
    );
    res.status(201).json({ mensaje: 'Alumno insertado correctamente', alumno: resultado.rows[0] });
  } catch (error) {
    console.error('Error al insertar alumno:', error);
    res.status(500).json({ error: 'Error al insertar el alumno' });
  }
});

// GET materias (ruta original)
app.get('/materias', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM materia');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar materias:', error);
    res.status(500).json({ error: 'Error al obtener las materias' });
  }
});

// GET materia por id (ruta original)
app.get('/materias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }
    const resultado = await pool.query('SELECT * FROM materia WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error('Error al consultar materia:', error);
    res.status(500).json({ error: 'Error al obtener la materia' });
  }
});

// POST materias (ruta original)
app.post('/materias', async (req, res) => {
  try {
    const { nombre, semestre, creditos } = req.body;
    if (!nombre || !semestre || !creditos) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    const resultado = await pool.query(
      'INSERT INTO materia (nombre, semestre, creditos) VALUES ($1, $2, $3) RETURNING *',
      [nombre, semestre, creditos]
    );
    res.status(201).json({ mensaje: 'Materia insertada correctamente', materia: resultado.rows[0] });
  } catch (error) {
    console.error('Error al insertar materia:', error);
    res.status(500).json({ error: 'Error al insertar la materia' });
  }
});

// ============================================================
// ENDPOINTS DE VEHÍCULOS CON MONGODB (ya existían)
// ============================================================

// GET /api/getVehiculos - Consultar todos los vehículos en MongoDB
app.get("/api/getVehiculos", async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find();
    res.status(200).json({
      message: "Vehículos consultados correctamente",
      data: vehiculos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al consultar vehículos",
      error: error.message,
    });
  }
});

// POST /api/createVehiculo - Crear vehículo en MongoDB
app.post("/api/createVehiculo", async (req, res) => {
  try {
    const { marca, modelo, anio, color } = req.body;

    if (!marca || !modelo || !anio || !color) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    if (isNaN(anio)) {
      return res.status(400).json({ message: "El año debe ser numérico" });
    }

    const nuevoVehiculo = new Vehiculo({ marca, modelo, anio, color });
    await nuevoVehiculo.save();

    res.status(201).json({
      message: "Vehículo creado correctamente",
      data: nuevoVehiculo,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear vehículo",
      error: error.message,
    });
  }
});

// ============================================================
// INTEGRANTE 1 - GABRIEL: getAlumnos y getAlumnoById
// ============================================================

// GET /api/getAlumnos - Consultar todos los alumnos activos
app.get("/api/getAlumnos", async (req, res) => {
  try {
    // Solo traer alumnos donde isActive sea true
    const result = await pool.query("SELECT * FROM alumno WHERE isActive = true");
    res.status(200).json({
      message: "Alumnos consultados correctamente",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al consultar alumnos",
      error: error.message,
    });
  }
});

// GET /api/getAlumnoById/:id - Consultar alumno activo por ID
app.get("/api/getAlumnoById/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el id exista y sea numérico
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "El ID debe ser numérico" });
    }

    // Buscar alumno activo
    const result = await pool.query(
      "SELECT * FROM alumno WHERE id = $1 AND isActive = true",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado o inactivo" });
    }

    res.status(200).json({
      message: "Alumno encontrado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al consultar alumno",
      error: error.message,
    });
  }
});

// ============================================================
// INTEGRANTE 2: DANIEL MANJARREZ searchAlumno y createAlumno
// ============================================================

// GET /api/searchAlumno?query=Juan - Buscar por nombre o apellido con LIKE
app.get("/api/searchAlumno", async (req, res) => {
  try {
    const { query } = req.query;

    // Validar que query exista y no esté vacío
    if (!query || query.trim() === "") {
      return res.status(400).json({ message: "El parámetro query es obligatorio" });
    }

    // LIKE para buscar en nombre o apellido, solo alumnos activos
    const result = await pool.query(
      `SELECT * FROM alumno 
       WHERE (nombre ILIKE $1 OR apellido ILIKE $1) 
       AND isActive = true`,
      [`%${query}%`]
    );

    res.status(200).json({
      message: "Búsqueda realizada correctamente",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al buscar alumno",
      error: error.message,
    });
  }
});

// POST /api/createAlumno - Crear un nuevo alumno
app.post("/api/createAlumno", async (req, res) => {
  try {
    const { nombre, apellido, edad, correo } = req.body;

    // Validar que todos los campos existan y no estén vacíos
    if (!nombre || !apellido || !edad || !correo) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }
    if (nombre.trim() === "" || apellido.trim() === "" || correo.trim() === "") {
      return res.status(400).json({ message: "Los campos no pueden estar vacíos" });
    }

    // Insertar alumno con isActive = true por defecto
    const result = await pool.query(
      "INSERT INTO alumno (nombre, apellido, edad, correo, isActive) VALUES ($1, $2, $3, $4, true) RETURNING *",
      [nombre, apellido, edad, correo]
    );

    res.status(201).json({
      message: "Alumno creado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear alumno",
      error: error.message,
    });
  }
});


// Pool
pool.connect()
  .then(() => {
    console.log('Conexión exitosa a PostgreSQL');
  })
  .catch((err) => {
    console.error('Error de conexión', err);
  });

// Servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});


//Para levantar el servidor node index.js
// Feat es para el commit que es una nueva funcionalidad
//npm list "pg" o otra dependencia o libreria para ver su versión o si esta instalda