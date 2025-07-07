# Explicación detallada de las consultas e inserciones SQL en la aplicación de chat

## Diagrama de relaciones principales

```mermaid
erDiagram
    USUARIO ||--o{ AMIG_ : "es amigo de"
    USUARIO ||--o{ MENSAJE : "envía/recibe"
    MENSAJE ||--o{ CONTENIDO : "tiene"
    MENSAJE ||--|{ MENSAJE : "cita (hilo)"

    USUARIO {
        VARCHAR2(36) CONSECUSER PK
        VARCHAR2(25) NOMBRE
        VARCHAR2(25) APELLIDO
        VARCHAR2(6)  USER
        VARCHAR2(8)  PASSWORD
        VARCHAR2(50) EMAIL
        VARCHAR2(16) CELULAR
    }
    AMIG_ {
        VARCHAR2(36) CONSECUSER PK
        VARCHAR2(36) USU_CONSECUSER PK
    }
    MENSAJE {
        VARCHAR2(36) USU_CONSECUSER PK
        VARCHAR2(36) CONSECUSER PK
        INTEGER CONSMENSAJE PK
        DATE FECHAREGMEN
        VARCHAR2(36) MEN_USU_CONSECUSER (referencia a MENSAJE)
        VARCHAR2(36) MEN_CONSECUSER (referencia a MENSAJE)
        INTEGER MEN_CONSMENSAJE (referencia a MENSAJE)
    }
    CONTENIDO {
        VARCHAR2(36) USU_CONSECUSER PK
        VARCHAR2(36) CONSECUSER PK
        INTEGER CONSMENSAJE PK
        INTEGER CONSECONTENIDO PK
        VARCHAR2(3) IDTIPOARCHIVO
        VARCHAR2(2) IDTIPOCONTENIDO
        VARCHAR2(255) LOCALIZACONTENIDO
    }
```

---

## Ejemplo de flujo de datos

1. **Usuario envía mensaje de texto:**
   - Se inserta un registro en `MENSAJE` (con metadatos y posible referencia a mensaje citado).
   - Se inserta el texto en `CONTENIDO` con `IDTIPOCONTENIDO = '2'`.

2. **Usuario envía archivo:**
   - Se inserta un registro en `MENSAJE`.
   - Se inserta la ruta del archivo en `CONTENIDO` con `IDTIPOCONTENIDO = '1'` y el tipo de archivo.

3. **Usuario responde a un mensaje:**
   - El nuevo mensaje en `MENSAJE` incluye los campos `MEN_USU_CONSECUSER`, `MEN_CONSECUSER`, `MEN_CONSMENSAJE` apuntando al mensaje original.

---

## Leyenda visual
- **PK**: Clave primaria
- Las líneas indican relaciones (uno a muchos, muchos a muchos, autorreferencia para hilos)
- Los campos `MEN_*` en `MENSAJE` permiten la funcionalidad de citar/responder mensajes (hilo)

---

## ¿Cómo leer el diagrama?
- Un usuario puede tener muchos amigos (`AMIG_`), y cada relación es bidireccional.
- Un usuario puede enviar/recibir muchos mensajes (`MENSAJE`).
- Cada mensaje puede tener varios contenidos (texto, archivo, etc.).
- Un mensaje puede citar a otro mensaje (relación de hilo).

---

# 1. Registro de Usuario
**Consulta:**
```sql
INSERT INTO USUARIO (CONSECUSER, NOMBRE, APELLIDO, "USER", PASSWORD, EMAIL, CELULAR, FECHAREGISTRO)
VALUES (:id, :nombre, :apellido, :username, :password, :email, :celular, SYSDATE)
```
**Explicación:**
- Inserta un nuevo usuario en la tabla `USUARIO`.
- `CONSECUSER`: identificador único (UUID) para cada usuario.
- `NOMBRE`, `APELLIDO`, `"USER"`, `PASSWORD`, `EMAIL`, `CELULAR`: datos personales del usuario.
- `FECHAREGISTRO`: almacena la fecha y hora de registro usando la función `SYSDATE` de Oracle.

## 2. Login de Usuario
**Consulta:**
```sql
SELECT * FROM USUARIO WHERE "USER" = :username AND PASSWORD = :password
```
**Explicación:**
- Busca un usuario por nombre de usuario y contraseña para autenticar el acceso.
- Si encuentra un registro, el usuario puede iniciar sesión.

## 3. Agregar Amigo
**Consultas:**
1. Verificar existencia de usuario y amigo:
   ```sql
   SELECT 1 FROM USUARIO WHERE CONSECUSER = :id
   SELECT 1 FROM USUARIO WHERE "USER" = :amigoUser
   ```
2. Obtener el ID del amigo:
   ```sql
   SELECT CONSECUSER FROM USUARIO WHERE "USER" = :amigoUser
   ```
3. Verificar si ya son amigos:
   ```sql
   SELECT 1 FROM AMIG_ WHERE (CONSECUSER = :a AND USU_CONSECUSER = :b) OR (CONSECUSER = :b AND USU_CONSECUSER = :a)
   ```
4. Insertar relación de amistad:
   ```sql
   INSERT INTO AMIG_ (CONSECUSER, USU_CONSECUSER) VALUES (:a, :b)
   ```
**Explicación:**
- Se valida que ambos usuarios existan y que no sean ya amigos.
- Se inserta la relación en la tabla `AMIG_`, que almacena pares de usuarios que son amigos.

## 4. Enviar Mensaje de Texto (y/o Cita)
**Consultas:**
1. Obtener el siguiente número de mensaje:
   ```sql
   SELECT NVL(MAX(CONSMENSAJE),0)+1 AS NEXTMSG FROM MENSAJE WHERE USU_CONSECUSER = :rem AND CONSECUSER = :dest
   ```
   - Genera un número de mensaje consecutivo para la conversación entre dos usuarios.
2. Insertar el mensaje (metadatos):
   ```sql
   INSERT INTO MENSAJE (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, FECHAREGMEN, MEN_USU_CONSECUSER, MEN_CONSECUSER, MEN_CONSMENSAJE)
   VALUES (:rem, :dest, :cons, SYSDATE, :men_usu_consecuser, :men_consecuser, :men_consMensaje)
   ```
   - Inserta el mensaje y, si es respuesta a otro, guarda la referencia al mensaje citado (hilo) mediante los campos `MEN_*`.
3. Insertar el contenido del mensaje:
   ```sql
   INSERT INTO CONTENIDO (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO, IDTIPOARCHIVO, IDTIPOCONTENIDO, LOCALIZACONTENIDO)
   VALUES (:rem, :dest, :cons, 1, NULL, '2', :texto)
   ```
   - `IDTIPOCONTENIDO = '2'` indica que es texto.
   - `LOCALIZACONTENIDO` almacena el texto del mensaje.

## 5. Enviar Archivo
**Consultas:**
1. Obtener el siguiente número de mensaje (igual que texto).
2. Insertar el mensaje (igual que texto, pero sin referencia de hilo).
3. Insertar el contenido del archivo:
   ```sql
   INSERT INTO CONTENIDO (USU_CONSECUSER, CONSECUSER, CONSMENSAJE, CONSECONTENIDO, IDTIPOARCHIVO, IDTIPOCONTENIDO, LOCALIZACONTENIDO)
   VALUES (:rem, :dest, :cons, 1, :tipoArchivo, '1', :ruta)
   ```
   - `IDTIPOCONTENIDO = '1'` indica que es archivo.
   - `IDTIPOARCHIVO` almacena el tipo de archivo (PDF, DOC, etc.).
   - `LOCALIZACONTENIDO` almacena la ruta del archivo en el servidor.

## 6. Obtener Mensajes entre Usuarios
**Consulta:**
```sql
SELECT * FROM (
  SELECT m.USU_CONSECUSER, m.CONSECUSER, m.CONSMENSAJE, m.FECHAREGMEN, c.LOCALIZACONTENIDO, c.IDTIPOCONTENIDO, c.IDTIPOARCHIVO,
         m.MEN_USU_CONSECUSER, m.MEN_CONSECUSER, m.MEN_CONSMENSAJE,
         ROW_NUMBER() OVER (ORDER BY m.FECHAREGMEN DESC) AS RN
  FROM MENSAJE m
  JOIN CONTENIDO c ON m.USU_CONSECUSER = c.USU_CONSECUSER AND m.CONSECUSER = c.CONSECUSER AND m.CONSMENSAJE = c.CONSMENSAJE
  WHERE ((m.USU_CONSECUSER = :u1 AND m.CONSECUSER = :u2) OR (m.USU_CONSECUSER = :u2 AND m.CONSECUSER = :u1))
    AND (c.IDTIPOCONTENIDO = '1' OR c.IDTIPOCONTENIDO = '2')
) WHERE RN BETWEEN :startRow AND :endRow
ORDER BY RN
```
**Explicación:**
- Devuelve los mensajes (texto y archivos) entre dos usuarios, con paginación.
- Incluye información de si el mensaje es respuesta a otro (campos `MEN_*`).
- Permite reconstruir la conversación y mostrar mensajes citados.

## 7. Descargar Archivo
**Explicación:**
- El endpoint usa la ruta almacenada en `LOCALIZACONTENIDO` para servir el archivo al usuario.
- No es una consulta SQL, pero depende de la información guardada en la base de datos.

---

## Resumen de relaciones y estructura
- **USUARIO**: almacena los datos de cada usuario.
- **AMIG_**: almacena las relaciones de amistad (pares de usuarios).
- **MENSAJE**: almacena los metadatos de cada mensaje, incluyendo referencias a mensajes citados (hilo).
- **CONTENIDO**: almacena el contenido de cada mensaje (texto o archivo), referenciado por usuario, destinatario y número de mensaje.

---

¿Dudas? Puedes agregar ejemplos de datos o diagramas para complementar la explicación si lo necesitas.
