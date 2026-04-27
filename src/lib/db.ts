const DB_NAME = 'music-player-store';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('audioFiles')) {
        db.createObjectStore('audioFiles', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveAudioFile(id: string, file: File): Promise<void> {
  const db = await openDB();
  const buffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audioFiles', 'readwrite');
    tx.objectStore('audioFiles').put({ id, data: buffer, type: file.type });
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

export async function loadAudioFile(id: string): Promise<{ blob: Blob; url: string } | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audioFiles', 'readonly');
    const req = tx.objectStore('audioFiles').get(id);
    req.onsuccess = () => {
      db.close();
      const record = req.result;
      if (!record) { resolve(null); return; }
      const blob = new Blob([record.data], { type: record.type || 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      resolve({ blob, url });
    };
    req.onerror = () => { db.close(); reject(req.error); };
  });
}

export async function deleteAudioFile(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audioFiles', 'readwrite');
    tx.objectStore('audioFiles').delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// --- localStorage helpers ---

const LS_KEYS = {
  songs: 'mp-songs',
  playlists: 'mp-playlists',
} as const;

export function saveSongs(songs: unknown[]): void {
  try {
    const data = songs.map((s: any) => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      duration: s.duration,
      coverColor: s.coverColor,
    }));
    localStorage.setItem(LS_KEYS.songs, JSON.stringify(data));
  } catch {}
}

export function loadSongs(): unknown[] | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.songs);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePlaylists(playlists: unknown[]): void {
  try {
    const data = playlists.map((p: any) => ({
      ...p,
      songs: p.songs.map((s: any) => s.id),
    }));
    localStorage.setItem(LS_KEYS.playlists, JSON.stringify(data));
  } catch {}
}

export function loadPlaylists(): { raw: any[]; songIds: string[] } | null {
  try {
    const raw = localStorage.getItem(LS_KEYS.playlists);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const allIds: string[] = [];
    for (const pl of data) {
      if (pl.songs) allIds.push(...pl.songs);
    }
    return { raw: data, songIds: [...new Set(allIds)] };
  } catch {
    return null;
  }
}
