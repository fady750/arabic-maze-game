import React from 'react';
import { RotateCcw, AlertTriangle, Home } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  level: number;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  level,
  onRestart,
  onHome,
}) => {
  const handleRestart = () => {
    gameAudio.playCorrect();
    onRestart();
  };

  const handleHome = () => {
    gameAudio.playCorrect();
    onHome();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="glass-panel w-full max-w-md p-8 text-center border-[#ff007f] relative overflow-hidden neon-border-pink">
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-pink-600 rounded-full filter blur-xl opacity-20 animate-pulse"></div>

        <AlertTriangle className="w-16 h-16 text-[#ff007f] mx-auto mb-4 filter drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]" />

        <h2 className="text-3xl font-black text-white mb-2 text-glow-pink">
          انتهت اللعبة!
        </h2>
        <p className="text-gray-400 mb-6">لقد أمسكت بك الوحوش ونفدت محاولاتك.</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-gray-800">
            <span className="text-sm text-gray-500 block mb-1">المستوى المحرز</span>
            <span className="text-2xl font-black text-[#00f0ff]">{level}</span>
          </div>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-gray-800">
            <span className="text-sm text-gray-500 block mb-1">النتيجة النهائية</span>
            <span className="text-2xl font-black text-[#39ff14]">{score}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRestart}
            className="game-btn game-btn-pink w-full flex items-center justify-center gap-2 py-3 text-lg font-bold"
          >
            <RotateCcw className="w-5 h-5" />
            حاول مرة أخرى
          </button>
          
          <button
            onClick={handleHome}
            className="w-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-5 h-5" />
            الشاشة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};
