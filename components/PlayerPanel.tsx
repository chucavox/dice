import React from 'react';
import { Player } from '../types';

interface PlayerPanelProps {
  player: Player;
  score: number;
  currentTurnScore: number;
  isActive: boolean;
  isWinner: boolean;
}

const PlayerPanel: React.FC<PlayerPanelProps> = ({ 
  player, 
  score, 
  currentTurnScore, 
  isActive,
  isWinner
}) => {
  const isUser = player === Player.USER;
  
  // Dynamic styles based on active state and player type
  const baseClasses = "flex flex-col items-center justify-center p-6 transition-all duration-500 rounded-3xl border-2";
  const activeClasses = isActive 
    ? (isUser ? "bg-pink-900/30 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]" : "bg-cyan-900/30 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]")
    : "bg-gray-900/40 border-gray-800 opacity-70";
    
  const titleColor = isUser ? "text-pink-400" : "text-cyan-400";

  return (
    <div className={`${baseClasses} ${activeClasses} ${isWinner ? 'ring-4 ring-yellow-400 scale-105 z-10' : 'flex-1'}`}>
      <h2 className={`text-2xl md:text-4xl font-black uppercase tracking-widest mb-4 ${titleColor}`}>
        {isUser ? 'You' : 'Gemini AI'}
      </h2>
      
      <div className="text-7xl md:text-8xl font-mono font-bold text-white mb-8">
        {score}
      </div>
      
      <div className={`
        flex flex-col items-center justify-center p-4 rounded-xl w-full max-w-[200px]
        transition-colors duration-300
        ${isActive ? (isUser ? 'bg-pink-600' : 'bg-cyan-600') : 'bg-gray-800'}
      `}>
        <span className="text-xs uppercase tracking-wider text-white/80 font-semibold mb-1">Current Turn</span>
        <span className="text-3xl font-bold text-white">
          {isActive ? currentTurnScore : '-'}
        </span>
      </div>
      
      {isWinner && (
        <div className="mt-8 text-yellow-400 font-bold text-xl animate-bounce">
          🏆 WINNER!
        </div>
      )}
    </div>
  );
};

export default PlayerPanel;
