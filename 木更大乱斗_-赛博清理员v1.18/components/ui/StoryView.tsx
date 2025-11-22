
import React, { useState, useEffect, useRef } from 'react';
import { CHARACTERS } from '../../data/memeContent';
import { gameEngine } from '../../services/gameEngine';

export const StoryView: React.FC<{ charId: string, onFinish: () => void }> = ({ charId, onFinish }) => {
    const [step, setStep] = useState(0);
    const scenes = CHARACTERS[charId]?.storyScenes || CHARACTERS['9527'].storyScenes;
    
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typeIntervalRef = useRef<number | null>(null);

    // Start music on mount
    useEffect(() => {
        gameEngine.audio.playStoryBGM();
    }, []);

    // Typewriter effect logic
    useEffect(() => {
        if (!scenes[step]) return;
        
        const fullText = scenes[step].text;
        setDisplayedText("");
        setIsTyping(true);
        let charIndex = 0;

        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);

        typeIntervalRef.current = window.setInterval(() => {
            if (charIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, charIndex + 1));
                gameEngine.audio.playTypewriter();
                charIndex++;
            } else {
                setIsTyping(false);
                if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
            }
        }, 50); // Speed: 50ms per char

        return () => {
             if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        };
    }, [step, scenes]);

    const handleClick = () => {
        if (isTyping) {
            // Skip typing
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
            setDisplayedText(scenes[step].text);
            setIsTyping(false);
        } else {
            // Next scene
            if (step < scenes.length - 1) {
                setStep(s => s + 1);
            } else {
                onFinish();
            }
        }
    };

    const current = scenes[step];
    if (!current) return null;

    return (
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50 p-8 cursor-pointer select-none" onClick={handleClick}>
          <div className="w-full max-w-4xl h-96 flex items-center justify-center relative">
              {current.type === 'center' ? (
                  <div className="flex flex-col items-center animate-bounce-in">
                      <div className="text-9xl mb-8 animate-pulse">{current.emoji}</div>
                      <div className="flex flex-col items-center bg-slate-800 px-8 py-4 rounded-full border-2 border-white">
                          <div className="text-sm text-slate-400 mb-1 font-bold">{current.name}</div>
                          <div className="text-3xl text-white font-bold typewriter min-h-[48px]">{displayedText}</div>
                      </div>
                  </div>
              ) : (
                  <div className={`flex items-end gap-8 w-full ${current.type === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="text-9xl filter drop-shadow-lg transform transition-transform duration-500 scale-110">{current.emoji}</div>
                      <div className={`
                          bg-white text-black p-6 rounded-2xl text-2xl font-bold shadow-xl relative max-w-lg animate-pop-in flex flex-col
                          after:content-[''] after:absolute after:bottom-4 after:w-0 after:h-0 after:border-8
                          ${current.type === 'left' 
                              ? "rounded-bl-none after:border-l-white after:border-t-transparent after:border-r-transparent after:border-b-transparent after:-left-4 origin-bottom-left" 
                              : "rounded-br-none after:border-r-white after:border-t-transparent after:border-l-transparent after:border-b-transparent after:-right-4 origin-bottom-right"}
                      `}>
                          <div className="text-sm text-slate-500 mb-2 font-black uppercase tracking-wider">{current.name}</div>
                          <div className="min-h-[32px]">{displayedText}</div>
                      </div>
                  </div>
              )}
          </div>
          <div className="absolute bottom-10 text-slate-500 animate-pulse text-sm">
              {isTyping ? "点击加速" : "点击继续 ▶"}
          </div>
      </div>
    );
};
