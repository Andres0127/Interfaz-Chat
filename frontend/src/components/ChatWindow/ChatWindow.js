import React, { useEffect, useState, useRef } from 'react';
import './ChatWindow.css';
import { getMensajes } from '../../services/api';

const ChatWindow = ({ user, selectedChat, refreshTrigger }) => {
  const [mensajes, setMensajes] = useState([]);
  const [limit, setLimit] = useState(10);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Polling para refresco automático cada 2 segundos
  useEffect(() => {
    let interval;
    const fetchMensajes = () => {
      if (user && selectedChat) {
        getMensajes(user.CONSECUSER, selectedChat.id, limit).then(setMensajes);
      } else {
        setMensajes([]);
      }
    };
    fetchMensajes();
    if (user && selectedChat) {
      interval = setInterval(fetchMensajes, 2000);
    }
    return () => clearInterval(interval);
  }, [user, selectedChat, refreshTrigger, limit]);

  // Mostrar botón de scroll si no estamos al final
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
      setShowScrollBtn(!atBottom);
    };
    container.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [mensajes]);

  const handleVerMas = () => {
    setLimit(l => l + 10);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="chat-window">
      {/* Header del chat */}
      <div className="chat-window-header">
        <div className="chat-window-avatar">{selectedChat ? selectedChat.name[0] : '?'}</div>
        <div className="chat-window-title">{selectedChat ? selectedChat.name : 'Selecciona un chat'}</div>
      </div>
      {/* Mensajes */}
      <div className="chat-window-messages" ref={messagesContainerRef}>
        {selectedChat ? (
          mensajes.length === 0 ? (
            <div className="chat-window-empty">No hay mensajes. Escribe para iniciar la conversación.</div>
          ) : (
            <>
              {mensajes.length >= limit && (
                <button className="chat-window-more" onClick={handleVerMas}>
                  Ver más mensajes
                </button>
              )}
              {mensajes.map((msg, idx) => (
                <div
                  key={msg.USU_CONSECUSER + msg.CONSMENSAJE + idx}
                  className={`chat-message ${msg.USU_CONSECUSER === user.CONSECUSER ? 'sent' : 'received'}`}
                >
                  <div className="chat-message-text">{msg.LOCALIZACONTENIDO}</div>
                  <div className="chat-message-time">{msg.FECHAREGMEN ? new Date(msg.FECHAREGMEN).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                </div>
              ))}
            </>
          )
        ) : (
          <div className="chat-window-empty">Selecciona un chat para ver los mensajes</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {showScrollBtn && (
        <button className="chat-window-scroll-bottom" onClick={scrollToBottom} title="Ir al último mensaje">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 10 12 16 18 10" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChatWindow;
