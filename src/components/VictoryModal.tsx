import React, { useEffect } from 'react';
import { Trophy, RotateCcw, Home, Sparkles, Star, Coins, Zap, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { gameAudio } from '../utils/audio';

interface VictoryModalProps {
  score: number;
  isSubmitting?: boolean;
  victoryData?: any;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  isSubmitting,
  victoryData,
  onRestart,
  onHome,
}) => {
  useEffect(() => {
    if (!isSubmitting) {
      // Play sound and trigger confetti
      gameAudio.playVictory();
      
      // Confetti burst
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#00f0ff', '#ff007f', '#39ff14', '#fff01f']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#00f0ff', '#ff007f', '#39ff14', '#fff01f']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }
  }, [isSubmitting]);

  const handleRestart = () => {
    gameAudio.playCorrect();
    onRestart();
  };

  const handleHome = () => {
    gameAudio.playCorrect();
    onHome();
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="glass-panel w-full max-w-md p-8 text-center border-[#00f0ff] relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-16 h-16 text-[#00f0ff] animate-spin mb-4" />
          <h2 className="text-2xl font-black text-white text-glow-cyan animate-pulse">
            جاري حفظ إنجازاتك...
          </h2>
          <p className="text-gray-400 mt-2">أنت بطل رائع!</p>
        </div>
      </div>
    );
  }

  const finalScore = victoryData?.score ?? score;
  const stars = victoryData?.stars ?? 0;
  const coins = victoryData?.coins ?? 0;
  const xp = victoryData?.experience ?? 0;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-panel w-full max-w-md p-8 text-center border-[#39ff14] relative overflow-hidden neon-border-cyan">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500 rounded-full filter blur-xl opacity-20 animate-pulse"></div>

        <div className="relative inline-block mb-4 mt-2">
          <Trophy className="w-24 h-24 text-[#fff01f] filter drop-shadow-[0_0_15px_rgba(255,240,31,0.8)] mx-auto animate-bounce" />
          <Sparkles className="w-10 h-10 text-[#39ff14] absolute -top-2 -right-4 animate-pulse" />
        </div>

        <h2 className="text-3xl font-black text-white mb-2 text-glow-green">
          أحسنت يا بطل!
        </h2>
        <p className="text-gray-300 mb-6 text-lg font-medium">
          لقد أنهيت المتاهة بنجاح ساحق!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Trophy className="w-6 h-6 text-[#00f0ff] mb-1" />
            <span className="text-xs text-gray-400 block mb-1">النقاط</span>
            <span className="text-2xl font-black text-[#00f0ff]">{finalScore}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Star className="w-6 h-6 text-[#fff01f] mb-1" />
            <span className="text-xs text-gray-400 block mb-1">النجوم</span>
            <span className="text-2xl font-black text-[#fff01f]">{stars}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Coins className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="text-xs text-gray-400 block mb-1">العملات</span>
            <span className="text-2xl font-black text-yellow-500">{coins}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Zap className="w-6 h-6 text-[#ff007f] mb-1" />
            <span className="text-xs text-gray-400 block mb-1">الخبرة</span>
            <span className="text-2xl font-black text-[#ff007f]">{xp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRestart}
            className="game-btn w-full flex items-center justify-center gap-2 py-4 text-xl font-bold rounded-2xl"
          >
            <RotateCcw className="w-6 h-6" />
            العب مرة أخرى
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
