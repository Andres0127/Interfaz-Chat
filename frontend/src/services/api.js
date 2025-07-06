// Función para login de usuario
export const login = async (user, password) => {
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password })
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};

// Función para registrar usuario (sin codubica)
export const register = async (data) => {
  try {
    const response = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error de red' };
  }
};

// Función para obtener ubicaciones
export const getUbicaciones = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/ubicaciones');
    return await response.json();
  } catch (error) {
    return [];
  }
};

// Obtener lista de amigos del usuario autenticado
export const getAmigos = async (consecuser) => {
  try {
    const response = await fetch(`http://localhost:3001/api/amigos/${consecuser}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};

// Función para agregar un amigo
export const addAmigo = async (consecuser, amigoUser) => {
  try {
    const response = await fetch('http://localhost:3001/api/amigos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consecuser, amigoUser })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error de red' };
  }
};

// Enviar mensaje entre usuarios
export const sendMensaje = async ({ remitente, destinatario, texto }) => {
  try {
    const response = await fetch('http://localhost:3001/api/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remitente, destinatario, texto })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error de red' };
  }
};

// Obtener mensajes entre dos usuarios (con paginación)
export const getMensajes = async (user1, user2, limit = 10) => {
  try {
    const response = await fetch(`http://localhost:3001/api/mensajes/${user1}/${user2}?offset=${limit}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};

// Crear grupo
export const crearGrupo = async ({ nombre, miembros, creador }) => {
  try {
    const response = await fetch('http://localhost:3001/api/grupos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, miembros, creador })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error de red' };
  }
};

// Obtener todos los chats (amigos y grupos)
export const getChats = async (consecuser) => {
  try {
    const response = await fetch(`http://localhost:3001/api/chats/${consecuser}`);
    return await response.json();
  } catch (error) {
    return [];
  }
};

// Enviar mensaje a grupo
export const sendMensajeGrupo = async ({ remitente, codgrupo, texto }) => {
  try {
    const response = await fetch('http://localhost:3001/api/mensajes/grupo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remitente, codgrupo, texto })
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error de red' };
  }
};

// Obtener mensajes de grupo
export const getMensajesGrupo = async (codgrupo, limit = 10) => {
  try {
    const response = await fetch(`http://localhost:3001/api/mensajes/grupo/${codgrupo}?offset=${limit}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
};
