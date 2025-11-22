
import React from 'react';
import { Button } from '../Button';
import { gameEngine } from '../../services/gameEngine';

export const VictoryView: React.FC<{ onMainMenu: () => void, onEndless: () => void }> = ({ onMainMenu, onEndless }) => (
    <div className="absolute inset-0 bg-yellow-500/20 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-bounce-in p-4">
        <div className="bg-black/80 p-12 rounded-2xl border-4 border-yellow-500 text-center">
            <h1 className="text-7xl font-black text-yellow-300 mb-4 drop-shadow-lg">转正通知书</h1>
            <p className="text-2xl text-white mb-8">KPI大魔王已倒下，服务器恢复正常。</p>
            <div className="text-8xl mb-8 animate-bounce">🏆</div>
            <div className="text-xl text-slate-300 mb-8">当前功德: {gameEngine.state.score}</div>
            
            <div className="flex gap-8 justify-center">
                <Button size="lg" onClick={onMainMenu} className="bg-indigo-600 border-indigo-800">
                    打卡下班 (回主菜单)
                </Button>
                <Button size="lg" onClick={onEndless} className="bg-red-600 hover:bg-red-500 border-red-800 animate-pulse">
                    自愿加班 (无尽模式)
                </Button>
            </div>
        </div>
    </div>
);
