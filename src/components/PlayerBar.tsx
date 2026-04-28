import React, { useRef, useCallback, useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface PlayerBarProps {
  onOpenNowPlaying?: () => void;
}

export function PlayerBar({ onOpenNowPlaying }: PlayerBarProps) {
  const { state, dispatch, togglePlay, nextTrack, prevTrack, audioRef, isLiked, toggleLike } = usePlayer();
  const { currentSong, isPlaying, currentTime, duration, volume, isShuffled, repeatMode } = state;
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const [draggingVolume, setDraggingVolume] = useState(false);

  function formatTime(sec: number): string {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    const el = progressRef.current;
    if (!el || !duration) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pct * duration;
    if (audioRef.current) audioRef.current.currentTime = time;
    dispatch({ type: 'SEEK', time });
  }, [duration, dispatch, audioRef]);

  const handleVolumeClick = useCallback((e: React.MouseEvent) => {
    const el = volumeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    dispatch({ type: 'SET_VOLUME', volume: pct });
  }, [dispatch]);

  useEffect(() => {
    if (!draggingVolume) return;
    const handleMove = (e: MouseEvent) => {
      const el = volumeRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      dispatch({ type: 'SET_VOLUME', volume: pct });
    };
    const handleUp = () => setDraggingVolume(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [draggingVolume, dispatch]);

  const handleVolumeDown = useCallback((e: React.MouseEvent) => {
    const el = volumeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    dispatch({ type: 'SET_VOLUME', volume: pct });
    setDraggingVolume(true);
  }, [dispatch]);

  const repeatIcons: Record<string, string> = {
    off: 'M4 4v7h7',
    all: 'M4 4v7h7M4 11l3-3m4 6v7h-7M4 18l3 3M20 4v7h-7M13 1l3 3-3 3M20 11v7h-7M13 15l3 3-3 3',
    one: 'M4 4v7h7M4 11l3-3m4 6v7h-7M4 18l3 3M20 4v7h-7M13 1l3 3-3 3M20 18a2 2 0 110-4 2 2 0 010 4z',
  };

  return (
    <footer className="player-bar">
      <div className="player-left">
        {currentSong ? (
          <div className="player-current-song">
            <div className="player-current-song-clickable" onClick={onOpenNowPlaying}>
              <div className="player-cover" style={{ background: currentSong.coverColor }} />
              <div className="player-song-info">
                <div className="player-song-title">{currentSong.title}</div>
                <div className="player-song-artist">{currentSong.artist}</div>
              </div>
            </div>
            <button
              className={`like-btn player-like-btn ${isLiked(currentSong.id) ? 'liked' : ''}`}
              onClick={() => toggleLike(currentSong)}
              title={isLiked(currentSong.id) ? '取消喜欢' : '喜欢'}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="player-current-song">
            <div className="player-cover player-cover-empty" />
            <div className="player-song-info">
              <div className="player-song-title player-muted">未选择歌曲</div>
              <div className="player-song-artist player-muted">选择一首歌开始播放</div>
            </div>
          </div>
        )}
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button
            className={`player-control-btn ${isShuffled ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
            title="随机播放"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M13.151.922a.75.75 0 10-1.06 1.06L13.17 3.06H11.5A10.5 10.5 0 001 13.5v.1a.75.75 0 001.5 0v-.1a9 9 0 019-9h1.67l-1.08 1.078a.75.75 0 101.06 1.06L16.29 3.11a.75.75 0 000-1.06L13.151.922z"/>
            </svg>
          </button>
          <button className="player-control-btn" onClick={prevTrack} title="上一首">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M6 4h2v16H6V4zm12.49-.323l-12 8.485a1 1 0 000 1.676l12 8.485A1 1 0 0022 21.485V2.515a1 1 0 00-1.51-.838z"/>
            </svg>
          </button>
          <button
            className="player-play-btn"
            onClick={() => currentSong && togglePlay()}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7H5.7zm8 0a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7h-2.6z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7l15.3-8.3a.7.7 0 000-1.2L5.7 3z"/>
              </svg>
            )}
          </button>
          <button className="player-control-btn" onClick={nextTrack} title="下一首">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M5.51 2.323l12 8.485a1 1 0 010 1.676l-12 8.485A1 1 0 014 20.485V3.515a1 1 0 011.51-.838zM18 4h2v16h-2V4z"/>
            </svg>
          </button>
          <button
            className={`player-control-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={() => dispatch({ type: 'CYCLE_REPEAT' })}
            title={`重复: ${repeatMode === 'off' ? '关闭' : repeatMode === 'all' ? '全部循环' : '单曲循环'}`}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d={repeatIcons[repeatMode]} />
            </svg>
            {repeatMode === 'one' && <span className="repeat-one-indicator">1</span>}
          </button>
        </div>

        <div className="player-progress">
          <span className="player-time">{formatTime(currentTime)}</span>
          <div className="progress-bar" ref={progressRef} onClick={handleProgressClick}>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
              <div
                className="progress-thumb"
                style={{ left: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="volume-icon">
          <path d={volume === 0
            ? "M1 8v8h4l5.7 5.3a1 1 0 001.3 0V2.7a1 1 0 00-1.3 0L5 8H1zm16.5 4a4.5 4.5 0 01-2.12 3.82.75.75 0 00.74 1.3 6 6 0 000-10.24.75.75 0 10-.74 1.3A4.5 4.5 0 0117.5 12z"
            : volume < 0.5
              ? "M1 8v8h4l5.7 5.3a1 1 0 001.3 0V2.7a1 1 0 00-1.3 0L5 8H1zm13.5 4a4.5 4.5 0 01-2.12 3.82.75.75 0 00.74 1.3 6 6 0 000-10.24.75.75 0 10-.74 1.3A4.5 4.5 0 0114.5 12z"
              : "M1 8v8h4l5.7 5.3a1 1 0 001.3 0V2.7a1 1 0 00-1.3 0L5 8H1zm13.5 4a4.5 4.5 0 01-2.12 3.82.75.75 0 00.74 1.3 6 6 0 000-10.24.75.75 0 10-.74 1.3A4.5 4.5 0 0114.5 12zm4.14-5.85a.75.75 0 10-.78 1.28A4.5 4.5 0 0119.5 12a4.5 4.5 0 01-1.64 3.43.75.75 0 00.78 1.28A6 6 0 0021 12a6 6 0 00-2.36-4.85z"
          }/>
        </svg>
        <div className="volume-bar" ref={volumeRef} onMouseDown={handleVolumeDown}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${volume * 100}%` }} />
            <div className="progress-thumb" style={{ left: `${volume * 100}%` }} />
          </div>
        </div>
      </div>
    </footer>
  );
}
