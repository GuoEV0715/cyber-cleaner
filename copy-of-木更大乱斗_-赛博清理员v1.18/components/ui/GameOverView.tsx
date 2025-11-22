



import React, { useEffect } from 'react';
import { Button } from '../Button';
import { gameEngine } from '../../services/gameEngine';
import { DEATH_MESSAGES, DIFFICULTY_SETTINGS, CHARACTERS, SHOP_ITEMS } from '../../data/memeContent';

export const GameOverView: React.FC<{ onRestart: () => void, onMainMenu: () => void }> = ({ onRestart, onMainMenu }) => {
    const killer = gameEngine.state.killer || 'unknown';
    const message = DEATH_MESSAGES[killer] || DEATH_MESSAGES['unknown'];
    const diff = DIFFICULTY_SETTINGS.find(d => d.id === gameEngine.state.difficultyId);
    const p = gameEngine.state.player;
    const charId = p.characterId || '9527';
    const charName = CHARACTERS[charId]?.name || '未知员工';

    useEffect(() => {
        gameEngine.audio.playGameOverBGM();
    }, []);

    // Consolidate inventory for display
    const inventoryMap: Record<string, {count: number, icon: string}> = {};
    p.items.forEach(name => {
        if (!inventoryMap[name]) {
            let icon = "📦";
            const ref = SHOP_ITEMS.find(i => i.items?.includes(name) || i.title === name);
            if(ref) {
                icon = ref.icon;
            }
            inventoryMap[name] = {count: 0, icon};
        }
        inventoryMap[name].count++;
    });

    return (
      <div className="absolute inset-0 bg-red-900/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-bounce-in p-6 overflow-y-auto">
        <div className="bg-black/80 p-8 rounded-2xl border-4 border-red-500 text-center max-w-7xl w-full my-auto flex flex-col gap-8">
            <div>
                <h1 className="text-9xl font-black text-white mb-2 glitch-text" data-text="寄">寄</h1>
                <p className="text-3xl text-red-200 mb-4">你被裁员了</p>
                <p className="text-xl text-slate-400 italic">"{message}"</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                {/* Final Result */}
                <div className="bg-slate-900/50 p-6 rounded-xl space-y-4 border border-slate-700">
                     <h3 className="text-red-400 font-bold text-xl border-b border-slate-700 pb-2 mb-2">最终结算</h3>
                     <div className="grid grid-cols-2 gap-y-4">
                        <div>
                            <div className="text-sm text-slate-500">员工</div>
                            <div className="text-xl text-white font-bold">{charName}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">难度</div>
                            <div className="text-xl text-yellow-300 font-bold">{diff?.emoji} {diff?.name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">进度</div>
                            {gameEngine.state.isEndless ? (
                                <div className="text-xl text-purple-400 font-bold">加班第 {gameEngine.state.endlessWaveCount} 波</div>
                            ) : (
                                <div className="text-xl text-white font-bold">第 {gameEngine.state.currentWave} 波</div>
                            )}
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">累计功德</div>
                            <div className="text-xl text-yellow-400 font-mono font-bold">💰 {gameEngine.state.score}</div>
                        </div>
                     </div>
                </div>

                {/* Player Stats */}
                <div className="bg-slate-900/50 p-6 rounded-xl space-y-4 border border-slate-700">
                     <h3 className="text-green-400 font-bold text-xl border-b border-slate-700 pb-2 mb-2">员工数据</h3>
                     <div className="grid grid-cols-2 gap-y-2 text-base">
                        <div className="flex justify-between px-1"><span>生命上限:</span> <span className="text-white">{p.maxHp}</span></div>
                        <div className="flex justify-between px-1"><span>护盾上限:</span> <span className="text-blue-300">{p.maxShield}</span></div>
                        <div className="flex justify-between px-1"><span>基础伤害:</span> <span className="text-red-300">{p.attackDamage.toFixed(1)}</span></div>
                        <div className="flex justify-between px-1"><span>攻击频率:</span> <span className="text-yellow-300">{(60/p.attackSpeed).toFixed(1)}/s</span></div>
                        <div className="flex justify-between px-1"><span>移速:</span> <span className="text-green-300">{p.speed.toFixed(1)}</span></div>
                        <div className="flex justify-between px-1"><span>穿透:</span> <span className="text-orange-300">{p.projectilePierce}</span></div>
                        <div className="flex justify-between px-1"><span>闪避率:</span> <span className="text-purple-300">{(p.dodgeChance*100).toFixed(0)}%</span></div>
                        <div className="flex justify-between px-1"><span>吸血:</span> <span className="text-red-500">{(p.lifeSteal*100).toFixed(0)}%</span></div>
                     </div>
                </div>

                {/* Inventory */}
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 flex flex-col">
                     <h3 className="text-cyan-400 font-bold text-xl border-b border-slate-700 pb-2 mb-4">持有物资</h3>
                     <div className="flex flex-wrap gap-3 content-start overflow-y-auto scrollbar-hide flex-1 min-h-[200px] max-h-[300px]">
                        {Object.entries(inventoryMap).map(([name, data]) => (
                            <div key={name} className="w-14 h-14 bg-slate-800 rounded-lg border border-slate-600 flex items-center justify-center text-3xl relative group">
                                {data.icon}
                                {data.count > 1 && (
                                    <span className="absolute bottom-0 right-0 bg-yellow-500 text-black text-xs font-bold px-1.5 rounded-tl">
                                        x{data.count}
                                    </span>
                                )}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-sm text-white px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 border border-slate-500">
                                    {name}
                                </div>
                            </div>
                        ))}
                        {Object.keys(inventoryMap).length === 0 && <span className="text-lg text-slate-600 italic">什么都没带走...</span>}
                     </div>
                </div>
            </div>

            <div className="flex gap-8 justify-center mt-8">
                <Button size="lg" onClick={onRestart} className="bg-red-600 border-red-800 hover:bg-red-500 text-xl px-12">重新投递简历</Button>
                <Button size="lg" variant="outline" onClick={onMainMenu} className="text-xl px-12">回到主菜单</Button>
            </div>
        </div>
      </div>
    );
};