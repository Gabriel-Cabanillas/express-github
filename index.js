const express = require('express');
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

// Servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});