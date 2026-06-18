class AlarmSoundEngine {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private currentRingtone: string = "chime";

  constructor() {
    // Lazy initialize so AudioContext isn't created before user interaction
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setRingtone(name: string) {
    this.currentRingtone = name;
  }

  public getRingtone(): string {
    return this.currentRingtone;
  }

  public play() {
    this.stop(); // Safe guard
    const ctx = this.getAudioContext();
    const ringtone = this.currentRingtone;

    if (ringtone === "digital") {
      this.playDigital(ctx);
    } else if (ringtone === "chime") {
      this.playChime(ctx);
    } else if (ringtone === "whistle") {
      this.playWhistle(ctx);
    } else if (ringtone === "zen") {
      this.playZen(ctx);
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.activeNodes.forEach(node => {
      try {
        node.osc.stop();
        node.osc.disconnect();
        node.gain.disconnect();
      } catch (e) {
        // ignore
      }
    });
    this.activeNodes = [];
  }

  private playDigital(ctx: AudioContext) {
    // Repeat: Beep-Beep ... beep-beep
    let step = 0;
    const triggerBeep = () => {
      const now = ctx.currentTime;
      
      // Beep 1
      this.createBeep(ctx, 2500, now, 0.12);
      // Beep 2
      this.createBeep(ctx, 2500, now + 0.18, 0.12);
    };

    triggerBeep();
    this.intervalId = setInterval(triggerBeep, 1000);
  }

  private createBeep(ctx: AudioContext, freq: number, startTime: number, duration: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.setValueAtTime(0.2, startTime + duration - 0.02);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);

    // Track active nodes
    const nodeRef = { osc, gain };
    this.activeNodes.push(nodeRef);
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n !== nodeRef);
    }, (startTime + duration - ctx.currentTime) * 1000 + 100);
  }

  private playChime(ctx: AudioContext) {
    // Warm celestial chime arpeggio: C5, E5, G5, C6 (523Hz, 659Hz, 784Hz, 1046Hz) repeating
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    let index = 0;

    const triggerChime = () => {
      const freq = freqs[index % freqs.length];
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      // Soft vibrato
      osc.frequency.linearRampToValueAtTime(freq + 4, now + 0.4);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.start(now);
      osc.stop(now + 1.3);

      const nodeRef = { osc, gain };
      this.activeNodes.push(nodeRef);
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n !== nodeRef);
      }, 1500);

      index++;
    };

    triggerChime();
    this.intervalId = setInterval(triggerChime, 450);
  }

  private playWhistle(ctx: AudioContext) {
    // Playful kettle/chef whistle
    const triggerWhistle = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      
      // frequency sweeper: up to high then back down
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
      osc.frequency.exponentialRampToValueAtTime(1300, now + 0.6);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      osc.start(now);
      osc.stop(now + 0.8);

      const nodeRef = { osc, gain };
      this.activeNodes.push(nodeRef);
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n !== nodeRef);
      }, 1000);
    };

    triggerWhistle();
    this.intervalId = setInterval(triggerWhistle, 900);
  }

  private playZen(ctx: AudioContext) {
    // Deep rich Tibetan singing bowl pulse
    const triggerZen = () => {
      const now = ctx.currentTime;

      // Base tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator(); // detuned for sweet warm resonance
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(220, now); // A3

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(221.5, now); // slightly detuned

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      // Slow pulse fade out
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc1.start(now);
      osc1.stop(now + 3.2);

      osc2.start(now);
      osc2.stop(now + 3.2);

      const nodeRef1 = { osc: osc1, gain };
      const nodeRef2 = { osc: osc2, gain };
      this.activeNodes.push(nodeRef1, nodeRef2);
      setTimeout(() => {
        this.activeNodes = this.activeNodes.filter(n => n !== nodeRef1 && n !== nodeRef2);
      }, 3500);
    };

    triggerZen();
    this.intervalId = setInterval(triggerZen, 2800);
  }
}

export const alarmSoundEngine = new AlarmSoundEngine();
