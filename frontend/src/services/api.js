// Funciones de acceso a la API del backend para todas las operaciones principales

// Login de usuario
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

// Registro de usuario
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

// Obtener ubicaciones (no usado en la app principal)
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

// Agregar un amigo por nombre de usuario
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

// Enviar mensaje de texto (y cita si corresponde)
export const sendMensaje = async ({ remitente, destinatario, texto, men_usu_consecuser, men_consecuser, men_consMensaje }) => {
  try {
    const response = await fetch('http://localhost:3001/api/mensajes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remitente, destinatario, texto, men_usu_consecuser, men_consecuser, men_consMensaje })
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

// Enviar archivo entre usuarios
export const sendArchivo = async ({ remitente, destinatario, archivo }) => {
  const formData = new FormData();
  formData.append('remitente', remitente);
  formData.append('destinatario', destinatario);
  formData.append('archivo', archivo);
  try {
    const response = await fetch('http://localhost:3001/api/mensajes/archivo', {
      method: 'POST',
      body: formData
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Error de red' };
  }
};
