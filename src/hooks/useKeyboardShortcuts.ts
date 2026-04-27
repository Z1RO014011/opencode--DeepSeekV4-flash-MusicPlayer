import { useEffect } from 'react';

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el || el === document.body) return false;
  if (INPUT_TAGS.has(el.tagName)) return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

interface ShortcutHandlers {
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  volumeUp: () => void;
  volumeDown: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  seekForward: () => void;
  seekBackward: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, active: boolean) {
  useEffect(() => {
    if (!active) return;

    function handleKey(e: KeyboardEvent) {
      if (isInputFocused()) return;
      if (e.metaKey || e.ctrlKey) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlers.togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            handlers.seekBackward();
          } else {
            handlers.prevTrack();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            handlers.seekForward();
          } else {
            handlers.nextTrack();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlers.volumeUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handlers.volumeDown();
          break;
        case 'KeyS':
          e.preventDefault();
          handlers.toggleShuffle();
          break;
        case 'KeyR':
          e.preventDefault();
          handlers.cycleRepeat();
          break;
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [active, handlers]);
}
