import React, { useEffect, useState } from 'react';
import './ChatList.css';
import { getAmigos } from '../../services/api';

// Componente que muestra la lista de amigos/chats
const ChatList = ({ user, onSelectChat, selectedChat, refresh }) => {
  const [amigos, setAmigos] = useState([]);

  // Polling para refrescar la lista de chats cada 2 segundos
  useEffect(() => {
    let interval;
    const fetchAmigos = () => {
      if (user && user.CONSECUSER) {
        getAmigos(user.CONSECUSER).then(setAmigos);
      }
    };
    fetchAmigos();
    interval = setInterval(fetchAmigos, 2000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  return (
    <div className="chat-list">
      <div style={{ fontWeight: 600, color: '#075e54', fontSize: 16, padding: '1rem 1.2rem 0.5rem' }}>Chats</div>
      <div>
        {/* Si no hay amigos, muestra mensaje. Si hay, muestra la lista */}
        {amigos.length === 0 ? (
          <div style={{ color: '#888', padding: '1rem' }}>No tienes amigos aún.</div>
        ) : (
          amigos.map(chat => (
            <div
              key={chat.CONSECUSER}
              className={`chat-list-item${selectedChat && selectedChat.id === chat.CONSECUSER ? ' selected' : ''}`}
              onClick={() => onSelectChat({ id: chat.CONSECUSER, name: chat.NOMBRE + (chat.APELLIDO ? ' ' + chat.APELLIDO : '') })}
            >
              {/* Avatar y nombre del amigo */}
              <div className="chat-list-avatar">{chat.NOMBRE[0]}</div>
              <div className="chat-list-info">
                <div className="chat-list-name">{chat.NOMBRE} {chat.APELLIDO}</div>
                {/* Muestra el último mensaje enviado/recibido */}
                <div className="chat-list-preview" style={{ color: '#bbb', fontSize: 13, marginTop: 2 }}>
                  {chat.ULTIMO_TEXTO ? (
                    <>
                      <span style={{ color: '#888' }}>
                        ~ {chat.ULTIMO_REMITENTE === user.CONSECUSER ? 'Tú' : (chat.NOMBRE + (chat.APELLIDO ? ' ' + chat.APELLIDO : ''))}:
                      </span>
                      <span style={{ color: '#bbb', marginLeft: 4 }}>{chat.ULTIMO_TEXTO}</span>
                    </>
                  ) : (
                    <span style={{ color: '#bbb' }}>Sin mensajes</span>
                  )}
                </div>
              </div>
              {/* Hora del último mensaje */}
              <div className="chat-list-time">
                {chat.ULTIMO_MENSAJE ? (
                  <span style={{ color: '#888', fontSize: 12 }}>
                    {(() => {
                      const d = new Date(chat.ULTIMO_MENSAJE);
                      const hoy = new Date();
                      if (d.toDateString() === hoy.toDateString()) {
                        // Formato hora WhatsApp
                        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace('.', ':').toLowerCase();
                      } else {
                        return d.toLocaleDateString();
                      }
                    })()}
                  </span>
                ) : ''}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
