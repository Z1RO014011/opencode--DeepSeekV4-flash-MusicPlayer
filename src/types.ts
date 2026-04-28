export interface LyricLine {
  time: number;
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverColor: string;
  audioUrl?: string;
  lyrics?: LyricLine[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverColor: string;
  songs: Song[];
  createdAt: number;
  creator?: string;
}

export type ViewType = 'home' | 'search' | 'library' | 'playlist' | 'nowplaying';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'all' | 'one';
  queue: Song[];
  queueIndex: number;
}

export interface PlaylistFormData {
  name: string;
  description: string;
  creator: string;
  coverColor: string;
}
