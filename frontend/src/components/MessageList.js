import React from 'react';

const MessageList = ({ messages, userId }) => (
  <div className="message-list">
    {messages.length === 0 ? (
      <div className="chat-window-empty">No hay mensajes. Escribe para iniciar la conversación.</div>
    ) : (
      messages.map(msg => (
        <div
          key={msg.id}
          className={`chat-message ${msg.senderId === userId ? 'sent' : 'received'}`}
        >
          <div className="chat-message-sender" style={{ fontSize: 12, color: '#128c7e', fontWeight: 600, marginBottom: 2 }}>
            {msg.senderId === userId ? 'Tú' : msg.senderName}
          </div>
          <div className="chat-message-text">{msg.text}</div>
          <div className="chat-message-time">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ))
    )}
  </div>
);

export default MessageList;
