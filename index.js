const express = require('express');
const pool = require('./db');
const app = express();

app.use(express.json());


// Ruta base
app.get('/', (req, res) => {  
  res.send('API funcionando');
});

// ENDPOINT Creado usuario
app.get('/usuarios', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM usuario');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar usuarios:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});



//Endpoint de usuario (usuarios/:id)
app.get('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // VALIDACIÓN
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }

    const resultado = await pool.query(
      'SELECT * FROM usuario WHERE id = $1',
      [id]
    );

    // NO ENCONTRADO
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // OK
    res.json(resultado.rows[0]);

  } catch (error) {
    console.error('Error al consultar usuario:', error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

// Ruta alumnos - SELECT * FROM alumno
app.get('/alumnos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM alumno');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar alumnos:', error);
    res.status(500).json({ error: 'Error al obtener los alumnos' });
  }
});

// Ruta alumnos con Post
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

    res.status(201).json({
      mensaje: 'Alumno insertado correctamente',
      alumno: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al insertar alumno:', error);
    res.status(500).json({ error: 'Error al insertar el alumno' });
  }
});

// Ruta materias - SELECT * FROM materia
app.get('/materias', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM materia');
    res.json(resultado.rows);
  } catch (error) {
    console.error('Error al consultar materias:', error);
    res.status(500).json({ error: 'Error al obtener las materias' });
  }
});

//Endpoint de materia (materia/:id)
app.get('/materias/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // VALIDACIÓN
    if (isNaN(id)) {
      return res.status(400).json({ error: 'El id debe ser numérico' });
    }

    const resultado = await pool.query(
      'SELECT * FROM materia WHERE id = $1',
      [id]
    );

    // NO ENCONTRADO
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Materia no encontrada' });
    }

    // OK
    res.json(resultado.rows[0]);

  } catch (error) {
    console.error('Error al consultar materia:', error);
    res.status(500).json({ error: 'Error al obtener la materia' });
  }
});


// Ruta materias con Post
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

    res.status(201).json({
      mensaje: 'Materia insertada correctamente',
      materia: resultado.rows[0]
    });
  } catch (error) {
    console.error('Error al insertar materia:', error);
    res.status(500).json({ error: 'Error al insertar la materia' });
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