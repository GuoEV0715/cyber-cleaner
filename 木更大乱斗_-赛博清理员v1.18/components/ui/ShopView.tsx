

import React, { useState, useEffect } from 'react';
import { UpgradeOption, GameState } from '../../types';
import { SHOP_ITEMS, WAVES, ENEMIES } from '../../data/memeContent';
import { gameEngine } from '../../services/gameEngine';
import { Button } from '../Button';

interface ShopViewProps {
    onNextWave: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onNextWave }) => {
    const [shopUpgrades, setShopUpgrades] = useState<UpgradeOption[]>([]);
    const [shopItems, setShopItems] = useState<UpgradeOption[]>([]);
    const [hoverItem, setHoverItem] = useState<string | null>(null);
    const [hoverEnemy, setHoverEnemy] = useState<string | null>(null);
    const [noMoneyTooltip, setNoMoneyTooltip] = useState<{x: number, y: number} | null>(null);
    const [renderTrigger, setRenderTrigger] = useState(0); // Force update

    const p = gameEngine.state.player;
    const discount = p.shopDiscount;
    const discountText = discount < 1 ? ` (会员 ${(discount*10).toFixed(1)}折)` : '';

    // -- Helpers --
    const getRandomItems = (pool: UpgradeOption[], count: number) => {
        const player = gameEngine.state.player;
        const available = pool.filter(item => {
            if (item.maxCount) {
                const owned = player.items.filter(n => n === item.items?.[0]).length;
                if (owned >= item.maxCount) return false;
            }
            
            if (item.minWave && gameEngine.state.currentWave < item.minWave) {
                return false;
            }

            if (item.id === 'fishing_guide' && player.dodgeChance >= 0.6) return false;
            if (item.id === 'fan_group' && player.projectileCount >= 5) return false;

            if (player.characterId === '007' && item.id === 'hot_search') return false;

            return true;
        });
        
        // Inflation rate logic
        const effectiveInflationRate = gameEngine.state.inflationRate;
        
        return [...available].sort(() => 0.5 - Math.random()).slice(0, count).map(item => {
            const inflatedPrice = Math.floor(item.price * (1 + effectiveInflationRate));
            return {
              ...item, 
              originalPrice: item.price, // Store base price
              price: inflatedPrice,
              purchased: false, 
              locked: false,
              uuid: Math.random().toString()
            };
        });
    };

    // -- Init --
    useEffect(() => {
        gameEngine.audio.playShopBGM();
        const allUpgrades = SHOP_ITEMS.filter(i => i.category === 'upgrade');
        const allItems = SHOP_ITEMS.filter(i => i.category === 'item');
        
        // Logic for Persistence:
        // 1. Get previously locked (and not purchased) items from gameEngine state
        const preservedUpgrades = gameEngine.state.shopState.upgrades.filter(i => i.locked && !i.purchased);
        const preservedItems = gameEngine.state.shopState.items.filter(i => i.locked && !i.purchased);

        // 2. Fill the rest of the slots
        const needUpgrades = Math.max(0, gameEngine.state.player.shopUpgradeSlots - preservedUpgrades.length);
        const needItems = Math.max(0, gameEngine.state.player.shopItemSlots - preservedItems.length);

        const finalUpgrades = [...preservedUpgrades, ...getRandomItems(allUpgrades, needUpgrades)];
        const finalItems = [...preservedItems, ...getRandomItems(allItems, needItems)];

        setShopUpgrades(finalUpgrades);
        setShopItems(finalItems);
    }, []);

    // -- Sync state back to engine on changes --
    useEffect(() => {
        if (shopUpgrades.length > 0 || shopItems.length > 0) {
            gameEngine.state.shopState.upgrades = shopUpgrades;
            gameEngine.state.shopState.items = shopItems;
        }
    }, [shopUpgrades, shopItems]);

    // -- Actions --
    const restockShop = (type: 'upgrade' | 'item', e: React.MouseEvent) => {
        const cost = gameEngine.state.restockCost;
        if (gameEngine.state.player.gold >= cost) {
            gameEngine.state.player.gold -= cost;
            gameEngine.state.refreshCount++;
            
            const baseIncrement = 10 + (gameEngine.state.currentWave - 1) * 2;
            gameEngine.state.restockCost += baseIncrement;

            gameEngine.audio.playCoin();
            
            const allUpgrades = SHOP_ITEMS.filter(i => i.category === 'upgrade');
            const allItems = SHOP_ITEMS.filter(i => i.category === 'item');

            if (type === 'upgrade') {
               setShopUpgrades(prev => {
                   const next = prev.filter(p => p.locked && !p.purchased);
                   const need = gameEngine.state.player.shopUpgradeSlots - next.length;
                   if (need > 0) {
                       next.push(...getRandomItems(allUpgrades, need));
                   }
                   return next;
               });
            } else {
               setShopItems(prev => {
                   const next = prev.filter(p => p.locked && !p.purchased);
                   const need = gameEngine.state.player.shopItemSlots - next.length;
                   if (need > 0) {
                       next.push(...getRandomItems(allItems, need));
                   }
                   return next;
               });
            }
            setRenderTrigger(prev => prev + 1);
        } else {
            setNoMoneyTooltip({ x: e.clientX, y: e.clientY });
            setTimeout(() => setNoMoneyTooltip(null), 1000);
        }
    };

    const toggleLock = (listSetter: React.Dispatch<React.SetStateAction<UpgradeOption[]>>, index: number) => {
        listSetter(prev => {
            const next = [...prev];
            if(!next[index].purchased) {
                next[index] = { ...next[index], locked: !next[index].locked };
            }
            return next;
        });
    };

    const buyItem = (list: UpgradeOption[], listSetter: React.Dispatch<React.SetStateAction<UpgradeOption[]>>, index: number) => {
        const item = list[index];
        const actualPrice = Math.floor(item.price * discount);
        
        if (!item.purchased && gameEngine.state.player.gold >= actualPrice) {
            gameEngine.state.player.gold -= actualPrice;
            item.effect(gameEngine.state);
            gameEngine.audio.playCoin();
            
            listSetter(prev => {
                const next = [...prev];
                next[index] = { ...next[index], purchased: true, locked: false };
                return next;
            });
            setRenderTrigger(prev => prev + 1);
        }
    };

    // -- Render Prep --
    const inventoryMap: Record<string, {count: number, desc: string, icon: string}> = {};
    p.items.forEach(name => {
        if (!inventoryMap[name]) {
            let desc = "未知物品";
            let icon = "📦";
            const ref = SHOP_ITEMS.find(i => i.items?.includes(name) || i.title === name);
            if(ref) {
                desc = ref.description;
                icon = ref.icon;
            }
            inventoryMap[name] = {count: 0, desc, icon};
        }
        inventoryMap[name].count++;
    });

    const nextWaveNum = gameEngine.state.currentWave + 1;
    const effectiveWaveNum = gameEngine.state.isEndless ? ((gameEngine.state.endlessWaveCount) % 7) + 1 : nextWaveNum;
    const nextWaveConfig = WAVES.find(w => w.waveNumber === effectiveWaveNum) || WAVES[WAVES.length - 1];
    const uniqueEnemies = Array.from(new Set(nextWaveConfig.enemies.map(e => e.type)));

    const isEndless = gameEngine.state.isEndless;
    const waveTitle = isEndless ? `无尽加班 (第 ${gameEngine.state.endlessWaveCount} 波)` : `第 ${gameEngine.state.currentWave} 波 结束`;

    // Calculate visual inflation rate for display (0 based)
    const effectiveInflationRate = gameEngine.state.inflationRate;

    // Calculate insurance stats
    const insuranceCount = p.items.filter(i => i === '意外险').length;
    const maxInsurance = insuranceCount * 800;

    const renderPriceButton = (item: UpgradeOption, index: number, list: UpgradeOption[], setter: any, canAfford: boolean) => {
        const finalPrice = Math.floor(item.price * discount);
        let inflationDiff = 0;
        if (item.originalPrice) {
            inflationDiff = item.price - item.originalPrice;
        }

        return (
            <Button 
                size="sm" 
                variant={canAfford ? (item.category === 'upgrade' ? "primary" : "secondary") : "outline"} 
                disabled={!canAfford || !!item.purchased}
                onClick={() => buyItem(list, setter, index)}
                className="w-full mt-auto flex justify-between items-center px-3"
            >
                <span>{item.purchased ? '已售罄' : `💰 ${finalPrice}`}</span>
                {!item.purchased && inflationDiff > 0 && (
                    <span className="text-red-300 text-xs font-normal ml-1">
                        (通货膨胀: +{inflationDiff})
                    </span>
                )}
            </Button>
        );
    };

    return (
    <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50 p-6 font-sans select-none">
        {noMoneyTooltip && (
            <div className="fixed z-[100] bg-red-600 text-white font-bold px-3 py-1 rounded pointer-events-none shadow-lg animate-bounce"
                 style={{left: noMoneyTooltip.x, top: noMoneyTooltip.y - 30}}>
                 功德不足!
            </div>
        )}

        <div className="w-full max-w-7xl h-full flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 bg-slate-800 p-4 rounded-xl border-2 border-slate-600 shadow-lg shrink-0">
                <div>
                    <h2 className="text-3xl font-bold text-yellow-400">摸鱼小卖部 ({waveTitle})</h2>
                    <div className="text-red-400 text-lg font-bold">通货膨胀率: {(effectiveInflationRate * 100).toFixed(0)}% 📈</div>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className="text-slate-300 text-lg font-bold">潜在威胁:</span>
                    <div className="flex gap-2">
                        {uniqueEnemies.map(type => {
                            const cfg = ENEMIES[type];
                            return (
                                <div key={type} className="relative group cursor-help"
                                     onMouseEnter={() => setHoverEnemy(type)}
                                     onMouseLeave={() => setHoverEnemy(null)}>
                                    <span className="text-4xl bg-slate-700 w-14 h-14 flex items-center justify-center rounded-full border border-slate-500 transform hover:scale-110 transition-transform">{cfg.emoji}</span>
                                    {hoverEnemy === type && (
                                        <div className="absolute top-full mt-2 right-0 w-64 bg-black border border-red-500 p-3 text-xs text-white rounded shadow-xl z-50">
                                            <h4 className="text-red-400 font-bold text-lg mb-1">{cfg.emoji} {type === 'boss_kpi' ? 'KPI大魔王' : cfg.description.split('，')[0]}</h4> 
                                            <p className="text-slate-300 mb-2">{cfg.description}</p>
                                            <div className="grid grid-cols-2 gap-1 text-slate-400">
                                                <span>生命: {Math.floor(cfg.hp * (1 + (nextWaveNum - 1) * 0.5))}</span>
                                                <span>伤害: {cfg.damage}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                     <div className="text-3xl text-white bg-slate-900 px-6 py-3 rounded-lg border border-yellow-500 shadow-lg flex items-center gap-2">
                        💰 <span className="text-yellow-400 font-mono">{p.gold}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-1 gap-6 overflow-hidden pb-4 min-h-0">
                <div className="w-64 bg-slate-800/80 p-4 rounded-xl border border-slate-700 overflow-y-auto scrollbar-hide flex flex-col gap-4 text-slate-200 text-sm shrink-0">
                    <h3 className="text-lg font-bold text-cyan-300 border-b border-slate-600 pb-2">📊 员工数据</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>生命上限:</span> <span className="text-white">{p.maxHp}</span></div>
                        <div className="flex justify-between"><span>护盾上限:</span> <span className="text-blue-300">{p.maxShield}</span></div>
                        <div className="flex justify-between"><span>基础伤害:</span> <span className="text-red-300">{p.attackDamage.toFixed(1)}</span></div>
                        <div className="flex justify-between"><span>攻击频率:</span> <span className="text-yellow-300">{(60/p.attackSpeed).toFixed(1)}次/秒</span></div>
                        <div className="flex justify-between"><span>子弹数量:</span> <span className="text-white">{p.projectileCount}</span></div>
                        <div className="flex justify-between"><span>子弹穿透:</span> <span className="text-orange-300">{p.projectilePierce}</span></div>
                        <div className="flex justify-between"><span>移速:</span> <span className="text-green-300">{p.speed.toFixed(1)}</span></div>
                        <div className="flex justify-between"><span>药品掉落率:</span> <span className="text-pink-300">{(p.dropRate*100).toFixed(0)}%</span></div>
                        {p.lifeSteal > 0 && <div className="flex justify-between"><span>吸血:</span> <span className="text-red-500">{(p.lifeSteal*100).toFixed(0)}%</span></div>}
                        {p.dodgeChance > 0 && <div className="flex justify-between"><span>闪避率:</span> <span className="text-purple-300">{(p.dodgeChance*100).toFixed(0)}%</span></div>}
                        {p.damageReflection > 0 && <div className="flex justify-between"><span>反伤:</span> <span className="text-gray-300">{(p.damageReflection*100).toFixed(0)}%</span></div>}
                        {p.backwardShots > 0 && <div className="flex justify-between"><span>背刺子弹:</span> <span className="text-white">{p.backwardShots}</span></div>}
                        {insuranceCount > 0 && <div className="flex justify-between"><span>保险收益:</span> <span className="text-yellow-500">{p.insuranceGoldEarned}/{maxInsurance}</span></div>}
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h3 className="text-xl font-bold text-purple-300">📈 属性增幅 {discountText}</h3>
                        <Button size="sm" onClick={(e) => restockShop('upgrade', e)} variant="outline">
                            🚚 进货 (花费: {gameEngine.state.restockCost})
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto scrollbar-hide content-start flex-1">
                        {shopUpgrades.map((item, idx) => {
                            const finalPrice = Math.floor(item.price * discount);
                            const canAfford = p.gold >= finalPrice;
                            return (
                                <div key={item.uuid} className={`
                                    p-3 rounded-lg border-2 transition-all flex flex-col relative min-h-[160px]
                                    ${item.purchased ? 'opacity-50 grayscale bg-slate-900' : ''}
                                    ${item.rarity === 'legendary' ? 'bg-slate-800 border-yellow-500 shadow-yellow-500/20 shadow-lg' : 
                                      item.rarity === 'rare' ? 'bg-slate-800 border-purple-500' : 'bg-slate-800 border-slate-600'}
                                `}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-3xl">{item.icon}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => toggleLock(setShopUpgrades, idx)} disabled={!!item.purchased} className={`text-xs px-2 py-1 rounded border transition-colors ${item.locked ? 'bg-red-900 border-red-500 text-red-200' : 'bg-slate-700 border-slate-500 text-slate-400 hover:bg-slate-600'}`}>
                                                {item.locked ? '🔒 已锁' : '🔓 锁定'}
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                    <p className="text-xs text-slate-400 mb-3 flex-1">{item.description}</p>
                                    {renderPriceButton(item, idx, shopUpgrades, setShopUpgrades, canAfford)}
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 overflow-hidden">
                    <div className="flex justify-between items-center mb-2 shrink-0">
                        <h3 className="text-xl font-bold text-blue-300">🎒 道具 & 补给 {discountText}</h3>
                        <Button size="sm" onClick={(e) => restockShop('item', e)} variant="outline">
                            🚚 进货 (花费: {gameEngine.state.restockCost})
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 overflow-y-auto scrollbar-hide content-start flex-1">
                         {shopItems.map((item, idx) => {
                            const finalPrice = Math.floor(item.price * discount);
                            const canAfford = p.gold >= finalPrice;
                            return (
                                <div key={item.uuid} className={`bg-slate-800 p-3 rounded-lg border border-slate-600 flex flex-col min-h-[160px] ${item.purchased ? 'opacity-50 grayscale bg-slate-900' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{item.icon}</span>
                                            <h4 className="font-bold text-white text-sm">{item.title}</h4>
                                        </div>
                                        <button onClick={() => toggleLock(setShopItems, idx)} disabled={!!item.purchased} className={`text-xs px-2 py-1 rounded border transition-colors ${item.locked ? 'bg-red-900 border-red-500 text-red-200' : 'bg-slate-700 border-slate-500 text-slate-400 hover:bg-slate-600'}`}>
                                            {item.locked ? '🔒 已锁' : '🔓 锁定'}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3 flex-1">{item.description}</p>
                                    {renderPriceButton(item, idx, shopItems, setShopItems, canAfford)}
                                </div>
                            )
                        })}
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-700 shrink-0">
                        <div className="text-xs text-slate-400 mb-2">已拥有:</div>
                        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-hide pb-4">
                            {Object.entries(inventoryMap).map(([name, data]) => (
                                <div 
                                    key={name} 
                                    className="relative group cursor-help"
                                    onMouseEnter={() => setHoverItem(name)}
                                    onMouseLeave={() => setHoverItem(null)}
                                >
                                    <div className="w-12 h-12 bg-slate-700 rounded-lg border border-slate-600 flex items-center justify-center text-2xl relative hover:bg-slate-600 transition-colors z-10">
                                       {data.icon}
                                       {data.count > 1 && (
                                            <span className="absolute bottom-0 right-0 bg-yellow-500 text-black text-[10px] font-bold px-1 rounded-tl">
                                                x{data.count}
                                            </span>
                                       )}
                                    </div>
                                    {hoverItem === name && (
                                        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-64 bg-black border-2 border-yellow-500 p-3 text-sm text-white rounded-lg shadow-2xl z-[100]">
                                           <div className="font-bold text-yellow-300 mb-1 text-lg">{data.icon} {name}</div>
                                           <div className="text-slate-200 leading-relaxed">{data.desc}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {Object.keys(inventoryMap).length === 0 && <span className="text-xs text-slate-600 italic">空空如也</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-4 shrink-0">
                <Button size="lg" onClick={onNextWave} className="bg-red-600 hover:bg-red-500 border-red-800 text-xl px-16 shadow-red-500/30 shadow-lg">
                    打卡上班 (下一波)
                </Button>
            </div>
        </div>
    </div>
    );
};
