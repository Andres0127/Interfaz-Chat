import React, { useRef } from 'react';
import './MessageInput.css';
import { sendMensaje, sendMensajeGrupo } from '../../services/api';

const MessageInput = ({ user, selectedChat, onMessageSent }) => {
  const inputRef = useRef();

  const handleSend = async (e) => {
    e.preventDefault();
    const texto = inputRef.current.value.trim();
    if (!texto || !selectedChat) return;
    if (selectedChat.tipo === 'grupo') {
      await sendMensajeGrupo({
        remitente: user.CONSECUSER,
        codgrupo: selectedChat.CODGRUPO,
        texto
      });
    } else {
      await sendMensaje({
        remitente: user.CONSECUSER,
        destinatario: selectedChat.id,
        texto
      });
    }
    inputRef.current.value = '';
    if (onMessageSent) onMessageSent();
  };

  return (
    <div className="message-input">
      <form className="message-input-form" onSubmit={handleSend}>
        <input
          ref={inputRef}
          type="text"
          className="message-input-text"
          placeholder={selectedChat ? 'Escribe un mensaje...' : 'Selecciona un chat para enviar mensajes'}
          disabled={!selectedChat}
        />
        <label className="message-input-file">
          <input type="file" style={{ display: 'none' }} disabled={!selectedChat} />
          <span role="img" aria-label="Adjuntar">📎</span>
        </label>
        <button type="submit" className="message-input-send" disabled={!selectedChat}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
