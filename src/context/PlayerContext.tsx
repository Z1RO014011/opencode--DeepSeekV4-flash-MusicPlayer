import React, { createContext, useContext, useReducer, useRef, useCallback, useEffect, useState } from 'react';
import { PlayerState, Song, Playlist } from '../types';
import { gradientColors } from '../data';
import { saveAudioFile, loadAudioFile, deleteAudioFile, saveSongs, loadSongs, savePlaylists, loadPlaylists } from '../lib/db';

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
  | { type: 'SEEK'; time: number };

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

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
  playPlaylist: (playlist: Playlist, startIndex?: number) => void;
  playSong: (song: Song) => void;
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
          });
          restoredPlaylistSongs.set(meta.id, songs[songs.length - 1]);
        }
      }

      // Load playlists
      if (playlistData) {
        const pls: Playlist[] = playlistData.raw.map((pl: any) => ({
          ...pl,
          songs: (pl.songs || [])
            .map((sid: string) => restoredPlaylistSongs.get(sid))
            .filter(Boolean),
        }));
        setUserPlaylists(pls);
      }

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

  const playSong = useCallback((song: Song) => {
    dispatch({ type: 'PLAY_SONG', song });
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

    for (const file of fileArray) {
      const id = `song-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await saveAudioFile(id, file);
      const loaded = await loadAudioFile(id);
      const duration = await getAudioDuration(loaded!.url);
      const song: Song = {
        id,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: '未知艺术家',
        album: '未知专辑',
        duration: Math.floor(duration),
        coverColor: nextColor(),
        audioUrl: loaded?.url,
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

  return (
    <PlayerContext.Provider value={{
      state, dispatch, playPlaylist, playSong, togglePlay, nextTrack, prevTrack, audioRef,
      userSongs, userPlaylists,
      importFiles, deleteSong, createPlaylist, deletePlaylist,
      renamePlaylist, addSongsToPlaylist, removeSongFromPlaylist,
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
    };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.load();
    setTimeout(() => { cleanup(); resolve(0); }, 3000);
  });
}
