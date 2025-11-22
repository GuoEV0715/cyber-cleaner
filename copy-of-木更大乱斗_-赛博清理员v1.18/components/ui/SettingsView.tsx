

import React, { useState, useEffect } from 'react';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';

export const SettingsView: React.FC<{ onNext: () => void, onBack: () => void }> = ({ onNext, onBack }) => {
    const [settings, setSettings] = useState(gameEngine.settings);

    useEffect(() => {
        gameEngine.audio.playAmbientBGM();
    }, []);

    const updateVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        gameEngine.updateSettings({ volume: val });
        setSettings(prev => ({ ...prev, volume: val }));
    };

    const toggleAutoAim = () => {
        const newVal = !settings.autoAim;
        gameEngine.updateSettings({ autoAim: newVal });
        setSettings(prev => ({ ...prev, autoAim: newVal }));
    };

    const toggleAutoShoot = () => {
        const newVal = !settings.autoShoot;
        gameEngine.updateSettings({ autoShoot: newVal });
        setSettings(prev => ({ ...prev, autoShoot: newVal }));
    };

    return (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-4xl font-black text-white mb-4">岗前培训 (设置)</h2>
            <p className="text-slate-400 mb-8 text-sm animate-pulse">💡 游戏中按 <span className="font-bold text-white bg-slate-700 px-2 py-0.5 rounded">Esc</span> 可随时暂停或修改设置</p>
            
            <div className="flex flex-col gap-8 bg-slate-800/50 p-8 rounded-2xl border-2 border-slate-600 max-w-xl w-full">
                
                {/* Volume */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-cyan-300">摸鱼掩护音量</h3>
                        <span className="text-white font-mono">{(settings.volume * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" max="1" step="0.05" 
                        value={settings.volume} 
                        onChange={updateVolume}
                        className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <p className="text-slate-400 text-sm italic">"调小点，别被老板听见。"</p>
                </div>

                <hr className="border-slate-700" />

                {/* Auto Aim */}
                <div className="flex justify-between items-center">
                    <div className="space-y-1 max-w-[70%]">
                         <h3 className="text-xl font-bold text-green-400">人体描边辅助 (自动瞄准)</h3>
                         <p className="text-slate-400 text-sm italic">"开启后不再描边，枪枪爆头。"</p>
                         <p className="text-red-400 text-xs font-bold mt-1">
                            ⚠️ 警告：开启自动瞄准会优先攻击较近单位，可能导致无法射击怪物密集方向，变相增加难度。
                         </p>
                    </div>
                    <Button 
                        size="sm" 
                        variant={settings.autoAim ? 'primary' : 'outline'} 
                        onClick={toggleAutoAim}
                        className="w-24 shrink-0"
                    >
                        {settings.autoAim ? '开启' : '关闭'}
                    </Button>
                </div>

                <hr className="border-slate-700" />

                {/* Auto Shoot */}
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                         <h3 className="text-xl font-bold text-yellow-400">扳机焊死</h3>
                         <p className="text-slate-400 text-sm italic">"手指累了？让程序替你扣扳机。"</p>
                    </div>
                    <Button 
                        size="sm" 
                        variant={settings.autoShoot ? 'primary' : 'outline'} 
                        onClick={toggleAutoShoot}
                        className="w-24"
                    >
                        {settings.autoShoot ? '开启' : '关闭'}
                    </Button>
                </div>

            </div>

            <div className="flex gap-6 mt-12">
                <Button size="lg" variant="outline" onClick={onBack} className="text-xl px-8">
                    返回主菜单
                </Button>
                <Button size="lg" onClick={onNext} className="px-12 text-xl">
                    准备就绪 (下一步)
                </Button>
            </div>
        </div>
    );
};