import React, { useState, useEffect } from 'react';
import UserProfile from '../components/UserProfile/UserProfile';
import ChatList from '../components/ChatList/ChatList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import MessageInput from '../components/MessageInput/MessageInput';
import SidebarPanel from '../components/SidebarPanel/SidebarPanel';
import CreateGroupModal from '../components/CreateGroupModal';
import { getAmigos, crearGrupo } from '../services/api';
import '../App.css';

const Chat = ({ user }) => {
  // Estado para el chat/grupo seleccionado
  const [selectedChat, setSelectedChat] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [refreshChats, setRefreshChats] = useState(false);
  const [refreshMessages, setRefreshMessages] = useState(0);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    if (user) {
      getAmigos(user.CONSECUSER).then((data) => {
        // Transformar los datos para el modal
        const amigosFormateados = data.map(amigo => ({
          id: amigo.CONSECUSER,
          name: amigo.NOMBRE + (amigo.APELLIDO ? ' ' + amigo.APELLIDO : ''),
        }));
        setFriends(amigosFormateados);
      });
    }
  }, [user, refreshChats]);

  // Función para refrescar la lista de amigos
  const handleFriendAdded = () => {
    setRefreshChats(r => !r);
  };

  // Función para refrescar los mensajes y la lista de chats
  const handleMessageSent = () => {
    setRefreshMessages(r => r + 1);
    setRefreshChats(r => !r); // Refresca la lista de chats para mostrar el último mensaje
  };

  // Manejar creación de grupo
  const handleCreateGroup = async (groupData) => {
    // Llama al backend para crear el grupo
    await crearGrupo({
      nombre: groupData.name,
      miembros: groupData.members,
      creador: user.CONSECUSER
    });
    setShowCreateGroup(false);
    setRefreshChats(r => !r); // Refresca la lista de chats para mostrar el grupo
  };

  return (
    <div style={{ display: 'flex', height: '90vh', width: '90vw', background: '#f0f2f5', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
      {/* Panel lateral izquierdo */}
      <SidebarPanel onAddFriend={() => setShowAddFriend(true)} onCreateGroup={() => setShowCreateGroup(true)} />
      {/* Sidebar de chats y perfil */}
      <div style={{ width: '340px', background: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <UserProfile user={user} showAddFriend={showAddFriend} setShowAddFriend={setShowAddFriend} onFriendAdded={handleFriendAdded} />
        <ChatList user={user} onSelectChat={setSelectedChat} selectedChat={selectedChat} refresh={refreshChats} />
      </div>
      {/* Ventana de chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ece5dd' }}>
        <ChatWindow user={user} selectedChat={selectedChat} refreshTrigger={refreshMessages} />
        <MessageInput user={user} selectedChat={selectedChat} onMessageSent={handleMessageSent} />
      </div>
      <CreateGroupModal
        friends={friends}
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default Chat;
