const express = require('express');
const cors = require('cors');
const { getConnection } = require('./config/db');
const oracledb = require('oracledb');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('¡Servidor backend funcionando!');
});
//http://localhost:3001/api/usuarios
// Ruta de prueba para consultar usuarios
app.get('/api/usuarios', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute('SELECT * FROM TIPOCONTENIDO', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error al cerrar la conexión:', err);
      }
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
