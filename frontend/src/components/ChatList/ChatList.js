import React, { useEffect, useState } from 'react';
import './ChatList.css';
import { getChats } from '../../services/api';

const ChatList = ({ user, onSelectChat, selectedChat, refresh }) => {
  const [chats, setChats] = useState([]);

  // Polling para refrescar la lista de chats cada 2 segundos
  useEffect(() => {
    let interval;
    const fetchChats = () => {
      if (user && user.CONSECUSER) {
        getChats(user.CONSECUSER).then(setChats);
      }
    };
    fetchChats();
    interval = setInterval(fetchChats, 2000);
    return () => clearInterval(interval);
  }, [user, refresh]);

  return (
    <div className="chat-list">
      <div style={{ fontWeight: 600, color: '#075e54', fontSize: 16, padding: '1rem 1.2rem 0.5rem' }}>Chats</div>
      <div>
        {chats.length === 0 ? (
          <div style={{ color: '#888', padding: '1rem' }}>No tienes chats aún.</div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.TIPO === 'grupo' ? `g${chat.CODGRUPO}` : chat.CONSECUSER}
              className={`chat-list-item${selectedChat && ((chat.TIPO === 'grupo' && selectedChat.id === `g${chat.CODGRUPO}`) || (chat.TIPO === 'amigo' && selectedChat.id === chat.CONSECUSER)) ? ' selected' : ''}`}
              onClick={() => onSelectChat(
                chat.TIPO === 'grupo'
                  ? { id: `g${chat.CODGRUPO}`, name: chat.NOMGRUPO, tipo: 'grupo', CODGRUPO: chat.CODGRUPO }
                  : { id: chat.CONSECUSER, name: chat.NOMBRE + (chat.APELLIDO ? ' ' + chat.APELLIDO : ''), tipo: 'amigo' }
              )}
            >
              <div className="chat-list-avatar">
                {chat.TIPO === 'grupo' ? (
                  <span role="img" aria-label="Grupo">👥</span>
                ) : (
                  chat.NOMBRE ? chat.NOMBRE[0] : '?' 
                )}
              </div>
              <div className="chat-list-info">
                <div className="chat-list-name">
                  {chat.TIPO === 'grupo' ? chat.NOMGRUPO : chat.NOMBRE + (chat.APELLIDO ? ' ' + chat.APELLIDO : '')}
                </div>
                <div className="chat-list-preview" style={{ color: '#bbb', fontSize: 13, marginTop: 2 }}>
                  {chat.ULTIMO_TEXTO ? (
                    <>
                      <span style={{ color: '#888' }}>
                        {chat.ULTIMO_REMITENTE === user.CONSECUSER
                          ? 'Tú'
                          : chat.TIPO === 'grupo'
                            ? (chat.ULTIMO_REMITENTE_NOMBRE ? chat.ULTIMO_REMITENTE_NOMBRE + (chat.ULTIMO_REMITENTE_APELLIDO ? ' ' + chat.ULTIMO_REMITENTE_APELLIDO : '') : '')
                            : (chat.NOMBRE + (chat.APELLIDO ? ' ' + chat.APELLIDO : ''))}
                        :
                      </span>
                      <span style={{ color: '#bbb', marginLeft: 4 }}>{chat.ULTIMO_TEXTO}</span>
                    </>
                  ) : (
                    <span style={{ color: '#bbb' }}>Sin mensajes</span>
                  )}
                </div>
              </div>
              <div className="chat-list-time">
                {chat.ULTIMO_MENSAJE ? (
                  <span style={{ color: '#888', fontSize: 12 }}>
                    {(() => {
                      const d = new Date(chat.ULTIMO_MENSAJE);
                      const hoy = new Date();
                      if (d.toDateString() === hoy.toDateString()) {
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
