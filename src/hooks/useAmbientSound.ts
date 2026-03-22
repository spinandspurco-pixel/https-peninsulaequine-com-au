/**
 * Procedural ambient sound engine for Experience the Build.
 *
 * Uses Web Audio API to generate continuous, non-looping
 * atmospheric textures that respond to scroll position.
 *
 * All sound is OFF by default. Crossfades between scenes
 * use 700ms gain ramps for smooth transitions.
 */

import { useRef, useCallback, useEffect, useState } from "react";

/* ── Scene ambient profiles ─────────────────────────── */
export type AmbientScene =
  | "hero"
  | "masterplan"
  | "walk-arrival"
  | "walk-entry"
  | "walk-courtyard"
  | "walk-stables"
  | "walk-structure"
  | "walk-corridor"
  | "walk-arena"
  | "walk-viewing"
  | "walk-system"
  | "walk-cta"
  | "timeline-site"
  | "timeline-ground"
  | "timeline-structure"
  | "timeline-envelope"
  | "timeline-finished"
  | "synthesis"
  | "silent";

interface SceneProfile {
  /** Base volume 0–1 (will be scaled by master) */
  volume: number;
  /** Wind noise level */
  wind: number;
  /** Low tonal hum level */
  hum: number;
  /** Hum frequency */
  humFreq: number;
  /** High-pass filter cutoff for wind (higher = thinner) */
  windHighpass: number;
  /** Low-pass filter cutoff for wind (lower = muffled) */
  windLowpass: number;
  /** Resonance tone level */
  resonance: number;
  /** Resonance frequency */
  resonanceFreq: number;
}

const MASTER_VOLUME = 0.12;
const FADE_MS = 700;

const profiles: Record<AmbientScene, SceneProfile> = {
  hero:              { volume: 0.6, wind: 0.5,  hum: 0,    humFreq: 80,  windHighpass: 200, windLowpass: 2000, resonance: 0,    resonanceFreq: 220 },
  masterplan:        { volume: 0.35, wind: 0.4, hum: 0,    humFreq: 80,  windHighpass: 300, windLowpass: 1800, resonance: 0,    resonanceFreq: 220 },
  "walk-arrival":    { volume: 0.6, wind: 0.6,  hum: 0,    humFreq: 80,  windHighpass: 150, windLowpass: 2200, resonance: 0,    resonanceFreq: 220 },
  "walk-entry":      { volume: 0.5, wind: 0.35, hum: 0,    humFreq: 80,  windHighpass: 400, windLowpass: 1600, resonance: 0.15, resonanceFreq: 180 },
  "walk-courtyard":  { volume: 0.5, wind: 0.3,  hum: 0,    humFreq: 80,  windHighpass: 250, windLowpass: 1800, resonance: 0.1,  resonanceFreq: 200 },
  "walk-stables":    { volume: 0.45, wind: 0.2, hum: 0.08, humFreq: 90,  windHighpass: 350, windLowpass: 1400, resonance: 0.12, resonanceFreq: 165 },
  "walk-structure":  { volume: 0.55, wind: 0.15,hum: 0.2,  humFreq: 65,  windHighpass: 300, windLowpass: 1200, resonance: 0.08, resonanceFreq: 130 },
  "walk-corridor":   { volume: 0.45, wind: 0.25,hum: 0.05, humFreq: 75,  windHighpass: 300, windLowpass: 1500, resonance: 0.1,  resonanceFreq: 175 },
  "walk-arena":      { volume: 0.55, wind: 0.45,hum: 0,    humFreq: 80,  windHighpass: 150, windLowpass: 2400, resonance: 0,    resonanceFreq: 220 },
  "walk-viewing":    { volume: 0.3, wind: 0.2,  hum: 0,    humFreq: 80,  windHighpass: 400, windLowpass: 1600, resonance: 0,    resonanceFreq: 220 },
  "walk-system":     { volume: 0.45, wind: 0.35,hum: 0.06, humFreq: 70,  windHighpass: 200, windLowpass: 2000, resonance: 0.05, resonanceFreq: 200 },
  "walk-cta":        { volume: 0.3, wind: 0.25, hum: 0,    humFreq: 80,  windHighpass: 300, windLowpass: 1800, resonance: 0,    resonanceFreq: 220 },
  "timeline-site":   { volume: 0.5, wind: 0.3,  hum: 0.05, humFreq: 55,  windHighpass: 200, windLowpass: 1800, resonance: 0.1,  resonanceFreq: 140 },
  "timeline-ground": { volume: 0.45, wind: 0.2, hum: 0.12, humFreq: 60,  windHighpass: 300, windLowpass: 1400, resonance: 0.15, resonanceFreq: 120 },
  "timeline-structure":{ volume: 0.5, wind: 0.15,hum: 0.1, humFreq: 70,  windHighpass: 350, windLowpass: 1200, resonance: 0.2,  resonanceFreq: 155 },
  "timeline-envelope": { volume: 0.45, wind: 0.35,hum: 0,  humFreq: 80,  windHighpass: 200, windLowpass: 2000, resonance: 0.05, resonanceFreq: 200 },
  "timeline-finished": { volume: 0.5, wind: 0.4, hum: 0,   humFreq: 80,  windHighpass: 200, windLowpass: 2200, resonance: 0,    resonanceFreq: 220 },
  synthesis:         { volume: 0.35, wind: 0.3, hum: 0,    humFreq: 80,  windHighpass: 300, windLowpass: 1800, resonance: 0,    resonanceFreq: 220 },
  silent:            { volume: 0,   wind: 0,    hum: 0,    humFreq: 80,  windHighpass: 300, windLowpass: 1800, resonance: 0,    resonanceFreq: 220 },
};

/* ── Noise buffer generator ─────────────────────────── */
function createNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const sr = ctx.sampleRate;
  const length = sr * seconds;
  const buffer = ctx.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);

  // Brownian noise for natural wind texture
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

/* ── Hook ────────────────────────────────────────────── */
export function useAmbientSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const highpassRef = useRef<BiquadFilterNode | null>(null);
  const lowpassRef = useRef<BiquadFilterNode | null>(null);
  const humOscRef = useRef<OscillatorNode | null>(null);
  const humGainRef = useRef<GainNode | null>(null);
  const resOscRef = useRef<OscillatorNode | null>(null);
  const resGainRef = useRef<GainNode | null>(null);
  const initRef = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const currentScene = useRef<AmbientScene>("silent");

  const initAudio = useCallback(() => {
    if (initRef.current) return;
    initRef.current = true;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Master gain
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterGainRef.current = master;

    // Wind noise chain: source → highpass → lowpass → gain → master
    const noiseBuffer = createNoiseBuffer(ctx, 6);
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    noiseSourceRef.current = source;

    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 200;
    hp.Q.value = 0.5;
    highpassRef.current = hp;

    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2000;
    lp.Q.value = 0.7;
    lowpassRef.current = lp;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseGainRef.current = noiseGain;

    source.connect(hp);
    hp.connect(lp);
    lp.connect(noiseGain);
    noiseGain.connect(master);
    source.start();

    // Hum oscillator
    const humOsc = ctx.createOscillator();
    humOsc.type = "sine";
    humOsc.frequency.value = 80;
    humOscRef.current = humOsc;

    const humGain = ctx.createGain();
    humGain.gain.value = 0;
    humGainRef.current = humGain;

    humOsc.connect(humGain);
    humGain.connect(master);
    humOsc.start();

    // Resonance oscillator (triangle for warmth)
    const resOsc = ctx.createOscillator();
    resOsc.type = "triangle";
    resOsc.frequency.value = 220;
    resOscRef.current = resOsc;

    const resGain = ctx.createGain();
    resGain.gain.value = 0;
    resGainRef.current = resGain;

    resOsc.connect(resGain);
    resGain.connect(master);
    resOsc.start();
  }, []);

  const rampTo = useCallback(
    (param: AudioParam, value: number, ms = FADE_MS) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      param.cancelScheduledValues(ctx.currentTime);
      param.setValueAtTime(param.value, ctx.currentTime);
      param.linearRampToValueAtTime(value, ctx.currentTime + ms / 1000);
    },
    []
  );

  const transitionTo = useCallback(
    (scene: AmbientScene) => {
      currentScene.current = scene;
      const p = profiles[scene];
      const ctx = ctxRef.current;
      if (!ctx || !enabled) return;

      const vol = p.volume * MASTER_VOLUME;
      rampTo(masterGainRef.current!.gain, vol);
      rampTo(noiseGainRef.current!.gain, p.wind);
      rampTo(highpassRef.current!.frequency, p.windHighpass);
      rampTo(lowpassRef.current!.frequency, p.windLowpass);
      rampTo(humGainRef.current!.gain, p.hum);
      rampTo(humOscRef.current!.frequency, p.humFreq);
      rampTo(resGainRef.current!.gain, p.resonance);
      rampTo(resOscRef.current!.frequency, p.resonanceFreq);
    },
    [enabled, rampTo]
  );

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        initAudio();
        // Resume context (browser autoplay policy)
        ctxRef.current?.resume();
        // Apply current scene
        setTimeout(() => {
          const p = profiles[currentScene.current];
          const vol = p.volume * MASTER_VOLUME;
          rampTo(masterGainRef.current!.gain, vol);
          rampTo(noiseGainRef.current!.gain, p.wind);
          rampTo(highpassRef.current!.frequency, p.windHighpass);
          rampTo(lowpassRef.current!.frequency, p.windLowpass);
          rampTo(humGainRef.current!.gain, p.hum);
          rampTo(humOscRef.current!.frequency, p.humFreq);
          rampTo(resGainRef.current!.gain, p.resonance);
          rampTo(resOscRef.current!.frequency, p.resonanceFreq);
        }, 50);
      } else {
        rampTo(masterGainRef.current!.gain, 0);
      }
      return next;
    });
  }, [initAudio, rampTo]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return { enabled, toggle, transitionTo };
}
