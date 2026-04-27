import React, { useState } from 'react';
import { ViewType, Playlist } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { CreatePlaylistModal } from './CreatePlaylistModal';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  collapsed: boolean;
}

export function Sidebar({ currentView, onViewChange, onSelectPlaylist, collapsed }: SidebarProps) {
  const { userPlaylists, createPlaylist, importFiles } = usePlayer();
  const [showModal, setShowModal] = useState(false);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      importFiles(e.target.files);
      e.target.value = '';
    }
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        {!collapsed && <span className="sidebar-logo-text">Music</span>}
      </div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => onViewChange('home')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12.5 3.247a1 1 0 00-1 0L4 7.577V20h4.5v-6a1.5 1.5 0 013 0v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 013 0l7.5 4.33a2 2 0 011 1.732V21a1 1 0 01-1 1h-6.5a1 1 0 01-1-1v-6h-1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V7.577a2 2 0 011-1.732l7.5-4.33z"/>
          </svg>
          {!collapsed && <span>首页</span>}
        </button>
        <button
          className={`sidebar-nav-item ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => onViewChange('search')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M10.533 1.279c-5.18 0-9.407 4.14-9.407 9.279s4.226 9.279 9.407 9.279c2.234 0 4.29-.77 5.907-2.057l4.42 4.42a1 1 0 101.415-1.414l-4.42-4.42a9.18 9.18 0 002.092-5.808c0-5.14-4.226-9.28-9.414-9.28zm0 2c4.115 0 7.407 3.274 7.407 7.279 0 4.005-3.292 7.279-7.407 7.279-4.115 0-7.407-3.274-7.407-7.279 0-4.005 3.292-7.279 7.407-7.279z"/>
          </svg>
          {!collapsed && <span>搜索</span>}
        </button>
        <button
          className={`sidebar-nav-item ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => onViewChange('library')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M14.5 2.134a1 1 0 011 0l6 3.464a1 1 0 01.5.866V21a1 1 0 01-1 1h-6a1 1 0 01-1-1V3a1 1 0 01.5-.866zM16 4.732V20h4V7.041l-4-2.309zM3 22a1 1 0 01-1-1V3a1 1 0 012 0v18a1 1 0 01-1 1zm5 0a1 1 0 01-1-1V3a1 1 0 012 0v18a1 1 0 01-1 1z"/>
          </svg>
          {!collapsed && <span>音乐库</span>}
        </button>
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-actions">
        <button className="sidebar-action-btn" onClick={() => document.getElementById('import-audio-input')?.click()}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 3a1 1 0 011 1v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 011-1z"/>
          </svg>
          {!collapsed && <span>导入音乐</span>}
        </button>
        <button className="sidebar-action-btn" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 3a1 1 0 011 1v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 011-1z"/>
          </svg>
          {!collapsed && <span>创建歌单</span>}
        </button>
      </div>

      <input
        id="import-audio-input"
        type="file"
        accept="audio/*"
        multiple
        onChange={handleImport}
        style={{ display: 'none' }}
      />

      {!collapsed && (
        <div className="sidebar-section-title">你的歌单</div>
      )}

      <div className="sidebar-playlists">
        {!collapsed && userPlaylists.length === 0 && (
          <div className="sidebar-empty">还没有歌单，点击上方创建</div>
        )}
        {userPlaylists.map(pl => (
          <button
            key={pl.id}
            className="sidebar-playlist-item"
            onClick={() => onSelectPlaylist(pl)}
            title={pl.name}
          >
            {pl.name}
          </button>
        ))}
      </div>

      {showModal && (
        <CreatePlaylistModal
          onClose={() => setShowModal(false)}
          onCreate={(data) => {
            createPlaylist(data);
            setShowModal(false);
          }}
        />
      )}
    </aside>
  );
}
