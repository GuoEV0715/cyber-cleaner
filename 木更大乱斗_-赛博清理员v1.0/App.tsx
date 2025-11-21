
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, UpgradeOption } from './types';
import { gameEngine } from './services/gameEngine';
import { Button } from './components/Button';
import { StatusPanel } from './components/StatusPanel';
import { SHOP_ITEMS, WAVES, ENEMIES, DEATH_MESSAGES } from './data/memeContent';

// --- INDEPENDENT COMPONENTS (Fixes Hook Rules) ---

const StoryView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const scenes = [
        { type: 'right', emoji: "👹", name: "KPI狂魔", text: "喂！！那个谁！！9527！！" },
        { type: 'left', emoji: "🎧", name: "9527", text: "（摘下耳机）...啊？老板？我在带薪拉...思考人生。" },
        { type: 'right', emoji: "👹", name: "KPI狂魔", text: "思考个屁！你看现在的赛博服务器！红灯都亮爆了！" },
        { type: 'right', emoji: "💩", name: "KPI狂魔", text: "到处都是'急了'、'泰裤辣'、'家人们'！内存都要溢出了！" },
        { type: 'left', emoji: "😐", name: "9527", text: "这不挺热闹的吗...互联网也就这点乐子了。" },
        { type: 'right', emoji: "👹", name: "KPI狂魔", text: "乐子？客户投诉要把我们服务器扬了！年底KPI还要不要了？！" },
        { type: 'right', emoji: "👹", name: "KPI狂魔", text: "给我去清理掉这些电子垃圾！立刻！马上！物理清理！" },
        { type: 'left', emoji: "😐", name: "9527", text: "行吧... 那个，算加班费吗？" },
        { type: 'right', emoji: "👹", name: "KPI狂魔", text: "加班费？能让你在这个岗位上发光发热就是最大的福报！" },
        { type: 'left', emoji: "😐", name: "9527", text: "......" },
        { type: 'center', emoji: "🧹", name: "旁白", text: "赛博保洁员 9527，被迫出击。" },
    ];

    const handleClick = () => {
        if (step < scenes.length - 1) {
            setStep(s => s + 1);
        } else {
            onFinish();
        }
    };

    const current = scenes[step];
    if (!current) return null;

    return (
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 p-8 cursor-pointer select-none" onClick={handleClick}>
          <div className="w-full max-w-4xl h-96 flex items-center justify-center relative">
              {current.type === 'center' ? (
                  <div className="flex flex-col items-center animate-bounce-in">
                      <div className="text-9xl mb-8 animate-pulse">{current.emoji}</div>
                      <div className="flex flex-col items-center bg-slate-800 px-8 py-4 rounded-full border-2 border-white">
                          <div className="text-sm text-slate-400 mb-1 font-bold">{current.name}</div>
                          <div className="text-3xl text-white font-bold typewriter">{current.text}</div>
                      </div>
                  </div>
              ) : (
                  <div className={`flex items-end gap-8 w-full ${current.type === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="text-9xl filter drop-shadow-lg transform transition-transform duration-500 scale-110">{current.emoji}</div>
                      <div className={`
                          bg-white text-black p-6 rounded-2xl text-2xl font-bold shadow-xl relative max-w-lg animate-pop-in flex flex-col
                          after:content-[''] after:absolute after:bottom-4 after:w-0 after:h-0 after:border-8
                          ${current.type === 'left' 
                              ? "rounded-bl-none after:border-l-white after:border-t-transparent after:border-r-transparent after:border-b-transparent after:-left-4 origin-bottom-left" 
                              : "rounded-br-none after:border-r-white after:border-t-transparent after:border-l-transparent after:border-b-transparent after:-right-4 origin-bottom-right"}
                      `}>
                          <div className="text-sm text-slate-500 mb-2 font-black uppercase tracking-wider">{current.name}</div>
                          <div>{current.text}</div>
                      </div>
                  </div>
              )}
          </div>
          <div className="absolute bottom-10 text-slate-500 animate-pulse text-sm">点击屏幕继续 ▶</div>
      </div>
    );
};

const BossIntroView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const scenes = [
        { emoji: "👹", text: "居然让你混到了这里..." },
        { emoji: "📉", text: "既然你想反抗，那就让你见识一下什么叫'降本增效'！" },
        { emoji: "🔥", text: "准备好接受KPI的审判了吗？" },
    ];

    useEffect(() => {
        if (step >= scenes.length) {
            onFinish();
            return;
        }
        const timer = setTimeout(() => {
            setStep(s => s + 1);
        }, 2500);
        return () => clearTimeout(timer);
    }, [step, onFinish, scenes.length]);

    const current = scenes[Math.min(step, scenes.length - 1)];
    if (!current) return null;

    return (
        <div className="absolute inset-0 bg-red-900 flex flex-col items-center justify-center z-50" onClick={onFinish}>
            <div className="text-9xl mb-8 animate-pulse filter drop-shadow-red">{current.emoji}</div>
            <div className="text-4xl text-white font-black bg-black/50 p-6 rounded-xl border-2 border-red-500 shadow-2xl max-w-3xl text-center">
                {current.text}
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WELCOME);
  const [shopUpgrades, setShopUpgrades] = useState<UpgradeOption[]>([]);
  const [shopItems, setShopItems] = useState<UpgradeOption[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0); 
  const [hoverItem, setHoverItem] = useState<string | null>(null); 
  const [hoverEnemy, setHoverEnemy] = useState<string | null>(null);
  
  // Transition State
  const [inTransition, setInTransition] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef<{x: number, y: number}>({x: 0, y: 0});

  // Render Scale for Zoom Out (Widened View)
  const RENDER_SCALE = 0.6;

  // --- TRANSITION HELPER ---
  const switchPhase = (newPhase: GamePhase) => {
      setInTransition(true);
      setTimeout(() => {
          setPhase(newPhase);
          setInTransition(false);
      }, 500);
  };

  // --- INPUT HANDLERS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    const handleMouseMove = (e: MouseEvent) => { 
        if(!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        
        const centeredX = screenX - width / 2;
        const centeredY = screenY - height / 2;
        
        const unscaledX = centeredX / RENDER_SCALE;
        const unscaledY = centeredY / RENDER_SCALE;
        
        // Simple camera addition
        const finalX = unscaledX + gameEngine.state.camera.x;
        const finalY = unscaledY + gameEngine.state.camera.y;

        mouseRef.current = { x: finalX, y: finalY };
    };
    const handleMouseDown = () => { keysRef.current['mousedown'] = true; };
    const handleMouseUp = () => { keysRef.current['mousedown'] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // --- SHOP LOGIC ---
  const getRandomItems = (pool: UpgradeOption[], count: number) => {
      const player = gameEngine.state.player;
      const available = pool.filter(item => {
          // Logic for limiting coupon or other max count items
          if (item.maxCount) {
              // Count how many of THIS item title the player has in their items list
              const owned = player.items.filter(n => n === item.items?.[0]).length;
              if (owned >= item.maxCount) return false;
          }
          
          // Min Wave Requirement
          if (item.minWave && gameEngine.state.currentWave < item.minWave) {
              return false;
          }

          // Dodge Chance Cap (60%)
          if (item.id === 'fishing_guide' && player.dodgeChance >= 0.6) return false;

          // Projectile Count Cap (5)
          if (item.id === 'fan_group' && player.projectileCount >= 5) return false;

          return true;
      });
      
      return [...available].sort(() => 0.5 - Math.random()).slice(0, count).map(item => ({
          ...item, 
          purchased: false, 
          locked: false,
          uuid: Math.random().toString()
      }));
  };

  const initShop = () => {
      gameEngine.audio.playShopBGM();
      const allUpgrades = SHOP_ITEMS.filter(i => i.category === 'upgrade');
      const allItems = SHOP_ITEMS.filter(i => i.category === 'item');
      
      setShopUpgrades(prev => {
          const locked = prev.filter(i => i.locked && !i.purchased); 
          const need = gameEngine.state.player.shopUpgradeSlots - locked.length;
          return [...locked, ...getRandomItems(allUpgrades, Math.max(0, need))];
      });

      setShopItems(prev => {
          const locked = prev.filter(i => i.locked && !i.purchased);
          const need = gameEngine.state.player.shopItemSlots - locked.length;
          return [...locked, ...getRandomItems(allItems, Math.max(0, need))];
      });
  };

  const restockShop = (type: 'upgrade' | 'item') => {
      const cost = gameEngine.state.restockCost;
      if (gameEngine.state.player.gold >= cost) {
          gameEngine.state.player.gold -= cost;
          gameEngine.state.restockCost += 10; 
          gameEngine.audio.playCoin();
          
          const allUpgrades = SHOP_ITEMS.filter(i => i.category === 'upgrade');
          const allItems = SHOP_ITEMS.filter(i => i.category === 'item');

          if (type === 'upgrade') {
             setShopUpgrades(prev => {
                 const next = prev.filter(p => p.locked && !p.purchased);
                 const need = gameEngine.state.player.shopUpgradeSlots - next.length;
                 if (need > 0) {
                     next.push(...getRandomItems(allUpgrades, need));
                 }
                 return next;
             });
          } else {
             setShopItems(prev => {
                 const next = prev.filter(p => p.locked && !p.purchased);
                 const need = gameEngine.state.player.shopItemSlots - next.length;
                 if (need > 0) {
                     next.push(...getRandomItems(allItems, need));
                 }
                 return next;
             });
          }
          setRenderTrigger(prev => prev + 1);
      }
  };

  const toggleLock = (listSetter: React.Dispatch<React.SetStateAction<UpgradeOption[]>>, index: number) => {
      listSetter(prev => {
          const next = [...prev];
          if(!next[index].purchased) {
              next[index] = { ...next[index], locked: !next[index].locked };
          }
          return next;
      });
  };

  const buyItem = (list: UpgradeOption[], listSetter: React.Dispatch<React.SetStateAction<UpgradeOption[]>>, index: number) => {
      const item = list[index];
      const actualPrice = Math.floor(item.price * gameEngine.state.player.shopDiscount);
      
      if (!item.purchased && gameEngine.state.player.gold >= actualPrice) {
          gameEngine.state.player.gold -= actualPrice;
          item.effect(gameEngine.state);
          gameEngine.audio.playCoin();
          
          listSetter(prev => {
              const next = [...prev];
              // Unlock automatically when purchased to prevent restocking it
              next[index] = { ...next[index], purchased: true, locked: false };
              return next;
          });
          setRenderTrigger(prev => prev + 1);
      }
  };

  // --- GAME LOOP ---
  const gameLoop = useCallback(() => {
    if (phase !== GamePhase.PLAYING) return;

    gameEngine.handleInput(keysRef.current, mouseRef.current);
    gameEngine.update();

    if (gameEngine.state.waveEnded) {
        if (gameEngine.state.currentWave >= WAVES.length && gameEngine.state.enemies.length === 0) {
            switchPhase(GamePhase.VICTORY);
        } else if (gameEngine.state.currentWave < WAVES.length) {
            initShop();
            switchPhase(GamePhase.SHOP);
        }
        return;
    }

    if (gameEngine.state.player.hp <= 0) {
        switchPhase(GamePhase.GAME_OVER);
        return;
    }

    renderCanvas();
    setRenderTrigger(prev => (prev + 1) % 60);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [phase]);

  // --- RENDERERS ---
  const drawProjectile = (ctx: CanvasRenderingContext2D, p: any) => {
      ctx.save();
      
      if (p.isExploding) {
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
      } 
      else if (p.isEnemy) {
        // Enemy Bullet
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = '#fff'; 
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Warning sign if stopped
        if (p.isStopped) {
            ctx.font = '30px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'yellow';
            if (Math.floor(Date.now() / 100) % 2 === 0) {
                 ctx.fillText("⚠️", p.x, p.y);
            }
        } else {
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'black';
            ctx.font = `bold ${Math.floor(p.radius * 1.1)}px sans-serif`; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.text, p.x, p.y);
        }
      } else {
        // Player Bullet
        const size = Math.floor(p.radius * 2.2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${size}px "Noto Sans SC", sans-serif`;

        // 1. Glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        
        // 2. Stroke for contrast
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        
        ctx.globalAlpha = 0.85; // Opacity Change to 85%
        ctx.strokeText(p.text, p.x, p.y);
        
        // 3. Fill Text (White)
        ctx.shadowBlur = 0; // Clean fill
        ctx.fillStyle = 'white';
        ctx.fillText(p.text, p.x, p.y);
        ctx.globalAlpha = 1.0;
      }
      
      ctx.restore();
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const state = gameEngine.state;
    const cam = state.camera;

    // Clear Screen
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    
    // 1. Center Camera
    ctx.translate(width / 2, height / 2);
    // 2. Zoom
    ctx.scale(RENDER_SCALE, RENDER_SCALE);
    // 3. Move Camera to Player World Pos
    ctx.translate(-cam.x, -cam.y);
    
    // --- DRAW WORLD FIXED ELEMENTS ---

    // Map Border (Fixed in World Space)
    const mapLeft = -state.mapWidth / 2;
    const mapTop = -state.mapHeight / 2;
    
    // Grid
    ctx.save();
    ctx.beginPath();
    ctx.rect(mapLeft, mapTop, state.mapWidth, state.mapHeight);
    ctx.clip();
    
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const gridSize = 100;
    
    for(let x = mapLeft; x <= mapLeft + state.mapWidth; x+=gridSize) {
        ctx.moveTo(x, mapTop);
        ctx.lineTo(x, mapTop + state.mapHeight);
    }
    for(let y = mapTop; y <= mapTop + state.mapHeight; y+=gridSize) {
        ctx.moveTo(mapLeft, y);
        ctx.lineTo(mapLeft + state.mapWidth, y);
    }
    ctx.stroke();
    ctx.restore();

    // Border Glow
    ctx.strokeStyle = '#0ea5e9'; // Cyan border
    ctx.lineWidth = 8;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 20;
    ctx.strokeRect(mapLeft, mapTop, state.mapWidth, state.mapHeight);
    ctx.shadowBlur = 0;

    // Draw Zones (e.g., Acid)
    state.zones.forEach(z => {
        ctx.save();
        ctx.fillStyle = z.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Bubbles effect
        if (Math.random() < 0.3) {
            const bx = z.x + (Math.random() - 0.5) * z.radius * 1.5;
            const by = z.y + (Math.random() - 0.5) * z.radius * 1.5;
            ctx.fillStyle = '#eaffb0';
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(bx, by, Math.random() * 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    });

    // Drops
    state.drops.forEach(d => {
        ctx.font = '32px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const floatY = Math.sin(Date.now() / 200) * 5;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 15;
        ctx.fillText(d.emoji, d.x, d.y + floatY);
        ctx.shadowBlur = 0;
    });

    // Particles
    state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });

    // Enemies
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    state.enemies.forEach(e => {
        // Warning Line for Rusher / Gai Liu Zi
        if (e.isAimingDash && e.aimX !== undefined && e.aimY !== undefined) {
            ctx.save();
            // Red Dashed Line (70% opacity)
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.lineWidth = 3; // Thinner
            ctx.setLineDash([15, 10]);
            ctx.beginPath();
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(e.aimX, e.aimY);
            ctx.stroke();
            
            // Target dot
            ctx.beginPath();
            ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.setLineDash([]);
            ctx.arc(e.aimX, e.aimY, 8, 0, Math.PI*2); // Small dot
            ctx.fill();

            // Exclamation Mark
            ctx.font = 'bold 40px sans-serif';
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText('!', e.x, e.y - e.radius - 20);
            ctx.fillText('!', e.x, e.y - e.radius - 20);
            
            ctx.restore();
        }

        // Boss Transition Shake
        const shakeX = e.isTransitioning ? (Math.random() - 0.5) * 10 : 0;
        const shakeY = e.isTransitioning ? (Math.random() - 0.5) * 10 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(e.x + shakeX, e.y + shakeY + e.radius, e.radius, e.radius/2, 0, 0, Math.PI*2);
        ctx.fill();

        // Background for solid look
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(e.x + shakeX, e.y + shakeY, e.radius * 0.9, 0, Math.PI*2);
        ctx.fill();

        // Body
        ctx.font = `${e.radius * 2}px serif`;
        ctx.fillStyle = 'white';
        if (e.isTransitioning) {
             // Flash Effect
             ctx.shadowColor = '#ef4444';
             ctx.shadowBlur = 50 * Math.abs(Math.sin(Date.now() / 100));
        }
        ctx.fillText(e.emoji, e.x + shakeX, e.y + shakeY);
        ctx.shadowBlur = 0;

        // Boss Phase Indicator
        if (e.config.behavior === 'boss' && e.phase === 2) {
             ctx.strokeStyle = 'red';
             ctx.lineWidth = 4;
             ctx.strokeText(e.emoji, e.x + shakeX, e.y + shakeY);
        }

        // Small HP Bar for non-boss
        if (e.config.behavior !== 'boss') {
            const hpPct = e.hp / e.maxHp;
            const barW = e.radius * 2;
            ctx.fillStyle = '#374151';
            ctx.fillRect(e.x - e.radius, e.y - e.radius - 10, barW, 6);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(e.x - e.radius, e.y - e.radius - 10, barW * hpPct, 6);
        }
    });

    // Projectiles
    state.projectiles.forEach(p => {
        drawProjectile(ctx, p);
    });

    // Player
    const p = state.player;
    
    // Shield Effect
    if (p.shield > 0) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 12, 0, Math.PI*2);
        ctx.stroke();
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Solid Background for Player
    ctx.fillStyle = '#000'; 
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.radius, p.radius, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.font = `${p.radius * 2}px serif`;
    ctx.fillStyle = 'white'; 
    if (p.invulnerableTime > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    ctx.fillText(p.emoji, p.x, p.y);
    ctx.globalAlpha = 1;

    // Floating Texts
    state.floatingTexts.forEach(ft => {
        ctx.save();
        if (ft.type === 'chat') {
            // Speech bubble style
            ctx.font = '16px "Noto Sans SC"';
            const width = ctx.measureText(ft.text).width + 20;
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.roundRect(ft.x - width/2, ft.y - 40, width, 30, 10);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = 'black';
            ctx.fillText(ft.text, ft.x, ft.y - 25);
        } else {
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 24px sans-serif';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText(ft.text, ft.x, ft.y);
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.restore();
    });

    ctx.restore();

    // --- HUD OVERLAYS (BOSS UI & TRANSITION) ---
    
    // Wave Transition Overlay
    if (state.isWaveClearing) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, height/2 - 60, width, 120);
        
        ctx.font = 'bold 60px "Noto Sans SC"';
        ctx.fillStyle = '#fcd34d'; // Yellow
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 10;
        ctx.fillText("打卡下班中...", width/2, height/2);
        ctx.restore();
    }

    // BOSS UI
    const boss = state.enemies.find(e => e.config.behavior === 'boss');
    if (boss) {
        const bossPct = Math.max(0, boss.hp / boss.maxHp);
        const barW = 600;
        const barH = 24;
        const startX = width / 2 - barW / 2;
        const startY = 120; // Below timer

        ctx.save();
        // Name
        ctx.fillStyle = boss.phase === 2 ? '#7f1d1d' : '#ef4444';
        ctx.font = 'bold 24px "Noto Sans SC"';
        ctx.textAlign = 'center';
        const name = boss.isTransitioning ? "形态切换中..." : (boss.phase === 2 ? "KPI 大魔王 (二阶段)" : "KPI 大魔王");
        ctx.fillText(name, width / 2, startY - 10);

        // Bar Background
        ctx.fillStyle = '#1f2937';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillRect(startX, startY, barW, barH);
        ctx.strokeRect(startX, startY, barW, barH);

        // Bar Fill
        if (!boss.isTransitioning) {
             ctx.fillStyle = boss.phase === 2 ? '#991b1b' : '#dc2626';
             ctx.fillRect(startX, startY, barW * bossPct, barH);
             
             ctx.fillStyle = 'white';
             ctx.font = 'bold 14px sans-serif';
             ctx.fillText(`${Math.ceil(boss.hp)} / ${Math.ceil(boss.maxHp)}`, width/2, startY + 17);
        } else {
             // Transitioning Bar Effect
             const t = (Date.now() % 500) / 500;
             ctx.fillStyle = `rgba(255, 255, 255, ${t})`;
             ctx.fillRect(startX, startY, barW, barH);
        }
        ctx.restore();
    }
  };

  useEffect(() => {
    if (phase === GamePhase.PLAYING) {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [phase, gameLoop]);

  const handleStart = () => {
      switchPhase(GamePhase.STORY);
  };
  
  const finishStory = () => {
      if(canvasRef.current) {
          gameEngine.init(canvasRef.current.width, canvasRef.current.height);
      }
      switchPhase(GamePhase.PLAYING);
  };

  const handleNextWave = () => {
      const nextWave = gameEngine.state.currentWave + 1;
      if (nextWave === 8) {
          switchPhase(GamePhase.BOSS_INTRO);
      } else {
          gameEngine.startWave(nextWave);
          switchPhase(GamePhase.PLAYING);
      }
  };

  const startBossBattle = () => {
      gameEngine.startWave(8);
      switchPhase(GamePhase.PLAYING);
  };

  useEffect(() => {
      const handleResize = () => {
          if(canvasRef.current) {
              canvasRef.current.width = window.innerWidth;
              canvasRef.current.height = window.innerHeight;
              gameEngine.canvasWidth = window.innerWidth;
              gameEngine.canvasHeight = window.innerHeight;
          }
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
  }, [phase]);

  const renderWelcome = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-center p-4 pointer-events-none bg-black/80">
      <div className="pointer-events-auto bg-slate-900/90 p-12 rounded-xl border-4 border-cyan-500 shadow-2xl backdrop-blur-md max-w-2xl relative overflow-hidden">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 glitch-text mb-4" data-text="木更大乱斗">
            木更大乱斗
        </h1>
        <div className="text-3xl text-white font-bold mb-2">赛博清理员</div>
        <div className="text-sm text-slate-400 mb-12 font-mono">Ev Studio 制作</div>
        
        <Button size="lg" onClick={handleStart} className="text-2xl px-12 py-4 animate-pulse border-b-8 border-indigo-800 mb-12">
            开始清理
        </Button>
      </div>

      {/* Visual Guides (Left & Right) */}
      <div className="absolute left-10 bottom-10 flex flex-col items-center gap-4 text-white/50 animate-pulse">
          <div className="text-2xl font-bold">移动</div>
          <div className="grid grid-cols-3 gap-2">
              <div />
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">W</div>
              <div />
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">A</div>
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">S</div>
              <div className="w-12 h-12 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl">D</div>
          </div>
      </div>

      <div className="absolute right-10 bottom-10 flex flex-col items-center gap-4 text-white/50 animate-pulse">
          <div className="text-2xl font-bold">瞄准</div>
          <div className="w-24 h-36 border-4 border-white/30 rounded-full relative">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-10 bg-white/30 rounded-full"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/10"></div>
          </div>
      </div>
    </div>
  );

  const renderShop = () => {
    const p = gameEngine.state.player;
    const discount = p.shopDiscount;
    const discountText = discount < 1 ? ` (会员 ${(discount*10).toFixed(1)}折)` : '';
    
    const inventoryMap: Record<string, {count: number, desc: string, icon: string}> = {};
    p.items.forEach(name => {
        if (!inventoryMap[name]) {
            let desc = "未知物品";
            let icon = "📦";
            const ref = SHOP_ITEMS.find(i => i.items?.includes(name) || i.title === name);
            if(ref) {
                desc = ref.description;
                icon = ref.icon;
            }
            inventoryMap[name] = {count: 0, desc, icon};
        }
        inventoryMap[name].count++;
    });

    const nextWaveNum = gameEngine.state.currentWave + 1;
    const nextWaveConfig = WAVES.find(w => w.waveNumber === nextWaveNum) || WAVES[WAVES.length - 1];
    const uniqueEnemies = Array.from(new Set(nextWaveConfig.enemies.map(e => e.type)));

    return (
    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50 p-6 font-sans select-none">
        <div className="w-full max-w-7xl h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 bg-slate-800 p-4 rounded-xl border-2 border-slate-600 shadow-lg shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-yellow-400">摸鱼小卖部 (第 {gameEngine.state.currentWave} 波 结束)</h2>
                    <div className="text-slate-400 text-sm">距离下班还需要坚持 {8 - gameEngine.state.currentWave} 波</div>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-slate-300 text-sm font-bold">潜在威胁:</span>
                    <div className="flex gap-2">
                        {uniqueEnemies.map(type => {
                            const cfg = ENEMIES[type];
                            return (
                                <div key={type} className="relative group cursor-help"
                                     onMouseEnter={() => setHoverEnemy(type)}
                                     onMouseLeave={() => setHoverEnemy(null)}>
                                    <span className="text-2xl bg-slate-700 w-10 h-10 flex items-center justify-center rounded-full border border-slate-500">{cfg.emoji}</span>
                                    {/* Enemy Tooltip */}
                                    {hoverEnemy === type && (
                                        <div className="absolute top-full mt-2 right-0 w-64 bg-black border border-red-500 p-3 text-xs text-white rounded shadow-xl z-50">
                                            <h4 className="text-red-400 font-bold text-lg mb-1">{cfg.emoji} {type === 'boss_kpi' ? 'KPI大魔王' : cfg.description.split('，')[0]}</h4> 
                                            <p className="text-slate-300 mb-2">{cfg.description}</p>
                                            <div className="grid grid-cols-2 gap-1 text-slate-400">
                                                <span>生命: {Math.floor(cfg.hp * (1 + (nextWaveNum - 1) * 0.5))}</span>
                                                <span>伤害: {cfg.damage}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                     <div className="text-3xl text-white bg-slate-900 px-6 py-3 rounded-lg border border-yellow-500 shadow-lg flex items-center gap-2">
                        💰 <span className="text-yellow-400 font-mono">{p.gold}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-1 gap-6 overflow-hidden pb-4 min-h-0">
                {/* Left: Stats Panel */}
                <div className="w-64 bg-slate-800/80 p-4 rounded-xl border border-slate-700 overflow-y-auto scrollbar-hide flex flex-col gap-4 text-slate-200 text-sm shrink-0">
                    <h3 className="text-lg font-bold text-cyan-300 border-b border-slate-600 pb-2">📊 员工数据</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>生命上限:</span> <span className="text-white">{p.maxHp}</span></div>
                        <div className="flex justify-between"><span>护盾上限:</span> <span className="text-blue-300">{p.maxShield}</span></div>
                        <div className="flex justify-between"><span>基础伤害:</span> <span className="text-red-300">{p.attackDamage.toFixed(1)}</span></div>
                        <div className="flex justify-between"><span>攻击频率:</span> <span className="text-yellow-300">{(60/p.attackSpeed).toFixed(1)}次/秒</span></div>
                        <div className="flex justify-between"><span>子弹数量:</span> <span className="text-white">{p.projectileCount}</span></div>
                        <div className="flex justify-between"><span>子弹穿透:</span> <span className="text-orange-300">{p.projectilePierce}</span></div>
                        <div className="flex justify-between"><span>移速:</span> <span className="text-green-300">{p.speed.toFixed(1)}</span></div>
                        <div className="flex justify-between"><span>药品掉落率:</span> <span className="text-pink-300">{(p.dropRate*100).toFixed(0)}%</span></div>
                        {p.lifeSteal > 0 && <div className="flex justify-between"><span>吸血:</span> <span className="text-red-500">{(p.lifeSteal*100).toFixed(0)}%</span></div>}
                        {p.dodgeChance > 0 && <div className="flex justify-between"><span>闪避率:</span> <span className="text-purple-300">{(p.dodgeChance*100).toFixed(0)}%</span></div>}
                        {p.damageReflection > 0 && <div className="flex justify-between"><span>反伤:</span> <span className="text-gray-300">{(p.damageReflection*100).toFixed(0)}%</span></div>}
                        {p.backwardShots > 0 && <div className="flex justify-between"><span>背刺子弹:</span> <span className="text-white">{p.backwardShots}</span></div>}
                    </div>
                </div>

                {/* Middle: Upgrades */}
                <div className="flex-1 flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h3 className="text-xl font-bold text-purple-300">📈 属性增幅 {discountText}</h3>
                        <Button size="sm" onClick={() => restockShop('upgrade')} variant="outline">
                            🚚 进货 (花费: {gameEngine.state.restockCost})
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto scrollbar-hide content-start flex-1">
                        {shopUpgrades.map((item, idx) => {
                            const finalPrice = Math.floor(item.price * discount);
                            const canAfford = p.gold >= finalPrice;
                            return (
                                <div key={item.uuid} className={`
                                    p-3 rounded-lg border-2 transition-all flex flex-col relative min-h-[160px]
                                    ${item.purchased ? 'opacity-50 grayscale bg-slate-900' : ''}
                                    ${item.rarity === 'legendary' ? 'bg-slate-800 border-yellow-500 shadow-yellow-500/20 shadow-lg' : 
                                      item.rarity === 'rare' ? 'bg-slate-800 border-purple-500' : 'bg-slate-800 border-slate-600'}
                                `}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-3xl">{item.icon}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => toggleLock(setShopUpgrades, idx)} disabled={!!item.purchased} className={`text-xs px-2 py-1 rounded border transition-colors ${item.locked ? 'bg-red-900 border-red-500 text-red-200' : 'bg-slate-700 border-slate-500 text-slate-400 hover:bg-slate-600'}`}>
                                                {item.locked ? '🔒 已锁' : '🔓 锁定'}
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                    <p className="text-xs text-slate-400 mb-3 flex-1">{item.description}</p>
                                    <Button 
                                        size="sm" 
                                        variant={canAfford ? "primary" : "outline"} 
                                        disabled={!canAfford || !!item.purchased}
                                        onClick={() => buyItem(shopUpgrades, setShopUpgrades, idx)}
                                        className="w-full mt-auto"
                                    >
                                        {item.purchased ? '已售罄' : `💰 ${finalPrice}`}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Right: Items */}
                <div className="flex-1 flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h3 className="text-xl font-bold text-blue-300">🎒 道具 & 补给 {discountText}</h3>
                        <Button size="sm" onClick={() => restockShop('item')} variant="outline">
                            🚚 进货 (花费: {gameEngine.state.restockCost})
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto scrollbar-hide content-start flex-1">
                         {shopItems.map((item, idx) => {
                            const finalPrice = Math.floor(item.price * discount);
                            const canAfford = p.gold >= finalPrice;
                            return (
                                <div key={item.uuid} className={`bg-slate-800 p-3 rounded-lg border border-slate-600 flex flex-col min-h-[160px] ${item.purchased ? 'opacity-50 grayscale bg-slate-900' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{item.icon}</span>
                                            <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                        </div>
                                        <button onClick={() => toggleLock(setShopItems, idx)} disabled={!!item.purchased} className={`text-xs px-2 py-1 rounded border transition-colors ${item.locked ? 'bg-red-900 border-red-500 text-red-200' : 'bg-slate-700 border-slate-500 text-slate-400 hover:bg-slate-600'}`}>
                                            {item.locked ? '🔒 已锁' : '🔓 锁定'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3 flex-1">{item.description}</p>
                                    <Button 
                                        size="sm" 
                                        variant={canAfford ? "secondary" : "outline"} 
                                        disabled={!canAfford || !!item.purchased}
                                        onClick={() => buyItem(shopItems, setShopItems, idx)}
                                        className="w-full mt-auto"
                                    >
                                        {item.purchased ? '已售罄' : `💰 ${finalPrice}`}
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                    {/* Inventory Preview */}
                    <div className="mt-auto pt-4 border-t border-slate-700 shrink-0">
                        <div className="text-xs text-slate-400 mb-2">已拥有:</div>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-hide pb-4">
                            {Object.entries(inventoryMap).map(([name, data]) => (
                                <div 
                                    key={name} 
                                    className="relative group cursor-help"
                                    onMouseEnter={() => setHoverItem(name)}
                                    onMouseLeave={() => setHoverItem(null)}
                                >
                                    <div className="w-12 h-12 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center text-2xl relative hover:bg-slate-600 transition-colors z-10">
                                       {data.icon}
                                       {data.count > 1 && (
                                            <span className="absolute bottom-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-1 rounded-tl">
                                                x{data.count}
                                            </span>
                                       )}
                                    </div>
                                    {/* Inventory Tooltip */}
                                    {hoverItem === name && (
                                        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-64 bg-black border-2 border-yellow-500 p-3 text-sm text-white rounded-lg shadow-2xl z-[100]">
                                           <div className="font-bold text-yellow-300 mb-1 text-lg">{data.icon} {name}</div>
                                           <div className="text-slate-200 leading-relaxed">{data.desc}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {Object.keys(inventoryMap).length === 0 && <span className="text-xs text-slate-600 italic">空空如也</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4 shrink-0">
                <Button size="lg" onClick={handleNextWave} className="bg-red-600 hover:bg-red-500 border-red-800 text-xl px-16 shadow-red-500/30 shadow-lg">
                    打卡上班 (下一波)
                </Button>
            </div>
        </div>
    </div>
    );
  };

  const renderVictory = () => (
    <div className="absolute inset-0 bg-yellow-500/20 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-bounce-in p-4">
        <div className="bg-black/80 p-12 rounded-2xl border-4 border-yellow-500 text-center">
            <h1 className="text-7xl font-black text-yellow-300 mb-4 drop-shadow-lg">转正通知书</h1>
            <p className="text-2xl text-white mb-8">你成功清理了所有垃圾信息。</p>
            <div className="text-8xl mb-8 animate-bounce">🏆</div>
            <div className="text-xl text-slate-300 mb-8">最终功德: {gameEngine.state.score}</div>
            <Button size="lg" onClick={handleStart}>再卷一次</Button>
        </div>
    </div>
  );

  const renderGameOver = () => {
      const killer = gameEngine.state.killer || 'unknown';
      const message = DEATH_MESSAGES[killer] || DEATH_MESSAGES['unknown'];
      
      return (
        <div className="absolute inset-0 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-bounce-in p-4">
          <div className="bg-black/80 p-12 rounded-2xl border-4 border-red-500 text-center max-w-2xl">
              <h1 className="text-9xl font-black text-white mb-4 glitch-text" data-text="寄">寄</h1>
              <p className="text-2xl text-red-200 mb-2">你被裁员了</p>
              <p className="text-lg text-slate-400 italic mb-8">"{message}"</p>
              <div className="text-xl text-slate-400 mb-8">存活时间: {Math.floor(gameEngine.state.timeAlive / 60)}秒</div>
              <Button size="lg" onClick={handleStart}>重新投递简历</Button>
          </div>
        </div>
      );
  };

  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        {/* Transition Curtain */}
        <div className={`absolute inset-0 bg-black z-[60] pointer-events-none transition-opacity duration-500 ${inTransition ? 'opacity-100' : 'opacity-0'}`} />

        {phase === GamePhase.PLAYING && (
            <StatusPanel 
                player={gameEngine.state.player} 
                score={gameEngine.state.score}
                time={gameEngine.state.waveTimer}
                wave={gameEngine.state.currentWave}
            />
        )}

        {phase === GamePhase.WELCOME && renderWelcome()}
        {phase === GamePhase.STORY && <StoryView onFinish={finishStory} />}
        {phase === GamePhase.BOSS_INTRO && <BossIntroView onFinish={startBossBattle} />}
        {phase === GamePhase.SHOP && renderShop()}
        {phase === GamePhase.VICTORY && renderVictory()}
        {phase === GamePhase.GAME_OVER && renderGameOver()}
    </div>
  );
}
