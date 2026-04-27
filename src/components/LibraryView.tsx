import React, { useState } from 'react';
import { Playlist, Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { CreatePlaylistModal } from './CreatePlaylistModal';

interface LibraryViewProps {
  onSelectPlaylist: (playlist: Playlist) => void;
}

export function LibraryView({ onSelectPlaylist }: LibraryViewProps) {
  const { userSongs, userPlaylists, playPlaylist, playSong, deleteSong, createPlaylist } = usePlayer();
  const [tab, setTab] = useState<'songs' | 'playlists'>('playlists');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="library-view">
      <div className="library-header">
        <h1 className="library-title">音乐库</h1>
        <div className="library-tabs">
          <button className={`library-tab ${tab === 'playlists' ? 'active' : ''}`} onClick={() => setTab('playlists')}>
            歌单 ({userPlaylists.length})
          </button>
          <button className={`library-tab ${tab === 'songs' ? 'active' : ''}`} onClick={() => setTab('songs')}>
            歌曲 ({userSongs.length})
          </button>
        </div>
      </div>

      {tab === 'playlists' && (
        <div className="library-playlists">
          <button className="create-playlist-btn" onClick={() => setShowModal(true)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 3a1 1 0 011 1v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 011-1z"/>
            </svg>
            <span>新建歌单</span>
          </button>

          {userPlaylists.length === 0 && (
            <div className="library-empty">
              <p>还没有歌单，点击上方按钮创建一个</p>
            </div>
          )}

          <div className="library-grid">
            {userPlaylists.map(pl => (
              <div key={pl.id} className="playlist-card" onClick={() => onSelectPlaylist(pl)}>
                <div className="playlist-card-cover" style={{ background: pl.coverColor }}>
                  <div className="playlist-card-overlay">
                    <button className="play-button" onClick={(e) => { e.stopPropagation(); playPlaylist(pl); }}>
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                        <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7l15.3-8.3a.7.7 0 000-1.2L5.7 3z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="playlist-card-info">
                  <h3 className="playlist-card-title">{pl.name}</h3>
                  <p className="playlist-card-desc">{pl.songs.length} 首歌曲{pl.creator ? ` · ${pl.creator}` : ''}</p>
                </div>
              </div>
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
        </div>
      )}

      {tab === 'songs' && (
        <div className="library-songs">
          {userSongs.length === 0 ? (
            <div className="library-empty">
              <p>还没有导入歌曲，点击左侧「导入音乐」添加</p>
            </div>
          ) : (
            <div className="track-list">
              <div className="track-list-header">
                <span className="track-col-num">#</span>
                <span className="track-col-title">标题</span>
                <span className="track-col-artist">艺术家</span>
                <span className="track-col-album">专辑</span>
                <span className="track-col-duration">时长</span>
                <span className="track-col-action">操作</span>
              </div>
              <div className="track-list-body">
                {userSongs.map((song, idx) => (
                  <div key={song.id} className="track-row" onClick={() => playSong(song)}>
                    <span className="track-col-num">{idx + 1}</span>
                    <span className="track-col-title">
                      <div className="track-cover-mini" style={{ background: song.coverColor }} />
                      <div className="track-title-text">{song.title}</div>
                    </span>
                    <span className="track-col-artist">{song.artist}</span>
                    <span className="track-col-album">{song.album}</span>
                    <span className="track-col-duration">
                      {Math.floor(song.duration / 60)}:{String(Math.floor(song.duration % 60)).padStart(2, '0')}
                    </span>
                    <span className="track-col-action">
                      <button
                        className="row-action-btn"
                        onClick={(e) => { e.stopPropagation(); deleteSong(song.id); }}
                        title="删除"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M3 6h18v2H3V6zm2 2h14l-1 13H6L5 8zm4-4h6l1-1H8l1 1z"/>
                        </svg>
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
