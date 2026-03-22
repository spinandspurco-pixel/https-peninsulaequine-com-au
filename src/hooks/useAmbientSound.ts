/**
 * Procedural ambient sound engine for Experience the Build.
 *
 * Uses Web Audio API to generate continuous, non-looping
 * atmospheric textures that respond to scroll position and interaction.
 *
 * All sound is OFF by default. Asymmetric crossfades between scenes:
 * outgoing fades faster (~450ms), incoming fades slower (~800ms).
 *
 * Four priority levels control volume by scene type:
 *   L1 (near silence): masterplan, viewing, synthesis
 *   L2 (light): arrival, entry, courtyard
 *   L3 (moderate): stables, arena
 *   L4 (emphasis): structure reveal, ground system
 *
 * Slow ambient modulation (8–12s cycles) prevents loop perception.
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
  volume: number;
  wind: number;
  hum: number;
  humFreq: number;
  windHighpass: number;
  windLowpass: number;
  resonance: number;
  resonanceFreq: number;
}

const MASTER_VOLUME = 0.12;

/* Asymmetric fade durations */
const FADE_OUT_MS = 450;
const FADE_IN_MS = 800;

/*
 * Priority mixing levels:
 *   L1 ≈ 0.18–0.25   (near silence)
 *   L2 ≈ 0.35–0.45   (light ambient)
 *   L3 ≈ 0.50–0.55   (moderate)
 *   L4 ≈ 0.60–0.65   (emphasis moments)
 */
const profiles: Record<AmbientScene, SceneProfile> = {
  // L2 — light
  hero:                { volume: 0.40, wind: 0.45, hum: 0,    humFreq: 80,  windHighpass: 200, windLowpass: 2000, resonance: 0,    resonanceFreq: 220 },
  // L1 — near silence
  masterplan:          { volume: 0.20, wind: 0.25, hum: 0,    humFreq: 80,  windHighpass: 350, windLowpass: 1600, resonance: 0,    resonanceFreq: 220 },
  // L2
  "walk-arrival":      { volume: 0.42, wind: 0.50, hum: 0,    humFreq: 80,  windHighpass: 150, windLowpass: 2200, resonance: 0,    resonanceFreq: 220 },
  "walk-entry":        { volume: 0.38, wind: 0.30, hum: 0,    humFreq: 80,  windHighpass: 400, windLowpass: 1600, resonance: 0.08, resonanceFreq: 180 },
  "walk-courtyard":    { volume: 0.40, wind: 0.28, hum: 0,    humFreq: 80,  windHighpass: 250, windLowpass: 1800, resonance: 0.06, resonanceFreq: 200 },
  // L3
  "walk-stables":      { volume: 0.50, wind: 0.20, hum: 0.08, humFreq: 90,  windHighpass: 350, windLowpass: 1400, resonance: 0.10, resonanceFreq: 165 },
  // L4 — emphasis
  "walk-structure":    { volume: 0.62, wind: 0.15, hum: 0.22, humFreq: 65,  windHighpass: 300, windLowpass: 1200, resonance: 0.12, resonanceFreq: 130 },
  // L2
  "walk-corridor":     { volume: 0.38, wind: 0.22, hum: 0.04, humFreq: 75,  windHighpass: 300, windLowpass: 1500, resonance: 0.08, resonanceFreq: 175 },
  // L3
  "walk-arena":        { volume: 0.52, wind: 0.42, hum: 0,    humFreq: 80,  windHighpass: 150, windLowpass: 2400, resonance: 0,    resonanceFreq: 220 },
  // L1
  "walk-viewing":      { volume: 0.22, wind: 0.15, hum: 0,    humFreq: 80,  windHighpass: 400, windLowpass: 1600, resonance: 0,    resonanceFreq: 220 },
  // L2
  "walk-system":       { volume: 0.38, wind: 0.30, hum: 0.05, humFreq: 70,  windHighpass: 200, windLowpass: 2000, resonance: 0.04, resonanceFreq: 200 },
  "walk-cta":          { volume: 0.25, wind: 0.20, hum: 0,    humFreq: 80,  windHighpass: 300, windLowpass: 1800, resonance: 0,    resonanceFreq: 220 },
  // L2
  "timeline-site":     { volume: 0.42, wind: 0.28, hum: 0.05, humFreq: 55,  windHighpass: 200, windLowpass: 1800, resonance: 0.08, resonanceFreq: 140 },
  // L4 — emphasis
  "timeline-ground":   { volume: 0.60, wind: 0.18, hum: 0.15, humFreq: 60,  windHighpass: 300, windLowpass: 1400, resonance: 0.18, resonanceFreq: 120 },
  // L4
  "timeline-structure":{ volume: 0.62, wind: 0.14, hum: 0.12, humFreq: 70,  windHighpass: 350, windLowpass: 1200, resonance: 0.22, resonanceFreq: 155 },
  // L2
  "timeline-envelope": { volume: 0.40, wind: 0.32, hum: 0,    humFreq: 80,  windHighpass: 200, windLowpass: 2000, resonance: 0.04, resonanceFreq: 200 },
  "timeline-finished": { volume: 0.42, wind: 0.35, hum: 0,    humFreq: 80,  windHighpass: 200, windLowpass: 2200, resonance: 0,    resonanceFreq: 220 },
  // L1
  synthesis:           { volume: 0.18, wind: 0.20, hum: 0,    humFreq: 80,  windHighpass: 350, windLowpass: 1600, resonance: 0,    resonanceFreq: 220 },
  silent:              { volume: 0,    wind: 0,    hum: 0,    humFreq: 80,  windHighpass: 300, windLowpass: 1800, resonance: 0,    resonanceFreq: 220 },
};

/* ── Noise buffer generator (Brownian) ──────────────── */
function createNoiseBuffer(ctx: AudioContext, seconds = 6): AudioBuffer {
  const sr = ctx.sampleRate;
  const length = sr * seconds;
  const buffer = ctx.createBuffer(1, length, sr);
  const data = buffer.getChannelData(0);

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
  /* Modulation LFO for wind variation */
  const modLfoRef = useRef<OscillatorNode | null>(null);
  const modGainRef = useRef<GainNode | null>(null);
  /* Interaction tone oscillator */
  const interOscRef = useRef<OscillatorNode | null>(null);
  const interGainRef = useRef<GainNode | null>(null);

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

    // Slow modulation LFO for wind variation (8–12s cycle)
    const modLfo = ctx.createOscillator();
    modLfo.type = "sine";
    modLfo.frequency.value = 0.1; // ~10s cycle
    modLfoRef.current = modLfo;

    const modGain = ctx.createGain();
    modGain.gain.value = 60; // modulates lowpass ±60Hz
    modGainRef.current = modGain;

    modLfo.connect(modGain);
    modGain.connect(lp.frequency);
    modLfo.start();

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

    // Interaction tone oscillator (high-frequency, very quiet)
    const interOsc = ctx.createOscillator();
    interOsc.type = "sine";
    interOsc.frequency.value = 2800;
    interOscRef.current = interOsc;

    const interGain = ctx.createGain();
    interGain.gain.value = 0;
    interGainRef.current = interGain;

    interOsc.connect(interGain);
    interGain.connect(master);
    interOsc.start();
  }, []);

  /* Asymmetric ramp: specify fade direction */
  const rampTo = useCallback(
    (param: AudioParam, value: number, direction: "in" | "out" | "neutral" = "neutral") => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const ms = direction === "out" ? FADE_OUT_MS : direction === "in" ? FADE_IN_MS : (value > param.value ? FADE_IN_MS : FADE_OUT_MS);
      param.cancelScheduledValues(ctx.currentTime);
      param.setValueAtTime(param.value, ctx.currentTime);
      param.linearRampToValueAtTime(value, ctx.currentTime + ms / 1000);
    },
    []
  );

  const applyProfile = useCallback(
    (p: SceneProfile) => {
      if (!ctxRef.current) return;
      const vol = p.volume * MASTER_VOLUME;

      // Master volume uses asymmetric fading
      const currentVol = masterGainRef.current!.gain.value;
      rampTo(masterGainRef.current!.gain, vol, vol > currentVol ? "in" : "out");

      // Wind: outgoing layers fade fast, incoming layers fade slow
      const currentWind = noiseGainRef.current!.gain.value;
      rampTo(noiseGainRef.current!.gain, p.wind, p.wind > currentWind ? "in" : "out");

      rampTo(highpassRef.current!.frequency, p.windHighpass, "in");
      rampTo(lowpassRef.current!.frequency, p.windLowpass, "in");

      const currentHum = humGainRef.current!.gain.value;
      rampTo(humGainRef.current!.gain, p.hum, p.hum > currentHum ? "in" : "out");
      rampTo(humOscRef.current!.frequency, p.humFreq, "in");

      const currentRes = resGainRef.current!.gain.value;
      rampTo(resGainRef.current!.gain, p.resonance, p.resonance > currentRes ? "in" : "out");
      rampTo(resOscRef.current!.frequency, p.resonanceFreq, "in");
    },
    [rampTo]
  );

  const transitionTo = useCallback(
    (scene: AmbientScene) => {
      currentScene.current = scene;
      if (!ctxRef.current || !enabled) return;
      applyProfile(profiles[scene]);
    },
    [enabled, applyProfile]
  );

  /* ── Interaction micro-tones ───────────────────────── */

  /** Hover tone: very soft high-frequency ping, ~200ms */
  const playHoverTone = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !enabled || !interGainRef.current) return;
    const g = interGainRef.current.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(0, ctx.currentTime);
    g.linearRampToValueAtTime(0.04, ctx.currentTime + 0.06);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
  }, [enabled]);

  /** Hover end: ensure tone fades */
  const stopHoverTone = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !interGainRef.current) return;
    const g = interGainRef.current.gain;
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(g.value, ctx.currentTime);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  }, []);

  /** Layer toggle: subtle tonal shift ~150ms */
  const playToggleTone = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !enabled || !interOscRef.current || !interGainRef.current) return;
    const osc = interOscRef.current;
    const g = interGainRef.current.gain;
    // Briefly shift frequency for tonal character
    osc.frequency.setValueAtTime(3200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(2800, ctx.currentTime + 0.15);
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(0, ctx.currentTime);
    g.linearRampToValueAtTime(0.025, ctx.currentTime + 0.04);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
  }, [enabled]);

  /** Button press: low-pressure tone, not a click */
  const playPressTone = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !enabled || !interOscRef.current || !interGainRef.current) return;
    const osc = interOscRef.current;
    const g = interGainRef.current.gain;
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(380, ctx.currentTime + 0.2);
    g.cancelScheduledValues(ctx.currentTime);
    g.setValueAtTime(0, ctx.currentTime);
    g.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
  }, [enabled]);

  /** Intro handoff: begin ambient wind before UI appears */
  const beginIntroHandoff = useCallback(() => {
    if (!ctxRef.current || !enabled) return;
    // Start with hero-level wind, seamless into first scene
    applyProfile(profiles.hero);
  }, [enabled, applyProfile]);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) {
        initAudio();
        ctxRef.current?.resume();
        setTimeout(() => {
          applyProfile(profiles[currentScene.current]);
        }, 50);
      } else {
        rampTo(masterGainRef.current!.gain, 0, "out");
      }
      return next;
    });
  }, [initAudio, rampTo, applyProfile]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (ctxRef.current && ctxRef.current.state !== "closed") {
        ctxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    enabled,
    toggle,
    transitionTo,
    playHoverTone,
    stopHoverTone,
    playToggleTone,
    playPressTone,
    beginIntroHandoff,
  };
}
