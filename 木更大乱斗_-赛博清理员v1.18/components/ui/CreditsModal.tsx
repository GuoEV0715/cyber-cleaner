

import React from 'react';
import { Button } from '../Button';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => (
    <div className="absolute inset-0 bg-black/95 z-[100] flex items-center justify-center p-8 animate-pop-in pointer-events-auto" onClick={onClose}>
        <div className="max-w-2xl text-center space-y-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-8">制作人员名单</h2>
            
            <div className="space-y-4 text-xl text-slate-300">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="font-bold text-white mb-2">策划 & 程序</p>
                    <p className="text-2xl text-yellow-400 font-black mb-2">GuoEv</p>
                    <p>B站 UID：<span className="text-pink-400 font-mono">34113096</span></p>
                    <p>抖音 ID：<span className="text-white font-mono">1326375405</span></p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <p className="font-bold text-white mb-2">特别鸣谢</p>
                    <p className="text-xl text-yellow-300 font-bold mb-1">黑游戏作坊</p>
                    <p className="text-sm mb-2">B站 UID：<span className="text-pink-400 font-mono">35074132</span></p>
                    <p className="text-sm text-slate-400 italic">
                        "首席量子纠缠态测试员，以凡人之躯比肩KPI大魔王，用无数次猝死换来了今天的平衡性补丁。"
                    </p>
                </div>

                <div className="text-slate-400 text-base leading-relaxed italic px-8">
                    <p>本项目历时 0.0000274 个世纪，耗资 0 亿津巴布韦币。</p>
                    <p>采用了最先进的 量子纠缠态渲染技术 和 脑机接口交互逻辑。</p>
                    <p>为了打磨每一个像素，开发团队不惜献祭了 1024 根头发。</p>
                    <p>旨在探索人类与人工智能在赛博空间的哲学共生关系。</p>
                </div>
                
                <p className="text-xs text-slate-600 mt-8">（其实是我瞎说的）</p>
                <p className="text-[10px] text-slate-700">免责声明：本游戏纯属虚构，如有雷同，纯属巧合。请勿在工作时间游玩，否则后果自负。</p>
            </div>

            <Button onClick={onClose} className="mt-8 relative z-50">关闭</Button>
        </div>
    </div>
);