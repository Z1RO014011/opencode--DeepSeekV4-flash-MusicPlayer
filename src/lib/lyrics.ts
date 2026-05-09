import { LyricLine } from '../types';

/**
 * Parse LRC format lyrics into structured array.
 * Supports:
 *   - Standard [mm:ss.xx] timestamps
 *   - Multiple timestamps per line: [00:01.00][00:30.00]lyric
 *   - [offset:+/-ms] global offset tag
 *   - Empty & blank lines (instrumental markers)
 *   - Strips enhanced LRC word-level tags <mm:ss.xx>
 */
export function parseLRC(text: string, filenameForDebug?: string): LyricLine[] {
  const lines = text.split('\n');
  const result: LyricLine[] = [];
  const timeTagRe = /\[(\d{1,3}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  const offsetRe = /\[offset:\s*([+-]?\d+)\]/i;
  let offsetMs = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Parse global offset
    const offsetMatch = line.match(offsetRe);
    if (offsetMatch) {
      offsetMs = parseInt(offsetMatch[1], 10);
      continue;
    }

    // Collect all timestamps on this line
    const timestamps: number[] = [];
    let m: RegExpExecArray | null;
    timeTagRe.lastIndex = 0;

    while ((m = timeTagRe.exec(line)) !== null) {
      const min = parseInt(m[1], 10);
      const sec = parseInt(m[2], 10);
      const ms = m[3] ? parseInt(m[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      timestamps.push(min * 60 + sec + ms / 1000);
    }

    if (timestamps.length === 0) continue;

    // Extract text after the last timestamp
    const textStart = line.lastIndexOf(']') + 1;
    let text = line.slice(textStart).trim();

    // Strip enhanced LRC word-level tags
    text = text.replace(/<\d{1,3}:\d{2}(?:\.\d{2,3})?>/g, '').trim();

    if (!text) continue;

    // Apply global offset
    for (const t of timestamps) {
      const adjusted = t + offsetMs / 1000;
      if (adjusted < 0) continue;
      result.push({ time: adjusted, text });
    }
  }

  result.sort((a, b) => a.time - b.time);
  return result;
}

/**
 * Find the index of the active lyric line given current playback time.
 * Returns -1 before the first line, otherwise the last line whose time <= currentTime.
 * Uses binary search for large lyric sets.
 */
export function findActiveLineIndex(lyrics: LyricLine[], currentTime: number): number {
  if (lyrics.length === 0) return -1;

  let lo = 0;
  let hi = lyrics.length - 1;
  let best = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (lyrics[mid].time <= currentTime) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return best;
}

/**
 * Convert a LyricLine[] back to LRC format text (for editing / export).
 */
export function lyricsToLRC(lyrics: LyricLine[]): string {
  const lines: string[] = [];
  for (const line of lyrics) {
    const min = Math.floor(line.time / 60);
    const sec = Math.floor(line.time % 60);
    const ms = Math.round((line.time % 1) * 100);
    const ts = `[${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms).padStart(2, '0')}]`;
    lines.push(`${ts}${line.text}`);
  }
  return lines.join('\n');
}
