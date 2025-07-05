const oracledb = require('oracledb');
require('dotenv').config();

// Activa el modo Thick (cliente nativo)
oracledb.initOracleClient({ libDir: 'C:/Users/usuario/Documents/Oracle/instantclient_21_18' }); // Cambia la ruta si es diferente

// Configuración de la conexión usando variables de entorno
const dbConfig = {
  user: process.env.ORACLE_USER,         // Usuario de Oracle
  password: process.env.ORACLE_PASSWORD, // Contraseña de Oracle
  connectString: process.env.ORACLE_CONNECT_STRING, // Cadena de conexión
};

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (err) {
    console.error('Error al conectar a Oracle:', err);
    throw err;
  }
}

module.exports = { getConnection };
