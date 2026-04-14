const express = require('express');
const pool = require('./db');
const app = express();

// Ruta base
app.get('/', (req, res) => {  
  res.send('API funcionando');
});

// ENDPOINT Creado
app.get('/usuario', (req, res) => {
  const usuario = {
    id: 1,
    nombre: 'Juan',
    rol: 'Administrador'
  };

  res.json(usuario);
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
//npm list pg o otra dependencia o libreria para ver su versión o si esta instalda