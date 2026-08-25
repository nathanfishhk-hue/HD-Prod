// Web Audio API beep synthesizer for rest timer completion & set logging
class AudioSynth {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTimerBeep() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // 3 short ascending beeps + 1 final long heavy tone
      [0, 0.2, 0.4].forEach((delay, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800 + i * 200, now + delay);
        
        gain.gain.setValueAtTime(0.3, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.12);
      });

      // Final deep completion tone
      const finalOsc = this.ctx.createOscillator();
      const finalGain = this.ctx.createGain();
      finalOsc.type = 'sawtooth';
      finalOsc.frequency.setValueAtTime(440, now + 0.6);
      
      finalGain.gain.setValueAtTime(0.4, now + 0.6);
      finalGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      finalOsc.connect(finalGain);
      finalGain.connect(this.ctx.destination);

      finalOsc.start(now + 0.6);
      finalOsc.stop(now + 1.2);
    } catch {
      // Audio fallback
    }
  }

  public playLogSuccessBeep() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio fallback
    }
  }
}

export const audioSynth = new AudioSynth();
