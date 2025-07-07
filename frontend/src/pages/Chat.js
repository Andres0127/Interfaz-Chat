import React, { useState } from 'react';
import UserProfile from '../components/UserProfile/UserProfile';
import ChatList from '../components/ChatList/ChatList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import MessageInput from '../components/MessageInput/MessageInput';
import SidebarPanel from '../components/SidebarPanel/SidebarPanel';
import '../App.css';

// Componente principal de la interfaz de chat
// Orquesta la selección de chats, refresco de mensajes y lógica de responder/citar mensajes
const Chat = ({ user }) => {
  // Estado para el chat seleccionado
  const [selectedChat, setSelectedChat] = useState(null);
  // Estado para mostrar el popup de agregar amigo
  const [showAddFriend, setShowAddFriend] = useState(false);
  // Estado para refrescar la lista de chats
  const [refreshChats, setRefreshChats] = useState(false);
  // Estado para refrescar los mensajes
  const [refreshMessages, setRefreshMessages] = useState(0);
  // Estado para el mensaje a citar/responder
  const [replyTo, setReplyTo] = useState(null);

  // Se ejecuta cuando se agrega un amigo
  const handleFriendAdded = () => {
    setRefreshChats(r => !r);
  };

  // Se ejecuta cuando se envía un mensaje
  const handleMessageSent = () => {
    setRefreshMessages(r => r + 1);
    setRefreshChats(r => !r);
  };

  return (
    <div style={{ display: 'flex', height: '90vh', width: '90vw', background: '#f0f2f5', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
      {/* Panel lateral izquierdo: botón para agregar amigos */}
      <SidebarPanel onAddFriend={() => setShowAddFriend(true)} />
      {/* Sidebar de chats y perfil */}
      <div style={{ width: '340px', background: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <UserProfile user={user} showAddFriend={showAddFriend} setShowAddFriend={setShowAddFriend} onFriendAdded={handleFriendAdded} />
        <ChatList user={user} onSelectChat={setSelectedChat} selectedChat={selectedChat} refresh={refreshChats} />
      </div>
      {/* Ventana de chat y barra de input */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ece5dd' }}>
        <ChatWindow user={user} selectedChat={selectedChat} refreshTrigger={refreshMessages} onReply={setReplyTo} />
        <MessageInput user={user} selectedChat={selectedChat} onMessageSent={handleMessageSent} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
      </div>
    </div>
  );
};

export default Chat;
