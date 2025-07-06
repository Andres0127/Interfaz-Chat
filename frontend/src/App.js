import React, { useState } from 'react';
import Login from './pages/Login';
import Chat from './pages/Chat';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  // Cuando el usuario inicia sesión correctamente
  const handleLogin = (userData) => {
    setUser(userData);
  };

  return (
    <div className="App">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
}

export default App;
