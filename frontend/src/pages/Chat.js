import React, { useState } from 'react';
import UserProfile from '../components/UserProfile/UserProfile';
import ChatList from '../components/ChatList/ChatList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import MessageInput from '../components/MessageInput/MessageInput';
import SidebarPanel from '../components/SidebarPanel/SidebarPanel';
import '../App.css';

const Chat = ({ user }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [refreshChats, setRefreshChats] = useState(false);
  const [refreshMessages, setRefreshMessages] = useState(0);
  const [replyTo, setReplyTo] = useState(null);

  const handleFriendAdded = () => {
    setRefreshChats(r => !r);
  };

  const handleMessageSent = () => {
    setRefreshMessages(r => r + 1);
    setRefreshChats(r => !r);
  };

  return (
    <div style={{ display: 'flex', height: '90vh', width: '90vw', background: '#f0f2f5', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
      {/* Panel lateral izquierdo */}
      <SidebarPanel onAddFriend={() => setShowAddFriend(true)} />
      {/* Sidebar de chats y perfil */}
      <div style={{ width: '340px', background: '#fff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
        <UserProfile user={user} showAddFriend={showAddFriend} setShowAddFriend={setShowAddFriend} onFriendAdded={handleFriendAdded} />
        <ChatList user={user} onSelectChat={setSelectedChat} selectedChat={selectedChat} refresh={refreshChats} />
      </div>
      {/* Ventana de chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ece5dd' }}>
        <ChatWindow user={user} selectedChat={selectedChat} refreshTrigger={refreshMessages} onReply={setReplyTo} />
        <MessageInput user={user} selectedChat={selectedChat} onMessageSent={handleMessageSent} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
      </div>
    </div>
  );
};

export default Chat;
