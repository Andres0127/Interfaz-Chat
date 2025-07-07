import React, { useState } from 'react';
import { login, register } from '../services/api';

const Login = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  // Campos para registro
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [registerMsg, setRegisterMsg] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await login(user, password);
      if (userData && !userData.error) {
        onLogin(userData);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterMsg('');
    setRegisterSuccess(null);
    const data = { user, password, nombre, apellido, email, celular };
    const res = await register(data);
    setRegisterSuccess(res.success);
    if (res.success) {
      setRegisterMsg('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      setShowRegister(false);
      setUser(''); setPassword(''); setNombre(''); setApellido(''); setEmail(''); setCelular('');
    } else {
      setRegisterMsg(res.error || 'Error al registrar usuario');
    }
  };

  return (
    <div className="login-container">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <img src={process.env.PUBLIC_URL + '/logochat.png'} alt="Logo Chat" style={{ width: 90, height: 90, borderRadius: 16, boxShadow: '0 2px 8px #1976d222' }} />
      </div>
      {!showRegister ? (
        <>
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit">Entrar</button>
          </form>
          <button style={{marginTop: '1rem'}} onClick={() => setShowRegister(true)}>Registrarse</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {registerMsg && <p style={{ color: 'green' }}>{registerMsg}</p>}
        </>
      ) : (
        <>
          <h2>Registro de Usuario</h2>
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} required />
            <input type="password" placeholder="Contraseña (máx 8)" value={password} maxLength={8} onChange={e => setPassword(e.target.value)} required />
            <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required />
            <input type="text" placeholder="Apellido" value={apellido} onChange={e => setApellido(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="text" placeholder="Celular" value={celular} onChange={e => setCelular(e.target.value)} />
            <button type="submit">Registrar</button>
          </form>
          <button style={{marginTop: '1rem'}} onClick={() => setShowRegister(false)}>Volver al login</button>
          {registerMsg && (
            <p style={{ color: registerSuccess ? 'green' : 'red' }}>{registerMsg}</p>
          )}
        </>
      )}
    </div>
  );
};

export default Login;
