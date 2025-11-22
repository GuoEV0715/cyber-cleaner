
import React, { useEffect } from 'react';
import { CHARACTERS } from '../../data/memeContent';
import { Button } from '../Button';
import { gameEngine } from '../../services/gameEngine';

export const CharacterSelectView: React.FC<{ onSelect: (charId: string) => void, onBack: () => void }> = ({ onSelect, onBack }) => {
    useEffect(() => {
        gameEngine.audio.playAmbientBGM();
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-4xl font-black text-white mb-12">选择你的打工人</h2>
            <div className="flex gap-8 mb-12">
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
            <Button variant="outline" onClick={onBack}>返回</Button>
        </div>
    );
};
