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



// ============================================================
// INTEGRANTE 3: PAULINA ALVARADO iupdateAlumno, deleteAlumno, getMaterias, createMateria
// ============================================================

// PUT /api/updateAlumno/:id - Modificar un alumno existente
app.put("/api/updateAlumno/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, edad, correo } = req.body;

    // Validar que el id sea numérico
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "El ID debe ser numérico" });
    }

    // Validar que se envíe al menos un campo
    if (!nombre && !apellido && !edad && !correo) {
      return res.status(400).json({ message: "Se debe enviar al menos un campo para modificar" });
    }

    // Verificar que el alumno exista y esté activo
    const alumno = await pool.query(
      "SELECT * FROM alumno WHERE id = $1 AND isActive = true",
      [id]
    );
    if (alumno.rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado o inactivo" });
    }

    // Si no se envía un campo, conservar el valor actual
    const nuevoNombre = nombre || alumno.rows[0].nombre;
    const nuevoApellido = apellido || alumno.rows[0].apellido;
    const nuevaEdad = edad || alumno.rows[0].edad;
    const nuevoCorreo = correo || alumno.rows[0].correo;

    const result = await pool.query(
      "UPDATE alumno SET nombre=$1, apellido=$2, edad=$3, correo=$4 WHERE id=$5 RETURNING *",
      [nuevoNombre, nuevoApellido, nuevaEdad, nuevoCorreo, id]
    );

    res.status(200).json({
      message: "Alumno actualizado correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar alumno",
      error: error.message,
    });
  }
});

// DELETE /api/deleteAlumno/:id - Eliminación LÓGICA (isActive = false)
app.delete("/api/deleteAlumno/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el id sea numérico
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "El ID debe ser numérico" });
    }

    // Verificar que el alumno exista y esté activo
    const alumno = await pool.query(
      "SELECT * FROM alumno WHERE id = $1 AND isActive = true",
      [id]
    );
    if (alumno.rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado o ya eliminado" });
    }

    // Eliminación lógica: no se borra el registro, solo se desactiva
    await pool.query("UPDATE alumno SET isActive = false WHERE id = $1", [id]);

    res.status(200).json({ message: "Alumno eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar alumno",
      error: error.message,
    });
  }
});

// GET /api/getMaterias - Consultar todas las materias
app.get("/api/getMaterias", async (req, res) => {
  try {
    // Traer todas las materias de la tabla materia
    const result = await pool.query("SELECT * FROM materia");
    res.status(200).json({
      message: "Materias consultadas correctamente",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al consultar materias",
      error: error.message,
    });
  }
});

// POST /api/createMateria - Crear una nueva materia
app.post("/api/createMateria", async (req, res) => {
  try {
    const { nombre, semestre, creditos } = req.body;

    // Validar que el nombre exista y no esté vacío
    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({ message: "El nombre de la materia es obligatorio" });
    }

    // Insertar nueva materia
    const result = await pool.query(
      "INSERT INTO materia (nombre, semestre, creditos) VALUES ($1, $2, $3) RETURNING *",
      [nombre, semestre || null, creditos || null]
    );

    res.status(201).json({
      message: "Materia creada correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear materia",
      error: error.message,
    });
  }
});


// ============================================================
// INTEGRANTE 4: SAUL GUZMAN assignMateriaToAlumno y getMateriasByAlumnoId
// ============================================================

// POST /api/assignMateriaToAlumno - Relacionar alumno con materia
app.post("/api/assignMateriaToAlumno", async (req, res) => {
  try {
    const { alumno_id, materia_id } = req.body;

    // Validar que ambos campos existan y sean numéricos
    if (!alumno_id || !materia_id) {
      return res.status(400).json({ message: "alumno_id y materia_id son obligatorios" });
    }
    if (isNaN(alumno_id) || isNaN(materia_id)) {
      return res.status(400).json({ message: "alumno_id y materia_id deben ser numéricos" });
    }

    // Verificar que el alumno exista y esté activo
    const alumno = await pool.query(
      "SELECT * FROM alumno WHERE id = $1 AND isActive = true",
      [alumno_id]
    );
    if (alumno.rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado o inactivo" });
    }

    // Verificar que la materia exista
    const materia = await pool.query("SELECT * FROM materia WHERE id = $1", [materia_id]);
    if (materia.rows.length === 0) {
      return res.status(404).json({ message: "Materia no encontrada" });
    }

    // Verificar que no exista ya esa relación (evitar duplicados)
    const relacion = await pool.query(
      "SELECT * FROM alumno_materia WHERE alumno_id = $1 AND materia_id = $2",
      [alumno_id, materia_id]
    );
    if (relacion.rows.length > 0) {
      return res.status(400).json({ message: "El alumno ya tiene asignada esa materia" });
    }

    // Insertar la relación en la tabla intermedia
    const result = await pool.query(
      "INSERT INTO alumno_materia (alumno_id, materia_id) VALUES ($1, $2) RETURNING *",
      [alumno_id, materia_id]
    );

    res.status(201).json({
      message: "Materia asignada al alumno correctamente",
      data: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al asignar materia",
      error: error.message,
    });
  }
});

// GET /api/getMateriasByAlumnoId/:id - Materias asignadas a un alumno
app.get("/api/getMateriasByAlumnoId/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el id sea numérico
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "El ID debe ser numérico" });
    }

    // Verificar que el alumno exista y esté activo
    const alumno = await pool.query(
      "SELECT * FROM alumno WHERE id = $1 AND isActive = true",
      [id]
    );
    if (alumno.rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado o inactivo" });
    }

    // JOIN entre materia y alumno_materia para traer las materias del alumno
    const result = await pool.query(
      `SELECT m.id, m.nombre, m.semestre, m.creditos
       FROM materia m
       INNER JOIN alumno_materia am ON m.id = am.materia_id
       WHERE am.alumno_id = $1`,
      [id]
    );

    res.status(200).json({
      message: "Materias del alumno consultadas correctamente",
      data: result.rows,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al consultar materias del alumno",
      error: error.message,
    });
  }
});


// ============================================================
// INTEGRANTE 5: ALONDRA ROMAN getMateriasCountByAlumnoId
// ============================================================

// GET /api/getMateriasCountByAlumnoId/:id - Cuántas materias tiene un alumno
app.get("/api/getMateriasCountByAlumnoId/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el id sea numérico
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "El ID debe ser numérico" });
    }

    // Verificar que el alumno exista y esté activo
    const alumno = await pool.query(
      "SELECT * FROM alumno WHERE id = $1 AND isActive = true",
      [id]
    );
    if (alumno.rows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado o inactivo" });
    }

    // COUNT para contar cuántas materias tiene asignadas
    const result = await pool.query(
      "SELECT COUNT(*) as total_materias FROM alumno_materia WHERE alumno_id = $1",
      [id]
    );

    res.status(200).json({
      message: "Conteo realizado correctamente",
      total_materias: parseInt(result.rows[0].total_materias),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al contar materias",
      error: error.message,
    });
  }
});

// ============================================================
// CONEXIÓN Y SERVIDOR
// ============================================================

// Verificar conexión a PostgreSQL
pool.connect()
  .then(() => console.log('Conexión exitosa a PostgreSQL'))
  .catch((err) => console.error('Error de conexión', err));

// Levantar el servidor en puerto 3000
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});


//Para levantar el servidor node index.js
// Feat es para el commit que es una nueva funcionalidad
//npm list "pg" o otra dependencia o libreria para ver su versión o si esta instalda
