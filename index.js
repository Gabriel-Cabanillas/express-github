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