import React, { useEffect, useState } from 'react';
import './ChatList.css';
import { getAmigos } from '../../services/api';

const ChatList = ({ user, onSelectChat, selectedChat, refresh }) => {
  const [amigos, setAmigos] = useState([]);

  useEffect(() => {
    if (user && user.CONSECUSER) {
      getAmigos(user.CONSECUSER).then(setAmigos);
    }
  }, [user, refresh]);

  return (
    <div className="chat-list">
      <div style={{ fontWeight: 600, color: '#075e54', fontSize: 16, padding: '1rem 1.2rem 0.5rem' }}>Chats</div>
      <div>
        {amigos.length === 0 ? (
          <div style={{ color: '#888', padding: '1rem' }}>No tienes amigos aún.</div>
        ) : (
          amigos.map(chat => (
            <div
              key={chat.CONSECUSER}
              className={`chat-list-item${selectedChat && selectedChat.id === chat.CONSECUSER ? ' selected' : ''}`}
              onClick={() => onSelectChat({ id: chat.CONSECUSER, name: chat.NOMBRE + (chat.APELLIDO ? ' ' + chat.APELLIDO : '') })}
            >
              <div className="chat-list-avatar">{chat.NOMBRE[0]}</div>
              <div className="chat-list-info">
                <div className="chat-list-name">{chat.NOMBRE} {chat.APELLIDO}</div>
                <div className="chat-list-last">&nbsp;</div>
              </div>
              <div className="chat-list-time">&nbsp;</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
