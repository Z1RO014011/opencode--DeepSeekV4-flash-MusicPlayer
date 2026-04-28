import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { generateShareCard } from '../lib/share';

interface NowPlayingViewProps {
  onBack: () => void;
}

export function NowPlayingView({ onBack }: NowPlayingViewProps) {
  const { state, dispatch, togglePlay, nextTrack, prevTrack, audioRef, isLiked, toggleLike, updateSongLyrics } = usePlayer();
  const { currentSong, isPlaying, currentTime, duration, volume, isShuffled, repeatMode } = state;
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<number, HTMLParagraphElement>>(new Map());

  const [showLyrics, setShowLyrics] = useState(() => (currentSong?.lyrics?.length ?? 0) > 0);
  const [editingLyrics, setEditingLyrics] = useState(false);
  const [lrcInput, setLrcInput] = useState('');
  const [draggingVolume, setDraggingVolume] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareImage, setShareImage] = useState<string | null>(null);

  useEffect(() => {
    setShowLyrics((currentSong?.lyrics?.length ?? 0) > 0);
    setEditingLyrics(false);
    lineRefs.current.clear();
  }, [currentSong?.id]);

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

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  const bgStyle = useMemo(() => {
    if (currentSong?.coverColor?.startsWith('url(')) {
      return { background: currentSong.coverColor, backgroundSize: 'cover' };
    }
    return { background: currentSong?.coverColor || '#121212' };
  }, [currentSong]);

  const lyrics = currentSong?.lyrics || [];

  const currentLyricIndex = useMemo(() => {
    if (lyrics.length === 0) return -1;
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (lyrics[i].time <= currentTime) return i;
    }
    return -1;
  }, [lyrics, currentTime]);

  useEffect(() => {
    if (currentLyricIndex < 0) return;
    const el = lineRefs.current.get(currentLyricIndex);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [currentLyricIndex]);

  const handleSaveLyrics = useCallback(() => {
    if (!currentSong || !lrcInput.trim()) return;
    updateSongLyrics(currentSong.id, lrcInput);
    setEditingLyrics(false);
    setLrcInput('');
  }, [currentSong, lrcInput, updateSongLyrics]);

  const handleOpenEditor = useCallback(() => {
    setLrcInput('');
    setEditingLyrics(true);
  }, []);

  const handleShare = useCallback(async () => {
    if (!currentSong) return;
    setSharing(true);
    try {
      const dataUrl = await generateShareCard(currentSong);
      setShareImage(dataUrl);
    } catch {
      setSharing(false);
    }
  }, [currentSong]);

  const handleDownloadShare = useCallback(() => {
    if (!shareImage || !currentSong) return;
    const a = document.createElement('a');
    a.href = shareImage;
    a.download = `${currentSong.title} - ${currentSong.artist}.png`;
    a.click();
  }, [shareImage, currentSong]);

  if (!currentSong) {
    return (
      <div className="nowplaying-view" style={{ background: '#121212' }}>
        <div className="nowplaying-view-inner">
          <p className="nowplaying-none">未选择歌曲</p>
        </div>
      </div>
    );
  }

  const hasLyrics = lyrics.length > 0;

  return (
    <div className="nowplaying-view" style={bgStyle}>
      <div className="nowplaying-view-bg" style={bgStyle} />
      <div className="nowplaying-view-overlay" />

      <div className="nowplaying-view-top-bar">
        <button className="nowplaying-view-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.5 3.5a1 1 0 010 1.5L9.42 12l6.08 7a1 1 0 01-1.5 1.5l-6.5-7.5a1 1 0 010-1.5l6.5-7.5a1 1 0 011.5 0z"/>
          </svg>
        </button>
        <div className="nowplaying-view-top-actions">
          {showLyrics && hasLyrics && (
            <button
              className="nowplaying-lyrics-edit-btn"
              onClick={() => { setEditingLyrics(true); setLrcInput(''); }}
              title="编辑歌词"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16.86 3.02a1.5 1.5 0 012.12 2.12l-10.6 10.6-2.84.7.7-2.84 10.62-10.58zM4 20h16v-2H4v2z"/>
              </svg>
            </button>
          )}
          {hasLyrics && (
            <button
              className={`nowplaying-lyrics-toggle ${showLyrics ? 'active' : ''}`}
              onClick={() => { setShowLyrics(!showLyrics); setEditingLyrics(false); }}
              title={showLyrics ? '显示控制' : '显示歌词'}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="nowplaying-view-inner">
        <div className="nowplaying-view-left">
          <div className="nowplaying-view-cover">
            <div
              className="nowplaying-view-cover-art"
              style={{
                background: currentSong.coverColor.startsWith('url(')
                  ? `${currentSong.coverColor}`
                  : currentSong.coverColor,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="nowplaying-view-cover-ring" />
          </div>
        </div>

        <div className="nowplaying-view-right">
          {showLyrics && hasLyrics ? (
            <div className="nowplaying-lyrics-section">
              <div className="nowplaying-view-text nowplaying-view-text-compact">
                <div className="nowplaying-view-title-row">
                  <h1 className="nowplaying-view-title nowplaying-view-title-small">{currentSong.title}</h1>
                  <button
                    className={`like-btn ${isLiked(currentSong.id) ? 'liked' : ''}`}
                    onClick={() => toggleLike(currentSong)}
                    title={isLiked(currentSong.id) ? '取消喜欢' : '喜欢'}
                  >
                    <svg viewBox="0 0 24 24" width="20" height="20" fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                <p className="nowplaying-view-artist nowplaying-view-artist-small">{currentSong.artist}</p>
              </div>

              <div className="nowplaying-lyrics-container" ref={lyricsContainerRef}>
                {lyrics.map((line, i) => (
                  <p
                    key={i}
                    ref={el => { if (el) lineRefs.current.set(i, el); }}
                    className={`nowplaying-lyric-line ${i === currentLyricIndex ? 'active' : ''} ${i <= currentLyricIndex ? 'past' : ''}`}
                  >
                    {line.text}
                  </p>
                ))}
              </div>

              <div className="nowplaying-view-progress-section nowplaying-view-progress-mini">
                <div className="nowplaying-view-progress" ref={progressRef} onClick={handleProgressClick}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    <div className="progress-thumb" style={{ left: `${progressPct}%` }} />
                  </div>
                </div>
                <div className="nowplaying-view-time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="nowplaying-view-controls nowplaying-view-controls-mini">
                <button className="nowplaying-view-btn" onClick={prevTrack} title="上一首">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M6 4h2v16H6V4zm12.49-.323l-12 8.485a1 1 0 000 1.676l12 8.485A1 1 0 0022 21.485V2.515a1 1 0 00-1.51-.838z"/>
                  </svg>
                </button>
                <button className="nowplaying-view-play" onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
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
                <button className="nowplaying-view-btn" onClick={nextTrack} title="下一首">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M5.51 2.323l12 8.485a1 1 0 010 1.676l-12 8.485A1 1 0 014 20.485V3.515a1 1 0 011.51-.838zM18 4h2v16h-2V4z"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : editingLyrics ? (
            <div className="nowplaying-lyrics-editor">
              <p className="nowplaying-lyrics-editor-hint">
                粘贴 LRC 格式歌词（每行格式：[mm:ss.xx]歌词文本）
              </p>
              <textarea
                className="nowplaying-lyrics-textarea"
                value={lrcInput}
                onChange={e => setLrcInput(e.target.value)}
                placeholder={`[00:12.50]第一句歌词\n[00:25.30]第二句歌词\n[00:42.10]第三句歌词`}
                rows={10}
              />
              <div className="nowplaying-lyrics-editor-actions">
                <button className="nowplaying-lyrics-btn-cancel" onClick={() => setEditingLyrics(false)}>取消</button>
                <button className="nowplaying-lyrics-btn-save" onClick={handleSaveLyrics}>保存歌词</button>
              </div>
            </div>
          ) : (
            <>
              <div className="nowplaying-view-text">
                <div className="nowplaying-view-title-row">
                  <h1 className="nowplaying-view-title">{currentSong.title}</h1>
                  <button
                    className={`like-btn ${isLiked(currentSong.id) ? 'liked' : ''}`}
                    onClick={() => toggleLike(currentSong)}
                    title={isLiked(currentSong.id) ? '取消喜欢' : '喜欢'}
                  >
                    <svg viewBox="0 0 24 24" width="24" height="24" fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                </div>
                <p className="nowplaying-view-artist">{currentSong.artist}</p>
                <p className="nowplaying-view-album">{currentSong.album}</p>
              </div>

              <div className="nowplaying-view-progress-section">
                <div className="nowplaying-view-progress" ref={progressRef} onClick={handleProgressClick}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                    <div className="progress-thumb" style={{ left: `${progressPct}%` }} />
                  </div>
                </div>
                <div className="nowplaying-view-time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="nowplaying-view-controls">
                <button
                  className={`nowplaying-view-btn ${isShuffled ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
                  title="随机播放"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M13.151.922a.75.75 0 10-1.06 1.06L13.17 3.06H11.5A10.5 10.5 0 001 13.5v.1a.75.75 0 001.5 0v-.1a9 9 0 019-9h1.67l-1.08 1.078a.75.75 0 101.06 1.06L16.29 3.11a.75.75 0 000-1.06L13.151.922z"/>
                  </svg>
                </button>
                <button className="nowplaying-view-btn" onClick={prevTrack} title="上一首">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M6 4h2v16H6V4zm12.49-.323l-12 8.485a1 1 0 000 1.676l12 8.485A1 1 0 0022 21.485V2.515a1 1 0 00-1.51-.838z"/>
                  </svg>
                </button>
                <button className="nowplaying-view-play" onClick={togglePlay} title={isPlaying ? '暂停' : '播放'}>
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7H5.7zm8 0a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7h2.6a.7.7 0 00.7-.7V3.7a.7.7 0 00-.7-.7h-2.6z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                      <path d="M5.7 3a.7.7 0 00-.7.7v16.6a.7.7 0 00.7.7l15.3-8.3a.7.7 0 000-1.2L5.7 3z"/>
                    </svg>
                  )}
                </button>
                <button className="nowplaying-view-btn" onClick={nextTrack} title="下一首">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M5.51 2.323l12 8.485a1 1 0 010 1.676l-12 8.485A1 1 0 014 20.485V3.515a1 1 0 011.51-.838zM18 4h2v16h-2V4z"/>
                  </svg>
                </button>
                <button
                  className={`nowplaying-view-btn ${repeatMode !== 'off' ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'CYCLE_REPEAT' })}
                  title={`重复: ${repeatMode === 'off' ? '关闭' : repeatMode === 'all' ? '全部循环' : '单曲循环'}`}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d={repeatMode === 'off' ? 'M4 4v7h7M4 11l3-3m4 6v7h-7M4 18l3 3M20 4v7h-7M13 1l3 3-3 3M20 11v7h-7M13 15l3 3-3 3' : repeatMode === 'all' ? 'M4 4v7h7M4 11l3-3m4 6v7h-7M4 18l3 3M20 4v7h-7M13 1l3 3-3 3M20 11v7h-7M13 15l3 3-3 3' : 'M4 4v7h7M4 11l3-3m4 6v7h-7M4 18l3 3M20 4v7h-7M13 1l3 3-3 3M20 18a2 2 0 110-4 2 2 0 010 4z'} />
                  </svg>
                  {repeatMode === 'one' && <span className="np-repeat-one">1</span>}
                </button>
              </div>

              <div className="nowplaying-volume-section">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="np-volume-icon">
                  <path d={volume === 0
                    ? "M1 8v8h4l5.7 5.3a1 1 0 001.3 0V2.7a1 1 0 00-1.3 0L5 8H1z"
                    : "M1 8v8h4l5.7 5.3a1 1 0 001.3 0V2.7a1 1 0 00-1.3 0L5 8H1zm13.5 4a4.5 4.5 0 01-2.12 3.82.75.75 0 00.74 1.3 6 6 0 000-10.24.75.75 0 10-.74 1.3A4.5 4.5 0 0114.5 12z"
                  }/>
                </svg>
                <div className="np-volume-bar" ref={volumeRef} onMouseDown={handleVolumeDown}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${volume * 100}%` }} />
                    <div className="progress-thumb" style={{ left: `${volume * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="nowplaying-view-meta">
                <div className="np-meta-item">
                  <span className="np-meta-label">专辑</span>
                  <span className="np-meta-value">{currentSong.album}</span>
                </div>
                <div className="np-meta-item">
                  <span className="np-meta-label">艺术家</span>
                  <span className="np-meta-value">{currentSong.artist}</span>
                </div>
                <div className="np-meta-item">
                  <span className="np-meta-label">时长</span>
                  <span className="np-meta-value">{formatTime(currentSong.duration)}</span>
                </div>
              </div>

              {!hasLyrics && (
                <button className="nowplaying-add-lyrics-btn" onClick={handleOpenEditor}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M3 4h18v2H3V4zm0 7h12v2H3v-2zm0 7h18v2H3v-2z"/>
                  </svg>
                  添加歌词
                </button>
              )}
              <button className="nowplaying-share-btn" onClick={handleShare} title="分享歌曲">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
                分享
              </button>
            </>
          )}
        </div>
      </div>

      {shareImage && (
        <div className="modal-overlay" onClick={() => { setShareImage(null); setSharing(false); }}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">分享卡片</h2>
              <button className="modal-close" onClick={() => { setShareImage(null); setSharing(false); }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M3.293 3.293a1 1 0 011.414 0L12 10.586l7.293-7.293a1 1 0 111.414 1.414L13.414 12l7.293 7.293a1 1 0 01-1.414 1.414L12 13.414l-7.293 7.293a1 1 0 01-1.414-1.414L10.586 12 3.293 4.707a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </div>
            <div className="share-card-preview">
              <img src={shareImage} alt="分享卡片" />
            </div>
            <div className="share-modal-actions">
              <button className="share-download-btn" onClick={handleDownloadShare}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M19 10a1 1 0 01 1 1v6a3 3 0 01-3 3H7a3 3 0 01-3-3v-6a1 1 0 012 0v6a1 1 0 001 1h10a1 1 0 001-1v-6a1 1 0 011-1zm-7-7a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L13 6.414V15a1 1 0 11-2 0V6.414L8.707 8.707a1 1 0 01-1.414-1.414l4-4A1 1 0 0112 3z"/>
                </svg>
                下载图片
              </button>
            </div>
          </div>
        </div>
      )}

      {sharing && !shareImage && (
        <div className="modal-overlay">
          <div className="share-loading">
            <div className="share-spinner" />
            <p>生成分享卡片中...</p>
          </div>
        </div>
      )}
    </div>
  );
}
