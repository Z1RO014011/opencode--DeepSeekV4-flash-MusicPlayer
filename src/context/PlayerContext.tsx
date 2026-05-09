import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect, useState } from 'react';
import { PlayerState, Song, Playlist, LyricLine } from '../types';
import { gradientColors } from '../data';
import { saveAudioFile, loadAudioFile, deleteAudioFile, saveSongs, loadSongs, savePlaylists, loadPlaylists } from '../lib/db';
import { extractMetadata } from '../lib/metadata';

type PlayerAction =
  | { type: 'PLAY_SONG'; song: Song; playlist?: Playlist }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_PLAYING'; isPlaying: boolean }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'CYCLE_REPEAT' }
  | { type: 'SET_QUEUE'; songs: Song[]; index: number }
  | { type: 'SEEK'; time: number }
  | { type: 'SET_SONG_LYRICS'; lyrics: LyricLine[] };

const initialState: PlayerState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isShuffled: false,
  repeatMode: 'off',
  queue: [],
  queueIndex: -1,
};

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'PLAY_SONG': {
      const queue = action.playlist
        ? action.playlist.songs
        : state.queue.length > 0
          ? state.queue
          : [action.song];
      const index = queue.findIndex(s => s.id === action.song.id);
      return { ...state, currentSong: action.song, queue, queueIndex: index >= 0 ? index : 0, isPlaying: true, currentTime: 0 };
    }
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.isPlaying };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.time };
    case 'SET_DURATION':
      return { ...state, duration: action.duration };
    case 'SET_VOLUME':
      return { ...state, volume: Math.max(0, Math.min(1, action.volume)) };
    case 'NEXT': {
      const { queue, queueIndex, repeatMode } = state;
      if (queue.length === 0) return state;
      let nextIndex: number;
      if (repeatMode === 'one') {
        nextIndex = queueIndex;
      } else {
        nextIndex = queueIndex + 1;
        if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            return { ...state, isPlaying: false };
          }
        }
      }
      const nextSong = queue[nextIndex];
      return { ...state, currentSong: nextSong, queueIndex: nextIndex, isPlaying: true, currentTime: 0 };
    }
    case 'PREV': {
      const { queue, queueIndex, currentTime, repeatMode } = state;
      if (queue.length === 0) return state;
      if (currentTime > 3) {
        return { ...state, currentTime: 0 };
      }
      let prevIndex: number;
      if (repeatMode === 'one') {
        prevIndex = queueIndex;
      } else {
        prevIndex = queueIndex - 1;
        if (prevIndex < 0) {
          if (repeatMode === 'all') {
            prevIndex = queue.length - 1;
          } else {
            prevIndex = 0;
          }
        }
      }
      const prevSong = queue[prevIndex];
      return { ...state, currentSong: prevSong, queueIndex: prevIndex, isPlaying: true, currentTime: 0 };
    }
    case 'TOGGLE_SHUFFLE':
      return { ...state, isShuffled: !state.isShuffled };
    case 'CYCLE_REPEAT': {
      const modes: PlayerState['repeatMode'][] = ['off', 'all', 'one'];
      const idx = modes.indexOf(state.repeatMode);
      return { ...state, repeatMode: modes[(idx + 1) % modes.length] };
    }
    case 'SET_QUEUE':
      return { ...state, queue: action.songs, queueIndex: action.index };
    case 'SEEK':
      return { ...state, currentTime: action.time };
    case 'SET_SONG_LYRICS':
      return state.currentSong
        ? { ...state, currentSong: { ...state.currentSong, lyrics: action.lyrics } }
        : state;
    default:
      return state;
  }
}

let colorIndex = 0;
function nextColor(): string {
  const c = gradientColors[colorIndex % gradientColors.length];
  colorIndex++;
  return c;
}

import { parseLRC } from '../lib/lyrics';

export const LIKED_PLAYLIST_ID = '__liked__';

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  playPlaylist: (playlist: Playlist, startIndex?: number) => void;
  playSong: (song: Song, context?: Song[]) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;

  userSongs: Song[];
  userPlaylists: Playlist[];
  importFiles: (files: FileList) => Promise<void>;
  deleteSong: (songId: string) => void;
  createPlaylist: (data: { name: string; description: string; creator: string; coverColor: string }) => void;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, name: string) => void;
  addSongsToPlaylist: (playlistId: string, songs: Song[]) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;

  likedPlaylist: Playlist | undefined;
  isLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => void;
  updateSongLyrics: (songId: string, lrcText: string) => void;
  updatePlaylistCover: (playlistId: string, coverColor: string) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef(state);
  const loadedRef = useRef(false);
  stateRef.current = state;

  // Load persisted data on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      const songMeta = loadSongs() as any[];
      const playlistData = loadPlaylists();
      const songs: Song[] = [];
      const restoredPlaylistSongs = new Map<string, Song>();

      // Load audio and create songs
      if (songMeta) {
        for (const meta of songMeta) {
          const audio = await loadAudioFile(meta.id);
          songs.push({
            id: meta.id,
            title: meta.title,
            artist: meta.artist,
            album: meta.album,
            duration: meta.duration,
            coverColor: meta.coverColor,
            audioUrl: audio?.url || undefined,
            lyrics: meta.lyrics || undefined,
          });
          restoredPlaylistSongs.set(meta.id, songs[songs.length - 1]);
        }
      }

      // Load playlists
      let pls: Playlist[] = [];
      if (playlistData) {
        pls = playlistData.raw.map((pl: any) => ({
          ...pl,
          songs: (pl.songs || [])
            .map((sid: string) => restoredPlaylistSongs.get(sid))
            .filter(Boolean),
        }));
      }

      // Ensure "我喜欢的音乐" playlist exists
      const likedExists = pls.some(pl => pl.id === LIKED_PLAYLIST_ID);
      if (!likedExists) {
        pls.unshift({
          id: LIKED_PLAYLIST_ID,
          name: '我喜欢的音乐',
          description: '收藏你喜欢的歌曲',
          coverColor: 'linear-gradient(135deg, #e23b3b 0%, #ff6b6b 100%)',
          songs: [],
          createdAt: 0,
        });
      }

      setUserPlaylists(pls);
      setUserSongs(songs);
      setLoaded(true);
    })();
  }, []);

  // Persist playlists when they change
  useEffect(() => {
    if (!loaded) return;
    savePlaylists(userPlaylists);
  }, [userPlaylists, loaded]);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => dispatch({ type: 'SET_CURRENT_TIME', time: audio.currentTime });
    const onDuration = () => dispatch({ type: 'SET_DURATION', duration: audio.duration });
    const onPlay = () => dispatch({ type: 'SET_PLAYING', isPlaying: true });
    const onPause = () => dispatch({ type: 'SET_PLAYING', isPlaying: false });

    const onEnded = () => {
      const s = stateRef.current;
      const playerAudio = audioRef.current;
      if (s.queue.length === 0) return;
      let nextIndex = s.queueIndex + 1;
      if (nextIndex >= s.queue.length) {
        if (s.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          dispatch({ type: 'SET_PLAYING', isPlaying: false });
          if (playerAudio) playerAudio.pause();
          return;
        }
      }
      const nextSong = s.queue[nextIndex];
      if (nextSong && playerAudio) {
        if (nextSong.audioUrl) {
          if (playerAudio.src !== nextSong.audioUrl) {
            playerAudio.src = nextSong.audioUrl;
            playerAudio.load();
          }
          playerAudio.play().catch(() => {});
        }
        dispatch({ type: 'PLAY_SONG', song: nextSong });
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = state.volume;
  }, [state.volume]);

  function initAudio(song: Song) {
    const audio = audioRef.current;
    if (!audio || !song.audioUrl) return;
    if (audio.src !== song.audioUrl) {
      audio.src = song.audioUrl;
      audio.load();
    }
    audio.play().catch(() => {});
  }

  const playPlaylist = useCallback((playlist: Playlist, startIndex = 0) => {
    const song = playlist.songs[startIndex];
    if (song) {
      dispatch({ type: 'PLAY_SONG', song, playlist });
      initAudio(song);
    }
  }, []);

  const playSong = useCallback((song: Song, context?: Song[]) => {
    if (context && context.length > 0) {
      const index = context.findIndex(s => s.id === song.id);
      dispatch({ type: 'SET_QUEUE', songs: context, index: index >= 0 ? index : 0 });
      dispatch({ type: 'PLAY_SONG', song });
    } else {
      dispatch({ type: 'PLAY_SONG', song });
    }
    initAudio(song);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
    dispatch({ type: 'TOGGLE_PLAY' });
  }, []);

  const nextTrack = useCallback(() => {
    const audio = audioRef.current;
    const { queue, queueIndex, repeatMode } = state;
    if (queue.length === 0) return;
    let nextIndex: number;
    if (repeatMode === 'one') {
      nextIndex = queueIndex;
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = repeatMode === 'all' ? 0 : -1;
      }
    }
    if (nextIndex < 0) {
      dispatch({ type: 'SET_PLAYING', isPlaying: false });
      if (audio) audio.pause();
      return;
    }
    const nextSong = queue[nextIndex];
    dispatch({ type: 'PLAY_SONG', song: nextSong });
    if (audio && nextSong.audioUrl) {
      if (audio.src !== nextSong.audioUrl) {
        audio.src = nextSong.audioUrl;
        audio.load();
      }
      audio.play().catch(() => {});
    }
  }, [state.queue, state.queueIndex, state.repeatMode]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    const { queue, queueIndex, currentTime, repeatMode } = state;
    if (queue.length === 0) return;
    if (currentTime > 3) {
      if (audio) {
        audio.currentTime = 0;
        dispatch({ type: 'SEEK', time: 0 });
      }
      return;
    }
    let prevIndex: number;
    if (repeatMode === 'one') {
      prevIndex = queueIndex;
    } else {
      prevIndex = queueIndex - 1;
      if (prevIndex < 0) {
        prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
      }
    }
    const prevSong = queue[prevIndex];
    dispatch({ type: 'PLAY_SONG', song: prevSong });
    if (audio && prevSong.audioUrl) {
      if (audio.src !== prevSong.audioUrl) {
        audio.src = prevSong.audioUrl;
        audio.load();
      }
      audio.play().catch(() => {});
    }
  }, [state.queue, state.queueIndex, state.currentTime, state.repeatMode]);

  const importFiles = useCallback(async (files: FileList) => {
    const newSongs: Song[] = [];
    const fileArray = Array.from(files);

    // Separate audio files and LRC files
    const audioFiles = fileArray.filter(f => !f.name.endsWith('.lrc'));
    const lrcFiles = fileArray.filter(f => f.name.endsWith('.lrc'));

    // Parse LRC files and build a basename → lyrics map
    const lrcMap = new Map<string, LyricLine[]>();
    for (const lrcFile of lrcFiles) {
      const baseName = lrcFile.name.replace(/\.lrc$/i, '');
      try {
        const text = await lrcFile.text();
        const parsed = parseLRC(text);
        if (parsed.length > 0) {
          lrcMap.set(baseName, parsed);
        }
      } catch {
        // skip unreadable LRC files
      }
    }

    for (const file of audioFiles) {
      const id = `song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await saveAudioFile(id, file);
      const loaded = await loadAudioFile(id);
      const duration = await getAudioDuration(loaded!.url);
      const meta = await extractMetadata(file);
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const matchedLyrics = lrcMap.get(baseName);
      const coverColor = meta.coverDataUrl
        ? `url(${meta.coverDataUrl}) center/cover no-repeat`
        : nextColor();
      const song: Song = {
        id,
        title: meta.title || baseName,
        artist: meta.artist || '未知艺术家',
        album: meta.album || '未知专辑',
        duration: Math.floor(duration),
        coverColor,
        audioUrl: loaded?.url,
        lyrics: matchedLyrics,
      };
      newSongs.push(song);
    }

    setUserSongs(prev => {
      const next = [...prev, ...newSongs];
      saveSongs(next);
      return next;
    });
  }, []);

  const deleteSong = useCallback((songId: string) => {
    deleteAudioFile(songId);
    setUserSongs(prev => {
      const deleted = prev.find(s => s.id === songId);
      if (deleted?.audioUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(deleted.audioUrl);
      }
      const next = prev.filter(s => s.id !== songId);
      saveSongs(next);
      return next;
    });
    setUserPlaylists(prev =>
      prev.map(pl => ({
        ...pl,
        songs: pl.songs.filter(s => s.id !== songId),
      }))
    );
  }, []);

  const createPlaylist = useCallback((data: { name: string; description: string; creator: string; coverColor: string }) => {
    const playlist: Playlist = {
      id: `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: data.name,
      description: data.description || `${data.name} · 自建歌单`,
      coverColor: data.coverColor || nextColor(),
      songs: [],
      createdAt: Date.now(),
      creator: data.creator || undefined,
    };
    setUserPlaylists(prev => [...prev, playlist]);
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    if (playlistId === LIKED_PLAYLIST_ID) return;
    setUserPlaylists(prev => prev.filter(pl => pl.id !== playlistId));
  }, []);

  const renamePlaylist = useCallback((playlistId: string, name: string) => {
    setUserPlaylists(prev =>
      prev.map(pl => pl.id === playlistId ? { ...pl, name, description: `${name} · 自建歌单` } : pl)
    );
  }, []);

  const addSongsToPlaylist = useCallback((playlistId: string, songs: Song[]) => {
    setUserPlaylists(prev =>
      prev.map(pl =>
        pl.id === playlistId
          ? { ...pl, songs: [...pl.songs, ...songs.filter(s => !pl.songs.some(ps => ps.id === s.id))] }
          : pl
      )
    );
  }, []);

  const removeSongFromPlaylist = useCallback((playlistId: string, songId: string) => {
    setUserPlaylists(prev =>
      prev.map(pl =>
        pl.id === playlistId
          ? { ...pl, songs: pl.songs.filter(s => s.id !== songId) }
          : pl
      )
    );
  }, []);

  const likedPlaylist = userPlaylists.find(pl => pl.id === LIKED_PLAYLIST_ID);

  const isLiked = useCallback((songId: string) => {
    return likedPlaylist?.songs.some(s => s.id === songId) ?? false;
  }, [likedPlaylist]);

  const toggleLike = useCallback((song: Song) => {
    setUserPlaylists(prev =>
      prev.map(pl => {
        if (pl.id !== LIKED_PLAYLIST_ID) return pl;
        const exists = pl.songs.some(s => s.id === song.id);
        return {
          ...pl,
          songs: exists
            ? pl.songs.filter(s => s.id !== song.id)
            : [...pl.songs, song],
        };
      })
    );
  }, []);

  const updateSongLyrics = useCallback((songId: string, lrcText: string) => {
    const parsed = parseLRC(lrcText);
    setUserSongs(prev => {
      const next = prev.map(s => s.id === songId ? { ...s, lyrics: parsed } : s);
      saveSongs(next);
      return next;
    });
    if (stateRef.current.currentSong?.id === songId) {
      dispatch({ type: 'SET_SONG_LYRICS', lyrics: parsed });
    }
  }, []);

  const updatePlaylistCover = useCallback((playlistId: string, coverColor: string) => {
    setUserPlaylists(prev =>
      prev.map(pl => pl.id === playlistId ? { ...pl, coverColor } : pl)
    );
  }, []);

  return (
    <PlayerContext.Provider value={{
      state, dispatch, playPlaylist, playSong, togglePlay, nextTrack, prevTrack, audioRef,
      userSongs, userPlaylists,
      importFiles, deleteSong, createPlaylist, deletePlaylist,
      renamePlaylist, addSongsToPlaylist, removeSongFromPlaylist,
      likedPlaylist, isLiked, toggleLike, updateSongLyrics, updatePlaylistCover,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

function getAudioDuration(url: string): Promise<number> {
  return new Promise(resolve => {
    const audio = new Audio(url);
    audio.preload = 'metadata';
    const onLoaded = () => {
      const dur = audio.duration || 0;
      cleanup();
      resolve(dur);
    };
    const onError = () => { cleanup(); resolve(0); };
    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.load();
    setTimeout(() => { cleanup(); resolve(0); }, 3000);
  });
}
