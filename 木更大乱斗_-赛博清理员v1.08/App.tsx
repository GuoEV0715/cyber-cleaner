
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, UpgradeOption } from './types';
import { gameEngine } from './services/gameEngine';
import { Button } from './components/Button';
import { StatusPanel } from './components/StatusPanel';
import { SHOP_ITEMS, WAVES, ENEMIES, DEATH_MESSAGES, CHARACTERS, MENU_QUOTES, DIFFICULTY_SETTINGS } from './data/memeContent';

// --- INDEPENDENT COMPONENTS (Fixes Hook Rules) ---

const DifficultySelectView: React.FC<{ onSelect: (diffId: string) => void }> = ({ onSelect }) => {
    useEffect(() => {
        gameEngine.audio.playAmbientBGM();
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
             <h2 className="text-4xl font-black text-white mb-12">选择工作强度</h2>
             <div className="flex gap-8">
                 {DIFFICULTY_SETTINGS.map(d => (
                     <div key={d.id} onClick={() => onSelect(d.id)} 
                        className="bg-slate-800 border-4 border-slate-600 rounded-xl p-6 w-72 flex flex-col items-center hover:border-cyan-500 hover:scale-105 transition-all cursor-pointer group">
                         <div className="text-8xl mb-6 group-hover:animate-bounce">{d.emoji}</div>
                         <div className="text-2xl font-bold text-cyan-300 mb-2">{d.name}</div>
                         <p className="text-slate-300 text-center mb-6 h-16">{d.description}</p>
                         <div className="text-sm text-slate-400 grid grid-cols-1 gap-1 w-full bg-slate-900/50 p-3 rounded-lg">
                             <div className="flex justify-between"><span>怪物血量:</span> <span className="text-white">x{d.hpMult}</span></div>
                             <div className="flex justify-between"><span>怪物伤害:</span> <span className="text-white">x{d.damageMult}</span></div>
                             <div className="flex justify-between"><span>收益:</span> <span className="text-yellow-300">x{d.scoreMult}</span></div>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const CharacterSelectView: React.FC<{ onSelect: (charId: string) => void }> = ({ onSelect }) => {
    useEffect(() => {
        gameEngine.audio.playAmbientBGM();
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-4xl font-black text-white mb-12">选择你的打工人</h2>
            <div className="flex gap-8">
                {Object.values(CHARACTERS).map(char => (
                    <div key={char.id} className="bg-slate-800 border-4 border-slate-600 rounded-xl p-6 w-80 flex flex-col items-center hover:border-yellow-500 hover:scale-105 transition-all cursor-pointer" onClick={() => onSelect(char.id)}>
                        <div className="text-8xl mb-4 animate-bounce">{char.emojiNormal}</div>
                        <div className="text-2xl font-bold text-yellow-400 mb-2">{char.name}</div>
                        <div className="text-sm font-bold text-slate-400 mb-4 bg-slate-900 px-2 py-1 rounded">{char.title}</div>
                        <p className="text-slate-300 text-center mb-6 leading-relaxed">{char.description}</p>
                        <div className="mt-auto w-full">
                             <Button size="md" className="w-full bg-indigo-600">入职</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StoryView: React.FC<{ charId: string, onFinish: () => void }> = ({ charId, onFinish }) => {
    const [step, setStep] = useState(0);
    const scenes = CHARACTERS[charId]?.storyScenes || CHARACTERS['9527'].storyScenes;

    // Start music on mount
    useEffect(() => {
        gameEngine.audio.playStoryBGM();
    }, []);

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
        gameEngine.audio.playBossIntroBGM();
    }, []);

    const handleClick = () => {
        if (step < scenes.length - 1) {
            setStep(s => s + 1);
        } else {
            onFinish();
        }
    };

    const current = scenes[Math.min(step, scenes.length - 1)];
    if (!current) return null;

    return (
        <div className="absolute inset-0 bg-red-900 flex flex-col items-center justify-center z-50 cursor-pointer" onClick={handleClick}>
            <div className="text-9xl mb-8 animate-pulse filter drop-shadow-red">{current.emoji}</div>
            <div className="text-4xl text-white font-black bg-black/50 p-6 rounded-xl border-2 border-red-500 shadow-2xl max-w-3xl text-center">
                {current.text}
            </div>
            <div className="absolute bottom-10 text-white/50 animate-pulse text-sm">点击继续</div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WELCOME);
  const [selectedChar, setSelectedChar] = useState<string>('9527');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('normal');
  const [shopUpgrades, setShopUpgrades] = useState<UpgradeOption[]>([]);
  const [shopItems, setShopItems] = useState<UpgradeOption[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0); 
  const [hoverItem, setHoverItem] = useState<string | null>(null); 
  const [hoverEnemy, setHoverEnemy] = useState<string | null>(null);
  const [noMoneyTooltip, setNoMoneyTooltip] = useState<{x: number, y: number} | null>(null);
  
  // Transition State
  const [inTransition, setInTransition] = useState(false);

  // Menu Background Characters
  const [menuWalkers, setMenuWalkers] = useState<{id: number, x: number, y: number, text: string, dir: number, scale: number}[]>([]);

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

  // --- MENU BACKGROUND ANIMATION ---
  useEffect(() => {
      if (phase === GamePhase.WELCOME) {
          // Start Ambient BGM
          gameEngine.audio.playAmbientBGM();

          const spawnInterval = setInterval(() => {
              const quote = MENU_QUOTES[Math.floor(Math.random() * MENU_QUOTES.length)];
              const direction = 1; // Always Left to Right
              const startX = -200;
              const y = 50 + Math.random() * (window.innerHeight - 200);
              const scale = 0.6 + Math.random() * 0.6; 

              setMenuWalkers(prev => [
                  ...prev, 
                  {
                      id: Date.now(),
                      x: startX,
                      y: y,
                      text: quote,
                      dir: direction,
                      scale: scale
                  }
              ]);
          }, 3000); 

          const animFrame = setInterval(() => {
              setMenuWalkers(prev => prev
                  .map(w => ({ ...w, x: w.x + (2 * w.dir) })) 
                  .filter(w => w.x < window.innerWidth + 200) 
              );
          }, 16);

          return () => {
              clearInterval(spawnInterval);
              clearInterval(animFrame);
          }
      } else {
          setMenuWalkers([]);
      }
  }, [phase]);

  // --- SHOP LOGIC ---
  const getRandomItems = (pool: UpgradeOption[], count: number) => {
      const player = gameEngine.state.player;
      const available = pool.filter(item => {
          if (item.maxCount) {
              const owned = player.items.filter(n => n === item.items?.[0]).length;
              if (owned >= item.maxCount) return false;
          }
          
          if (item.minWave && gameEngine.state.currentWave < item.minWave) {
              return false;
          }

          if (item.id === 'fishing_guide' && player.dodgeChance >= 0.6) return false;
          if (item.id === 'fan_group' && player.projectileCount >= 5) return false;

          if (player.characterId === '007' && item.id === 'hot_search') return false;

          return true;
      });
      
      return [...available].sort(() => 0.5 - Math.random()).slice(0, count).map(item => {
          const inflatedPrice = Math.floor(item.price * (1 + gameEngine.state.inflationRate));
          return {
            ...item, 
            price: inflatedPrice,
            purchased: false, 
            locked: false,
            uuid: Math.random().toString()
          };
      });
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

  const restockShop = (type: 'upgrade' | 'item', e: React.MouseEvent) => {
      const cost = gameEngine.state.restockCost;
      if (gameEngine.state.player.gold >= cost) {
          gameEngine.state.player.gold -= cost;
          gameEngine.state.refreshCount++;
          
          // Increase cost for next refresh: Base increment * (refresh count + 1)
          const baseIncrement = 10 + (gameEngine.state.currentWave - 1) * 2;
          gameEngine.state.restockCost += baseIncrement;

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
      } else {
          setNoMoneyTooltip({ x: e.clientX, y: e.clientY });
          setTimeout(() => setNoMoneyTooltip(null), 1000);
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
        if (!gameEngine.state.isEndless && gameEngine.state.currentWave >= 8) {
             if (gameEngine.state.enemies.length === 0) {
                 switchPhase(GamePhase.VICTORY);
             }
        } 
        else if (gameEngine.state.isEndless && gameEngine.state.enemies.length === 0 && gameEngine.state.waveTimer > 60) {
             initShop();
             switchPhase(GamePhase.SHOP);
        }
        else if (gameEngine.state.currentWave < 8) {
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
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fillStyle = '#fff'; 
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
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
        const size = Math.floor(p.radius * 2.2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `900 ${size}px "Noto Sans SC", sans-serif`;

        if (p.emoji === '💣') {
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 10;
            ctx.fillText(p.emoji, p.x, p.y);
            ctx.shadowBlur = 0;
        } else {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.85; 
            ctx.strokeText(p.text, p.x, p.y);
            
            ctx.shadowBlur = 0; 
            ctx.fillStyle = 'white';
            ctx.fillText(p.text, p.x, p.y);
        }
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

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    
    ctx.translate(width / 2, height / 2);
    ctx.scale(RENDER_SCALE, RENDER_SCALE);
    ctx.translate(-cam.x, -cam.y);
    
    const mapLeft = -state.mapWidth / 2;
    const mapTop = -state.mapHeight / 2;
    
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

    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 20;
    ctx.strokeRect(mapLeft, mapTop, state.mapWidth, state.mapHeight);
    ctx.shadowBlur = 0;

    state.zones.forEach(z => {
        ctx.save();
        ctx.fillStyle = z.color;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2);
        ctx.fill();
        
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

    state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fill();
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    state.enemies.forEach(e => {
        if (e.isAimingDash && e.aimX !== undefined && e.aimY !== undefined) {
            ctx.save();
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.lineWidth = 3; 
            ctx.setLineDash([15, 10]);
            ctx.beginPath();
            
            const dashDist = e.config.speed * 135;
            const angle = Math.atan2(e.aimY - e.y, e.aimX - e.x);
            const endX = e.x + Math.cos(angle) * dashDist;
            const endY = e.y + Math.sin(angle) * dashDist;
            
            ctx.moveTo(e.x, e.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.setLineDash([]);
            ctx.arc(endX, endY, 8, 0, Math.PI*2); 
            ctx.fill();

            ctx.font = 'bold 40px sans-serif';
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.strokeText('!', e.x, e.y - e.radius - 20);
            ctx.fillText('!', e.x, e.y - e.radius - 20);
            
            ctx.restore();
        }

        const shakeX = e.isTransitioning ? (Math.random() - 0.5) * 10 : 0;
        const shakeY = e.isTransitioning ? (Math.random() - 0.5) * 10 : 0;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(e.x + shakeX, e.y + shakeY + e.radius, e.radius, e.radius/2, 0, 0, Math.PI*2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(e.x + shakeX, e.y + shakeY, e.radius * 0.9, 0, Math.PI*2);
        ctx.fill();

        ctx.font = `${e.radius * 2}px serif`;
        ctx.fillStyle = 'white';
        if (e.isTransitioning) {
             ctx.shadowColor = '#ef4444';
             ctx.shadowBlur = 50 * Math.abs(Math.sin(Date.now() / 100));
        }
        ctx.fillText(e.emoji, e.x + shakeX, e.y + shakeY);
        ctx.shadowBlur = 0;

        if (e.config.behavior === 'boss' && e.phase === 2) {
             ctx.strokeStyle = 'red';
             ctx.lineWidth = 4;
             ctx.strokeText(e.emoji, e.x + shakeX, e.y + shakeY);
        }

        if (e.config.behavior !== 'boss') {
            const hpPct = e.hp / e.maxHp;
            const barW = e.radius * 2;
            ctx.fillStyle = '#374151';
            ctx.fillRect(e.x - e.radius, e.y - e.radius - 10, barW, 6);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(e.x - e.radius, e.y - e.radius - 10, barW * hpPct, 6);
        }
    });

    state.projectiles.forEach(p => {
        drawProjectile(ctx, p);
    });

    const p = state.player;
    
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

    state.floatingTexts.forEach(ft => {
        ctx.save();
        if (ft.type === 'chat') {
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

    if (state.isWaveClearing) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, height/2 - 60, width, 120);
        
        ctx.font = 'bold 60px "Noto Sans SC"';
        ctx.fillStyle = '#fcd34d'; 
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 10;
        ctx.fillText("打卡下班中...", width/2, height/2);
        ctx.restore();
    }

    const boss = state.enemies.find(e => e.config.behavior === 'boss');
    if (boss) {
        const bossPct = Math.max(0, boss.hp / boss.maxHp);
        const barW = 600;
        const barH = 24;
        const startX = width / 2 - barW / 2;
        const startY = 120; 

        ctx.save();
        ctx.fillStyle = boss.phase === 2 ? '#7f1d1d' : '#ef4444';
        ctx.font = 'bold 24px "Noto Sans SC"';
        ctx.textAlign = 'center';
        const name = boss.isTransitioning ? "形态切换中..." : (boss.phase === 2 ? "KPI 大魔王 (二阶段)" : "KPI 大魔王");
        ctx.fillText(name, width / 2, startY - 10);

        ctx.fillStyle = '#1f2937';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillRect(startX, startY, barW, barH);
        ctx.strokeRect(startX, startY, barW, barH);

        if (!boss.isTransitioning) {
             ctx.fillStyle = boss.phase === 2 ? '#991b1b' : '#dc2626';
             ctx.fillRect(startX, startY, barW * bossPct, barH);
             
             ctx.fillStyle = 'white';
             ctx.font = 'bold 14px sans-serif';
             ctx.fillText(`${Math.ceil(boss.hp)} / ${Math.ceil(boss.maxHp)}`, width/2, startY + 17);
        } else {
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
      switchPhase(GamePhase.DIFFICULTY_SELECT);
  };
  
  const handleDifficultySelect = (diffId: string) => {
      setSelectedDifficulty(diffId);
      switchPhase(GamePhase.CHARACTER_SELECT);
  };

  const handleCharSelect = (charId: string) => {
      setSelectedChar(charId);
      switchPhase(GamePhase.STORY);
  };
  
  const finishStory = () => {
      if(canvasRef.current) {
          gameEngine.init(canvasRef.current.width, canvasRef.current.height, selectedChar, selectedDifficulty);
      }
      switchPhase(GamePhase.PLAYING);
  };

  const handleNextWave = () => {
      const nextWave = gameEngine.state.currentWave + 1;
      if (nextWave === 8 && !gameEngine.state.isEndless) {
          switchPhase(GamePhase.BOSS_INTRO);
      } else {
          gameEngine.startWave(nextWave);
          switchPhase(GamePhase.PLAYING);
      }
  };
  
  const startEndlessMode = () => {
      gameEngine.state.isEndless = true;
      gameEngine.startWave(1); 
      switchPhase(GamePhase.PLAYING);
  };

  const startBossBattle = () => {
      gameEngine.startWave(8);
      switchPhase(GamePhase.PLAYING);
  };

  const restartGame = () => {
      if(canvasRef.current) {
          gameEngine.init(canvasRef.current.width, canvasRef.current.height, selectedChar, selectedDifficulty);
      }
      switchPhase(GamePhase.PLAYING);
  };

  const goToMainMenu = () => {
      switchPhase(GamePhase.WELCOME);
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
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
          {menuWalkers.map(w => (
              <div key={w.id} className="absolute flex flex-col items-center" style={{left: w.x, top: w.y, transform: `scale(${w.scale})`}}>
                  <div className="bg-[#f1f5f9] text-black px-4 py-2 rounded-xl mb-1 text-sm font-bold whitespace-nowrap shadow-md">
                      {w.text}
                  </div>
              </div>
          ))}
      </div>

      <div className="pointer-events-auto bg-slate-900/90 p-12 rounded-xl border-4 border-cyan-500 shadow-2xl backdrop-blur-md max-w-2xl relative overflow-hidden z-10">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 glitch-text mb-4" data-text="木更大乱斗">
            木更大乱斗
        </h1>
        <div className="text-3xl text-white font-bold mb-2">赛博清理员</div>
        <div className="text-sm text-slate-400 mb-12 font-mono">Ev Studio 制作</div>
        
        <Button size="lg" onClick={handleStart} className="text-2xl px-12 py-4 animate-pulse border-b-8 border-indigo-800 mb-12">
            开始清理
        </Button>
      </div>

      <div className="absolute left-10 bottom-10 flex flex-col items-center gap-4 text-white/50 animate-pulse z-20">
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

      <div className="absolute right-10 bottom-10 flex flex-col items-center gap-4 text-white/50 animate-pulse z-20">
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
    const effectiveWaveNum = gameEngine.state.isEndless ? ((gameEngine.state.endlessWaveCount) % 7) + 1 : nextWaveNum;
    const nextWaveConfig = WAVES.find(w => w.waveNumber === effectiveWaveNum) || WAVES[WAVES.length - 1];
    const uniqueEnemies = Array.from(new Set(nextWaveConfig.enemies.map(e => e.type)));

    const isEndless = gameEngine.state.isEndless;
    const waveTitle = isEndless ? `无尽加班 (第 ${gameEngine.state.endlessWaveCount} 波)` : `第 ${gameEngine.state.currentWave} 波 结束`;

    return (
    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50 p-6 font-sans select-none">
        {noMoneyTooltip && (
            <div className="fixed z-[100] bg-red-600 text-white font-bold px-3 py-1 rounded pointer-events-none shadow-lg animate-bounce"
                 style={{left: noMoneyTooltip.x, top: noMoneyTooltip.y - 30}}>
                 功德不足!
            </div>
        )}

        <div className="w-full max-w-7xl h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 bg-slate-800 p-4 rounded-xl border-2 border-slate-600 shadow-lg shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-yellow-400">摸鱼小卖部 ({waveTitle})</h2>
                    <div className="text-red-400 text-lg font-bold">通货膨胀率: {(gameEngine.state.inflationRate * 100).toFixed(0)}% 📈</div>
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

                <div className="flex-1 flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h3 className="text-xl font-bold text-purple-300">📈 属性增幅 {discountText}</h3>
                        <Button size="sm" onClick={(e) => restockShop('upgrade', e)} variant="outline">
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

                <div className="flex-1 flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h3 className="text-xl font-bold text-blue-300">🎒 道具 & 补给 {discountText}</h3>
                        <Button size="sm" onClick={(e) => restockShop('item', e)} variant="outline">
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
            <p className="text-2xl text-white mb-8">KPI大魔王已倒下，服务器恢复正常。</p>
            <div className="text-8xl mb-8 animate-bounce">🏆</div>
            <div className="text-xl text-slate-300 mb-8">当前功德: {gameEngine.state.score}</div>
            
            <div className="flex gap-8 justify-center">
                <Button size="lg" onClick={goToMainMenu} className="bg-indigo-600 border-indigo-800">
                    打卡下班 (回主菜单)
                </Button>
                <Button size="lg" onClick={startEndlessMode} className="bg-red-600 hover:bg-red-500 border-red-800 animate-pulse">
                    自愿加班 (无尽模式)
                </Button>
            </div>
        </div>
    </div>
  );

  const renderGameOver = () => {
      const killer = gameEngine.state.killer || 'unknown';
      const message = DEATH_MESSAGES[killer] || DEATH_MESSAGES['unknown'];
      const diff = DIFFICULTY_SETTINGS.find(d => d.id === gameEngine.state.difficultyId);

      return (
        <div className="absolute inset-0 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-bounce-in p-4">
          <div className="bg-black/80 p-12 rounded-2xl border-4 border-red-500 text-center max-w-2xl">
              <h1 className="text-9xl font-black text-white mb-4 glitch-text" data-text="寄">寄</h1>
              <p className="text-2xl text-red-200 mb-2">你被裁员了</p>
              <p className="text-lg text-slate-400 italic mb-8">"{message}"</p>
              
              <div className="bg-slate-900/50 p-4 rounded-lg mb-8 flex flex-col gap-2">
                  <div className="text-xl text-yellow-300 font-bold">难度: {diff?.emoji} {diff?.name}</div>
                  {gameEngine.state.isEndless ? (
                      <div className="text-xl text-yellow-300 font-bold">最终加班时长: {gameEngine.state.endlessWaveCount} 波</div>
                  ) : (
                      <div className="text-xl text-slate-400">最终波次: {gameEngine.state.currentWave}</div>
                  )}
              </div>
              
              <div className="flex gap-4 justify-center">
                  <Button size="lg" onClick={restartGame} className="bg-red-600 border-red-800 hover:bg-red-500">重新投递简历</Button>
                  <Button size="lg" variant="outline" onClick={goToMainMenu}>回到主菜单</Button>
              </div>
          </div>
        </div>
      );
  };

  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
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
        {phase === GamePhase.DIFFICULTY_SELECT && <DifficultySelectView onSelect={handleDifficultySelect} />}
        {phase === GamePhase.CHARACTER_SELECT && <CharacterSelectView onSelect={handleCharSelect} />}
        {phase === GamePhase.STORY && <StoryView charId={selectedChar} onFinish={finishStory} />}
        {phase === GamePhase.BOSS_INTRO && <BossIntroView onFinish={startBossBattle} />}
        {phase === GamePhase.SHOP && renderShop()}
        {phase === GamePhase.VICTORY && renderVictory()}
        {phase === GamePhase.GAME_OVER && renderGameOver()}
    </div>
  );
}
