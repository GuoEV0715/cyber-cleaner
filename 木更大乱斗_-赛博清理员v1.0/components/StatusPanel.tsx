
import React, { useEffect, useState } from 'react';
import { Player } from '../types';
import { WAVES } from '../data/memeContent';

interface StatusPanelProps {
  player: Player;
  score: number;
  time: number; // Wave time
  wave: number;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ player, score, time, wave }) => {
  // HP Bar
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  
  // Shield Bar (Separate)
  // If shield is 0, bar width is 0. If shield is maxShield, 100%.
  const shieldPercent = player.maxShield > 0 ? Math.min(100, (player.shield / player.maxShield) * 100) : 0;
  
  // Wave Logic
  const waveConfig = WAVES.find(w => w.waveNumber === wave) || WAVES[WAVES.length - 1];
  const timeLeft = Math.max(0, waveConfig.duration - Math.floor(time / 60));
  const timeStr = waveConfig.isBossWave ? "BOSS" : `${timeLeft}秒`;

  // Gold Animation
  const [displayGold, setDisplayGold] = useState(player.gold);
  const [goldDiff, setGoldDiff] = useState(0);

  useEffect(() => {
      if (player.gold !== displayGold) {
          setGoldDiff(player.gold - displayGold);
          setDisplayGold(player.gold);
          const t = setTimeout(() => setGoldDiff(0), 1000);
          return () => clearTimeout(t);
      }
  }, [player.gold]);

  return (
    <div className="absolute top-6 left-6 right-6 pointer-events-none flex justify-between items-start gap-4 z-10">
      {/* Player Status */}
      <div className="flex flex-col w-96 gap-2">
         <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border-2 border-slate-600 backdrop-blur-sm shadow-xl">
            <div className="text-5xl filter drop-shadow-lg animate-bounce">{player.emoji}</div>
            <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between text-base text-slate-300 font-bold">
                    <span>第 {wave} 波</span>
                    <span>{Math.ceil(player.hp)}/{Math.ceil(player.maxHp)}</span>
                </div>
                
                {/* HP Bar */}
                <div className="h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-600 relative shadow-inner">
                    <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-200
                                   ${hpPercent < 30 ? 'bg-red-600 animate-pulse' : 'bg-green-500'}`} 
                        style={{width: `${hpPercent}%`}}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/80 font-bold uppercase tracking-widest drop-shadow-md">
                        生命值
                    </span>
                </div>

                {/* Shield Bar (Separate) */}
                {player.maxShield > 0 && (
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-blue-900 relative shadow-inner mt-1">
                         <div 
                            className="absolute top-0 left-0 h-full bg-blue-400 transition-all duration-200" 
                            style={{width: `${shieldPercent}%`}}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white/90 font-bold drop-shadow-md">
                            护盾: {Math.floor(player.shield)}
                        </span>
                    </div>
                )}
            </div>
         </div>
         <div className="flex items-center gap-2 bg-yellow-900/80 px-4 py-2 rounded-full border-2 border-yellow-600 self-start shadow-lg relative">
             <span className="text-2xl">💰</span>
             <span className="text-yellow-300 font-mono font-bold text-2xl">{player.gold}</span>
             {goldDiff > 0 && (
                 <span className="absolute -right-12 top-0 text-yellow-300 font-bold animate-ping">+{goldDiff}</span>
             )}
         </div>
      </div>

      {/* Wave Timer */}
      <div className="flex flex-col items-center">
           <div className={`text-7xl font-black font-mono drop-shadow-2xl ${timeLeft < 10 && !waveConfig.isBossWave ? 'text-red-500 animate-pulse' : 'text-white'}`}>
               {timeStr}
           </div>
           {waveConfig.isBossWave && <div className="text-red-500 font-bold animate-bounce text-3xl mt-2 stroke-black">KPI大魔王!</div>}
      </div>
    </div>
  );
};
