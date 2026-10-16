class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.stepIndex = 0;
    this.currentLevel = 1;
    this.jetpackActive = false;
    this.jetpackNodes = null;
    this.cachedNoiseBuffer = null;
    this.bgmGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.jetpackActive && this.muted) {
      this.stopJetpackSound();
    }
    return this.muted;
  }

  toggleBgm() {
    this.init();
    if (this.bgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.bgmPlaying;
  }

  toggleMasterMute() {
    this.init();
    const newMuted = !this.muted;
    this.muted = newMuted;
    this.bgmMuted = newMuted;
    if (this.bgmGain && this.ctx) {
      const targetGain = newMuted ? 0.0001 : 0.18;
      this.bgmGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }
    if (newMuted && this.jetpackActive) {
      this.stopJetpackSound();
    }
    return newMuted;
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

  getNoiseBuffer() {
    if (!this.cachedNoiseBuffer && this.ctx) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      this.cachedNoiseBuffer = buffer;
    }
    return this.cachedNoiseBuffer;
  }

  startJetpackSound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    if (this.jetpackActive && this.jetpackNodes) return;

    this.jetpackActive = true;
    const now = this.ctx.currentTime;

    const buffer = this.getNoiseBuffer();
    if (!buffer) return;

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

  playSupaSplatShot() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 1. Pneumatic pressure pop
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(360, now);
    popOsc.frequency.exponentialRampToValueAtTime(70, now + 0.11);

    popGain.gain.setValueAtTime(0.36, now);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    popOsc.connect(popGain);
    popGain.connect(this.ctx.destination);
    popOsc.start(now);
    popOsc.stop(now + 0.12);

    // 2. High-resonance juicy liquid SPLAT squelch
    const splatOsc = this.ctx.createOscillator();
    const splatGain = this.ctx.createGain();
    splatOsc.type = 'sawtooth';
    splatOsc.frequency.setValueAtTime(860, now + 0.015);
    splatOsc.frequency.exponentialRampToValueAtTime(220, now + 0.15);

    const splatFilter = this.ctx.createBiquadFilter();
    splatFilter.type = 'lowpass';
    splatFilter.frequency.setValueAtTime(1600, now + 0.015);
    splatFilter.frequency.exponentialRampToValueAtTime(450, now + 0.15);
    splatFilter.Q.setValueAtTime(4.2, now);

    splatGain.gain.setValueAtTime(0.001, now);
    splatGain.gain.setValueAtTime(0.22, now + 0.015);
    splatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    splatOsc.connect(splatFilter);
    splatFilter.connect(splatGain);
    splatGain.connect(this.ctx.destination);
    splatOsc.start(now + 0.015);
    splatOsc.stop(now + 0.18);
  }

  // =========================================================================
  // AMBIENT BACKGROUND MUSIC ENGINE (Procedural Web Audio Coffeehouse Chillhop)
  // Zero external audio files required, seamless looping, adaptive by level!
  // =========================================================================

  setBgmLevel(lvl = 1) {
    this.currentLevel = lvl;
  }

  startBgm() {
    this.init();
    if (!this.ctx || this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.stepIndex = 0;

    if (this.bgmGain) {
      const vol = this.bgmMuted ? 0.0001 : 0.18;
      this.bgmGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.15);
    }

    const stepMs = 380; // ~79 BPM eighth-note pulse
    const scheduleNext = () => {
      if (!this.bgmPlaying) return;
      this.playBgmStep(this.stepIndex);
      this.stepIndex = (this.stepIndex + 1) % 16;
      this.bgmTimer = setTimeout(scheduleNext, stepMs);
    };

    scheduleNext();
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
    }
  }

  playBgmStep(step) {
    if (!this.ctx || this.bgmMuted || !this.bgmGain) return;
    const now = this.ctx.currentTime;
    const bar = Math.floor(step / 4);
    const beat = step % 4;

    // Harmonic chord palettes by level
    const palettes = {
      1: [
        [146.83, 220.0, 261.63, 329.63], // Dm9
        [98.0, 196.0, 246.94, 329.63],   // G13
        [130.81, 196.0, 246.94, 293.66], // Cmaj9
        [110.0, 164.81, 261.63, 329.63]  // Am7
      ],
      2: [
        [87.31, 174.61, 207.65, 311.13], // Fm9
        [116.54, 207.65, 293.66, 392.0], // Bb13
        [77.78, 155.56, 196.0, 293.66],  // Ebmaj9
        [130.81, 196.0, 261.63, 349.23]  // Cm7
      ],
      3: [
        [103.83, 207.65, 261.63, 392.0], // Abmaj9 (Celestial Starlight)
        [77.78, 155.56, 233.08, 349.23],  // Ebmaj7
        [87.31, 174.61, 261.63, 311.13],  // Fm9
        [138.59, 174.61, 207.65, 329.63] // Dbmaj7
      ]
    };

    const currentPalette = palettes[this.currentLevel] || palettes[1];
    const currentChord = currentPalette[bar];

    // 1. Warm Electric Piano / Rhodes Chord Pad (triggered on beat 0 and beat 2 of each bar)
    if (beat === 0 || beat === 2) {
      currentChord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = this.currentLevel === 3 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(this.currentLevel === 3 ? 1200 : 750, now);
        filter.Q.setValueAtTime(1.5, now);

        const chordVol = (beat === 0 ? 0.038 : 0.024) / currentChord.length;
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(chordVol, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.72);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.74);
      });
    }

    // 2. Round Acoustic Sub-Bass on downbeats
    if (beat === 0 || (beat === 2 && step % 8 === 6)) {
      const bassFreq = currentChord[0] * 0.5;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.08, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      bassOsc.connect(bassGain);
      bassGain.connect(this.bgmGain);
      bassOsc.start(now);
      bassOsc.stop(now + 0.56);
    }

    // 3. Delicate Lo-Fi Coffee Drums
    // Soft acoustic kick on step 0 and step 6
    if (step === 0 || step === 6 || step === 10) {
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(110, now);
      kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.09);

      kickGain.gain.setValueAtTime(0.09, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      kickOsc.connect(kickGain);
      kickGain.connect(this.bgmGain);
      kickOsc.start(now);
      kickOsc.stop(now + 0.12);
    }

    // Soft brush snare / rim click on step 4 and step 12
    if (step === 4 || step === 12) {
      const noiseBuf = this.getNoiseBuffer();
      if (noiseBuf) {
        const snareNoise = this.ctx.createBufferSource();
        snareNoise.buffer = noiseBuf;
        const snareFilter = this.ctx.createBiquadFilter();
        snareFilter.type = 'bandpass';
        snareFilter.frequency.setValueAtTime(2400, now);
        snareFilter.Q.setValueAtTime(2.2, now);

        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.045, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        snareNoise.connect(snareFilter);
        snareFilter.connect(snareGain);
        snareGain.connect(this.bgmGain);
        snareNoise.start(now);
        snareNoise.stop(now + 0.09);
      }
    }

    // Gentle shaker / hi-hat on every step
    if (step % 2 === 0) {
      const noiseBuf = this.getNoiseBuffer();
      if (noiseBuf) {
        const hat = this.ctx.createBufferSource();
        hat.buffer = noiseBuf;
        const hatFilter = this.ctx.createBiquadFilter();
        hatFilter.type = 'highpass';
        hatFilter.frequency.setValueAtTime(6500, now);

        const hatGain = this.ctx.createGain();
        const hatVol = step % 4 === 0 ? 0.022 : 0.014;
        hatGain.gain.setValueAtTime(hatVol, now);
        hatGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.035);

        hat.connect(hatFilter);
        hatFilter.connect(hatGain);
        hatGain.connect(this.bgmGain);
        hat.start(now);
        hat.stop(now + 0.04);
      }
    }

    // 4. Ethereal Chime Bells (Twinkling pentatonic notes floating on high octaves)
    if (step === 1 || step === 3 || step === 7 || step === 11 || step === 14) {
      const bellFreq = currentChord[step % currentChord.length] * 2.0;
      const bellOsc = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(bellFreq, now);

      bellGain.gain.setValueAtTime(0.018, now);
      bellGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.32);

      bellOsc.connect(bellGain);
      bellGain.connect(this.bgmGain);
      bellOsc.start(now);
      bellOsc.stop(now + 0.34);
    }
  }
}

export const sound = new SoundManager();
