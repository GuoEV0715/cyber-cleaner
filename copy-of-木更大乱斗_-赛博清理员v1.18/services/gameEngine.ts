import { GameState, Player, Enemy, Projectile, Vector2D, WaveConfig } from "../types";
import { ENEMIES, BULLET_TEXTS, WAVES, CHARACTERS, DIFFICULTY_SETTINGS, WORKER_QUOTES } from "../data/memeContent";

export interface GameSettings {
  autoShoot: boolean;
  autoAim: boolean;
  soundEnabled: boolean;
  volume: number;
}

// Simple Audio Synthesizer & BGM
export class SoundManager {
  ctx: AudioContext | null = null;
  nodes: AudioNode[] = [];
  masterGain: GainNode | null = null;
  currentBgmType: 'battle' | 'shop' | 'story' | 'boss' | 'ambient' | 'gameover' | 'none' = 'none';
  muted: boolean = false;
  volume: number = 0.5;
  
  // Round robin for shooting sounds to reduce fatigue
  shootRR: number = 0;

  constructor() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.volume;
    } catch (e) {
      console.error("Web Audio API not supported");
    }
  }

  setVolume(vol: number) {
      this.volume = Math.max(0, Math.min(1, vol));
      if (this.masterGain) {
          this.masterGain.gain.value = this.muted ? 0 : this.volume;
      }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
      this.muted = mute;
      if (this.masterGain) {
          this.masterGain.gain.value = mute ? 0 : this.volume;
      }
      if (mute) {
          if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
      } else {
          if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      }
  }

  stopBGM() {
      this.nodes.forEach(n => {
          try { (n as any).stop && (n as any).stop(); } catch(e){}
          try { n.disconnect(); } catch(e){}
      });
      this.nodes = [];
      this.currentBgmType = 'none';
  }

  playAmbientBGM() {
      if (this.muted || !this.masterGain) return;
      // Don't restart if already playing ambient
      if (this.currentBgmType === 'ambient' && this.nodes.length > 0) return;
      
      this.stopBGM();
      this.currentBgmType = 'ambient';

      if (!this.ctx) return;

      // Ethereal Ambient Texture
      // Chords: Cmaj9 -> Fmaj7 -> Am9 -> G6
      const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [220.00, 261.63, 329.63, 392.00], // Am9
          [196.00, 246.94, 293.66, 329.63], // G6
      ];

      let chordIdx = 0;

      const playChord = () => {
          if (this.currentBgmType !== 'ambient' || !this.ctx || !this.masterGain) return;
          
          const notes = chords[chordIdx];
          notes.forEach((freq, i) => {
              if (!this.ctx) return;
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              
              osc.type = 'sine'; 
              // Detune slightly for richness
              osc.frequency.value = freq + (Math.random() - 0.5) * 2;
              
              const now = this.ctx.currentTime;
              const attack = 2.0 + Math.random();
              const decay = 4.0 + Math.random();
              
              gain.gain.setValueAtTime(0, now);
              gain.gain.linearRampToValueAtTime(0.05, now + attack);
              gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);

              osc.connect(gain);
              gain.connect(this.masterGain!);
              
              osc.start(now);
              osc.stop(now + attack + decay + 1);
              
              this.nodes.push(osc, gain); // Track nodes to stop later
          });

          chordIdx = (chordIdx + 1) % chords.length;
          setTimeout(playChord, 6000); // Slow changes
      };

      // Add a twinkling high note melody
      const playTwinkle = () => {
          if (this.currentBgmType !== 'ambient' || !this.ctx || !this.masterGain) return;
           const osc = this.ctx.createOscillator();
           const gain = this.ctx.createGain();
           osc.type = 'triangle';
           
           // Pentatonic scale C Major
           const scale = [523.25, 587.33, 659.25, 783.99, 880.00];
           const freq = scale[Math.floor(Math.random() * scale.length)];
           osc.frequency.value = freq;
           
           const now = this.ctx.currentTime;
           gain.gain.setValueAtTime(0, now);
           gain.gain.linearRampToValueAtTime(0.02, now + 0.5);
           gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);
           
           osc.connect(gain);
           gain.connect(this.masterGain!);
           osc.start(now);
           osc.stop(now + 2.0);
           this.nodes.push(osc, gain);

           setTimeout(playTwinkle, 2000 + Math.random() * 4000);
      };

      playChord();
      playTwinkle();
  }

  playStoryBGM() {
      if (this.muted || !this.masterGain) return;
      if (!this.ctx || this.currentBgmType === 'story') return;
      this.stopBGM();
      this.currentBgmType = 'story';

      // Humorous pizzicato style
      const notes = [261.63, 329.63, 392.00, 523.25]; // C Major chord arpeggio
      
      const playNote = () => {
          if (this.currentBgmType !== 'story' || !this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          
          // Randomize note
          const freq = notes[Math.floor(Math.random() * notes.length)] * (Math.random() > 0.8 ? 2 : 1);
          osc.frequency.value = freq;

          gain.gain.setValueAtTime(0, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15); // Very short

          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.2);

          // Irregular rhythm
          setTimeout(playNote, 150 + Math.random() * 300);
      };
      playNote();
  }

  playBossIntroBGM() {
      if (this.muted || !this.masterGain) return;
      if (!this.ctx || this.currentBgmType === 'boss') return;
      this.stopBGM();
      this.currentBgmType = 'boss';

      // "War Drums" - Low frequency impact
      const playDrum = () => {
          if (this.currentBgmType !== 'boss' || !this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(80, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.3);
          
          gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
          
          osc.connect(gain);
          gain.connect(this.masterGain!);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.5);
          
          this.nodes.push(osc, gain);
      };

      // "Tension" - High pitched dissonance
      const playTension = () => {
           if (this.currentBgmType !== 'boss' || !this.ctx || !this.masterGain) return;
           const osc = this.ctx.createOscillator();
           const gain = this.ctx.createGain();
           
           osc.type = 'sawtooth';
           osc.frequency.value = 800; 
           
           // LFO for vibrato
           const lfo = this.ctx.createOscillator();
           lfo.frequency.value = 15; 
           const lfoGain = this.ctx.createGain();
           lfoGain.gain.value = 20;
           
           lfo.connect(lfoGain);
           lfoGain.connect(osc.frequency);
           
           gain.gain.setValueAtTime(0, this.ctx.currentTime);
           gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 1);
           gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2);
           
           osc.connect(gain);
           gain.connect(this.masterGain!);
           
           osc.start();
           lfo.start();
           osc.stop(this.ctx.currentTime + 2.2);
           lfo.stop(this.ctx.currentTime + 2.2);
           
           this.nodes.push(osc, gain, lfo, lfoGain);
      };

      // Rhythm loop
      let beat = 0;
      const loop = () => {
          if (this.currentBgmType !== 'boss') return;
          if (beat % 4 === 0) playDrum(); // Boom
          if (beat % 8 === 6) playDrum(); // Boom offbeat
          if (beat % 16 === 0) playTension(); // Screech
          
          beat++;
          setTimeout(loop, 300); // 200 BPMish
      };
      loop();
  }

  playShopBGM() {
    if (this.muted || !this.masterGain) return;
    if (!this.ctx || this.currentBgmType === 'shop') return;
    this.stopBGM();
    this.currentBgmType = 'shop';

    // Elevator Music / Bossa Nova style
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
    
    const playNote = () => {
        if (this.currentBgmType !== 'shop' || !this.ctx || !this.masterGain) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Smoother sound
        osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
        
        const noteIdx = Math.floor(Math.random() * scale.length);
        let freq = scale[noteIdx];
        // Sometimes lower octave
        if (Math.random() > 0.7) freq /= 2;

        osc.frequency.value = freq;

        // Gentle envelope
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.0);

        // Slower tempo
        const duration = [400, 600, 800][Math.floor(Math.random() * 3)];
        setTimeout(playNote, duration);
    };
    
    playNote();
  }

  playBattleBGM() {
    if (this.muted || !this.masterGain) return;
    if (!this.ctx || this.currentBgmType === 'battle') return;
    this.stopBGM();
    this.currentBgmType = 'battle';

    // 1. Bass Drone (Driving)
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.value = 45; // Lower bass
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;

    bassOsc.connect(filter);
    filter.connect(bassGain);
    bassGain.connect(this.masterGain!);
    
    bassGain.gain.value = 0.05;
    bassOsc.start();
    this.nodes.push(bassOsc, bassGain, filter);

    // 2. Extended Arpeggio Sequence
    const notes = [
        110, 110, 130.81, 146.83, 130.81, 110, // A Minor low
        164.81, 146.83, 130.81, 110, 110, // mid
        220, 196, 220, 261.63, 220, 196, // high
        164.81, 130.81, 146.83, 110, // resolve
        87.31, 87.31, 110, 130.81 // turnaround
    ]; 
    let noteIndex = 0;

    const playNote = () => {
      if (this.currentBgmType !== 'battle' || !this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = notes[noteIndex];
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);

      noteIndex = (noteIndex + 1) % notes.length;
      setTimeout(playNote, 180); // Slightly faster BPM
    };
    
    playNote();
  }
  
  playGameOverBGM() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    if (this.currentBgmType === 'gameover') return;
    this.stopBGM();
    this.currentBgmType = 'gameover';

    // Sad slow melody
    const notes = [220, 261.63, 196, 164.81, 146.83, 130.81]; // Am scale-ish
    let noteIndex = 0;

    const playNote = () => {
        if (this.currentBgmType !== 'gameover' || !this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = notes[noteIndex];
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 2.1);

        noteIndex = (noteIndex + 1) % notes.length;
        setTimeout(playNote, 1500); // Slow tempo
    };
    
    playNote();
  }

  // Completely redesigned player shoot sound
  playShoot() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Use Triangle for softer, "laser-like" but less harsh sound than Square/Saw
    osc.type = 'triangle';

    // Rotate through a few small pitch variations to reduce ear fatigue
    const variations = [220, 240, 200];
    const baseFreq = variations[this.shootRR % variations.length];
    this.shootRR++;

    // Quick pitch drop for the "pew" effect, but lower register
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
    
    // Softer envelope
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playEnemyShoot(enemyType: string) {
      if (this.muted || !this.ctx || !this.masterGain) return;
      
      // Create nodes
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      const now = this.ctx.currentTime;
      
      // Common lowpass to remove sharpness
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      // Connect
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      
      let duration = 0.1;
      let volume = 0.02; // Much quieter default

      switch (enemyType) {
          case 'keyboard_man':
              // Soft "bloop"
              osc.type = 'sine';
              osc.frequency.setValueAtTime(600, now);
              osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
              duration = 0.1;
              volume = 0.02;
              break;
          case 'marketing_account':
              // Muffled "thump"
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(150, now);
              osc.frequency.linearRampToValueAtTime(50, now + 0.15);
              filter.frequency.value = 400; // darker
              duration = 0.15;
              volume = 0.025;
              break;
          case 'boss_kpi':
              // Lower "boom"
              osc.type = 'sawtooth';
              filter.frequency.value = 200; // Very muffled
              osc.frequency.setValueAtTime(80, now);
              osc.frequency.linearRampToValueAtTime(40, now + 0.2);
              volume = 0.04; 
              duration = 0.2;
              break;
          case 'da_ye':
              // Sine sweep
              osc.type = 'sine';
              osc.frequency.setValueAtTime(300, now);
              osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
              duration = 0.2;
              volume = 0.02;
              break;
          case 'chi_gua':
              // Short tick
              osc.type = 'square';
              filter.frequency.value = 1000;
              osc.frequency.setValueAtTime(800, now);
              duration = 0.05;
              volume = 0.01;
              break;
          default:
              // Generic soft pop
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(300, now);
              osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
              duration = 0.1;
              volume = 0.015;
              break;
      }
      
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      
      osc.start(now);
      osc.stop(now + duration + 0.05);
  }

  playHit() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle'; 
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playExplosion() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    
    const variant = Math.floor(Math.random() * 3);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    const now = this.ctx.currentTime;

    if (variant === 0) {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.6);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(50, now + 0.5);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        
        osc.start(now);
        osc.stop(now + 0.6);
    } else if (variant === 1) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
    } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.linearRampToValueAtTime(20, now + 0.3);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }
  }

  playCoin() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playShieldBreak() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
  
  playPowerup() {
    if (this.muted || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playTypewriter() {
      if (this.muted || !this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // High pitch short blip
      osc.frequency.setValueAtTime(800 + Math.random() * 200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
  }
}

export class GamePhysics {
  state: GameState;
  settings: GameSettings;
  canvasWidth: number = 800;
  canvasHeight: number = 600;
  keysPressed: Record<string, boolean> = {};
  mousePos: Vector2D = { x: 0, y: 0 };
  audio: SoundManager;
  
  readonly MAP_WIDTH = 2500;
  readonly MAP_HEIGHT = 2000;
  
  constructor() {
    this.settings = {
        autoShoot: true,
        autoAim: false, // Changed to false
        soundEnabled: true,
        volume: 0.5
    };
    this.state = this.getInitialState('9527', 'normal');
    this.audio = new SoundManager();
  }

  updateSettings(newSettings: Partial<GameSettings>) {
      this.settings = { ...this.settings, ...newSettings };
      this.audio.setMute(!this.settings.soundEnabled);
      if (newSettings.volume !== undefined) {
          this.audio.setVolume(newSettings.volume);
      }
  }

  getInitialState(charId: string, difficultyId: string): GameState {
    const charConfig = CHARACTERS[charId] || CHARACTERS['9527'];
    return {
      player: {
        id: 'player',
        characterId: charId,
        x: 0, y: 0, 
        radius: 24,
        emoji: charConfig.emojiNormal,
        hp: charConfig.baseStats.maxHp || 100, 
        maxHp: charConfig.baseStats.maxHp || 100,
        shield: 0, maxShield: 0,
        speed: charConfig.baseStats.speed || 6,
        gold: 0,
        attackDamage: charConfig.baseStats.attackDamage || 15,
        attackSpeed: charConfig.baseStats.attackSpeed || 25, 
        projectileSpeed: 7.5, // Reduced from 10
        projectileCount: charConfig.baseStats.projectileCount || 1,
        projectileSpread: 0.2,
        projectilePierce: charConfig.baseStats.projectilePierce || 0,
        backwardShots: 0,
        knockback: 8,
        lifeSteal: 0,
        dropRate: 0.02,
        dodgeChance: 0,
        damageReflection: 0,
        incomeMultiplier: charConfig.baseStats.incomeMultiplier || 1.0, 
        shopDiscount: 1.0,
        shopUpgradeSlots: 4,
        shopItemSlots: 4,
        lastShotTime: 0,
        lastDamageTime: 0,
        isRegeneratingShield: false,
        invulnerableTime: 0,
        items: [],
        insuranceGoldEarned: 0,
        isDying: false,
        deathTimer: 0,
        speechSentenceIndex: 0,
        speechCharIndex: 0,
        speechPauseTimer: 0
      },
      enemies: [],
      projectiles: [],
      floatingTexts: [],
      particles: [],
      drops: [],
      zones: [],
      camera: { x: 0, y: 0 },
      score: 0,
      timeAlive: 0,
      mapWidth: this.MAP_WIDTH,
      mapHeight: this.MAP_HEIGHT,
      currentWave: 1,
      waveTimer: 0,
      waveEnded: false,
      isWaveClearing: false,
      waveTransitionTimer: 0,
      restockCost: 10,
      refreshCount: 0,
      
      difficultyId: difficultyId,
      isEndless: false,
      endlessWaveCount: 0,
      inflationRate: 0,
      isPaused: false,
      
      shopState: {
          upgrades: [],
          items: []
      }
    };
  }

  init(width: number, height: number, charId: string = '9527', difficultyId: string = 'normal') {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.state = this.getInitialState(charId, difficultyId);
    this.startWave(1);
    this.audio.resume();
    this.audio.setMute(!this.settings.soundEnabled); // Ensure sync
    this.audio.setVolume(this.settings.volume);
  }

  startWave(waveNum: number) {
    if (this.state.isEndless) {
        this.state.endlessWaveCount++;
        this.state.currentWave = this.state.currentWave + 1;
    } else {
        this.state.currentWave = waveNum;
    }

    if (this.state.currentWave > 1) {
        this.state.inflationRate += 0.05;
    } else {
        this.state.inflationRate = 0;
    }

    this.state.waveTimer = 0;
    this.state.waveEnded = false;
    this.state.isWaveClearing = false;
    this.state.waveTransitionTimer = 0;
    
    this.state.player.x = 0;
    this.state.player.y = 0;
    
    this.state.player.hp = this.state.player.maxHp;
    this.state.player.shield = this.state.player.maxShield;
    this.state.player.isRegeneratingShield = false;
    this.state.player.insuranceGoldEarned = 0; // Reset insurance cap per wave
    this.state.player.isDying = false;
    this.state.player.deathTimer = 0;
    
    // Reset Shop Restock Logic
    this.state.refreshCount = 0;
    const baseIncrement = 10 + (this.state.currentWave - 1) * 2;
    this.state.restockCost = baseIncrement;
    
    // 9527 Skill: Interest
    if (this.state.player.characterId === '9527' && this.state.player.gold > 0) {
        const interest = Math.floor(this.state.player.gold * 0.2 * this.state.player.incomeMultiplier);
        if (interest > 0) {
            this.state.player.gold += interest;
            this.state.score += interest; // Add interest to total merit score
            this.spawnFloatingText(this.state.player.x, this.state.player.y - 50, `利息 +${interest}`, '#fbbf24', 'gold');
        }
    }

    this.state.projectiles = [];
    this.state.enemies = [];
    this.state.drops = [];
    this.state.zones = [];
    
    this.audio.playBattleBGM();
    
    const effectiveWaveNum = this.state.isEndless ? ((this.state.endlessWaveCount - 1) % 7) + 1 : this.state.currentWave;
    const waveConfig = WAVES.find(w => w.waveNumber === effectiveWaveNum) || WAVES[WAVES.length - 1];
    
    if (waveConfig.isBossWave && !this.state.isEndless) {
        this.spawnEnemy('boss_kpi', 0, -800);
    }
  }

  handleInput(keys: Record<string, boolean>, mouse: Vector2D) {
    this.keysPressed = keys;
    this.mousePos = mouse;
  }

  update() {
    if (this.state.isPaused) return;
    if (this.state.waveEnded) return;
    
    // Update player and handle death logic
    this.updatePlayer();
    
    // If dying, pause other updates
    if (this.state.player.isDying) {
        this.state.player.deathTimer--;
        return;
    }

    // Transition Logic
    if (this.state.isWaveClearing) {
        this.state.waveTransitionTimer--;
        if (this.state.waveTransitionTimer <= 0) {
            this.state.waveEnded = true;
        }
        // this.updatePlayer(); // Already called
        this.updateParticles();
        this.updateDrops();
        this.updateZones();
        this.updateCamera();
        return; 
    }

    this.state.timeAlive++;
    this.state.waveTimer++;

    this.updateWaveLogic();
    // this.updatePlayer(); // Already called
    this.updateEnemies();
    this.updateProjectiles();
    this.updateParticles();
    this.updateDrops();
    this.updateZones();
    this.checkCollisions();
    
    this.updateCamera();
  }

  private updateWaveLogic() {
      // Determine logic wave for spawning
      const effectiveWaveNum = this.state.isEndless ? ((this.state.endlessWaveCount - 1) % 7) + 1 : this.state.currentWave;
      const waveConfig = WAVES.find(w => w.waveNumber === effectiveWaveNum) || WAVES[WAVES.length - 1];
      const maxTime = waveConfig.duration * 60; 

      if (waveConfig.isBossWave && !this.state.isEndless) {
          const boss = this.state.enemies.find(e => e.config.behavior === 'boss');
          
          if (boss && !boss.isTransitioning && this.state.waveTimer % 300 === 0) {
               // Spawns minions or other annoying small enemies
               const options = ['minion', 'minion', 'keyboard_man', 'marketing_account'];
               const type = options[Math.floor(Math.random() * options.length)];
               this.spawnEnemyRandomly(type);
          }

          if (!boss && this.state.waveTimer > 60) { 
             this.triggerWaveEnd();
          }
      } else {
          if (this.state.waveTimer >= maxTime && !this.state.isWaveClearing) {
              this.triggerWaveEnd();
          } else {
             if (this.state.waveTimer % waveConfig.spawnRate === 0) {
                 const totalWeight = waveConfig.enemies.reduce((sum, e) => sum + e.weight, 0);
                 let r = Math.random() * totalWeight;
                 let selectedType = waveConfig.enemies[0].type;
                 for(const e of waveConfig.enemies) {
                     r -= e.weight;
                     if (r <= 0) {
                         selectedType = e.type;
                         break;
                     }
                 }
                 this.spawnEnemyRandomly(selectedType);
             }
          }
      }
  }

  private triggerWaveEnd() {
      this.state.isWaveClearing = true;
      this.state.waveTransitionTimer = 90; 
      // Clear enemies logic. Previously skipped boss wave, now we clear to ensure game end state for boss.
      this.state.enemies = [];
      this.state.projectiles = [];
  }

  private spawnEnemyRandomly(type: string) {
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = 900;
      const spawnX = Math.max(-this.MAP_WIDTH/2, Math.min(this.MAP_WIDTH/2, this.state.player.x + Math.cos(angle) * spawnDist));
      const spawnY = Math.max(-this.MAP_HEIGHT/2, Math.min(this.MAP_HEIGHT/2, this.state.player.y + Math.sin(angle) * spawnDist));
      this.spawnEnemy(type, spawnX, spawnY);
  }

  private updateCamera() {
    let targetX = this.state.player.x;
    let targetY = this.state.player.y;
    
    const boss = this.state.enemies.find(e => e.isTransitioning);
    if (boss) {
        targetX += (Math.random() - 0.5) * 20;
        targetY += (Math.random() - 0.5) * 20;
    }

    this.state.camera.x += (targetX - this.state.camera.x) * 0.1;
    this.state.camera.y += (targetY - this.state.camera.y) * 0.1;
  }

  private updatePlayer() {
    const p = this.state.player;
    
    // Death Logic
    if (p.hp <= 0 && !p.isDying) {
        p.isDying = true;
        p.deathTimer = 120; // 2 seconds animation
        p.emoji = '💀';
        
        // Spawn particle explosion immediately upon death
        this.spawnParticles(p.x, p.y, '#ef4444', 12);
        this.spawnParticles(p.x, p.y, '#ffffff', 8);
        
        this.audio.stopBGM();
        this.audio.playExplosion();
        return;
    }

    if (p.isDying) return;

    const charConfig = CHARACTERS[p.characterId] || CHARACTERS['9527'];
    
    // Item Effects: Involution King Bleed (Stacked)
    const kingCount = p.items.filter(i => i === '卷王').length;
    if (kingCount > 0) {
        // Fix: Do not apply bleed during wave clearing/transition to avoid "end of round" damage spike feeling
        if (!this.state.isWaveClearing && this.state.timeAlive % 60 === 0) {
            p.hp -= kingCount; // 1 damage per item per second
            this.spawnFloatingText(p.x, p.y - 20, `-${kingCount}`, "#ef4444");

            // Involution King triggers Accident Insurance
            // Check for insurance items
            const insuranceCount = p.items.filter(i => i === '意外险').length;
            if (insuranceCount > 0) {
                const cap = insuranceCount * 800;
                if (p.insuranceGoldEarned < cap) {
                    p.gold += 10; 
                    this.state.score += 10; // Insurance contributes to total score
                    p.insuranceGoldEarned += 10; 
                    this.spawnFloatingText(p.x, p.y - 40, "💰+10", "#fbbf24", 'gold');
                }
            }

            // Self-destruct check
            if (p.hp <= 0) {
                this.state.killer = 'involution_king';
            }
        }
    }

    // Shield Regen
    if (p.maxShield > 0 && p.shield < p.maxShield) {
        if (this.state.timeAlive - p.lastDamageTime > 120) { // 2 seconds
            if (!p.isRegeneratingShield) {
                this.spawnFloatingText(p.x, p.y - 40, "护盾充能", "#3b82f6", 'chat');
                p.isRegeneratingShield = true;
            }
            // Reduced regen rate from 0.2 to 0.05 per frame (approx 3 per second)
            p.shield = Math.min(p.maxShield, p.shield + 0.05); 
        } else {
            p.isRegeneratingShield = false;
        }
    } else {
        p.isRegeneratingShield = false;
    }

    // Check Acid Slow
    let speedMod = 1.0;
    for (const zone of this.state.zones) {
        if (zone.type === 'acid') {
            const dist = Math.hypot(zone.x - p.x, zone.y - p.y);
            if (dist < zone.radius) {
                speedMod = 0.4;
                if (Math.random() < 0.1) {
                    this.spawnParticles(p.x, p.y, '#a3e635', 1);
                }
                break;
            }
        }
    }

    let dx = 0;
    let dy = 0;
    if (this.keysPressed['w'] || this.keysPressed['arrowup']) dy -= 1;
    if (this.keysPressed['s'] || this.keysPressed['arrowdown']) dy += 1;
    if (this.keysPressed['a'] || this.keysPressed['arrowleft']) dx -= 1;
    if (this.keysPressed['d'] || this.keysPressed['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx*dx + dy*dy);
      p.x += (dx / len) * p.speed * speedMod;
      p.y += (dy / len) * p.speed * speedMod;
    }

    const halfW = this.MAP_WIDTH / 2 - p.radius;
    const halfH = this.MAP_HEIGHT / 2 - p.radius;
    p.x = Math.max(-halfW, Math.min(halfW, p.x));
    p.y = Math.max(-halfH, Math.min(halfH, p.y));

    // Auto Shoot vs Manual Shoot
    const wantShoot = this.settings.autoShoot || this.keysPressed['mousedown'];

    // Decrease speech pause timer for 9527
    if (p.speechPauseTimer > 0) {
        p.speechPauseTimer--;
    }

    if (wantShoot && this.state.timeAlive - p.lastShotTime >= p.attackSpeed) {
      // Check if 9527 is in pause
      if (p.characterId === '9527' && p.speechPauseTimer > 0) {
          // Waiting
      } else {
          this.shoot();
          p.lastShotTime = this.state.timeAlive;
      }
    }

    if (p.invulnerableTime > 0) p.invulnerableTime--;

    const hpPct = p.hp / p.maxHp;
    if (hpPct > 0.6) {
        p.emoji = charConfig.emojiNormal;
    } else if (hpPct > 0.3) {
        p.emoji = charConfig.emojiHurt;
    } else {
        p.emoji = charConfig.emojiCritical;
    }
  }

  private shoot() {
    const p = this.state.player;
    
    // --- Auto Aim Logic ---
    let angle = 0;
    
    if (this.settings.autoAim) {
        // Find nearest enemy
        let nearest = null;
        let minDst = Infinity;
        
        for(const e of this.state.enemies) {
            if (e.isTransitioning) continue;
            const d = Math.hypot(e.x - p.x, e.y - p.y);
            if (d < minDst) {
                minDst = d;
                nearest = e;
            }
        }
        
        if (nearest) {
             angle = Math.atan2(nearest.y - p.y, nearest.x - p.x);
        } else {
             // Fallback to mouse if no enemies
             angle = Math.atan2(this.mousePos.y - p.y, this.mousePos.x - p.x);
        }
    } else {
        angle = Math.atan2(this.mousePos.y - p.y, this.mousePos.x - p.x);
    }

    this.audio.playShoot();
    
    const bulletEmoji = p.characterId === '007' ? '💣' : '';
    
    // Special text for Programmer 1024
    let specificTexts: string[] | null = null;
    if (p.characterId === '1024') {
        specificTexts = ["Bug", "404", "null", ";", "{}", "&&", ".", "?", "if", "else", "var", "git", "sudo", "rm", "TODO", "//", "const", "let", "=>", "await"];
    }

    // Special text for 9527 (Sequential Speech)
    let char9527Text = "";
    if (p.characterId === '9527') {
        const sentences = WORKER_QUOTES;
        const currentSentence = sentences[p.speechSentenceIndex % sentences.length];
        char9527Text = currentSentence[p.speechCharIndex];

        // Advance
        p.speechCharIndex++;
        if (p.speechCharIndex >= currentSentence.length) {
            // End of sentence
            p.speechCharIndex = 0;
            p.speechSentenceIndex++;
            // Add pause: ~2 shots worth duration
            p.speechPauseTimer = p.attackSpeed * 2.5;
        }
    }

    const createBullet = (dir: number) => {
        let text = bulletEmoji;
        let radius = 20;

        if (!text) {
            if (p.characterId === '9527') {
                text = char9527Text;
            }
            else if (specificTexts) {
                 text = specificTexts[Math.floor(Math.random() * specificTexts.length)];
                 const isSmall = [".", ";", "?", ",", "{", "}"].includes(text);
                 const baseR = isSmall ? 12 : 20;
                 radius = baseR + (Math.random() * 10 - 5); 
            } else {
                 text = BULLET_TEXTS[Math.floor(Math.random() * BULLET_TEXTS.length)];
            }
        }
        
        const is007 = p.characterId === '007';

        this.state.projectiles.push({
            id: Math.random().toString(),
            x: p.x, y: p.y,
            radius: radius,
            emoji: text,
            vx: Math.cos(dir) * p.projectileSpeed,
            vy: Math.sin(dir) * p.projectileSpeed,
            damage: p.attackDamage,
            life: 120,
            isEnemy: false,
            color: '#a5f3fc',
            text: text,
            pierce: p.projectilePierce,
            hitIds: [],
            angle: dir, 
            sourceType: 'player',
            isExplosive: is007, 
            maxExplosionRadius: is007 ? 104 : 80, // 007 radius increased by 30% (80 * 1.3 = 104)
            stopTimer: 0 
        });
    };

    const count = p.projectileCount;
    const spread = p.projectileSpread;
    const startAngle = angle - (spread * (count - 1)) / 2;
    for (let i = 0; i < count; i++) {
      createBullet(startAngle + spread * i);
    }

    if (p.backwardShots > 0) {
        const backAngle = angle + Math.PI;
        const backStartAngle = backAngle - (spread * (p.backwardShots - 1)) / 2;
        for (let i = 0; i < p.backwardShots; i++) {
            createBullet(backStartAngle + spread * i);
        }
    }
  }

  private spawnEnemy(type: string, x: number, y: number) {
    const config = ENEMIES[type];
    
    // Difficulty Multipliers
    const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === this.state.difficultyId) || DIFFICULTY_SETTINGS[1];
    let hpMult = diffCfg.hpMult;
    
    // Wave Scaling (Base Game)
    hpMult *= (1 + (this.state.currentWave - 1) * 0.5);
    
    // Endless Scaling (Compounding 10%)
    if (this.state.isEndless) {
        hpMult *= Math.pow(1.10, this.state.endlessWaveCount);
    }

    const baseRadius = config.behavior === 'boss' ? 70 : 24;
    const scale = config.sizeScale || 1;

    this.state.enemies.push({
      id: Math.random().toString(),
      x, y,
      radius: baseRadius * scale,
      emoji: config.emoji,
      hp: config.hp * hpMult,
      maxHp: config.hp * hpMult,
      config: config,
      vx: 0, vy: 0,
      attackCooldown: 60 + Math.random() * 60,
      attackState: 0,
      stateTimer: 0,
      phase: 1,
      isTransitioning: false,
      dashTimer: 0,
      isAimingDash: false,
      stunTimer: 0,
      burstQueue: [],
      burstTimer: 0
    });
  }

  private updateEnemies() {
    const p = this.state.player;
    const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === this.state.difficultyId) || DIFFICULTY_SETTINGS[1];
    let dmgMult = diffCfg.damageMult;
    if (this.state.isEndless) {
        dmgMult *= Math.pow(1.1, this.state.endlessWaveCount);
    }
    
    this.state.enemies.forEach(e => {
      if (e.isTransitioning) {
          e.stateTimer = (e.stateTimer || 0) - 1;
          e.vx = 0; e.vy = 0;
          
          if (e.config.behavior === 'boss') {
              e.radius = 70 * 2.0 + (70 * 2.0) * (1 - (e.stateTimer! / 180)); 
          }

          if ((e.stateTimer || 0) <= 0) {
              e.isTransitioning = false;
              e.phase = 2;
              e.hp = e.maxHp;
              e.emoji = '👿';
              e.radius = 70 * 4.0; 
              this.spawnFloatingText(e.x, e.y, "暴走模式!!!", "#ef4444", 'chat');
          }
          return;
      }

      // Handle Stun
      if (e.stunTimer && e.stunTimer > 0) {
          e.stunTimer--;
          e.vx = 0; e.vy = 0;
          // Render stun effect handled in main loop by emoji or visual
          if (e.stunTimer % 20 === 0) {
              this.spawnFloatingText(e.x, e.y - 30, "⚡", "#fcd34d");
          }
          return; 
      }

      // Handle Burst Fire Logic (Keyboard Man)
      if (e.burstQueue && e.burstQueue.length > 0) {
          e.burstTimer = (e.burstTimer || 0) - 1;
          if (e.burstTimer <= 0) {
              const char = e.burstQueue.shift();
              if (char) {
                  const aimAngle = Math.atan2(p.y - e.y, p.x - e.x);
                  this.spawnSingleBullet(e, aimAngle, false, char);
                  e.burstTimer = 15; // 15 frames between burst shots
              }
          }
          // Stop moving while bursting? Optional, but keyboard man usually stands still
          if (e.config.type === 'keyboard_man') {
              e.vx = 0; e.vy = 0;
              return;
          }
      }

      const dx = p.x - e.x;
      const dy = p.y - e.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > 0) {
          let moveSpeed = e.config.speed;
          let moveX = dx / dist;
          let moveY = dy / dist;

          if (e.config.behavior === 'boss' && e.phase === 2) {
              moveSpeed *= 1.5;
          }

          if (e.config.behavior === 'shooter' && dist < 400) {
              moveSpeed *= 0.2; 
          } 
          else if (e.config.behavior === 'boss') {
              moveSpeed *= 0.8; 
          }
          else if (e.config.type === 'river_crab') {
              if (!e.stateTimer) e.stateTimer = 0;
              e.stateTimer++;
              moveY = dy / dist; 
              moveX = Math.sin(e.stateTimer / 20) * 1.5; 
              moveSpeed = e.config.speed;
          }
          else if (e.config.behavior === 'circle') {
              e.dashTimer = (e.dashTimer || 0) + 1;
              const DASH_CYCLE = 300; 
              const WARNING_START = 240;
              const DASH_START = 270;
              
              if (e.dashTimer < WARNING_START) {
                  e.isAimingDash = false;
                  if (dist < 250) {
                      moveX = -moveX; moveY = -moveY; 
                  } else {
                      const angle = Math.atan2(dy, dx) + Math.PI / 2;
                      moveX = Math.cos(angle);
                      moveY = Math.sin(angle);
                  }
                  e.vx = moveX * moveSpeed;
                  e.vy = moveY * moveSpeed;
              } 
              else if (e.dashTimer < DASH_START) {
                  e.isAimingDash = true;
                  e.vx = 0;
                  e.vy = 0;
                  if (e.dashTimer === WARNING_START) {
                      e.aimX = p.x;
                      e.aimY = p.y;
                  }
              } 
              else if (e.dashTimer < DASH_CYCLE) {
                  e.isAimingDash = false; 
                  if (e.dashTimer === DASH_START) {
                      const targetX = e.aimX ?? p.x;
                      const targetY = e.aimY ?? p.y;
                      const angle = Math.atan2(targetY - e.y, targetX - e.x);
                      
                      e.vx = Math.cos(angle) * (moveSpeed * 4.5);
                      e.vy = Math.sin(angle) * (moveSpeed * 4.5);
                      this.spawnFloatingText(e.x, e.y, "冲!", "#fcd34d", 'chat');
                  }
              } 
              else {
                  e.dashTimer = 0;
                  e.aimX = undefined;
                  e.aimY = undefined;
              }
              e.x += e.vx;
              e.y += e.vy;
              const halfW = this.MAP_WIDTH/2 - e.radius;
              const halfH = this.MAP_HEIGHT/2 - e.radius;
              e.x = Math.max(-halfW, Math.min(halfW, e.x));
              e.y = Math.max(-halfH, Math.min(halfH, e.y));
              return;
          }
          else if (e.config.behavior === 'turret') {
              moveSpeed = 0;
          }
          else if (e.config.behavior === 'tank') {
              moveSpeed *= 0.8;
          }
          else if (e.config.behavior === 'minion') {
              if (Math.random() < 0.05) {
                  const randAngle = Math.random() * Math.PI * 2;
                  e.vx = Math.cos(randAngle) * moveSpeed;
                  e.vy = Math.sin(randAngle) * moveSpeed;
              }
              e.x += e.vx;
              e.y += e.vy;
              return; 
          }
          
          if (e.config.behavior !== 'circle' && e.config.type !== 'river_crab') {
              e.vx = moveX * moveSpeed;
              e.vy = moveY * moveSpeed;
          }
          
          if (e.config.type === 'river_crab') {
              e.vx = moveX * moveSpeed;
              e.vy = moveY * moveSpeed * 0.3; // Slower vertical
          }
          
          if (e.config.behavior !== 'circle') {
             e.x += e.vx;
             e.y += e.vy;
          }
      }

      this.state.enemies.forEach(other => {
        if (e === other) return;
        const odx = e.x - other.x;
        const ody = e.y - other.y;
        const odist = Math.sqrt(odx*odx + ody*ody);
        
        if (odist < e.radius + other.radius) {
          if (e.config.behavior === 'boss' && other.config.behavior === 'minion') {
             this.spawnFloatingText(e.x, e.y, "压榨!", "#ef4444", 'chat');
             e.hp = Math.min(e.maxHp, e.hp + 200);
             this.spawnFloatingText(e.x, e.y, "+200", "#22c55e");
             other.hp = 0; 
             this.state.enemies = this.state.enemies.filter(en => en !== other);
             return;
          }
          const push = 0.2; 
          e.vx += odx / odist * push;
          e.vy += ody / odist * push;
        }
      });

      const halfW = this.MAP_WIDTH/2 - e.radius;
      const halfH = this.MAP_HEIGHT/2 - e.radius;
      e.x = Math.max(-halfW, Math.min(halfW, e.x));
      e.y = Math.max(-halfH, Math.min(halfH, e.y));

      this.performEnemyAttack(e, p, dist, dmgMult);
    });
  }

  private spawnSingleBullet(e: Enemy, angle: number, explosive: boolean = false, overrideText?: string) {
      const bulletSpeed = 5;
      const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === this.state.difficultyId) || DIFFICULTY_SETTINGS[1];
      let dmgMult = diffCfg.damageMult;
      if (this.state.isEndless) dmgMult *= Math.pow(1.1, this.state.endlessWaveCount);

      const bulletDmg = e.config.damage * dmgMult;
      let bulletChar = overrideText || e.config.projectileChar || '!';
      
      if (!overrideText && e.config.projectileOptions && e.config.projectileOptions.length > 0) {
          bulletChar = e.config.projectileOptions[Math.floor(Math.random() * e.config.projectileOptions.length)];
      }

      const bulletSize = e.config.projectileSize || 16;
      const bulletColor = e.config.projectileColor || '#ffffff';
      const bulletLife = e.config.behavior === 'boss' ? 400 : 200;

      this.audio.playEnemyShoot(e.config.type); 
      this.state.projectiles.push({
          id: Math.random().toString(),
          x: e.x, y: e.y,
          radius: bulletSize,
          emoji: bulletChar,
          vx: Math.cos(angle) * bulletSpeed,
          vy: Math.sin(angle) * bulletSpeed,
          damage: bulletDmg,
          life: bulletLife,
          isEnemy: true,
          color: bulletColor,
          text: bulletChar,
          pierce: 0,
          hitIds: [],
          isExplosive: explosive,
          maxExplosionRadius: 100,
          stopTimer: 60,
          angle: angle,
          sourceType: e.config.type
      });
  }

  private performEnemyAttack(e: Enemy, p: Player, dist: number, dmgMult: number) {
      if (e.config.behavior === 'chase' || e.config.behavior === 'rusher' || e.config.behavior === 'circle' || e.config.behavior === 'minion') return;
      if (e.config.type === 'river_crab') return;
      if (e.isTransitioning) return;
      if (e.stunTimer && e.stunTimer > 0) return;

      if (e.attackCooldown > 0) {
        e.attackCooldown--;
        return;
      }

      const aimAngle = Math.atan2(p.y - e.y, p.x - e.x);

      if (e.config.behavior === 'boss') {
          e.stateTimer = (e.stateTimer || 0) + 1;
          
          if (e.phase === 2) {
               e.stateTimer += 1; 
               if (Math.random() < 0.02) {
                    const randAngle = Math.random() * Math.PI * 2;
                    this.spawnSingleBullet(e, randAngle, true); 
               }
          }

          if (e.stateTimer < 300) {
              const density = e.phase === 2 ? 10 : 6;
              if (e.stateTimer % density === 0) {
                  e.attackState = (e.attackState || 0) + 0.3;
                  this.spawnSingleBullet(e, e.attackState);
                  this.spawnSingleBullet(e, e.attackState + Math.PI);
                  this.spawnSingleBullet(e, e.attackState + Math.PI/2);
                  this.spawnSingleBullet(e, e.attackState - Math.PI/2);
              }
          } else if (e.stateTimer < 480) {
             // Rest
          } else if (e.stateTimer < 700) {
              // Phase 1: Screen Spread
              if (e.stateTimer % 20 === 0) {
                 for(let k=0; k<8; k++) {
                     this.spawnSingleBullet(e, aimAngle + (k/8) * Math.PI * 2);
                 }
              }
          } else if (e.stateTimer < 820) {
              // Rest
          } else {
              e.stateTimer = 0; 
          }
          return;
      }

      const pattern = e.config.attackPattern || 'single';
      
      if (pattern === 'burst') {
          if (dist < 800) {
              if (e.config.burstPhrases && e.config.burstPhrases.length > 0) {
                  const phrase = e.config.burstPhrases[Math.floor(Math.random() * e.config.burstPhrases.length)];
                  e.burstQueue = phrase.split('').slice(0, 5); // Max 5 chars safety
              } else {
                  e.burstQueue = ['急', '急', '急'];
              }
              e.burstTimer = 0;
              e.attackCooldown = 180;
          }
      } else if (pattern === 'single') {
          if (dist < 800) { 
              this.spawnSingleBullet(e, aimAngle);
              e.attackCooldown = e.config.type === 'turret' ? 30 : 120;
          }
      } else if (pattern === 'spread') {
          if (dist < 600) {
              this.spawnSingleBullet(e, aimAngle - 0.2);
              this.spawnSingleBullet(e, aimAngle);
              this.spawnSingleBullet(e, aimAngle + 0.2);
              e.attackCooldown = 150;
          }
      } else if (pattern === 'explode') {
          if (dist < 700) {
              this.spawnSingleBullet(e, aimAngle, true);
              e.attackCooldown = 180;
          }
      }
  }

  private updateProjectiles() {
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];
      
      if (proj.isExplosive) {
          if (proj.isExploding) {
              proj.radius += 5;
              if (proj.radius >= (proj.maxExplosionRadius || 100)) {
                  proj.life = 0;
              }
          } else if (proj.isStopped) {
               proj.stopTimer = (proj.stopTimer || 0) - 1;
               if (proj.stopTimer <= 0) {
                   proj.isExploding = true;
                   this.audio.playExplosion();
                   proj.color = proj.isEnemy ? '#ef4444' : '#fbbf24'; 
                   proj.hitIds = [];
                   
                   if (proj.isEnemy && proj.text === '退') {
                       const angle = proj.angle || 0;
                       const spawnSplit = (offset: number) => {
                           this.state.projectiles.push({
                               id: Math.random().toString(),
                               x: proj.x, y: proj.y,
                               radius: proj.radius * 0.5,
                               emoji: '退',
                               vx: Math.cos(angle + offset) * 6,
                               vy: Math.sin(angle + offset) * 6,
                               damage: proj.damage * 0.7,
                               life: 100,
                               isEnemy: true,
                               color: proj.color,
                               text: '退',
                               pierce: 0,
                               hitIds: [],
                               isExplosive: false,
                               sourceType: proj.sourceType
                           });
                       };
                       spawnSplit(-0.4);
                       spawnSplit(0.4);
                   }
               }
          } else {
              proj.x += proj.vx;
              proj.y += proj.vy;
              
              if (proj.isEnemy) {
                   if (proj.life < 150) { 
                      proj.isStopped = true;
                      proj.vx = 0;
                      proj.vy = 0;
                      proj.text = "⚠️";
                      proj.stopTimer = 60; 
                   }
              }
              
              if (Math.abs(proj.x) > this.MAP_WIDTH/2 + 200 || Math.abs(proj.y) > this.MAP_HEIGHT/2 + 200) {
                 proj.life = 0;
              }
              proj.life--;
          }
      } else {
          proj.x += proj.vx;
          proj.y += proj.vy;
          if (Math.abs(proj.x) > this.MAP_WIDTH/2 + 200 || Math.abs(proj.y) > this.MAP_HEIGHT/2 + 200) {
             proj.life = 0;
          }
          proj.life--;
      }

      if (proj.life <= 0) {
        this.state.projectiles.splice(i, 1);
      }
    }
  }

  private updateParticles() {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }

    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.state.floatingTexts[i];
        ft.y += ft.vy;
        ft.life--;
        if (ft.life <= 0) {
            this.state.floatingTexts.splice(i, 1);
        }
    }
  }

  private updateDrops() {
      const p = this.state.player;
      for (let i = this.state.drops.length - 1; i >= 0; i--) {
          const d = this.state.drops[i];
          
          const dist = Math.hypot(d.x - p.x, d.y - p.y);
          if (dist < 150) {
              // Only suck if not full HP
              if (p.hp < p.maxHp) {
                  // Increased suction speed (0.08 -> 0.1)
                  d.x += (p.x - d.x) * 0.1;
                  d.y += (p.y - d.y) * 0.1;
              }
          }
          
          if (dist < p.radius + d.radius) {
              if (d.type === 'health') {
                  if (p.hp < p.maxHp) {
                      p.hp = Math.min(p.maxHp, p.hp + d.value);
                      this.spawnFloatingText(p.x, p.y, `+${d.value}`, '#22c55e');
                      this.audio.playPowerup();
                      this.state.drops.splice(i, 1);
                      continue;
                  }
              }
          }

          d.life--;
          if (d.life <= 0) {
              this.state.drops.splice(i, 1);
          }
      }
  }

  private updateZones() {
      for (let i = this.state.zones.length - 1; i >= 0; i--) {
          const z = this.state.zones[i];
          z.life--;
          if (z.life <= 0) {
              this.state.zones.splice(i, 1);
          }
      }
  }

  private checkCollisions() {
    const p = this.state.player;
    const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === this.state.difficultyId) || DIFFICULTY_SETTINGS[1];
    
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];
      
      if (proj.isExploding) {
         if (proj.isEnemy) {
             const dist = Math.hypot(proj.x - p.x, proj.y - p.y);
             if (dist < proj.radius && p.invulnerableTime <= 0) {
                 this.damagePlayer(proj.damage * 1.5, proj.sourceType);
             }
         } else {
             for (const e of this.state.enemies) {
                 if (proj.hitIds.includes(e.id)) continue;
                 const dist = Math.hypot(proj.x - e.x, proj.y - e.y);
                 if (dist < proj.radius + e.radius) {
                     proj.hitIds.push(e.id); 
                     e.hp -= proj.damage * 0.8; 
                     this.spawnFloatingText(e.x, e.y, `-${Math.floor(proj.damage * 0.8)}`, '#fbbf24', 'damage');
                     
                     if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) {
                         this.triggerBossTransition(e);
                     } else if (e.hp <= 0) {
                        const idx = this.state.enemies.indexOf(e);
                        if (idx > -1) this.killEnemy(idx);
                     }
                 }
             }
         }
         continue;
      }

      let destroyBullet = false;

      if (proj.isEnemy) {
        const dist = Math.hypot(proj.x - p.x, proj.y - p.y);
        if (dist < proj.radius + p.radius * 0.6) {
            if (Math.random() < p.dodgeChance) {
                this.spawnFloatingText(p.x, p.y, "闪避", "#60a5fa");
                destroyBullet = true;
            } 
            else if (p.invulnerableTime <= 0) {
                this.damagePlayer(proj.damage, proj.sourceType);
                destroyBullet = true;
            }
        }
      } else {
        for (let j = this.state.enemies.length - 1; j >= 0; j--) {
          const e = this.state.enemies[j];
          if (e.isTransitioning) continue; 
          if (proj.hitIds.includes(e.id)) continue;

          const dist = Math.hypot(proj.x - e.x, proj.y - e.y);
          if (dist < proj.radius + e.radius) {
            proj.hitIds.push(e.id);
            
            // Character 1024 Skill: Bug Attack
            if (p.characterId === '1024' && Math.random() < 0.15) {
                e.stunTimer = 60; // 1 second stun
            }

            if (proj.isExplosive) {
                proj.isStopped = true; 
                proj.stopTimer = 0;
                proj.life = 60; 
                break; 
            }

            if (Math.random() < p.lifeSteal) {
                if (p.hp < p.maxHp) {
                    p.hp = Math.min(p.maxHp, p.hp + 1);
                }
            }
            
            if (p.items.includes('红包') && Math.random() < 0.05) {
                p.gold += 1;
                this.state.score += 1; // Red Envelope gold counts for score
                this.spawnFloatingText(e.x, e.y, "🧧+1", "#f87171", 'gold');
            }

            e.hp -= proj.damage;
            this.spawnFloatingText(e.x, e.y, `-${Math.floor(proj.damage)}`, '#fbbf24', 'damage');
            const angle = Math.atan2(e.y - proj.y, e.x - proj.x);
            e.vx += Math.cos(angle) * p.knockback;
            e.vy += Math.sin(angle) * p.knockback;

            if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) {
                this.triggerBossTransition(e);
            } 
            else if (e.hp <= 0) {
                this.killEnemy(j);
            }
            
            if (proj.pierce > 0) {
                proj.pierce--;
                proj.damage *= 0.8; 
            } else {
                destroyBullet = true;
            }
            if (destroyBullet) break;
          }
        }
      }

      if (destroyBullet && !proj.isExplosive) {
        this.spawnParticles(proj.x, proj.y, proj.color, 3);
        this.state.projectiles.splice(i, 1);
      }
    }

    for (const e of this.state.enemies) {
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist < e.radius + p.radius && p.invulnerableTime <= 0) {
            this.damagePlayer(10 * diffCfg.damageMult, e.config.type);
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            p.x += Math.cos(angle) * 50;
            p.y += Math.sin(angle) * 50;
        }
    }
  }

  private triggerBossTransition(e: Enemy) {
    e.hp = 1; 
    if (!e.isTransitioning) {
        e.isTransitioning = true;
        e.stateTimer = 180; 
        this.spawnFloatingText(e.x, e.y, "形态切换中...", "#ef4444", 'chat');
        this.state.projectiles.forEach(p => {
            if (p.isEnemy) p.life = 0;
        });
    }
  }

  private damagePlayer(amount: number, source: string = 'unknown') {
      const p = this.state.player;
      p.lastDamageTime = this.state.timeAlive;
      
      if (p.damageReflection > 0) {
          this.spawnParticles(p.x, p.y, '#ffffff', 5);
      }

      if (p.shield > 0) {
          this.audio.playShieldBreak();
          if (p.shield >= amount) {
              p.shield -= amount;
              this.spawnFloatingText(p.x, p.y, "吸收", "#3b82f6");
              p.invulnerableTime = 20;
              return;
          } else {
              amount -= p.shield;
              p.shield = 0;
              this.spawnFloatingText(p.x, p.y, "破盾!", "#3b82f6");
          }
      }

      // Accident Insurance Item Effect (Capped at 800 PER ITEM per wave)
      const insuranceCount = p.items.filter(i => i === '意外险').length;
      if (insuranceCount > 0) {
           const cap = insuranceCount * 800;
           if (p.insuranceGoldEarned < cap) {
               p.gold += 10; 
               this.state.score += 10; // Insurance counts for total merit
               p.insuranceGoldEarned += 10; 
               this.spawnFloatingText(p.x, p.y - 20, "💰+10", "#fbbf24", 'gold');
           }
      }

      p.hp -= amount;
      p.invulnerableTime = 40;
      this.spawnFloatingText(p.x, p.y, "痛!", "#ef4444");
      this.audio.playHit();
      
      if (p.hp <= 0) {
          this.state.killer = source;
      }
      
      this.state.camera.x += (Math.random() - 0.5) * 20;
      this.state.camera.y += (Math.random() - 0.5) * 20;
  }

  private killEnemy(index: number) {
    const e = this.state.enemies[index];
    const p = this.state.player;
    const diffCfg = DIFFICULTY_SETTINGS.find(d => d.id === this.state.difficultyId) || DIFFICULTY_SETTINGS[1];
    
    this.state.enemies.splice(index, 1);
    this.spawnParticles(e.x, e.y, '#ef4444', 8);
    
    const earnedGold = Math.ceil(e.config.score * diffCfg.scoreMult * p.incomeMultiplier);
    p.gold += earnedGold;
    this.state.score += earnedGold;
    
    if (e.config.type === 'lemon_head') {
        this.state.zones.push({
            id: Math.random().toString(),
            x: e.x, y: e.y,
            radius: 160, 
            emoji: '',
            type: 'acid',
            life: 180, 
            color: '#a3e635'
        });
    }

    if (e.config.type === 'tao_wa_big') {
        this.spawnEnemy('tao_wa_med', e.x - 20, e.y);
        this.spawnEnemy('tao_wa_med', e.x + 20, e.y);
    } else if (e.config.type === 'tao_wa_med') {
        this.spawnEnemy('tao_wa_small', e.x - 15, e.y);
        this.spawnEnemy('tao_wa_small', e.x + 15, e.y);
    }
    
    if (e.config.deathQuotes && Math.random() < 0.4) {
        const quote = e.config.deathQuotes[Math.floor(Math.random() * e.config.deathQuotes.length)];
        this.spawnFloatingText(e.x, e.y, quote, '#cbd5e1', 'chat');
    }
    
    if (Math.random() < p.dropRate) { 
        this.state.drops.push({
            id: Math.random().toString(),
            x: e.x, y: e.y,
            radius: 15,
            emoji: '💊',
            type: 'health',
            value: 20,
            life: 999999 
        });
    }
  }

  spawnFloatingText(x: number, y: number, text: string, color: string = '#ffffff', type: 'damage' | 'chat' | 'gold' = 'damage') {
      this.state.floatingTexts.push({
          id: Math.random().toString(),
          x,
          y,
          text,
          color,
          life: 60,
          vy: -1,
          type
      });
  }

  private spawnParticles(x: number, y: number, color: string, count: number) {
    for(let i=0; i<count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4;
        this.state.particles.push({
            id: Math.random().toString(),
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 30 + Math.random() * 20,
            color: color,
            size: 2 + Math.random() * 3
        });
    }
  }
}

export const gameEngine = new GamePhysics();
