
import React, { useState, useEffect } from 'react';
import { gameEngine } from '../../services/gameEngine';

export const BossIntroView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
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
