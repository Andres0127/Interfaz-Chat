import React, { useEffect, useState } from 'react';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import MessageInput from '../components/MessageInput/MessageInput';

const GroupChat = ({ user, groupId, groupName, participants }) => {
  // Simula el objeto selectedChat igual que en ChatWindow para grupos
  const selectedChat = {
    tipo: 'grupo',
    CODGRUPO: groupId,
    name: groupName,
    participants
  };
  const [refreshMessages, setRefreshMessages] = useState(0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#ece5dd' }}>
      <ChatWindow user={user} selectedChat={selectedChat} refreshTrigger={refreshMessages} />
      <MessageInput user={user} selectedChat={selectedChat} onMessageSent={() => setRefreshMessages(r => r + 1)} />
    </div>
  );
};

export default GroupChat;
