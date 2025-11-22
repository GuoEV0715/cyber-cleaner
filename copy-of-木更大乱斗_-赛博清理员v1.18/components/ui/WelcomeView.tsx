


import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { CreditsModal } from './CreditsModal';
import { MENU_QUOTES } from '../../data/memeContent';
import { gameEngine } from '../../services/gameEngine';

export const WelcomeView: React.FC<{ onStart: () => void }> = ({ onStart }) => {
    const [showCredits, setShowCredits] = useState(false);
    const [menuWalkers, setMenuWalkers] = useState<{id: number, x: number, y: number, text: string, dir: number, scale: number, speed: number}[]>([]);
    
    useEffect(() => {
        // Start Ambient BGM
        gameEngine.audio.playAmbientBGM();

        const spawnInterval = setInterval(() => {
            // Spawn 1-3 items at once for higher density
            const count = Math.floor(Math.random() * 3) + 1;
            
            const newItems = [];
            for (let i = 0; i < count; i++) {
                const quote = MENU_QUOTES[Math.floor(Math.random() * MENU_QUOTES.length)];
                const direction = 1; // Always Left to Right
                const startX = -200 - (Math.random() * 200); // Stagger start X slightly
                const y = 50 + Math.random() * (window.innerHeight - 200);
                
                // Wider scale range for spatial effect: 0.4 to 1.5
                const scale = 0.4 + Math.random() * 1.1; 
                
                // Speed depends on scale: larger = faster (closer), smaller = slower (farther)
                const speed = scale * 1.5; 

                newItems.push({
                    id: Date.now() + i,
                    x: startX,
                    y: y,
                    text: quote,
                    dir: direction,
                    scale: scale,
                    speed: speed
                });
            }

            setMenuWalkers(prev => [...prev, ...newItems]);
        }, 1500); 

        const animFrame = setInterval(() => {
            setMenuWalkers(prev => prev
                .map(w => ({ ...w, x: w.x + (w.speed * w.dir) })) 
                .filter(w => w.x < window.innerWidth + 200) 
            );
        }, 16);

        return () => {
            clearInterval(spawnInterval);
            clearInterval(animFrame);
        }
    }, []);

    return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-center p-4 pointer-events-none bg-black/80">
      
      <div className="absolute top-6 left-6 pointer-events-auto flex items-center gap-3 z-30 animate-pulse">
          <div className="w-14 h-14 border-4 border-white/30 rounded flex items-center justify-center font-bold text-xl text-white shadow-lg bg-slate-900/50">
              Esc
          </div>
          <div className="text-sm text-slate-400 font-bold">暂停</div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
          {menuWalkers.map(w => {
              // Map scale to opacity: 0.4 -> 0.2 opacity, 1.5 -> 1.0 opacity
              const opacity = 0.2 + (w.scale - 0.4) * 0.7;
              return (
                  <div key={w.id} className="absolute flex flex-col items-center" style={{
                      left: w.x, 
                      top: w.y, 
                      transform: `scale(${w.scale})`,
                      opacity: opacity,
                      zIndex: Math.floor(w.scale * 10)
                  }}>
                      <div className="bg-[#f1f5f9] text-black px-4 py-2 rounded-xl mb-1 text-sm font-bold whitespace-nowrap shadow-md">
                          {w.text}
                      </div>
                  </div>
              );
          })}
      </div>

      <div className="pointer-events-auto bg-slate-900/90 p-12 rounded-xl border-4 border-cyan-500 shadow-2xl backdrop-blur-md max-w-2xl relative overflow-hidden z-10 flex flex-col items-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 glitch-text mb-4" data-text="木更大乱斗">
            木更大乱斗
        </h1>
        <div className="text-3xl text-white font-bold mb-2">赛博清理员</div>
        <div className="text-sm text-slate-400 mb-12 font-mono">Ev Studio 制作</div>
        
        <Button size="lg" onClick={onStart} className="w-64 text-2xl px-12 py-4 border-b-8 border-indigo-800 mb-6">
            开始清理
        </Button>

        <div className="flex gap-6 w-full justify-center">
            <Button size="md" variant="danger" onClick={() => setShowCredits(true)} className="flex-1 max-w-[160px] border-b-4">
                制作人员
            </Button>
        </div>
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
      
      {showCredits && <CreditsModal onClose={() => setShowCredits(false)} />}
    </div>
    );
};