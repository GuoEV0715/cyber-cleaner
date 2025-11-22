



import React, { useState } from 'react';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';

interface PauseOverlayProps {
    onMainMenu: () => void;
    onResume: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ onMainMenu, onResume }) => {
    const [settings, setSettings] = useState(gameEngine.settings);
    const [confirmExit, setConfirmExit] = useState(false);

    const toggleAutoShoot = () => {
        const newVal = !settings.autoShoot;
        gameEngine.updateSettings({ autoShoot: newVal });
        setSettings(prev => ({ ...prev, autoShoot: newVal }));
    };

    const toggleAutoAim = () => {
        const newVal = !settings.autoAim;
        gameEngine.updateSettings({ autoAim: newVal });
        setSettings(prev => ({ ...prev, autoAim: newVal }));
    };

    const toggleSound = () => {
        const newVal = !settings.soundEnabled;
        gameEngine.updateSettings({ soundEnabled: newVal });
        setSettings(prev => ({ ...prev, soundEnabled: newVal }));
    };

    const updateVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        gameEngine.updateSettings({ volume: val });
        setSettings(prev => ({ ...prev, volume: val }));
    };

    return (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-pop-in pointer-events-auto">
            <div className="flex flex-col items-center gap-8">
                <div className="text-6xl font-black text-white border-4 border-white p-12 rounded-2xl transform -rotate-6 shadow-2xl bg-black/80">
                    暂停中 ☕
                </div>

                {!confirmExit ? (
                    <div className="bg-slate-800 p-6 rounded-xl border-2 border-slate-600 w-80 space-y-4 pointer-events-auto">
                        
                        <div className="space-y-2 border-b border-slate-700 pb-4">
                            <div className="flex justify-between items-center text-white font-bold text-sm">
                                <span>摸鱼音量</span>
                                <span>{(settings.volume * 100).toFixed(0)}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.05" 
                                value={settings.volume} 
                                onChange={updateVolume}
                                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold">自动瞄准</span>
                            <Button size="sm" 
                                variant={settings.autoAim ? 'primary' : 'secondary'} 
                                onClick={toggleAutoAim}>
                                {settings.autoAim ? '开启' : '关闭'}
                            </Button>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-white font-bold">自动射击</span>
                            <Button size="sm" 
                                variant={settings.autoShoot ? 'primary' : 'secondary'} 
                                onClick={toggleAutoShoot}>
                                {settings.autoShoot ? '开启' : '关闭'}
                            </Button>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-700 flex flex-col gap-3">
                            <Button size="sm" variant="primary" onClick={onResume} className="w-full border-green-700 bg-green-600 hover:bg-green-500">
                                返回游戏
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => setConfirmExit(true)} className="w-full">
                                返回主菜单
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800 p-6 rounded-xl border-2 border-red-500 w-80 space-y-4 pointer-events-auto text-center">
                        <h3 className="text-white font-bold text-xl">确定要退出吗？</h3>
                        <p className="text-slate-400 text-sm mb-4">当前进度将会丢失</p>
                        <div className="flex gap-3">
                            <Button size="sm" variant="secondary" onClick={() => setConfirmExit(false)} className="flex-1">
                                取消
                            </Button>
                            <Button size="sm" variant="danger" onClick={onMainMenu} className="flex-1">
                                确定退出
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="text-white text-sm animate-pulse">按 ESC 继续摸鱼</div>
            </div>
        </div>
    );
};