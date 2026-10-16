class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.stepIndex = 0;
    this.jetpackActive = false;
    this.jetpackNodes = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playJump(isDouble = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = isDouble ? 360 : 240;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, now + 0.16);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  playBeanCollect(combo = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const pitchBoost = Math.min(combo * 35, 350);
    osc.frequency.setValueAtTime(587.33 + pitchBoost, now);
    osc.frequency.setValueAtTime(880 + pitchBoost, now + 0.055);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  playSpoonSwing(upgraded = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = upgraded ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(upgraded ? 520 : 380, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.14);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  }

  playEspressoShot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Crisp pneumatic bean-blaster pop!
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(145, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playEnemyDefeat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. High-impact cartoon inflation POP!
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(190, now);
    popOsc.frequency.exponentialRampToValueAtTime(680, now + 0.065);
    popOsc.frequency.exponentialRampToValueAtTime(110, now + 0.19);
    popGain.gain.setValueAtTime(0.24, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);
    popOsc.start(now);
    popOsc.stop(now + 0.22);

    // 2. Juicy bubbly pink-goo SPLAT cascade!
    const splatFreqs = [420, 560, 310, 490, 240];
    splatFreqs.forEach((f, idx) => {
      const t = now + 0.04 + idx * 0.032;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.06);
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    });
  }

  playSugarCrumble() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.09);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playHurt() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.linearRampToValueAtTime(85, now + 0.28);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  playProductUnlock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    });
  }

  playDeagleShot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Heavy magnum sub-bass cannon thud!
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(260, now);
    bassOsc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
    bassGain.gain.setValueAtTime(0.38, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.25);

    // 2. High-caliber supersonic crack!
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.setValueAtTime(920, now);
    crackOsc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    crackGain.gain.setValueAtTime(0.24, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    crackOsc.connect(crackGain);
    crackGain.connect(this.ctx.destination);
    crackOsc.start(now);
    crackOsc.stop(now + 0.1);
  }

  playMarshmallowBounce() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.18);

    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playGemCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [1046.5, 1318.5, 1568.0, 2093.0];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.035;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }

  startJetpackSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    if (this.jetpackActive && this.jetpackNodes) return;

    this.jetpackActive = true;
    const now = this.ctx.currentTime;

    // Create white noise buffer for continuous rocket steam hiss
    const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Resonant bandpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(680, now);
    filter.Q.setValueAtTime(3.2, now);

    // Deep sub-bass rocket turbine rumble
    const rumbleOsc = this.ctx.createOscillator();
    rumbleOsc.type = 'triangle';
    rumbleOsc.frequency.setValueAtTime(95, now);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.12, now);

    // Master jetpack gain
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.linearRampToValueAtTime(0.22, now + 0.06);

    whiteNoise.connect(filter);
    filter.connect(masterGain);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(masterGain);

    masterGain.connect(this.ctx.destination);

    whiteNoise.start(now);
    rumbleOsc.start(now);

    this.jetpackNodes = { whiteNoise, filter, rumbleOsc, masterGain };
  }

  updateJetpackSound(intensity = 1) {
    if (!this.jetpackNodes || !this.ctx) return;
    const now = this.ctx.currentTime;
    const freq = 650 + Math.min(1, intensity) * 850;
    this.jetpackNodes.filter.frequency.setTargetAtTime(freq, now, 0.05);
    this.jetpackNodes.masterGain.gain.setTargetAtTime(0.16 + intensity * 0.08, now, 0.05);
  }

  stopJetpackSound() {
    if (!this.jetpackActive || !this.jetpackNodes || !this.ctx) return;
    this.jetpackActive = false;
    const now = this.ctx.currentTime;
    const nodes = this.jetpackNodes;
    this.jetpackNodes = null;

    nodes.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.08);
    setTimeout(() => {
      try {
        nodes.whiteNoise.stop();
        nodes.rumbleOsc.stop();
        nodes.whiteNoise.disconnect();
        nodes.rumbleOsc.disconnect();
        nodes.masterGain.disconnect();
      } catch (e) {}
    }, 100);
  }

  playJetpackPickup() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Ascending brass/synth powerup fanfare
    const freqs = [392.0, 523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  playRingFlythrough() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }
}

export const sound = new SoundManager();
