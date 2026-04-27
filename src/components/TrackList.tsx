import React from 'react';
import { Song, Playlist } from '../types';
import { usePlayer } from '../context/PlayerContext';

interface TrackListProps {
  songs: Song[];
  playlist: Playlist;
}

export function TrackList({ songs, playlist }: TrackListProps) {
  const { state, dispatch } = usePlayer();

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function handlePlay(index: number) {
    dispatch({ type: 'PLAY_SONG', song: songs[index], playlist });
  }

  return (
    <div className="track-list">
      <div className="track-list-header">
        <span className="track-col-num">#</span>
        <span className="track-col-title">标题</span>
        <span className="track-col-artist">艺术家</span>
        <span className="track-col-album">专辑</span>
        <span className="track-col-duration">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8zm1-13a1 1 0 00-2 0v6a1 1 0 00.553.894l4 2a1 1 0 10.894-1.788L13 12.382V7z"/>
          </svg>
        </span>
      </div>
      <div className="track-list-body">
        {songs.map((song, idx) => (
          <div
            key={song.id}
            className={`track-row ${state.currentSong?.id === song.id ? 'active' : ''}`}
            onClick={() => handlePlay(idx)}
            onDoubleClick={() => handlePlay(idx)}
          >
            <span className="track-col-num">
              {state.currentSong?.id === song.id && state.isPlaying ? (
                <span className="equalizer">
                  <span /><span /><span />
                </span>
              ) : (
                idx + 1
              )}
            </span>
            <span className="track-col-title">
              <div className="track-cover-mini" style={{ background: song.coverColor }} />
              <div className="track-title-text">{song.title}</div>
            </span>
            <span className="track-col-artist">{song.artist}</span>
            <span className="track-col-album">{song.album}</span>
            <span className="track-col-duration">{formatTime(song.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
