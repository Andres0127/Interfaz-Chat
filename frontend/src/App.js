import React, { useState } from 'react';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

// Componente principal de la aplicación
// Controla si el usuario está logueado y muestra el login o la interfaz de chat
function App() {
  // Estado para almacenar el usuario autenticado
  const [user, setUser] = useState(null);

  // Función que se ejecuta cuando el usuario inicia sesión correctamente
  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <div className="App">
      {/* Si no hay usuario, muestra el login. Si hay usuario, muestra el chat */}
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
}

export default App;
