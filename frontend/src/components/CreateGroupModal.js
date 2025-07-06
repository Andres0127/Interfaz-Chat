import React, { useState } from 'react';
import './CreateGroupModal.css';

const CreateGroupModal = ({ friends, isOpen, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleFriendToggle = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (groupName && selectedFriends.length > 0) {
      onCreate({ name: groupName, members: selectedFriends });
      setGroupName('');
      setSelectedFriends([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Crear nuevo grupo</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre del grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <div className="friends-list">
            <p>Selecciona amigos:</p>
            {friends.map((friend) => (
              <label key={friend.id}>
                <input
                  type="checkbox"
                  checked={selectedFriends.includes(friend.id)}
                  onChange={() => handleFriendToggle(friend.id)}
                />
                {friend.name}
              </label>
            ))}
          </div>
          <div className="modal-actions">
            <button type="submit">Crear grupo</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
