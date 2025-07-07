const express = require('express');
const cors = require('cors');
const { getConnection } = require('./config/db');
const oracledb = require('oracledb');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());

// Configuración de multer para guardar archivos en /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Nombre único: fecha + original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

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

// ===================== USUARIO =====================
// Registro de usuario:
// Inserta un nuevo usuario en la tabla USUARIO con todos sus datos personales y la fecha de registro.
// CONSECUSER: identificador único (UUID)
// NOMBRE, APELLIDO, "USER", PASSWORD, EMAIL, CELULAR: datos personales
// FECHAREGISTRO: fecha y hora de registro (SYSDATE)
// ---------------------------------------------------
// Consulta:
// INSERT INTO USUARIO (CONSECUSER, NOMBRE, APELLIDO, "USER", PASSWORD, EMAIL, CELULAR, FECHAREGISTRO)
// VALUES (:id, :nombre, :apellido, :username, :password, :email, :celular, SYSDATE)
// ---------------------------------------------------
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

// ===================== LOGIN =====================
// Consulta para autenticar usuario:
// Busca un usuario por nombre de usuario y contraseña para autenticar el acceso.
// Consulta:
// SELECT * FROM USUARIO WHERE "USER" = :username AND PASSWORD = :password
// ---------------------------------------------------
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

// ===================== AMIGOS =====================
// 1. Verificar existencia de usuario y amigo:
//    SELECT 1 FROM USUARIO WHERE CONSECUSER = :id
//    SELECT 1 FROM USUARIO WHERE "USER" = :amigoUser
// 2. Obtener el ID del amigo:
//    SELECT CONSECUSER FROM USUARIO WHERE "USER" = :amigoUser
// 3. Verificar si ya son amigos:
//    SELECT 1 FROM AMIG_ WHERE (CONSECUSER = :a AND USU_CONSECUSER = :b) OR (CONSECUSER = :b AND USU_CONSECUSER = :a)
// 4. Insertar relación de amistad:
//    INSERT INTO AMIG_ (CONSECUSER, USU_CONSECUSER) VALUES (:a, :b)
// Explicación:
// Se valida que ambos usuarios existan y que no sean ya amigos. Se inserta la relación en la tabla AMIG_, que almacena pares de usuarios que son amigos.
// ---------------------------------------------------
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

// ===================== MENSAJES (Texto y Citas) =====================
// 1. Obtener el siguiente número de mensaje:
//    SELECT NVL(MAX(CONSMENSAJE),0)+1 AS NEXTMSG FROM MENSAJE WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest
//    - Genera un número de mensaje consecutivo para la conversación.
// 2. Insertar el mensaje (metadatos):
//    INSERT INTO MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, FECHAREGMEN, MEN_USU_CONSECUSER, MEN_CONSECUSER, MEN_CONSMENSAJE)
//    VALUES (:rem, :dest, :cons, SYSDATE, :men_usu_consecuser, :men_consecuser, :men_consMensaje)
//    - Inserta el mensaje y, si es respuesta a otro, guarda la referencia al mensaje citado (hilo).
// 3. Insertar el contenido del mensaje:
//    INSERT INTO CONTENIDO (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO, IDTIPOARCHIVO, IDTIPOCONTENIDO, LOCALIZACONTENIDO)
//    VALUES (:rem, :dest, :cons, 1, NULL, '2', :texto)
//    - IDTIPOCONTENIDO = '2' indica que es texto.
// ---------------------------------------------------
// Endpoint para enviar mensaje entre usuarios
app.post('/api/mensajes', async (req, res) => {
  const { remitente, destinatario, texto, men_usu_consecuser, men_consecuser, men_consMensaje } = req.body;
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT NVL(MAX(CONSMENSAJE),0)+1 AS NEXTMSG FROM MENSAJE WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest`,
      { rem: remitente, dest: destinatario },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const consMensaje = result.rows[0].NEXTMSG;
    // Insertar el mensaje, incluyendo los campos de referencia si existen
    await connection.execute(
      `INSERT INTO MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, FECHAREGMEN, MEN_USU_CONSECUSER, MEN_CONSECUSER, MEN_CONSMENSAJE) VALUES (:rem, :dest, :cons, SYSDATE, :men_usu_consecuser, :men_consecuser, :men_consMensaje)`,
      {
        rem: remitente,
        dest: destinatario,
        cons: consMensaje,
        men_usu_consecuser: men_usu_consecuser || null,
        men_consecuser: men_consecuser || null,
        men_consMensaje: men_consMensaje || null
      },
      { autoCommit: true }
    );
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

// ===================== MENSAJES (Archivos) =====================
// 1. Obtener el siguiente número de mensaje (igual que texto).
// 2. Insertar el mensaje (igual que texto, pero sin referencia de hilo).
// 3. Insertar el contenido del archivo:
//    INSERT INTO CONTENIDO (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO, IDTIPOARCHIVO, IDTIPOCONTENIDO, LOCALIZACONTENIDO)
//    VALUES (:rem, :dest, :cons, 1, :tipoArchivo, '1', :ruta)
//    - IDTIPOCONTENIDO = '1' indica que es archivo.
//    - IDTIPOARCHIVO almacena el tipo de archivo (PDF, DOC, etc.).
//    - LOCALIZACONTENIDO almacena la ruta del archivo en el servidor.
// ---------------------------------------------------
// Endpoint para subir archivo y registrar mensaje
console.log("SUBIDA DE ARCHIVO ACTIVA");
app.post('/api/mensajes/archivo', upload.single('archivo'), async (req, res) => {
  const { remitente, destinatario } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No se recibió archivo' });
  let connection;
  try {
    connection = await getConnection();
    // Obtener el siguiente CONSMENSAJE
    const result = await connection.execute(
      `SELECT NVL(MAX(CONSMENSAJE),0)+1 AS NEXTMSG FROM MENSAJE WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest`,
      { rem: remitente, dest: destinatario },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const consMensaje = result.rows[0].NEXTMSG;
    // Insertar en MENSAJE
    await connection.execute(
      `INSERT INTO MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, FECHAREGMEN) VALUES (:rem, :dest, :cons, SYSDATE)`,
      { rem: remitente, dest: destinatario, cons: consMensaje },
      { autoCommit: true }
    );
    // Determinar tipo de archivo
    const ext = path.extname(file.originalname).toLowerCase();
    let tipoArchivo = null;
    switch (ext) {
      case '.pdf': tipoArchivo = 'PDF'; break;
      case '.doc': case '.docx': tipoArchivo = 'DOC'; break;
      case '.xls': case '.xlsx': tipoArchivo = 'XLS'; break;
      case '.gif': tipoArchivo = 'GIF'; break;
      case '.bmp': tipoArchivo = 'BMP'; break;
      case '.mp4': tipoArchivo = 'MP4'; break;
      case '.avi': tipoArchivo = 'AVI'; break;
      case '.mp3': tipoArchivo = 'MP3'; break;
      case '.exe': tipoArchivo = 'EXE'; break;
      default: tipoArchivo = 'OTR'; break;
    }
    // Insertar en CONTENIDO (solo ruta, no blob)
    await connection.execute(
      `INSERT INTO CONTENIDO (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO, IDTIPOARCHIVO, IDTIPOCONTENIDO, LOCALIZACONTENIDO) VALUES (:rem, :dest, :cons, 1, :tipoArchivo, '1', :ruta)`,
      { rem: remitente, dest: destinatario, cons: consMensaje, tipoArchivo, ruta: file.path },
      { autoCommit: true }
    );
    res.json({ success: true, message: 'Archivo enviado', ruta: file.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar archivo' });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error('Error al cerrar la conexión:', err); }
    }
  }
});

// ===================== OBTENER MENSAJES =====================
// Consulta para obtener mensajes entre dos usuarios (texto y archivos):
// SELECT * FROM (
//   SELECT m.USU_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, m.FECHAREGMEN, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
//          m.MEN_USU_CONSECUSER, m.MEN_CONSECUSER, m.MEN_CONSMENSAJE,
//          ROW_NUMBER() OVER (ORDER BY m.FECHAREGMEN DESC) AS RN
//   FROM MENSAJE m
//   JOIN CONTENIDO c ON m.USU_CONSECUSER = c.USU_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE
//   WHERE ((m.USU_CONSECUSER = :u1 AND m.CONSECUSER = :u2) OR (m.USU_CONSECUSER = :u2 AND m.CONSECUSER = :u1))
//     AND (c.IDTIPOCONTENIDO = '1' OR c.IDTIPOCONTENIDO = '2')
// ) WHERE RN BETWEEN :startRow AND :endRow
// ORDER BY RN
// Explicación:
// Devuelve los mensajes (texto y archivos) entre dos usuarios, con paginación. Incluye información de si el mensaje es respuesta a otro (campos MEN_*).
// ---------------------------------------------------
// Endpoint para obtener mensajes entre dos usuarios (solo texto, con paginación inicial)
app.get('/api/mensajes/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  const { offset } = req.query; // offset opcional para paginación
  let connection;
  try {
    connection = await getConnection();
    // Consulta: Obtener los mensajes entre dos usuarios (solo texto), con paginación
    // Estructura general:
    //   SELECT * FROM (
    //     SELECT m.USU_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, m.FECHAREGMEN, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
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
         SELECT m.USU_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, m.FECHAREGMEN, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
                m.MEN_USU_CONSECUSER, m.MEN_CONSECUSER, m.MEN_CONSMENSAJE,
                ROW_NUMBER() OVER (ORDER BY m.FECHAREGMEN DESC) AS RN
         FROM MENSAJE m
         JOIN CONTENIDO c ON m.USU_CONSECUSER = c.USU_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE
         WHERE ((m.USU_CONSECUSER = :u1 AND m.CONSECUSER = :u2) OR (m.USU_CONSECUSER = :u2 AND m.CONSECUSER = :u1))
           AND (c.IDTIPOCONTENIDO = '1' OR c.IDTIPOCONTENIDO = '2')
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
    // Si algún mensaje es respuesta, buscar el mensaje original y adjuntarlo
    for (const msg of mensajes) {
      if (msg.MEN_USU_CONSECUSER && msg.MEN_CONSECUSER && msg.MEN_CONSMENSAJE) {
        // Buscar el mensaje original en la misma lista (optimización para la mayoría de los casos)
        const citado = mensajes.find(m => m.USU_CONSECUSER === msg.MEN_USU_CONSECUSER && m.CONSECUSER === msg.MEN_CONSECUSER && m.CONSMENSAJE === msg.MEN_CONSMENSAJE);
        if (citado) {
          msg.mensaje_citado = {
            USU_CONSECUSER: citado.USU_CONSECUSER,
            CONSECUSER: citado.CONSECUSER,
            CONSMENSAJE: citado.CONSMENSAJE,
            LOCALIZACONTENIDO: citado.LOCALIZACONTENIDO,
            IDTIPOCONTENIDO: citado.IDTIPOCONTENIDO,
            FECHAREGMEN: citado.FECHAREGMEN
          };
        } else {
          // Si no está en la lista, opcional: podrías hacer una consulta extra a la BD
          msg.mensaje_citado = null;
        }
      }
    }
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

// ===================== DESCARGA DE ARCHIVOS =====================
// El endpoint usa la ruta almacenada en LOCALIZACONTENIDO para servir el archivo al usuario.
// ---------------------------------------------------
// Endpoint para servir archivos
app.get('/api/descargar', (req, res) => {
  const { ruta } = req.query;
  if (!ruta) return res.status(400).json({ error: 'Ruta no especificada' });
  res.download(ruta, err => {
    if (err) res.status(404).json({ error: 'Archivo no encontrado' });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
