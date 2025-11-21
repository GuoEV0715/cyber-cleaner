
export enum GamePhase {
  WELCOME = 'WELCOME',
  STORY = 'STORY', 
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  BOSS_INTRO = 'BOSS_INTRO', // New Phase
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
}

// 物理实体基础
export interface Vector2D {
  x: number;
  y: number;
}

// 游戏配置数据
export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary';
  category: 'upgrade' | 'item'; 
  price: number;
  icon: string;
  effect: (state: GameState) => void;
  maxCount?: number; 
  minWave?: number; 
  
  items?: string[];

  locked?: boolean;
  purchased?: boolean;
  uuid?: string; 
}

export interface EnemyConfig {
  type: string;
  emoji: string;
  hp: number;
  speed: number;
  damage: number;
  score: number;
  description: string; 
  behavior: 'chase' | 'shooter' | 'rusher' | 'boss' | 'circle' | 'turret' | 'tank' | 'minion'; 
  projectileChar?: string;
  projectileOptions?: string[]; 
  attackPattern?: 'single' | 'spread' | 'spiral' | 'circle' | 'explode'; 
  sizeScale?: number; 
  projectileSize?: number;
  projectileColor?: string;
  deathQuotes?: string[]; 
}

// 运行时实体
export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  emoji: string;
}

export interface Player extends Entity {
  hp: number;
  maxHp: number;
  shield: number; 
  maxShield: number;
  speed: number;
  gold: number;
  
  attackDamage: number;
  attackSpeed: number; 
  projectileSpeed: number;
  projectileCount: number;
  projectileSpread: number;
  projectilePierce: number;
  backwardShots: number; 
  knockback: number;
  lifeSteal: number;
  dropRate: number; 
  dodgeChance: number; 
  damageReflection: number; 
  
  shopDiscount: number; 
  shopUpgradeSlots: number;
  shopItemSlots: number;

  lastShotTime: number;
  invulnerableTime: number;
  items: string[]; 
}

export interface Enemy extends Entity {
  id: string;
  config: EnemyConfig;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  attackCooldown: number;
  attackState?: number;
  stateTimer?: number; 
  phase?: number; 
  isTransitioning?: boolean; 
  dashTimer?: number; 
  isAimingDash?: boolean; 
  aimX?: number;
  aimY?: number;
}

export interface Projectile extends Entity {
  vx: number;
  vy: number;
  damage: number;
  life: number;
  isEnemy: boolean;
  color: string;
  text: string;
  pierce: number;
  hitIds: string[];
  angle?: number; 
  sourceType?: string; // Track who fired this
  
  isExplosive?: boolean;
  isStopped?: boolean;
  stopTimer?: number;
  isExploding?: boolean;
  maxExplosionRadius?: number;
}

export interface Drop extends Entity {
  type: 'health'; 
  value: number;
  life: number; 
}

export interface Zone extends Entity {
  type: 'acid';
  life: number;
  color: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
  type?: 'damage' | 'chat' | 'gold'; 
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface WaveConfig {
  waveNumber: number;
  duration: number; 
  enemies: { type: string, weight: number }[];
  spawnRate: number;
  isBossWave?: boolean;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  projectiles: Projectile[];
  floatingTexts: FloatingText[];
  particles: Particle[];
  drops: Drop[];
  zones: Zone[]; 
  camera: Vector2D; 
  score: number;
  timeAlive: number;
  
  mapWidth: number;
  mapHeight: number;
  currentWave: number;
  waveTimer: number;
  waveEnded: boolean;
  isWaveClearing: boolean; 
  waveTransitionTimer: number; 
  
  restockCost: number;
  killer?: string; // Stores the name/type of the entity that killed the player
}

export interface PlayerStats {
  name: string;
  trait: string;
  hp: number;
  gold: number;
}

export interface GameOption {
  label: string;
  description: string;
  type: 'combat' | 'event' | 'shop' | 'rest';
}

export interface AIResponse {
  eventTitle: string;
  eventDescription: string;
  isCombat: boolean;
  enemyName?: string;
  enemyHp?: number;
  options: GameOption[];
  actionResult: string;
  hpChange: number;
  goldChange: number;
}
