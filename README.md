# Interfaz-Chat: Instrucciones de Instalación y Uso

## 1. Creación de la Base de Datos en Oracle (SQL*Plus)

### Pasos recomendados:

1. **Ingresar a la consola de SQL*Plus**
   - Abre una terminal (cmd o PowerShell en Windows).
   - Escribe: `sqlplus / as sysdba` o tu método de acceso habitual.

2. **Crear un usuario propio para la base de datos**
   - Se recomienda crear un usuario llamado `modulo` con contraseña `modulo`:
     ```sql
     CREATE USER modulo IDENTIFIED BY modulo;
     GRANT CONNECT, RESOURCE, DBA TO modulo;
     COMMIT
     ```
   - Si deseas usar otro usuario, deberás modificar el archivo `.env` del backend con el usuario y contraseña respectivos.

3. **Conectarse con el usuario creado**
   - En SQL*Plus, escribe:
     ```sql
     CONNECT modulo/modulo;
     ```

4. **Ejecutar los scripts de creación y datos**
   - Ubica los archivos `Creacion.sql` y `Querypunto2.sql` en una ruta conocida.
   - Ejecuta los scripts en este orden:
     ```sql
     start <ruta al archivo>
     -- Ejemplo:
     start C:\Users\usuario\Desktop\Creacion.sql
     start C:\Users\usuario\Desktop\Querypunto2.sql
     ```
   - Esto creará todas las tablas y poblará los datos necesarios.

---

## 2. Instalación de Node.js

### ¿No tienes Node.js?

1. **Descargar Node.js**
   - Ve a [https://nodejs.org/](https://nodejs.org/) y descarga la versión LTS recomendada para tu sistema operativo.
   - Instala siguiendo el asistente (siguiente, siguiente, finalizar).

2. **Verificar la instalación**
   - Abre una terminal nueva y ejecuta:
     ```sh
     node -v
     npm -v
     ```
   - Debes ver la versión de Node.js y npm (por ejemplo, `v18.17.0` y `9.6.7`).
   - Si no aparece, reinicia la terminal o revisa la variable de entorno PATH.

**Precauciones:**
- No instales Node.js en carpetas con espacios o caracteres especiales en la ruta.
- Si tienes versiones antiguas, desinstala antes de instalar la nueva.

---

## 3. Instalación y ejecución del proyecto

### 3.1. Clona o descarga el repositorio

### 3.2. Instala dependencias

Debes abrir dos terminales, una para el backend y otra para el frontend.

#### **Backend**
1. Abre una terminal y navega a la carpeta `backend`:
   ```sh
   cd backend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Configura el archivo `.env` con los datos de tu base de datos Oracle (usuario, contraseña, host, etc.).
4. Inicia el backend:
   ```sh
   npm start
   ```
   - El backend se ejecutará por defecto en `http://localhost:3001`.

#### **Frontend**
1. Abre otra terminal y navega a la carpeta `frontend`:
   ```sh
   cd frontend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Inicia el frontend:
   ```sh
   npm start
   ```
   - El frontend se abrirá automáticamente en tu navegador en `http://localhost:3000`.

**Precaución:**
- Ambos servidores deben estar corriendo al mismo tiempo, cada uno en su terminal.
- Si tienes problemas de puertos ocupados, asegúrate de que no haya otros programas usando los puertos 3000 (frontend) o 3001 (backend).

---

## 4. Instructivo de uso y funcionalidades disponibles

### 4.1. Registro e inicio de sesión
- Al abrir la app, puedes registrarte como nuevo usuario o iniciar sesión con tus credenciales.

### 4.2. Agregar amigos
- Usa la opción de agregar amigo para buscar y añadir usuarios por su nombre de usuario.

### 4.3. Enviar mensajes
- Selecciona un chat y escribe tu mensaje en la barra inferior.
- Puedes enviar mensajes de texto o adjuntar archivos (PDF, DOC, XLS, GIF, BMP, MP4, AVI, MP3, EXE).

### 4.4. Enviar y responder mensajes citados (hilo)
- Haz doble clic sobre un mensaje para citarlo/responderlo.
- El mensaje citado aparecerá encima del input y también en la conversación, similar a WhatsApp.

### 4.5. Descargar o visualizar archivos
- Los archivos enviados aparecen como enlaces. Haz clic para descargar o abrir el archivo.

### 4.6. Otras funcionalidades
- Scroll automático, paginación de mensajes, refresco automático de chats y mensajes.
- Interfaz moderna y responsiva.

---

## 5. Precauciones y recomendaciones
- No cierres las terminales mientras uses la app.
- Si cambias la configuración de la base de datos, reinicia el backend.
- Si tienes problemas de conexión, revisa el archivo `.env` y que Oracle esté corriendo.
- Para desarrollo, usa navegadores actualizados (Chrome, Edge, Firefox).

---

¿Dudas? Consulta la documentación interna del proyecto o abre un issue en el repositorio.
