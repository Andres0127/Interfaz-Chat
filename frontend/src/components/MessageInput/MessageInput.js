import React, { useRef, useState } from 'react';
import './MessageInput.css';
import { sendMensaje, sendArchivo } from '../../services/api';

const MessageInput = ({ user, selectedChat, onMessageSent, replyTo, onCancelReply }) => {
  const inputRef = useRef();
  const fileInputRef = useRef();
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    const texto = inputRef.current.value.trim();
    if (!texto || !selectedChat) return;
    setSending(true);
    await sendMensaje({
      remitente: user.CONSECUSER,
      destinatario: selectedChat.id,
      texto,
      men_usu_consecuser: replyTo ? replyTo.USU_CONSECUSER : undefined,
      men_consecuser: replyTo ? replyTo.CONSECUSER : undefined,
      men_consMensaje: replyTo ? replyTo.CONSMENSAJE : undefined
    });
    inputRef.current.value = '';
    setSending(false);
    if (onMessageSent) onMessageSent();
    if (onCancelReply) onCancelReply();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;
    setSending(true);
    await sendArchivo({
      remitente: user.CONSECUSER,
      destinatario: selectedChat.id,
      archivo: file
    });
    fileInputRef.current.value = '';
    setSending(false);
    if (onMessageSent) onMessageSent();
  };

  return (
    <div className="message-input">
      {replyTo && (
        <div className="message-input-reply">
          <span className="message-input-reply-label">Respondiendo a:</span>
          <span className="message-input-reply-text">{replyTo.LOCALIZACONTENIDO}</span>
          <button className="message-input-reply-cancel" onClick={onCancelReply} type="button">✕</button>
        </div>
      )}
      <form className="message-input-form" onSubmit={handleSend}>
        <input
          ref={inputRef}
          type="text"
          className="message-input-text"
          placeholder={selectedChat ? 'Escribe un mensaje...' : 'Selecciona un chat para enviar mensajes'}
          disabled={!selectedChat || sending}
        />
        <label className="message-input-file">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            disabled={!selectedChat || sending}
            onChange={handleFileChange}
          />
          <span role="img" aria-label="Adjuntar">📎</span>
        </label>
        <button type="submit" className="message-input-send" disabled={!selectedChat || sending}>
          Enviar
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
