import React, { useState, useCallback, useRef, useMemo } from 'react';
import { ViewType, Playlist } from './types';
import { I18nProvider } from './i18n/I18nContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { HomeView } from './components/HomeView';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { PlaylistDetail } from './components/PlaylistDetail';
import { NowPlayingView } from './components/NowPlayingView';
import { SettingsView } from './components/SettingsView';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import './App.css';

function AppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [prevView, setPrevView] = useState<ViewType>('home');
  const { userPlaylists, togglePlay, nextTrack, prevTrack, state, dispatch, audioRef } = usePlayer();
  const mainRef = useRef<HTMLDivElement>(null);

  const shortcuts = useMemo(() => ({
    togglePlay,
    nextTrack,
    prevTrack,
    volumeUp: () => dispatch({ type: 'SET_VOLUME', volume: Math.min(1, state.volume + 0.1) }),
    volumeDown: () => dispatch({ type: 'SET_VOLUME', volume: Math.max(0, state.volume - 0.1) }),
    toggleShuffle: () => dispatch({ type: 'TOGGLE_SHUFFLE' }),
    cycleRepeat: () => dispatch({ type: 'CYCLE_REPEAT' }),
    seekForward: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 5);
      }
    },
    seekBackward: () => {
      if (audioRef.current) {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
      }
    },
  }), [togglePlay, nextTrack, prevTrack, state.volume, dispatch, audioRef]);

  useKeyboardShortcuts(shortcuts, true);

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    setSelectedPlaylistId(null);
    setPrevView(view);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleSelectPlaylist = useCallback((playlist: Playlist) => {
    setSelectedPlaylistId(playlist.id);
    setCurrentView('playlist');
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPlaylistId(null);
    setCurrentView('home');
  }, []);

  const handleOpenNowPlaying = useCallback(() => {
    if (currentView !== 'nowplaying') {
      setPrevView(currentView);
      setCurrentView('nowplaying');
    }
  }, [currentView]);

  const handleCloseNowPlaying = useCallback(() => {
    setCurrentView(prevView);
  }, [prevView]);

  const selectedPlaylist = selectedPlaylistId
    ? userPlaylists.find(pl => pl.id === selectedPlaylistId) || null
    : null;

  function renderMainContent() {
    switch (currentView) {
      case 'nowplaying':
        return <NowPlayingView onBack={handleCloseNowPlaying} />;
      case 'home':
        return <HomeView onSelectPlaylist={handleSelectPlaylist} />;
      case 'search':
        return <SearchView onSelectPlaylist={handleSelectPlaylist} />;
      case 'library':
        return <LibraryView onSelectPlaylist={handleSelectPlaylist} />;
      case 'settings':
        return <SettingsView />;
      case 'playlist':
        if (selectedPlaylist) {
          return (
            <PlaylistDetail
              playlist={selectedPlaylist}
              onBack={handleBack}
            />
          );
        }
        return <HomeView onSelectPlaylist={handleSelectPlaylist} />;
      default:
        return <HomeView onSelectPlaylist={handleSelectPlaylist} />;
    }
  }

  return (
    <div className={`app ${currentView === 'nowplaying' ? 'nowplaying-active' : ''}`}>
      <div className="app-body">
        {currentView !== 'nowplaying' && (
          <>
            <Sidebar
              currentView={currentView === 'playlist' ? 'home' : currentView}
              onViewChange={handleViewChange}
              onSelectPlaylist={handleSelectPlaylist}
              collapsed={sidebarCollapsed}
            />
            <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
              </svg>
            </button>
          </>
        )}
        <main className={`main-content ${currentView === 'nowplaying' ? 'nowplaying-main' : ''}`} ref={mainRef}>
          {renderMainContent()}
        </main>
      </div>
      <PlayerBar onOpenNowPlaying={handleOpenNowPlaying} />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </I18nProvider>
  );
}
