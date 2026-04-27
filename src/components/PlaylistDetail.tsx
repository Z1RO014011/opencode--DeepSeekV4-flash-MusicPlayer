import React, { useState } from 'react';
import { Playlist, Song } from '../types';
import { usePlayer, LIKED_PLAYLIST_ID } from '../context/PlayerContext';

interface PlaylistDetailProps {
  playlist: Playlist;
  onBack: () => void;
}

export function PlaylistDetail({ playlist, onBack }: PlaylistDetailProps) {
  const { playPlaylist, playSong, removeSongFromPlaylist, deletePlaylist, renamePlaylist, userSongs, addSongsToPlaylist } = usePlayer();
  const isLikedPlaylist = playlist.id === LIKED_PLAYLIST_ID;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(playlist.name);
  const [showAddSongs, setShowAddSongs] = useState(false);

  function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h} 小时 ${m} 分钟` : `${m} 分钟`;
  }

  const totalDuration = playlist.songs.reduce((acc, s) => acc + s.duration, 0);

  function handleRename() {
    if (editName.trim() && editName.trim() !== playlist.name) {
      renamePlaylist(playlist.id, editName.trim());
    }
    setIsEditing(false);
  }

  function handleDelete() {
    deletePlaylist(playlist.id);
    onBack();
  }

  function handleAddSong(song: Song) {
    addSongsToPlaylist(playlist.id, [song]);
  }

  const availableSongs = userSongs.filter(s => !playlist.songs.some(ps => ps.id === s.id));

  return (
    <div className="playlist-detail">
      <div className="playlist-detail-hero" style={{ background: playlist.coverColor }}>
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M15.5 3.5a1 1 0 010 1.5L9.42 12l6.08 7a1 1 0 01-1.5 1.5l-6.5-7.5a1 1 0 010-1.5l6.5-7.5a1 1 0 011.5 0z"/>
          </svg>
        </button>
        <div className="playlist-detail-info">
          <span className="playlist-detail-label">歌单</span>
          {isEditing && !isLikedPlaylist ? (
            <div className="playlist-rename">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setIsEditing(false); }}
                autoFocus
              />
              <button onClick={handleRename}>保存</button>
              <button onClick={() => setIsEditing(false)}>取消</button>
            </div>
          ) : (
            <h1 className="playlist-detail-title" onClick={() => { if (!isLikedPlaylist) { setEditName(playlist.name); setIsEditing(true); } }}>
              {playlist.name}
            </h1>
          )}
          <p className="playlist-detail-desc">{playlist.description}</p>
          <p className="playlist-detail-meta">
            {playlist.songs.length} 首歌曲 · 约 {formatDuration(totalDuration)}
            {playlist.creator && <> · {playlist.creator}</>}
          </p>
        </div>
      </div>

      <div className="playlist-detail-actions">
        <button className="playlist-play-all" onClick={() => playPlaylist(playlist)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7l15.3-8.3a.7.7 0 000-1.2L5.7 3z"/>
          </svg>
        </button>
        {availableSongs.length > 0 && (
          <button className="playlist-action-btn" onClick={() => setShowAddSongs(!showAddSongs)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 3a1 1 0 011 1v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 011-1z"/>
            </svg>
            添加歌曲
          </button>
        )}
        {!isLikedPlaylist && (
          <button className="playlist-action-btn danger" onClick={handleDelete}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M3 6h18v2H3V6zm2 2h14l-1 13H6L5 8zm4-4h6l1-1H8l1 1z"/>
            </svg>
            删除歌单
          </button>
        )}
      </div>

      {showAddSongs && availableSongs.length > 0 && (
        <div className="add-songs-panel">
          <h3>从音乐库添加歌曲</h3>
          <div className="add-songs-list">
            {availableSongs.map(song => (
              <div key={song.id} className="track-row" onClick={() => handleAddSong(song)}>
                <span className="track-col-num">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 3a1 1 0 011 1v7h7a1 1 0 110 2h-7v7a1 1 0 11-2 0v-7H4a1 1 0 110-2h7V4a1 1 0 011-1z"/>
                  </svg>
                </span>
                <span className="track-col-title">
                  <div className="track-cover-mini" style={{ background: song.coverColor }} />
                  <div className="track-title-text">{song.title}</div>
                </span>
                <span className="track-col-artist">{song.artist}</span>
                <span className="track-col-album">{song.album}</span>
                <span className="track-col-duration">
                  {Math.floor(song.duration / 60)}:{String(Math.floor(song.duration % 60)).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="playlist-detail-tracks">
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
            {playlist.songs.length === 0 ? (
              <div className="track-list-empty">歌单暂无歌曲</div>
            ) : (
              playlist.songs.map((song, idx) => (
                <div key={song.id} className="track-row" onClick={() => playPlaylist(playlist, idx)}>
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
                      onClick={(e) => { e.stopPropagation(); removeSongFromPlaylist(playlist.id, song.id); }}
                      title="从歌单移除"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
