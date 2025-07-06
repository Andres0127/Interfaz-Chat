const express = require('express');
const cors = require('cors');
const { getConnection } = require('./config/db');
const oracledb = require('oracledb');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('¡Servidor backend funcionando!');
});
//http://localhost:3001/api/usuarios
//http://localhost:3001/api/register
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

// Endpoint para registro de usuario (sin codubica)
app.post('/api/register', async (req, res) => {
  const { user, password, nombre, apellido, email, celular } = req.body;
  let connection;
  try {
    connection = await getConnection();
    // Generar un identificador único para CONSECUSER
    const consecuser = uuidv4();
    await connection.execute(
      `INSERT INTO USUARIO (CONSECUSER, NOMBRE, APELLIDO, "USER", PASSWORD, EMAIL, CELULAR, FECHAREGISTRO) VALUES (:id, :nombre, :apellido, :username, :password, :email, :celular, SYSDATE)`,
      { id: consecuser, nombre, apellido, username: user, password, email, celular },
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error('Error al cerrar la conexión:', err); }
    }
  }
});

// Endpoint para login de usuario
app.post('/api/login', async (req, res) => {
  const { user, password } = req.body;
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT * FROM USUARIO WHERE "USER" = :username AND PASSWORD = :password`,
      [user, password],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar la base de datos' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error('Error al cerrar la conexión:', err); }
    }
  }
});

// Endpoint para obtener los amigos de un usuario con último mensaje, texto y remitente
app.get('/api/amigos/:consecuser', async (req, res) => {
  const { consecuser } = req.params;
  let connection;
  try {
    connection = await getConnection();
    // Buscar amigos y el último mensaje con cada uno (fecha, texto y remitente)
    const result = await connection.execute(
      `SELECT * FROM (
        SELECT u.CONSECUSER, u.NOMBRE, u.APELLIDO, u."USER", u.EMAIL, u.CELULAR,
          (
            SELECT m.FECHAREGMEN FROM MENSAJE m
            WHERE ((m.USU_CONSECUSER = :id AND m.CONSECUSER = u.CONSECUSER)
                OR (m.USU_CONSECUSER = u.CONSECUSER AND m.CONSECUSER = :id))
            AND m.FECHAREGMEN = (
              SELECT MAX(m2.FECHAREGMEN) FROM MENSAJE m2
              WHERE ((m2.USU_CONSECUSER = :id AND m2.CONSECUSER = u.CONSECUSER)
                 OR (m2.USU_CONSECUSER = u.CONSECUSER AND m2.CONSECUSER = :id))
            )
          ) AS ULTIMO_MENSAJE,
          (
            SELECT c.LOCALIZACONTENIDO FROM MENSAJE m
            JOIN CONTENIDO c ON c.USU_CONSECUSER = m.USU_CONSECUSER AND c.CONSECUSER = m.CONSECUSER AND c.CONSMENSAJE = m.CONSMENSAJE
            WHERE ((m.USU_CONSECUSER = :id AND m.CONSECUSER = u.CONSECUSER)
                OR (m.USU_CONSECUSER = u.CONSECUSER AND m.CONSECUSER = :id))
              AND m.FECHAREGMEN = (
                SELECT MAX(m2.FECHAREGMEN) FROM MENSAJE m2
                WHERE ((m2.USU_CONSECUSER = :id AND m2.CONSECUSER = u.CONSECUSER)
                   OR (m2.USU_CONSECUSER = u.CONSECUSER AND m2.CONSECUSER = :id))
              )
              AND c.IDTIPOCONTENIDO = '2'
          ) AS ULTIMO_TEXTO,
          (
            SELECT m.USU_CONSECUSER FROM MENSAJE m
            WHERE ((m.USU_CONSECUSER = :id AND m.CONSECUSER = u.CONSECUSER)
                OR (m.USU_CONSECUSER = u.CONSECUSER AND m.CONSECUSER = :id))
              AND m.FECHAREGMEN = (
                SELECT MAX(m2.FECHAREGMEN) FROM MENSAJE m2
                WHERE ((m2.USU_CONSECUSER = :id AND m2.CONSECUSER = u.CONSECUSER)
                   OR (m2.USU_CONSECUSER = u.CONSECUSER AND m2.CONSECUSER = :id))
              )
          ) AS ULTIMO_REMITENTE
        FROM AMIG_ a
        JOIN USUARIO u ON (u.CONSECUSER = a.USU_CONSECUSER AND a.CONSECUSER = :id)
        UNION
        SELECT u.CONSECUSER, u.NOMBRE, u.APELLIDO, u."USER", u.EMAIL, u.CELULAR,
          (
            SELECT m.FECHAREGMEN FROM MENSAJE m
            WHERE ((m.USU_CONSECUSER = :id AND m.CONSECUSER = u.CONSECUSER)
                OR (m.USU_CONSECUSER = u.CONSECUSER AND m.CONSECUSER = :id))
              AND m.FECHAREGMEN = (
                SELECT MAX(m2.FECHAREGMEN) FROM MENSAJE m2
                WHERE ((m2.USU_CONSECUSER = :id AND m2.CONSECUSER = u.CONSECUSER)
                   OR (m2.USU_CONSECUSER = u.CONSECUSER AND m2.CONSECUSER = :id))
              )
          ) AS ULTIMO_MENSAJE,
          (
            SELECT c.LOCALIZACONTENIDO FROM MENSAJE m
            JOIN CONTENIDO c ON c.USU_CONSECUSER = m.USU_CONSECUSER AND c.CONSECUSER = m.CONSECUSER AND c.CONSMENSAJE = m.CONSMENSAJE
            WHERE ((m.USU_CONSECUSER = :id AND m.CONSECUSER = u.CONSECUSER)
                OR (m.USU_CONSECUSER = u.CONSECUSER AND m.CONSECUSER = :id))
              AND m.FECHAREGMEN = (
                SELECT MAX(m2.FECHAREGMEN) FROM MENSAJE m2
                WHERE ((m2.USU_CONSECUSER = :id AND m2.CONSECUSER = u.CONSECUSER)
                   OR (m2.USU_CONSECUSER = u.CONSECUSER AND m2.CONSECUSER = :id))
              )
              AND c.IDTIPOCONTENIDO = '2'
          ) AS ULTIMO_TEXTO,
          (
            SELECT m.USU_CONSECUSER FROM MENSAJE m
            WHERE ((m.USU_CONSECUSER = :id AND m.CONSECUSER = u.CONSECUSER)
                OR (m.USU_CONSECUSER = u.CONSECUSER AND m.CONSECUSER = :id))
              AND m.FECHAREGMEN = (
                SELECT MAX(m2.FECHAREGMEN) FROM MENSAJE m2
                WHERE ((m2.USU_CONSECUSER = :id AND m2.CONSECUSER = u.CONSECUSER)
                   OR (m2.USU_CONSECUSER = u.CONSECUSER AND m2.CONSECUSER = :id))
              )
          ) AS ULTIMO_REMITENTE
        FROM AMIG_ a
        JOIN USUARIO u ON (u.CONSECUSER = a.CONSECUSER AND a.USU_CONSECUSER = :id)
      ) ORDER BY ULTIMO_MENSAJE DESC NULLS LAST`,
      { id: consecuser },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar amigos' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error('Error al cerrar la conexión:', err); }
    }
  }
});

// Endpoint para agregar un amigo
app.post('/api/amigos', async (req, res) => {
  const { consecuser, amigoUser } = req.body;
  let connection;
  try {
    connection = await getConnection();
    // Verificar que ambos usuarios existen
    const userCheck = await connection.execute(
      `SELECT 1 FROM USUARIO WHERE CONSECUSER = :id`,
      { id: consecuser }
    );
    const amigoCheck = await connection.execute(
      `SELECT 1 FROM USUARIO WHERE "USER" = :amigoUser`,
      { amigoUser }
    );
    if (userCheck.rows.length === 0 || amigoCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    // Obtener el CONSECUSER del amigo
    const amigoId = await connection.execute(
      `SELECT CONSECUSER FROM USUARIO WHERE "USER" = :amigoUser`,
      { amigoUser },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const amigoConsec = amigoId.rows[0].CONSECUSER;
    // Verificar si ya son amigos
    const already = await connection.execute(
      `SELECT 1 FROM AMIG_ WHERE (CONSECUSER = :a AND USU_CONSECUSER = :b) OR (CONSECUSER = :b AND USU_CONSECUSER = :a)`,
      { a: consecuser, b: amigoConsec }
    );
    if (already.rows.length > 0) {
      return res.json({ success: false, error: 'Ya son amigos' });
    }
    // Insertar la relación de amistad
    await connection.execute(
      `INSERT INTO AMIG_ (CONSECUSER, USU_CONSECUSER) VALUES (:a, :b)`,
      { a: consecuser, b: amigoConsec },
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Amigo agregado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al agregar amigo' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error('Error al cerrar la conexión:', err); }
    }
  }
});

// Endpoint para enviar mensaje entre usuarios
app.post('/api/mensajes', async (req, res) => {
  const { remitente, destinatario, texto } = req.body;
  let connection;
  try {
    connection = await getConnection();
    // Obtener el siguiente CONSMENSAJE para el remitente y destinatario
    const result = await connection.execute(
      `SELECT NVL(MAX(CONSMENSAJE),0)+1 AS NEXTMSG FROM MENSAJE WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest`,
      { rem: remitente, dest: destinatario },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const consMensaje = result.rows[0].NEXTMSG;
    // Insertar el mensaje
    await connection.execute(
      `INSERT INTO MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, FECHAREGMEN) VALUES (:rem, :dest, :cons, SYSDATE)`,
      { rem: remitente, dest: destinatario, cons: consMensaje },
      { autoCommit: true }
    );
    // Insertar el contenido del mensaje (texto)
    await connection.execute(
      `INSERT INTO CONTENIDO (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO, IDTIPOARCHIVO, IDTIPOCONTENIDO, LOCALIZACONTENIDO) VALUES (:rem, :dest, :cons, 1, NULL, '2', :texto)`,
      { rem: remitente, dest: destinatario, cons: consMensaje, texto },
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Mensaje enviado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al enviar mensaje' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error('Error al cerrar la conexión:', err); }
    }
  }
});

// Obtener mensajes entre dos usuarios (solo texto, con paginación inicial)
app.get('/api/mensajes/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const { offset } = req.query; // offset opcional para paginación
  let connection;
  try {
    connection = await getConnection();
    let query =
      `SELECT * FROM (
         SELECT m.USU_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, m.FECHAREGMEN, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO,
                ROW_NUMBER() OVER (ORDER BY m.FECHAREGMEN DESC) AS RN
         FROM MENSAJE m
         JOIN CONTENIDO c ON m.USU_CONSECUSER = c.USU_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE
         WHERE ((m.USU_CONSECUSER = :u1 AND m.CONSECUSER = :u2) OR (m.USU_CONSECUSER = :u2 AND m.CONSECUSER = :u1))
           AND c.IDTIPOCONTENIDO = '2'
       ) WHERE RN BETWEEN :startRow AND :endRow
       ORDER BY RN`;
    let startRow = 1;
    let endRow = 10;
    if (offset) {
      startRow = 1;
      endRow = parseInt(offset, 10);
    }
    const result = await connection.execute(
      query,
      { u1: user1, u2: user2, startRow, endRow },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    // Ordenar de más antiguo a más reciente
    const mensajes = result.rows.sort((a, b) => new Date(a.FECHAREGMEN) - new Date(b.FECHAREGMEN));
    res.json(mensajes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error al obtener mensajes' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error('Error al cerrar la conexión:', err); }
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
