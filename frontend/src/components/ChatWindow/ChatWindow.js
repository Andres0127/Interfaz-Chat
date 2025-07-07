import React, { useEffect, useState, useRef } from 'react';
import './ChatWindow.css';
import { getMensajes } from '../../services/api';

// Componente que muestra la ventana de mensajes del chat seleccionado
const ChatWindow = ({ user, selectedChat, refreshTrigger, onReply }) => {
  const [mensajes, setMensajes] = useState([]); // Lista de mensajes
  const [limit, setLimit] = useState(10); // Límite de mensajes a mostrar (paginación)
  const [showScrollBtn, setShowScrollBtn] = useState(false); // Mostrar botón de scroll
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevChatRef = useRef();
  const prevLengthRef = useRef();

  // Polling para refresco automático de mensajes cada 2 segundos
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

  // Scroll automático al último mensaje solo al cambiar de chat o al cargar más mensajes
  useEffect(() => {
    if (selectedChat !== prevChatRef.current || mensajes.length > (prevLengthRef.current || 0)) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    }
    prevChatRef.current = selectedChat;
    prevLengthRef.current = mensajes.length;
  }, [selectedChat, mensajes]);

  // Cargar más mensajes (paginación)
  const handleVerMas = () => {
    setLimit(l => l + 10);
  };

  // Scroll al fondo
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Permitir seleccionar un mensaje para responder (doble clic)
  const handleReply = (msg) => {
    if (onReply) onReply(msg);
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
                  onDoubleClick={() => handleReply(msg)}
                  title="Doble clic para responder"
                >
                  {/* Mostrar mensaje citado si existe */}
                  {msg.mensaje_citado && (
                    <div className="chat-message-quote">
                      <span className="chat-message-quote-user">
                        {msg.mensaje_citado.USU_CONSECUSER === user.CONSECUSER ? 'Tú' : (selectedChat && selectedChat.name ? selectedChat.name : 'Usuario')}
                      </span>
                      <span className="chat-message-quote-text">{msg.mensaje_citado.LOCALIZACONTENIDO}</span>
                    </div>
                  )}
                  {/* Mostrar archivo o texto */}
                  {msg.IDTIPOCONTENIDO === '1' && msg.LOCALIZACONTENIDO ? (
                    <a
                      href={`http://localhost:3001/api/descargar?ruta=${encodeURIComponent(msg.LOCALIZACONTENIDO)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-message-file-link"
                    >
                      {msg.IDTIPOARCHIVO ? `${msg.IDTIPOARCHIVO} - ` : ''}{msg.LOCALIZACONTENIDO.split(/[/\\]/).pop()}
                    </a>
                  ) : (
                    <div className="chat-message-text">{msg.LOCALIZACONTENIDO}</div>
                  )}
                  {/* Hora del mensaje */}
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
      {/* Botón para hacer scroll al fondo */}
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
