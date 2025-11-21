
import { EnemyConfig, UpgradeOption, WaveConfig } from "../types";

// --- 死亡语录 ---
export const DEATH_MESSAGES: Record<string, string> = {
  'keyboard_man': "你被键盘侠喷到怀疑人生，直接退网了。",
  'tian_gou': "你被舔狗的真心感动（恶心）死了。",
  'lemon_head': "你被酸死了。这就破防了？",
  'gai_liu_zi': "你在街头被鬼火少年撞飞，社保都没得赔。",
  'chi_gua': "你在围观群众的瓜子壳海洋中窒息了。",
  'da_ye': "大爷使用了'退退退'，你被物理超度了。",
  'marketing_account': "你被营销号的谣言洗脑，变成了傻子。",
  'clown': "小丑竟是你自己。",
  'minion': "你被当成垃圾清理掉了。",
  'tao_wa_big': "你被无限套娃困在循环里出不来了。",
  'tao_wa_med': "你倒在了套娃的第二层。",
  'tao_wa_small': "你竟然被最小的套娃干掉了？",
  'river_crab': "你的内容违规，已被河蟹屏蔽。",
  'boss_kpi': "你被公司'结构性优化'了。请立刻办理离职手续。",
  'unknown': "你猝死了。这就是996的福报。"
};

// --- 敌人配置 ---
export const ENEMIES: Record<string, EnemyConfig> = {
  'keyboard_man': {
    type: 'keyboard_man',
    emoji: '⌨️',
    hp: 30,
    speed: 2,
    damage: 10,
    score: 15,
    description: "野生键盘侠，擅长远程输出观点，只要还在打字就是无敌的。",
    behavior: 'shooter',
    projectileChar: '急',
    projectileOptions: ["急", "典", "孝", "乐", "崩", "赢", "麻"],
    attackPattern: 'single',
    sizeScale: 1.0,
    projectileSize: 20, 
    projectileColor: '#f87171',
    deathQuotes: ["急了急了", "我键盘坏了", "不至于吧", "典", "我不服"]
  },
  'tian_gou': {
    type: 'tian_gou',
    emoji: '🐶',
    hp: 25,
    speed: 4.5, 
    damage: 8,
    score: 8,
    description: "忠诚的舔狗，看到女神就会不顾一切冲上来，速度极快。",
    behavior: 'chase',
    sizeScale: 0.8,
    deathQuotes: ["女神...", "在吗", "早安", "我错了", "汪"]
  },
  'lemon_head': {
    type: 'lemon_head',
    emoji: '🍋',
    hp: 50,
    speed: 1.5,
    damage: 10,
    score: 12,
    description: "柠檬精，死亡后留下酸液池，踩上去会大幅减速。",
    behavior: 'chase',
    sizeScale: 0.9,
    deathQuotes: ["酸了", "恰柠檬", "你什么家庭", "真酸", "呵呵"]
  },
  'gai_liu_zi': {
    type: 'gai_liu_zi',
    emoji: '🕺',
    hp: 45,
    speed: 5,
    damage: 12,
    score: 20,
    description: "该溜子，没事到处晃悠，偶尔会发起极速鬼火冲撞，注意躲避！",
    behavior: 'circle',
    sizeScale: 1.1,
    deathQuotes: ["摇起来", "别扒拉我", "给你脸了", "花手"]
  },
  'chi_gua': {
    type: 'chi_gua',
    emoji: '🍉',
    hp: 80,
    speed: 0.5,
    damage: 15,
    score: 25,
    description: "吃瓜群众，前排围观，虽然不动但会吐瓜子（子弹）。",
    behavior: 'turret', 
    projectileChar: '瓜',
    projectileSize: 22,
    attackPattern: 'single',
    projectileColor: '#22c55e',
    sizeScale: 1.2,
    deathQuotes: ["保熟吗", "吃瓜", "前排", "这就完了？"]
  },
  'da_ye': {
    type: 'da_ye',
    emoji: '👴',
    hp: 200,
    speed: 1.2,
    damage: 30,
    score: 40,
    description: "小区大爷，会发射延迟爆炸的“退退退”法术，血量极厚。",
    behavior: 'tank', 
    projectileChar: '退',
    projectileSize: 40,
    attackPattern: 'explode', 
    projectileColor: '#fbbf24',
    sizeScale: 1.8,
    deathQuotes: ["年轻人", "不讲武德", "耗子尾汁", "大意了"]
  },
  'marketing_account': {
    type: 'marketing_account',
    emoji: '📢',
    hp: 90,
    speed: 1,
    damage: 15,
    score: 30,
    description: "营销号，一张嘴就是散弹谣言，令人防不胜防。",
    behavior: 'shooter',
    projectileChar: '谣',
    attackPattern: 'spread',
    sizeScale: 1.5,
    projectileSize: 24,
    projectileColor: '#a855f7', 
    deathQuotes: ["震惊！", "看哭了", "删前速看", "家人们谁懂", "纯路人"]
  },
  'clown': {
    type: 'clown',
    emoji: '🤡',
    hp: 70,
    speed: 3.5,
    damage: 18,
    score: 25,
    description: "小丑，不仅是心理上的，物理上也会像疯子一样冲过来。",
    behavior: 'rusher',
    sizeScale: 1.2,
    deathQuotes: ["小丑竟是我", "玩不起？", "原来我是小丑", "别急", "这就破防了"]
  },
  'minion': {
    type: 'minion',
    emoji: '🔨',
    hp: 40,
    speed: 2.5,
    damage: 5,
    score: 5,
    description: "工具人，毫无感情的打工机器，会随机游走。",
    behavior: 'minion', 
    sizeScale: 0.6,
    deathQuotes: ["我是自愿的", "996福报", "我爱加班", "收到"]
  },
  'tao_wa_big': {
    type: 'tao_wa_big',
    emoji: '📦',
    hp: 120,
    speed: 1.5,
    damage: 15,
    score: 30,
    description: "禁止套娃（大），打死后会分裂出两个中型套娃。",
    behavior: 'chase',
    sizeScale: 1.5,
    deathQuotes: ["还没完呢", "再来", "套娃开始"]
  },
  'tao_wa_med': {
    type: 'tao_wa_med',
    emoji: '🥡',
    hp: 60,
    speed: 2,
    damage: 10,
    score: 15,
    description: "禁止套娃（中），打死后会分裂出两个小型套娃。",
    behavior: 'chase',
    sizeScale: 1.0,
    deathQuotes: ["还有", "继续"]
  },
  'tao_wa_small': {
    type: 'tao_wa_small',
    emoji: '🍬',
    hp: 30,
    speed: 3,
    damage: 5,
    score: 5,
    description: "禁止套娃（小），终于到头了。",
    behavior: 'chase',
    sizeScale: 0.7,
    deathQuotes: ["结束了", "没了"]
  },
  'river_crab': {
    type: 'river_crab',
    emoji: '🦀',
    hp: 150,
    speed: 3,
    damage: 20,
    score: 35,
    description: "河蟹，横行霸道，虽然不怎么打人但是挡路且很硬。",
    behavior: 'rusher', 
    sizeScale: 1.4,
    deathQuotes: ["被夹了", "和谐", "404"]
  },
  'boss_kpi': {
    type: 'boss_kpi',
    emoji: '👹',
    hp: 5000, 
    speed: 2.5,
    damage: 25,
    score: 10000,
    description: "KPI大魔王，掌握着你的生杀大权，二阶段会更加疯狂。",
    behavior: 'boss',
    projectileChar: '裁',
    attackPattern: 'spiral',
    sizeScale: 4.5,
    projectileSize: 35,
    projectileColor: '#ef4444',
    deathQuotes: ["公司需要降本增效...", "这不符合底层逻辑...", "我的期权..."]
  }
};

// --- 波次配置 ---
export const WAVES: WaveConfig[] = [
  {
    waveNumber: 1,
    duration: 60,
    enemies: [{ type: 'tian_gou', weight: 8 }, { type: 'keyboard_man', weight: 2 }],
    spawnRate: 60
  },
  {
    waveNumber: 2,
    duration: 60,
    enemies: [{ type: 'tian_gou', weight: 4 }, { type: 'keyboard_man', weight: 4 }, { type: 'lemon_head', weight: 2 }],
    spawnRate: 55
  },
  {
    waveNumber: 3,
    duration: 60,
    enemies: [{ type: 'tao_wa_big', weight: 3 }, { type: 'gai_liu_zi', weight: 3 }, { type: 'chi_gua', weight: 3 }],
    spawnRate: 50
  },
  {
    waveNumber: 4,
    duration: 60,
    enemies: [{ type: 'clown', weight: 3 }, { type: 'marketing_account', weight: 4 }, { type: 'river_crab', weight: 2 }, { type: 'gai_liu_zi', weight: 2 }],
    spawnRate: 45
  },
  {
    waveNumber: 5,
    duration: 60,
    enemies: [{ type: 'da_ye', weight: 3 }, { type: 'chi_gua', weight: 3 }, { type: 'tao_wa_big', weight: 3 }],
    spawnRate: 40
  },
  {
    waveNumber: 6,
    duration: 60,
    enemies: [{ type: 'marketing_account', weight: 4 }, { type: 'river_crab', weight: 3 }, { type: 'lemon_head', weight: 4 }],
    spawnRate: 35
  },
  {
    waveNumber: 7,
    duration: 60,
    enemies: [{ type: 'gai_liu_zi', weight: 5 }, { type: 'clown', weight: 4 }, { type: 'da_ye', weight: 2 }, { type: 'tao_wa_big', weight: 2 }],
    spawnRate: 30
  },
  {
    waveNumber: 8,
    duration: 999, 
    enemies: [{ type: 'boss_kpi', weight: 1 }],
    spawnRate: 99999,
    isBossWave: true
  }
];

// --- 商店道具 ---
export const SHOP_ITEMS: UpgradeOption[] = [
  // Upgrades
  {
    id: 'keyboard_cleaner',
    title: '键盘清理泥',
    description: '基础伤害 +1。前期神器。',
    rarity: 'common',
    category: 'upgrade',
    price: 30,
    icon: '🧹',
    effect: (state) => {
      state.player.attackDamage += 1;
    }
  },
  {
    id: 'mechanical_keyboard',
    title: '机械键盘',
    description: '攻速 +15%，打字如飞。',
    rarity: 'common',
    category: 'upgrade',
    price: 50,
    icon: '⌨️',
    effect: (state) => {
      state.player.attackSpeed = Math.max(5, state.player.attackSpeed * 0.85);
    }
  },
  {
    id: 'big_lung',
    title: '大嗓门',
    description: '伤害 +20%，输出全靠吼。(第3波后解锁)',
    rarity: 'common',
    category: 'upgrade',
    minWave: 3,
    price: 80,
    icon: '🗣️',
    effect: (state) => {
      state.player.attackDamage *= 1.2;
    }
  },
  {
    id: 'thick_face',
    title: '防弹脸皮',
    description: '最大生命 +30，脸皮厚吃得开。',
    rarity: 'rare',
    category: 'upgrade',
    price: 80,
    icon: '🛡️',
    effect: (state) => {
      state.player.maxHp += 30;
    }
  },
  {
    id: '5g_speed',
    title: '5G网速',
    description: '移速 +10%。',
    rarity: 'common',
    category: 'upgrade',
    price: 40,
    icon: '🚀',
    effect: (state) => {
      state.player.speed *= 1.1;
    }
  },
  {
    id: 'coffee',
    title: '冰美式',
    description: '弹速 +20%，攻速 +5%。',
    rarity: 'common',
    category: 'upgrade',
    price: 45,
    icon: '☕',
    effect: (state) => {
      state.player.projectileSpeed *= 1.2;
      state.player.attackSpeed *= 0.95;
    }
  },
  {
    id: 'hot_search',
    title: '买热搜',
    description: '子弹穿透 +1。',
    rarity: 'legendary',
    category: 'upgrade',
    price: 150,
    icon: '🔥',
    effect: (state) => {
      state.player.projectilePierce += 1;
      state.player.attackDamage *= 0.9;
    }
  },
  {
    id: 'fan_group',
    title: '粉丝群',
    description: '子弹数量 +1 (至多5发)。',
    rarity: 'legendary',
    category: 'upgrade',
    price: 200,
    icon: '📶',
    effect: (state) => {
      state.player.projectileCount += 1;
      state.player.attackDamage *= 0.8;
    }
  },

  // Items
  {
    id: 'screen_protector',
    title: '钢化膜',
    description: '护盾上限 +30。每波自动恢复。',
    rarity: 'common',
    category: 'item',
    price: 60,
    icon: '📱',
    effect: (state) => {
      state.player.maxShield += 30;
      state.player.items.push('钢化膜');
    },
    items: ['钢化膜']
  },
  {
    id: 'black_pot',
    title: '背锅',
    description: '受到伤害时，反弹 50% 伤害给攻击者。',
    rarity: 'rare',
    category: 'item',
    price: 120,
    icon: '🍳',
    effect: (state) => {
      state.player.damageReflection += 0.5;
      state.player.items.push('黑锅');
    },
    items: ['黑锅']
  },
  {
    id: 'fishing_guide',
    title: '摸鱼指南',
    description: '增加 15% 闪避几率 (上限60%)。',
    rarity: 'rare',
    category: 'item',
    price: 130,
    icon: '📖',
    effect: (state) => {
      state.player.dodgeChance += 0.15;
      state.player.items.push('摸鱼指南');
    },
    items: ['摸鱼指南']
  },
  {
    id: 'coupon',
    title: '小卖部优惠券',
    description: '商店价格永久打9折！(可叠加, 限5张)',
    rarity: 'rare',
    category: 'item',
    price: 200,
    maxCount: 5,
    icon: '🎟️',
    effect: (state) => {
      state.player.shopDiscount *= 0.9;
      state.player.items.push('优惠券');
    },
    items: ['优惠券']
  },
  {
    id: 'quirky_gun',
    title: '古灵精怪枪',
    description: '发射时向身后也发射一颗子弹 (限2把)。',
    rarity: 'legendary',
    category: 'item',
    price: 250,
    maxCount: 2,
    icon: '🔫',
    effect: (state) => {
      state.player.backwardShots += 1;
      state.player.items.push('古灵精怪枪');
    },
    items: ['古灵精怪枪']
  },
  {
    id: 'koi_fish',
    title: '欧皇附体',
    description: '增加 3% 物品掉落率（可以吸欧气）。',
    rarity: 'rare',
    category: 'item',
    price: 100,
    icon: '🐟',
    effect: (state) => {
      state.player.dropRate += 0.03;
      state.player.items.push('欧皇附体');
    },
    items: ['欧皇附体']
  },
  {
    id: 'street_lamp',
    title: '资本家路灯',
    description: '攻击附带 1% 吸血效果。',
    rarity: 'legendary',
    category: 'item',
    price: 300,
    icon: '💡',
    effect: (state) => {
      state.player.lifeSteal += 0.01;
      state.player.items.push('路灯');
    },
    items: ['路灯']
  },
  {
    id: 'red_envelope',
    title: '红包',
    description: '攻击有概率掉落 1 块钱。',
    rarity: 'rare',
    category: 'item',
    price: 150,
    icon: '🧧',
    effect: (state) => {
      // This item adds a passive effect which needs to be checked in collision
      // We will mark it in items list
      state.player.items.push('红包');
    },
    items: ['红包']
  },
  {
    id: 'wifi_booster',
    title: 'WiFi增强器',
    description: '子弹飞行速度 +15%，攻击范围变相增加。',
    rarity: 'common',
    category: 'item',
    price: 70,
    icon: '📡',
    effect: (state) => {
      state.player.projectileSpeed *= 1.15;
      state.player.items.push('WiFi');
    },
    items: ['WiFi']
  }
];

export const BULLET_TEXTS = ["乐", "典", "孝", "急", "崩", "赢", "麻", "6", "哈", "这", "尊"];
