// Unified Audio & AI Bot Voice Synthesizer for 3D Roadmap

class RoadmapAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.isVoiceEnabled = true;
    this.bgmAudio = null;
    this.bgmGain = null;
    this.isBgmPlaying = false;
    this.synthInterval = null;
    this.currentUtterance = null;
    this.selectedVoice = null;
    this.onVoiceStartCallback = null;
    this.onVoiceEndCallback = null;
    this.onWordCallback = null;

    if (typeof window !== "undefined") {
      this.initSpeech();
    }
  }

  ensureAudioContext() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  initSpeech() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high-quality natural English voices
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Arthur"))
      );
      this.selectedVoice = preferred || voices.find((v) => v.lang.startsWith("en")) || voices[0];
    };

    pickVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }
  }

  startBgm() {
    if (this.isBgmPlaying || this.isMuted) return;

    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio("/background-music.mp3");
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.35;
      }

      const playPromise = this.bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isBgmPlaying = true;
          })
          .catch(() => {
            // If browser blocked audio file autoplay, start procedural ambient synth
            this.startProceduralAmbient();
          });
      }
    } catch (_) {
      this.startProceduralAmbient();
    }
  }

  stopBgm() {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch (_) {}
    }
    this.stopProceduralAmbient();
    this.isBgmPlaying = false;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.bgmAudio) this.bgmAudio.muted = true;
      this.stopProceduralAmbient();
      this.stopSpeaking();
    } else {
      if (this.bgmAudio) {
        this.bgmAudio.muted = false;
        this.startBgm();
      } else {
        this.startBgm();
      }
    }
    return this.isMuted;
  }

  setMuted(muted) {
    this.isMuted = Boolean(muted);
    if (this.bgmAudio) this.bgmAudio.muted = this.isMuted;
    if (this.isMuted) {
      this.stopProceduralAmbient();
      this.stopSpeaking();
    } else {
      this.startBgm();
    }
  }

  // Fallback Procedural Lo-Fi Ambient Synth (uses Web Audio API)
  startProceduralAmbient() {
    if (this.isBgmPlaying || this.isMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    const chords = [
      [261.63, 329.63, 392.0, 493.88], // Cmaj7
      [220.0, 261.63, 329.63, 392.0],  // Am7
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [196.0, 246.94, 293.66, 349.23], // G7
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.isBgmPlaying || this.isMuted) return;
      const now = ctx.currentTime;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, now);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(650, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.022, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 5.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 5.5);
      });
    };

    playChord();
    this.synthInterval = setInterval(playChord, 5200);
  }

  stopProceduralAmbient() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  // Milestone Checkpoint Ding Chime
  playMilestoneChime() {
    if (this.isMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  // Soft walking footstep on asphalt
  playFootstep() {
    if (this.isMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(120 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Crisp button tap
  playClick() {
    if (this.isMuted) return;
    const ctx = this.ensureAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // AI BOT VOICE GUIDER (SpeechSynthesis)
  speak(text, { onStart, onEnd, onBoundary } = {}) {
    if (!this.isVoiceEnabled || this.isMuted) {
      if (onEnd) onEnd();
      return;
    }

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any previous speech immediately
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#•\-\n]/g, " ").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    utterance.volume = 0.95;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          onBoundary(event.charIndex);
        }
      };
    }

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  toggleVoice() {
    this.isVoiceEnabled = !this.isVoiceEnabled;
    if (!this.isVoiceEnabled) {
      this.stopSpeaking();
    }
    return this.isVoiceEnabled;
  }
}

export const roadmapAudio = new RoadmapAudioEngine();
