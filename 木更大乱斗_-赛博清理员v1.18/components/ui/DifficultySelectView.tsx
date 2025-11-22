
import React, { useEffect } from 'react';
import { DIFFICULTY_SETTINGS } from '../../data/memeContent';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';

export const DifficultySelectView: React.FC<{ onSelect: (diffId: string) => void, onBack: () => void }> = ({ onSelect, onBack }) => {
    useEffect(() => {
        gameEngine.audio.playAmbientBGM();
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
             <h2 className="text-4xl font-black text-white mb-12">选择工作强度</h2>
             <div className="flex gap-8 mb-12">
                 {DIFFICULTY_SETTINGS.map(d => (
                     <div key={d.id} onClick={() => onSelect(d.id)} 
                        className="bg-slate-800 border-4 border-slate-600 rounded-xl p-6 w-72 flex flex-col items-center hover:border-cyan-500 hover:scale-105 transition-all cursor-pointer group">
                         <div className="text-8xl mb-6 group-hover:animate-bounce">{d.emoji}</div>
                         <div className="text-2xl font-bold text-cyan-300 mb-2">{d.name}</div>
                         <p className="text-slate-300 text-center mb-6 h-16">{d.description}</p>
                         <div className="text-sm text-slate-400 grid grid-cols-1 gap-1 w-full bg-slate-900/50 p-3 rounded-lg">
                             <div className="flex justify-between"><span>怪物血量:</span> <span className="text-white">x{d.hpMult}</span></div>
                             <div className="flex justify-between"><span>怪物伤害:</span> <span className="text-white">x{d.damageMult}</span></div>
                         </div>
                     </div>
                 ))}
             </div>
             <Button variant="outline" onClick={onBack}>返回</Button>
        </div>
    );
};
