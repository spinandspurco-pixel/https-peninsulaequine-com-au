/**
 * useSoundSystem — Ultra-minimal, premium sound cues
 *
 * Sounds are barely perceptible — the user feels precision
 * without consciously noticing audio.
 *
 * Respects browser autoplay policies with silent fallback.
 */

import { useCallback, useEffect, useRef } from "react";
import tickSrc from "@/assets/audio/tick.wav";
import whooshSrc from "@/assets/audio/whoosh.wav";
import toneSrc from "@/assets/audio/tone.wav";

type SoundName = "tick" | "whoosh" | "tone";

const SOUND_MAP: Record<SoundName, string> = {
  tick: tickSrc,
  whoosh: whooshSrc,
  tone: toneSrc,
};

/** Master volume — extremely low, barely perceptible */
const VOLUME: Record<SoundName, number> = {
  tick: 0.06,
  whoosh: 0.04,
  tone: 0.03,
};

let audioUnlocked = false;
const audioCache = new Map<SoundName, HTMLAudioElement>();

function preload() {
  (Object.entries(SOUND_MAP) as [SoundName, string][]).forEach(([name, src]) => {
    if (audioCache.has(name)) return;
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = VOLUME[name];
    audioCache.set(name, audio);
  });
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Play silent tick to unlock audio context on first interaction
  const audio = audioCache.get("tick");
  if (audio) {
    audio.volume = 0;
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = VOLUME.tick;
    }).catch(() => {});
  }
}

function playSound(name: SoundName) {
  const src = SOUND_MAP[name];
  if (!src) return;

  try {
    // Clone for overlapping plays
    const audio = new Audio(src);
    audio.volume = VOLUME[name];
    audio.play().catch(() => {});
  } catch {
    // Silent fallback
  }
}

export function useSoundSystem() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    preload();

    // Unlock audio on first user interaction
    const unlock = () => {
      unlockAudio();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const tick = useCallback(() => playSound("tick"), []);
  const whoosh = useCallback(() => playSound("whoosh"), []);
  const tone = useCallback(() => playSound("tone"), []);

  return { tick, whoosh, tone };
}
