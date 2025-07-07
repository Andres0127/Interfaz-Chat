# Documentación Técnica de la Aplicación Interfaz-Chat

Este documento describe la función y propósito de cada archivo y carpeta principal del proyecto, tanto en el frontend (React) como en el backend (Node.js + Express), y su relación con el funcionamiento general de la aplicación.

---

## FRONTEND (Carpeta `frontend/`)

### Estructura principal
- **src/App.js**: Componente raíz. Controla si el usuario está autenticado y muestra el login o la interfaz de chat.
- **src/index.js**: Punto de entrada de React. Renderiza el componente `App`.
- **src/App.css, src/index.css**: Estilos globales de la aplicación.

### Páginas
- **src/pages/Login.js**: Pantalla de inicio de sesión y registro. Permite al usuario autenticarse o crear una cuenta.
- **src/pages/Chat.js**: Pantalla principal de chat. Orquesta la visualización de la lista de chats, el chat activo, el perfil de usuario y el input de mensajes.

### Componentes
- **src/components/ChatList/ChatList.js**: Muestra la lista de chats disponibles para el usuario. Permite seleccionar un chat para visualizar sus mensajes.
- **src/components/ChatWindow/ChatWindow.js**: Muestra los mensajes del chat seleccionado, incluyendo archivos y mensajes citados.
- **src/components/MessageInput/MessageInput.js**: Barra de entrada para escribir y enviar mensajes o archivos. Permite citar mensajes.
- **src/components/UserProfile/UserProfile.js**: Muestra la información del usuario autenticado y permite agregar amigos.
- **src/components/SidebarPanel/SidebarPanel.js**: Panel lateral con botón para agregar amigos.

### Servicios
- **src/services/api.js**: Funciones para interactuar con el backend vía HTTP (login, registro, envío/recepción de mensajes, subida/descarga de archivos, etc).

### Recursos
- **public/logochat.png**: Logo de la aplicación, usado en login y perfil.
- **public/**: Archivos estáticos (favicon, manifest, etc).

---

## BACKEND (Carpeta `backend/`)

### Estructura principal
- **src/app.js**: Archivo principal del servidor Express. Define los endpoints de la API (mensajes, archivos, usuarios, etc).
- **src/config/db.js**: Configuración y conexión a la base de datos Oracle.
- **package.json**: Dependencias y scripts del backend.
- **uploads/**: Carpeta donde se almacenan los archivos subidos por los usuarios.
- **.env**: Variables de entorno (credenciales, rutas, etc).

---

## FUNCIONAMIENTO DE CADA COMPONENTE CLAVE

### ChatList.js
- **Función:** Muestra la lista de chats (conversaciones) del usuario. Permite seleccionar un chat para ver sus mensajes.
- **Relación:** Cuando el usuario selecciona un chat, se actualiza el estado en `Chat.js` y se muestra el historial de mensajes en `ChatWindow.js`.

### ChatWindow.js
- **Función:** Muestra los mensajes del chat seleccionado, incluyendo archivos adjuntos y mensajes citados. Permite visualizar y descargar archivos.
- **Relación:** Recibe el chat seleccionado desde `Chat.js` y los mensajes desde el backend.

### MessageInput.js
- **Función:** Permite escribir y enviar mensajes de texto o archivos. Soporta citar mensajes (responder en hilo).
- **Relación:** Envía los mensajes al backend y actualiza la vista de `ChatWindow.js`.

### UserProfile.js
- **Función:** Muestra la información del usuario autenticado y permite agregar amigos.
- **Relación:** Se muestra en la parte superior de la lista de chats.

### SidebarPanel.js
- **Función:** Panel lateral con botón para agregar amigos.
- **Relación:** Permite abrir el popup de agregar amigo en `UserProfile.js`.

### api.js
- **Función:** Centraliza todas las llamadas HTTP al backend (login, registro, mensajes, archivos, etc).

### Login.js
- **Función:** Pantalla de autenticación y registro de usuarios.
- **Relación:** Si el login es exitoso, muestra la pantalla de chat (`Chat.js`).

### Chat.js
- **Función:** Orquesta la interfaz principal de chat, integrando todos los componentes anteriores.

---

## FUNCIONALIDADES PRINCIPALES Y SU IMPLEMENTACIÓN

### 1. Autenticación de Usuarios (Login y Registro)
- **Descripción:** Permite a los usuarios iniciar sesión o registrarse en la aplicación.
- **Archivos involucrados:**
  - `frontend/src/pages/Login.js`: Formulario de login y registro, validación de datos.
  - `frontend/src/services/api.js`: Llamadas HTTP a los endpoints de autenticación.
  - `backend/src/app.js`: Endpoints `/api/login` y `/api/register`.
  - `backend/src/config/db.js`: Validación y registro en la base de datos Oracle.

### 2. Visualización y Selección de Chats
- **Descripción:** El usuario ve una lista de sus chats y puede seleccionar uno para ver los mensajes.
- **Archivos involucrados:**
  - `frontend/src/components/ChatList/ChatList.js`: Renderiza la lista de chats.
  - `frontend/src/pages/Chat.js`: Mantiene el estado del chat seleccionado.
  - `frontend/src/services/api.js`: Obtiene la lista de chats desde el backend.
  - `backend/src/app.js`: Endpoint para obtener los chats del usuario.

### 3. Envío y Recepción de Mensajes
- **Descripción:** Permite enviar mensajes de texto y archivos, y ver el historial de mensajes.
- **Archivos involucrados:**
  - `frontend/src/components/MessageInput/MessageInput.js`: Formulario para escribir y enviar mensajes o archivos.
  - `frontend/src/components/ChatWindow/ChatWindow.js`: Muestra los mensajes del chat seleccionado.
  - `frontend/src/services/api.js`: Lógica para enviar y recibir mensajes/archivos.
  - `backend/src/app.js`: Endpoints `/api/mensajes`, `/api/mensajes/archivo`, `/api/descargar`.
  - `backend/uploads/`: Almacena los archivos subidos.
  - `backend/src/config/db.js`: Guarda y recupera mensajes y rutas de archivos.

### 4. Citar/Responder Mensajes (Hilos)
- **Descripción:** Permite responder a un mensaje específico, mostrando la cita en la interfaz.
- **Archivos involucrados:**
  - `frontend/src/components/MessageInput/MessageInput.js`: Permite seleccionar un mensaje a citar.
  - `frontend/src/components/ChatWindow/ChatWindow.js`: Muestra el mensaje citado junto al nuevo mensaje.
  - `frontend/src/services/api.js`: Envía la referencia del mensaje citado al backend.
  - `backend/src/app.js`: Lógica para guardar y recuperar mensajes citados.
  - `backend/src/config/db.js`: Relaciona mensajes con sus citas en la base de datos.

### 5. Subida y Descarga de Archivos
- **Descripción:** Los usuarios pueden enviar archivos y descargarlos desde el chat.
- **Archivos involucrados:**
  - `frontend/src/components/MessageInput/MessageInput.js`: Permite seleccionar y subir archivos.
  - `frontend/src/components/ChatWindow/ChatWindow.js`: Muestra enlaces de descarga para los archivos recibidos.
  - `frontend/src/services/api.js`: Lógica de subida y descarga de archivos.
  - `backend/src/app.js`: Endpoints para subir y descargar archivos.
  - `backend/uploads/`: Carpeta donde se almacenan los archivos.

### 6. Gestión de Amigos
- **Descripción:** Permite agregar amigos para iniciar nuevos chats.
- **Archivos involucrados:**
  - `frontend/src/components/UserProfile/UserProfile.js`: Formulario para agregar amigos.
  - `frontend/src/components/SidebarPanel/SidebarPanel.js`: Botón para abrir el formulario de agregar amigo.
  - `frontend/src/services/api.js`: Lógica para agregar amigos.
  - `backend/src/app.js`: Endpoint para agregar amigos y gestionar relaciones.
  - `backend/src/config/db.js`: Guarda las relaciones de amistad en la base de datos.

---

## OTROS ARCHIVOS
- **README.md**: Instrucciones de instalación y uso.
- **ExplicacionConsultasSQL.md**: Explicación detallada de las consultas SQL y el modelo de datos.
- **Creacion.sql**: Script de creación de la base de datos Oracle.

---

