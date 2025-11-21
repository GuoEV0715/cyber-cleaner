
import { GameState, Player, Enemy, Projectile, Vector2D, WaveConfig } from "../types";
import { ENEMIES, BULLET_TEXTS, WAVES } from "../data/memeContent";

// Simple Audio Synthesizer & BGM
export class SoundManager {
  ctx: AudioContext | null = null;
  nodes: AudioNode[] = [];
  currentBgmType: 'battle' | 'shop' | 'none' = 'none';

  constructor() {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
    } catch (e) {
      console.error("Web Audio API not supported");
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
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

  playShopBGM() {
    if (!this.ctx || this.currentBgmType === 'shop') return;
    this.stopBGM();
    this.currentBgmType = 'shop';

    // Elevator Music / Bossa Nova style
    // Softer wave types (Sine/Triangle)
    // Pentatonic scale for chill vibes
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00]; // C, D, E, G, A
    
    const playNote = () => {
        if (this.currentBgmType !== 'shop' || !this.ctx) return;
        
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
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.0);

        // Slower tempo
        const duration = [400, 600, 800][Math.floor(Math.random() * 3)];
        setTimeout(playNote, duration);
    };
    
    playNote();
  }

  playBattleBGM() {
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
    bassGain.connect(this.ctx.destination);
    
    bassGain.gain.value = 0.05;
    bassOsc.start();
    this.nodes.push(bassOsc, bassGain, filter);

    // 2. Extended Arpeggio Sequence
    // Minor scale for tension
    const notes = [
        110, 110, 130.81, 146.83, 130.81, 110, // A Minor low
        164.81, 146.83, 130.81, 110, 110, // mid
        220, 196, 220, 261.63, 220, 196, // high
        164.81, 130.81, 146.83, 110, // resolve
        87.31, 87.31, 110, 130.81 // turnaround
    ]; 
    let noteIndex = 0;

    const playNote = () => {
      if (this.currentBgmType !== 'battle' || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = notes[noteIndex];
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);

      noteIndex = (noteIndex + 1) % notes.length;
      setTimeout(playNote, 180); // Slightly faster BPM
    };
    
    playNote();
  }

  playShoot() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    const isHigh = Math.random() > 0.5;
    if (isHigh) {
        osc.type = 'square';
        osc.frequency.setValueAtTime(300 + Math.random() * 100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);
    } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200 + Math.random() * 50, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);
    }
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playHit() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playExplosion() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playCoin() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1600, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playShieldBreak() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }
  
  playPowerup() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

export class GamePhysics {
  state: GameState;
  canvasWidth: number = 800;
  canvasHeight: number = 600;
  keysPressed: Record<string, boolean> = {};
  mousePos: Vector2D = { x: 0, y: 0 };
  audio: SoundManager;
  
  readonly MAP_WIDTH = 2500;
  readonly MAP_HEIGHT = 2000;
  
  constructor() {
    this.state = this.getInitialState();
    this.audio = new SoundManager();
  }

  getInitialState(): GameState {
    return {
      player: {
        id: 'player',
        x: 0, y: 0, 
        radius: 24,
        emoji: '😐',
        hp: 100, maxHp: 100,
        shield: 0, maxShield: 0,
        speed: 6,
        gold: 0,
        attackDamage: 15,
        attackSpeed: 25, 
        projectileSpeed: 10,
        projectileCount: 1,
        projectileSpread: 0.2,
        projectilePierce: 0,
        backwardShots: 0,
        knockback: 8,
        lifeSteal: 0,
        dropRate: 0.02,
        dodgeChance: 0,
        damageReflection: 0,
        shopDiscount: 1.0,
        shopUpgradeSlots: 4,
        shopItemSlots: 4,
        lastShotTime: 0,
        invulnerableTime: 0,
        items: []
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
      restockCost: 10
    };
  }

  init(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.state = this.getInitialState();
    this.startWave(1);
    this.audio.resume();
  }

  startWave(waveNum: number) {
    this.state.currentWave = waveNum;
    this.state.waveTimer = 0;
    this.state.waveEnded = false;
    this.state.isWaveClearing = false;
    this.state.waveTransitionTimer = 0;
    
    this.state.player.x = 0;
    this.state.player.y = 0;
    
    this.state.player.hp = this.state.player.maxHp;
    this.state.player.shield = this.state.player.maxShield;
    this.state.restockCost = 10; 

    this.state.projectiles = [];
    this.state.enemies = [];
    this.state.drops = [];
    this.state.zones = [];
    
    this.audio.playBattleBGM();
    
    const waveConfig = WAVES.find(w => w.waveNumber === waveNum) || WAVES[WAVES.length - 1];
    if (waveConfig.isBossWave) {
        this.spawnEnemy('boss_kpi', 0, -800);
    }
  }

  handleInput(keys: Record<string, boolean>, mouse: Vector2D) {
    this.keysPressed = keys;
    this.mousePos = mouse;
  }

  update() {
    if (this.state.waveEnded) return;

    // Transition Logic
    if (this.state.isWaveClearing) {
        this.state.waveTransitionTimer--;
        if (this.state.waveTransitionTimer <= 0) {
            this.state.waveEnded = true;
        }
        // Still update drops/particles/floating text but freeze enemy spawning/movement?
        // Let's freeze enemies but allow player to move to collect drops.
        this.updatePlayer();
        this.updateParticles();
        this.updateDrops();
        this.updateZones();
        this.updateCamera();
        return; // Skip enemy updates
    }

    this.state.timeAlive++;
    this.state.waveTimer++;

    this.updateWaveLogic();
    this.updatePlayer();
    this.updateEnemies();
    this.updateProjectiles();
    this.updateParticles();
    this.updateDrops();
    this.updateZones();
    this.checkCollisions();
    
    this.updateCamera();
  }

  private updateWaveLogic() {
      const waveConfig = WAVES.find(w => w.waveNumber === this.state.currentWave) || WAVES[WAVES.length - 1];
      const maxTime = waveConfig.duration * 60; 

      // Boss wave ends only when boss dies, checked in updateWaveLogic or after kill
      if (waveConfig.isBossWave) {
          const boss = this.state.enemies.find(e => e.config.behavior === 'boss');
          if (!boss && this.state.waveTimer > 60) { 
             this.triggerWaveEnd();
          }
      } else {
          // Normal wave
          if (this.state.waveTimer >= maxTime && !this.state.isWaveClearing) {
              this.triggerWaveEnd();
          } else {
             // Spawn Logic
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
      this.state.waveTransitionTimer = 90; // 1.5 Seconds Transition
      // Clear remaining enemies/projectiles to reduce chaos during transition
      if (!WAVES.find(w => w.waveNumber === this.state.currentWave)?.isBossWave) {
          this.state.enemies = [];
      }
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
    
    // Shake camera if boss transitioning
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

    // Auto Shoot (Always shoots if alive and not in menu)
    if (this.state.timeAlive - p.lastShotTime >= p.attackSpeed) {
      this.shoot();
      p.lastShotTime = this.state.timeAlive;
    }

    if (p.invulnerableTime > 0) p.invulnerableTime--;

    const hpPct = p.hp / p.maxHp;
    if (hpPct > 0.6) {
        p.emoji = '😐';
    } else if (hpPct > 0.3) {
        p.emoji = '😰';
    } else {
        p.emoji = '😱';
    }
  }

  private shoot() {
    const p = this.state.player;
    const angle = Math.atan2(this.mousePos.y - p.y, this.mousePos.x - p.x);

    this.audio.playShoot();

    const createBullet = (dir: number) => {
        const text = BULLET_TEXTS[Math.floor(Math.random() * BULLET_TEXTS.length)];
        this.state.projectiles.push({
            id: Math.random().toString(),
            x: p.x, y: p.y,
            radius: 20,
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
            angle: dir, // Store initial angle
            sourceType: 'player'
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
    const hpMult = 1 + (this.state.currentWave - 1) * 0.5; 
    
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
      isAimingDash: false
    });
  }

  private updateEnemies() {
    const p = this.state.player;
    
    this.state.enemies.forEach(e => {
      // Transition Logic
      if (e.isTransitioning) {
          e.stateTimer = (e.stateTimer || 0) - 1;
          e.vx = 0; e.vy = 0;
          if ((e.stateTimer || 0) <= 0) {
              e.isTransitioning = false;
              e.phase = 2;
              e.hp = e.maxHp;
              e.emoji = '👿';
              this.spawnFloatingText(e.x, e.y, "暴走模式!!!", "#ef4444", 'chat');
          }
          return;
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
              // Move horizontally back and forth relative to player vertical
              if (!e.stateTimer) e.stateTimer = 0;
              e.stateTimer++;
              moveY = dy / dist; // Chase vertical slowly
              moveX = Math.sin(e.stateTimer / 20) * 1.5; // Fast strafe
              moveSpeed = e.config.speed;
          }
          else if (e.config.behavior === 'circle') {
              // "Gai Liu Zi" AI: Wander -> Warning -> Dash
              e.dashTimer = (e.dashTimer || 0) + 1;
              
              // State Machine for Gai Liu Zi
              const DASH_CYCLE = 300; // Total Cycle
              const WARNING_START = 240;
              const DASH_START = 270;
              
              if (e.dashTimer < WARNING_START) {
                  // State: Wandering / Circling
                  e.isAimingDash = false;
                  // Circle logic
                  if (dist < 250) {
                      moveX = -moveX; moveY = -moveY; // Back off
                  } else {
                      const angle = Math.atan2(dy, dx) + Math.PI / 2;
                      moveX = Math.cos(angle);
                      moveY = Math.sin(angle);
                  }
                  e.vx = moveX * moveSpeed;
                  e.vy = moveY * moveSpeed;
              } 
              else if (e.dashTimer < DASH_START) {
                  // State: Warning (Lock aim)
                  e.isAimingDash = true;
                  e.vx = 0;
                  e.vy = 0;
                  
                  // Lock target coordinates at start of warning
                  if (e.dashTimer === WARNING_START) {
                      e.aimX = p.x;
                      e.aimY = p.y;
                  }
              } 
              else if (e.dashTimer < DASH_CYCLE) {
                  // State: Dash
                  e.isAimingDash = false; // Turn off warning line
                  
                  // Set velocity ONLY once at start of dash
                  if (e.dashTimer === DASH_START) {
                      const targetX = e.aimX ?? p.x;
                      const targetY = e.aimY ?? p.y;
                      const angle = Math.atan2(targetY - e.y, targetX - e.x);
                      // High speed dash
                      e.vx = Math.cos(angle) * (moveSpeed * 4.5);
                      e.vy = Math.sin(angle) * (moveSpeed * 4.5);
                      this.spawnFloatingText(e.x, e.y, "冲!", "#fcd34d", 'chat');
                  }
                  // Keep existing vx/vy (don't update it)
                  // Manual position update handled below
              } 
              else {
                  // Reset
                  e.dashTimer = 0;
                  e.aimX = undefined;
                  e.aimY = undefined;
              }
              
              // Gai Liu Zi position update is specific because it overrides standard logic
              e.x += e.vx;
              e.y += e.vy;
              // Return early to avoid standard movement overwriting it
              
              // Keep within bounds
              const halfW = this.MAP_WIDTH/2 - e.radius;
              const halfH = this.MAP_HEIGHT/2 - e.radius;
              e.x = Math.max(-halfW, Math.min(halfW, e.x));
              e.y = Math.max(-halfH, Math.min(halfH, e.y));
              
              // Do not perform standard attack for rusher/circle type (dash is the attack)
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

      // Enemy Collisions
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

      this.performEnemyAttack(e, p, dist);
    });
  }

  private performEnemyAttack(e: Enemy, p: Player, dist: number) {
      if (e.config.behavior === 'chase' || e.config.behavior === 'rusher' || e.config.behavior === 'circle' || e.config.behavior === 'minion') return;
      if (e.config.type === 'river_crab') return;
      if (e.isTransitioning) return;

      if (e.attackCooldown > 0) {
        e.attackCooldown--;
        return;
      }

      const aimAngle = Math.atan2(p.y - e.y, p.x - e.x);
      const bulletSpeed = 5;
      const bulletDmg = e.config.damage;
      let bulletChar = e.config.projectileChar || '!';
      
      // Random text for Keyboard Man
      if (e.config.projectileOptions && e.config.projectileOptions.length > 0) {
          bulletChar = e.config.projectileOptions[Math.floor(Math.random() * e.config.projectileOptions.length)];
      }

      const bulletSize = e.config.projectileSize || 16;
      const bulletColor = e.config.projectileColor || '#ffffff';

      // Boss Bullet life increased
      const bulletLife = e.config.behavior === 'boss' ? 400 : 200;

      const spawnBullet = (angle: number, explosive: boolean = false) => {
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
      };

      if (e.config.behavior === 'boss') {
          e.stateTimer = (e.stateTimer || 0) + 1;
          
          if (e.phase === 2) {
               e.stateTimer += 1; 
               if (Math.random() < 0.02) {
                    const randAngle = Math.random() * Math.PI * 2;
                    spawnBullet(randAngle, true); 
               }
          }

          if (e.stateTimer < 300) {
              // Spiral
              if (e.stateTimer % (e.phase === 2 ? 4 : 6) === 0) {
                  e.attackState = (e.attackState || 0) + 0.3;
                  spawnBullet(e.attackState);
                  spawnBullet(e.attackState + Math.PI);
                  spawnBullet(e.attackState + Math.PI/2);
                  spawnBullet(e.attackState - Math.PI/2);
              }
          } else if (e.stateTimer < 480) {
             // Rest
          } else if (e.stateTimer < 700) {
              // Phase 1: Screen Spread (New)
              if (e.stateTimer % 20 === 0) {
                 for(let k=0; k<8; k++) {
                     spawnBullet(aimAngle + (k/8) * Math.PI * 2);
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
      
      if (pattern === 'single') {
          if (dist < 800) { 
              spawnBullet(aimAngle);
              e.attackCooldown = e.config.type === 'turret' ? 30 : 120;
          }
      } else if (pattern === 'spread') {
          if (dist < 600) {
              spawnBullet(aimAngle - 0.2);
              spawnBullet(aimAngle);
              spawnBullet(aimAngle + 0.2);
              e.attackCooldown = 150;
          }
      } else if (pattern === 'explode') {
          if (dist < 700) {
              spawnBullet(aimAngle, true);
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
                   proj.color = '#ef4444'; 
                   proj.hitIds = [];
                   
                   // Split logic for "Tu" bullets
                   if (proj.isEnemy && proj.text === '退') {
                       const angle = proj.angle || 0;
                       // Spawn two smaller bullets
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
              proj.life--;
              if (proj.life < 150) { 
                  proj.isStopped = true;
                  proj.vx = 0;
                  proj.vy = 0;
                  proj.text = "⚠️";
                  proj.stopTimer = 60; 
              }
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
      const pt = this.state.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }
    for (let i = this.state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.state.floatingTexts[i];
      ft.y -= 1;
      ft.life--;
      if (ft.life <= 0) {
        this.state.floatingTexts.splice(i, 1);
      }
    }
  }
  
  private updateDrops() {
      const p = this.state.player;
      for (let i = this.state.drops.length - 1; i >= 0; i--) {
          const drop = this.state.drops[i];
          const dist = Math.hypot(drop.x - p.x, drop.y - p.y);
          if (dist < p.radius + drop.radius) {
              if (drop.type === 'health') {
                  if (p.hp < p.maxHp) {
                      p.hp = Math.min(p.maxHp, p.hp + drop.value);
                      this.spawnFloatingText(p.x, p.y, `+${drop.value}`, '#22c55e');
                      this.audio.playPowerup();
                      this.state.drops.splice(i, 1);
                  }
              } else {
                  this.state.drops.splice(i, 1);
              }
          }
      }
  }

  private updateZones() {
      for (let i = this.state.zones.length - 1; i >= 0; i--) {
          const zone = this.state.zones[i];
          zone.life--;
          if (zone.life <= 0) {
              this.state.zones.splice(i, 1);
          }
      }
  }

  private checkCollisions() {
    const p = this.state.player;
    
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const proj = this.state.projectiles[i];
      
      if (proj.isExploding) {
         if (proj.isEnemy) {
             const dist = Math.hypot(proj.x - p.x, proj.y - p.y);
             if (dist < proj.radius && p.invulnerableTime <= 0) {
                 this.damagePlayer(proj.damage * 1.5, proj.sourceType);
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
          if (e.isTransitioning) continue; // Immune during transition
          if (proj.hitIds.includes(e.id)) continue;

          const dist = Math.hypot(proj.x - e.x, proj.y - e.y);
          if (dist < proj.radius + e.radius) {
            proj.hitIds.push(e.id);
            
            if (Math.random() < p.lifeSteal) {
                p.hp = Math.min(p.maxHp, p.hp + 1);
            }
            
            // Red Envelope item effect
            if (p.items.includes('红包') && Math.random() < 0.05) {
                p.gold += 1;
                this.spawnFloatingText(e.x, e.y, "🧧+1", "#f87171", 'gold');
            }

            e.hp -= proj.damage;
            this.spawnFloatingText(e.x, e.y, `-${Math.floor(proj.damage)}`, '#fbbf24', 'damage');
            const angle = Math.atan2(e.y - proj.y, e.x - proj.x);
            e.vx += Math.cos(angle) * p.knockback;
            e.vy += Math.sin(angle) * p.knockback;

            // Boss Logic Phase 1 -> Transition Check
            if (e.config.behavior === 'boss' && e.phase === 1 && e.hp <= 0) {
                e.hp = 1; // Prevent death logic
                if (!e.isTransitioning) {
                    e.isTransitioning = true;
                    e.stateTimer = 180; // 3 seconds wait
                    this.spawnFloatingText(e.x, e.y, "形态切换中...", "#ef4444", 'chat');
                    
                    // Safe filter
                    this.state.projectiles.forEach(p => {
                        if (p.isEnemy) p.life = 0;
                    });
                }
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
            this.damagePlayer(10, e.config.type);
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            p.x += Math.cos(angle) * 50;
            p.y += Math.sin(angle) * 50;
        }
    }
  }

  private damagePlayer(amount: number, source: string = 'unknown') {
      const p = this.state.player;
      
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
    this.state.enemies.splice(index, 1);
    this.spawnParticles(e.x, e.y, '#ef4444', 8);
    
    this.state.player.gold += e.config.score;
    this.state.score += e.config.score;
    
    // Lemon Acid Pool Logic
    if (e.config.type === 'lemon_head') {
        this.state.zones.push({
            id: Math.random().toString(),
            x: e.x, y: e.y,
            radius: 100,
            emoji: '',
            type: 'acid',
            life: 180, // 3 seconds
            color: '#a3e635'
        });
    }

    // Tao Wa (Nesting Doll) Logic
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
    
    if (Math.random() < this.state.player.dropRate) { 
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

  private spawnParticles(x: number, y: number, color: string, count: number) {
    for(let i=0; i<count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4;
        this.state.particles.push({
            id: Math.random().toString(),
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 20,
            color,
            size: Math.random() * 4 + 1
        });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string, type: 'damage' | 'chat' | 'gold' = 'damage') {
      this.state.floatingTexts.push({
          id: Math.random().toString(),
          x, y, text, color, life: type === 'chat' ? 60 : 30, vy: -1, type
      });
  }
}

export const gameEngine = new GamePhysics();
