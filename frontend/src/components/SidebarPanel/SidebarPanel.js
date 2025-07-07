import React from 'react';
import './SidebarPanel.css';

const SidebarPanel = ({ onAddFriend }) => {
  return (
    <div className="sidebar-panel">
      <button className="sidebar-btn" title="Agregar amigo" onClick={onAddFriend}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#075e54" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/>
          <g>
            <circle cx="19" cy="7" r="3" fill="#fff" stroke="#075e54" strokeWidth="1.5"/>
            <line x1="19" y1="6" x2="19" y2="8" stroke="#075e54" strokeWidth="1.5"/>
            <line x1="18" y1="7" x2="20" y2="7" stroke="#075e54" strokeWidth="1.5"/>
          </g>
        </svg>
      </button>
    </div>
  );
};

export default SidebarPanel;
