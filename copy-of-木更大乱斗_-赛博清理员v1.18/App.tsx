
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase } from './types';
import { gameEngine } from './services/gameEngine';
import { StatusPanel } from './components/StatusPanel';

// Import Views
import { WelcomeView } from './components/ui/WelcomeView';
import { SettingsView } from './components/ui/SettingsView';
import { DifficultySelectView } from './components/ui/DifficultySelectView';
import { CharacterSelectView } from './components/ui/CharacterSelectView';
import { StoryView } from './components/ui/StoryView';
import { BossIntroView } from './components/ui/BossIntroView';
import { ShopView } from './components/ui/ShopView';
import { VictoryView } from './components/ui/VictoryView';
import { GameOverView } from './components/ui/GameOverView';
import { PauseOverlay } from './components/ui/PauseOverlay';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.WELCOME);
  const [selectedChar, setSelectedChar] = useState<string>('9527');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('normal');
  
  // Transition State
  const [inTransition, setInTransition] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [isPausedUI, setIsPausedUI] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const keysRef = useRef<Record<string, boolean>>({});
  const mouseRef = useRef<{x: number, y: number}>({x: 0, y: 0});

  // Render Scale for Zoom Out
  const RENDER_SCALE = 0.6;

  // --- HELPER: Switch Phase with Transition ---
  const switchPhase = (newPhase: GamePhase) => {
      setInTransition(true);
      setTimeout(() => {
          setPhase(newPhase);
          setInTransition(false);
      }, 500);
  };

  // --- INPUT HANDLERS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
        keysRef.current[e.key.toLowerCase()] = true;
        if (e.key === 'Escape' && phase === GamePhase.PLAYING) {
            gameEngine.state.isPaused = !gameEngine.state.isPaused;
            setIsPausedUI(gameEngine.state.isPaused);
        }
    };
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
  }, [phase]);

  // --- RENDERER (Kept in App for ref usage) ---
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

    // Draw Player
    ctx.font = `${p.radius * 2}px serif`;
    ctx.fillStyle = 'white'; 
    if (p.invulnerableTime > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    if (p.isDying) {
        ctx.font = `${p.radius * 2.5}px serif`;
        ctx.fillText('💀', p.x, p.y);
    } else {
        ctx.fillText(p.emoji, p.x, p.y);
    }
    
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
             switchPhase(GamePhase.SHOP);
        }
        else if (gameEngine.state.currentWave < 8) {
            switchPhase(GamePhase.SHOP);
        }
        return;
    }

    // Handle Game Over Logic with Animation
    if (gameEngine.state.player.isDying) {
        if (gameEngine.state.player.deathTimer <= 0) {
            switchPhase(GamePhase.GAME_OVER);
            return;
        }
        // Allow render to show skull
    } else if (gameEngine.state.player.hp <= 0) {
        // Should be handled by engine setting isDying, but fallback here
        // gameEngine.state.player.isDying = true; ...
    }

    renderCanvas();
    setRenderTrigger(prev => (prev + 1) % 60);
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [phase]);

  useEffect(() => {
    if (phase === GamePhase.PLAYING) {
        if (canvasRef.current) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [phase, gameLoop]);

  // --- EVENT HANDLERS ---
  // Welcome -> Settings
  const handleStart = () => switchPhase(GamePhase.SETTINGS);
  
  // Settings -> Welcome (Back)
  const handleSettingsBack = () => switchPhase(GamePhase.WELCOME);

  // Settings -> Difficulty
  const handleSettingsNext = () => switchPhase(GamePhase.DIFFICULTY_SELECT);

  const handleBack = () => {
      if (phase === GamePhase.DIFFICULTY_SELECT) switchPhase(GamePhase.SETTINGS); // Back to settings
      if (phase === GamePhase.CHARACTER_SELECT) switchPhase(GamePhase.DIFFICULTY_SELECT);
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
      gameEngine.state.isPaused = false;
      setIsPausedUI(false);
      switchPhase(GamePhase.WELCOME);
  };
  
  const resumeGame = () => {
      gameEngine.state.isPaused = false;
      setIsPausedUI(false);
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

  // --- RENDER ---
  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
        <canvas ref={canvasRef} className="block w-full h-full" />
        
        <div className={`absolute inset-0 bg-black z-[60] pointer-events-none transition-opacity duration-500 ${inTransition ? 'opacity-100' : 'opacity-0'}`} />

        {phase === GamePhase.PLAYING && (
            <>
                <StatusPanel 
                    player={gameEngine.state.player} 
                    score={gameEngine.state.score}
                    time={gameEngine.state.waveTimer}
                    wave={gameEngine.state.currentWave}
                />
                {isPausedUI && <PauseOverlay onMainMenu={goToMainMenu} onResume={resumeGame} />}
            </>
        )}

        {phase === GamePhase.WELCOME && <WelcomeView onStart={handleStart} />}
        {phase === GamePhase.SETTINGS && <SettingsView onNext={handleSettingsNext} onBack={handleSettingsBack} />}
        {phase === GamePhase.DIFFICULTY_SELECT && <DifficultySelectView onSelect={handleDifficultySelect} onBack={handleBack} />}
        {phase === GamePhase.CHARACTER_SELECT && <CharacterSelectView onSelect={handleCharSelect} onBack={handleBack} />}
        {phase === GamePhase.STORY && <StoryView charId={selectedChar} onFinish={finishStory} />}
        {phase === GamePhase.BOSS_INTRO && <BossIntroView onFinish={startBossBattle} />}
        {phase === GamePhase.SHOP && <ShopView onNextWave={handleNextWave} />}
        {phase === GamePhase.VICTORY && <VictoryView onMainMenu={goToMainMenu} onEndless={startEndlessMode} />}
        {phase === GamePhase.GAME_OVER && <GameOverView onRestart={restartGame} onMainMenu={goToMainMenu} />}
    </div>
  );
}
