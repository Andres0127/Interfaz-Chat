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
    // Consulta: Obtener todos los tipos de contenido disponibles en la tabla TIPOCONTENIDO
    // Estructura: SELECT * FROM TIPOCONTENIDO
    // - SELECT *: selecciona todas las columnas de la tabla TIPOCONTENIDO.
    // - FROM TIPOCONTENIDO: indica la tabla de la que se extraen los datos.
    // Propósito: Esta consulta es solo de prueba y sirve para verificar la conexión y estructura de la base de datos.
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
    // Consulta: Insertar un nuevo usuario en la tabla USUARIO
    // Estructura:
    //   INSERT INTO USUARIO (CONSECUSER, NOMBRE, APELLIDO, "USER", PASSWORD, EMAIL, CELULAR, FECHAREGISTRO)
    //   VALUES (:id, :nombre, :apellido, :username, :password, :email, :celular, SYSDATE)
    // - INSERT INTO USUARIO (...): indica que se va a insertar un nuevo registro en la tabla USUARIO.
    // - Los campos corresponden a: identificador único (UUID), nombre, apellido, usuario, contraseña, email, celular y fecha de registro.
    // - VALUES (...): los valores se pasan como parámetros para evitar inyección SQL.
    // - SYSDATE: función de Oracle que almacena la fecha y hora actual del registro.
    // Propósito: Registrar un nuevo usuario en el sistema con todos sus datos.
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
    // Consulta: Buscar usuario por username y password para login
    // Estructura:
    //   SELECT * FROM USUARIO WHERE "USER" = :username AND PASSWORD = :password
    // - SELECT *: selecciona todas las columnas del usuario.
    // - FROM USUARIO: de la tabla de usuarios.
    // - WHERE "USER" = :username AND PASSWORD = :password: filtra por usuario y contraseña exactos.
    // Propósito: Autenticar al usuario en el login.
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
    // Consulta: Verificar que el usuario existe
    // Estructura: SELECT 1 FROM USUARIO WHERE CONSECUSER = :id
    // - Devuelve 1 si existe un usuario con ese CONSECUSER.
    // Propósito: Validar que el usuario que quiere agregar un amigo existe.
    const userCheck = await connection.execute(
      `SELECT 1 FROM USUARIO WHERE CONSECUSER = :id`,
      { id: consecuser }
    );
    // Consulta: Verificar que el amigo existe por username
    // Estructura: SELECT 1 FROM USUARIO WHERE "USER" = :amigoUser
    // - Devuelve 1 si existe un usuario con ese nombre de usuario.
    // Propósito: Validar que el amigo a agregar existe.
    const amigoCheck = await connection.execute(
      `SELECT 1 FROM USUARIO WHERE "USER" = :amigoUser`,
      { amigoUser }
    );
    if (userCheck.rows.length === 0 || amigoCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    // Obtener el CONSECUSER del amigo
    // Consulta: Obtener el CONSECUSER del amigo a partir del username
    // Estructura: SELECT CONSECUSER FROM USUARIO WHERE "USER" = :amigoUser
    // - Devuelve el identificador único del usuario amigo.
    // Propósito: Obtener el ID necesario para crear la relación de amistad.
    const amigoId = await connection.execute(
      `SELECT CONSECUSER FROM USUARIO WHERE "USER" = :amigoUser`,
      { amigoUser },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const amigoConsec = amigoId.rows[0].CONSECUSER;
    // Verificar si ya son amigos
    // Consulta: Verificar si ya existe la relación de amistad (en ambas direcciones)
    // Estructura: SELECT 1 FROM AMIG_ WHERE (CONSECUSER = :a AND USU_CONSECUSER = :b) OR (CONSECUSER = :b AND USU_CONSECUSER = :a)
    // - Busca si ya existe una relación de amistad entre los dos usuarios, sin importar el orden.
    // Propósito: Evitar duplicar relaciones de amistad.
    const already = await connection.execute(
      `SELECT 1 FROM AMIG_ WHERE (CONSECUSER = :a AND USU_CONSECUSER = :b) OR (CONSECUSER = :b AND USU_CONSECUSER = :a)`,
      { a: consecuser, b: amigoConsec }
    );
    if (already.rows.length > 0) {
      return res.json({ success: false, error: 'Ya son amigos' });
    }
    // Insertar la relación de amistad
    // Consulta: Insertar la relación de amistad en la tabla AMIG_
    // Estructura: INSERT INTO AMIG_ (CONSECUSER, USU_CONSECUSER) VALUES (:a, :b)
    // - Inserta una fila que representa la amistad entre dos usuarios.
    // Propósito: Registrar la nueva relación de amistad.
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
    // Consulta: Obtener el siguiente número de mensaje (CONSMENSAJE) para el remitente y destinatario
    // Estructura:
    //   SELECT NVL(MAX(CONSMENSAJE),0)+1 AS NEXTMSG FROM MENSAJE WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest
    // - NVL(MAX(CONSMENSAJE),0)+1: busca el máximo número de mensaje previo y suma 1, o inicia en 1 si no hay mensajes.
    // - WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest: filtra solo los mensajes enviados por el remitente a ese destinatario.
    // Propósito: Generar el número de mensaje consecutivo para la relación remitente-destinatario.
    const result = await connection.execute(
      `SELECT NVL(MAX(CONSMENSAJE),0)+1 AS NEXTMSG FROM MENSAJE WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest`,
      { rem: remitente, dest: destinatario },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const consMensaje = result.rows[0].NEXTMSG;
    // Insertar el mensaje
    // Consulta: Insertar el mensaje en la tabla MENSAJE (solo metadatos, no el texto)
    // Estructura:
    //   INSERT INTO MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, FECHAREGMEN) VALUES (:rem, :dest, :cons, SYSDATE)
    // - Inserta una fila con el remitente, destinatario, número de mensaje y fecha/hora de envío.
    // Propósito: Registrar el envío de un mensaje entre dos usuarios.
    await connection.execute(
      `INSERT INTO MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, FECHAREGMEN) VALUES (:rem, :dest, :cons, SYSDATE)`,
      { rem: remitente, dest: destinatario, cons: consMensaje },
      { autoCommit: true }
    );
    // Insertar el contenido del mensaje (texto)
    // Consulta: Insertar el contenido del mensaje (texto) en la tabla CONTENIDO
    // Estructura:
    //   INSERT INTO CONTENIDO (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO, IDTIPOARCHIVO, IDTIPOCONTENIDO, LOCALIZACONTENIDO)
    //   VALUES (:rem, :dest, :cons, 1, NULL, '2', :texto)
    // - Inserta el texto del mensaje asociado al mensaje recién creado.
    // - IDTIPOCONTENIDO = '2' indica que es texto, IDTIPOARCHIVO = NULL porque no es archivo.
    // Propósito: Guardar el contenido textual del mensaje.
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
    // Consulta: Obtener los mensajes entre dos usuarios (solo texto), con paginación
    // Estructura general:
    //   SELECT * FROM (
    //     SELECT m.USU_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, m.FECHAREGMEN, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO,
    //            ROW_NUMBER() OVER (ORDER BY m.FECHAREGMEN DESC) AS RN
    //     FROM MENSAJE m
    //     JOIN CONTENIDO c ON m.USU_CONSECUSER = c.USU_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE
    //     WHERE ((m.USU_CONSECUSER = :u1 AND m.CONSECUSER = :u2) OR (m.USU_CONSECUSER = :u2 AND m.CONSECUSER = :u1))
    //       AND c.IDTIPOCONTENIDO = '2'
    //   ) WHERE RN BETWEEN :startRow AND :endRow
    //   ORDER BY RN
    // Detalle:
    // - Se usa ROW_NUMBER() para numerar los mensajes por fecha descendente (los más recientes primero).
    // - El WHERE filtra solo los mensajes entre los dos usuarios y solo los de tipo texto.
    // - La consulta externa permite paginar los resultados (por defecto, los últimos 10 mensajes).
    // Propósito: Permitir la visualización paginada de los mensajes de texto entre dos usuarios.
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
