const { Pool } = require('pg');

const pool = new Pool({
  user: 'gabriel_cabanillas',
  host: 'localhost',
  database: 'react_express_db',
  password: 'Gabo15com',
  port: 5432,
});

module.exports = pool;