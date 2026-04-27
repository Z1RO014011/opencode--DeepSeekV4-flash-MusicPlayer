import { useRef, useCallback, useEffect } from 'react';

export function useAudioEngine() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const currentNoteIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const startTimeRef = useRef(0);
  const pausedAtRef = useRef(0);

  const melody = [
    262, 294, 330, 349, 392, 440, 494, 523,
    494, 440, 392, 349, 330, 294, 262, 294,
    330, 262, 330, 349, 392, 440, 494, 523,
    587, 659, 698, 784, 698, 659, 587, 523,
  ];

  const noteDuration = 0.3;

  function getContext(): AudioContext {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }

  const playTone = useCallback(() => {
    const ctx = getContext();
    const now = ctx.currentTime;
    const noteIndex = currentNoteIndexRef.current;
    const freq = melody[noteIndex % melody.length];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.setValueAtTime(freq * 1.005, now + 0.05);
    osc.frequency.setValueAtTime(freq, now + 0.1);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + noteDuration * 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + noteDuration);

    const nextNoteTime = now + noteDuration * 0.85;
    currentNoteIndexRef.current = (noteIndex + 1) % melody.length;

    if (isPlayingRef.current) {
      const timeout = (nextNoteTime - ctx.currentTime) * 1000;
      setTimeout(() => playTone(), Math.max(0, timeout - 10));
    }
  }, [melody]);

  const start = useCallback(() => {
    const ctx = getContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    isPlayingRef.current = true;
    startTimeRef.current = ctx.currentTime;
    pausedAtRef.current = 0;
    currentNoteIndexRef.current = 0;
    playTone();
  }, [playTone]);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
  }, []);

  const cleanup = useCallback(() => {
    isPlayingRef.current = false;
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { start, stop, cleanup, getContext };
}
