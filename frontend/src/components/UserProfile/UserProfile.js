import React, { useState } from 'react';
import './UserProfile.css';
import { addAmigo } from '../../services/api';

// Componente que muestra la información del usuario y permite agregar amigos
const UserProfile = ({ user, showAddFriend, setShowAddFriend, onFriendAdded }) => {
  const [amigoUser, setAmigoUser] = useState(''); // Usuario a agregar
  const [msg, setMsg] = useState(''); // Mensaje de éxito/error
  const now = new Date();
  const fecha = now.toLocaleDateString();
  const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Lógica para agregar un amigo
  const handleAddAmigo = async () => {
    if (!amigoUser) return;
    const res = await addAmigo(user.CONSECUSER || user.consecuser, amigoUser);
    setMsg(res.success ? '¡Amigo agregado!' : res.error || 'Error');
    setAmigoUser('');
    setTimeout(() => setMsg(''), 2500);
    setShowAddFriend(false);
    if (res.success && onFriendAdded) onFriendAdded();
  };

  return (
    <div className="user-profile" style={{ padding: '1.2rem 1rem', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: '1rem', background: '#f7f7f7', position: 'relative' }}>
      {/* Logo y avatar del usuario */}
      <img src={process.env.PUBLIC_URL + '/logochat.png'} alt="Logo Chat" style={{ width: 38, height: 38, borderRadius: 10, marginRight: 10, boxShadow: '0 2px 8px #1976d222' }} />
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1976d2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: 22 }}>
        {user?.NOMBRE?.[0] || user?.nombre?.[0] || 'U'}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontWeight: 600, color: '#1565c0', fontSize: 18 }}>{user?.NOMBRE || user?.nombre || 'Usuario'}</div>
        <div style={{ fontSize: 13, color: '#888' }}>{fecha} {hora}</div>
      </div>
      {/* Popup para agregar amigo */}
      {showAddFriend && (
        <div className="add-friend-popup" style={{ left: 80, top: 20 }}>
          <input
            type="text"
            placeholder="Usuario a agregar"
            value={amigoUser}
            onChange={e => setAmigoUser(e.target.value)}
            style={{ marginRight: 8, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button onClick={handleAddAmigo} style={{ background: '#1565c0', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 600 }}>Agregar</button>
        </div>
      )}
      {/* Mensaje de éxito o error */}
      {msg && <div className="add-friend-msg">{msg}</div>}
    </div>
  );
};

export default UserProfile;
