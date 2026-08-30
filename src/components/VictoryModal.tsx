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
        <div className="glass-panel w-full max-w-md md:max-w-xl lg:max-w-2xl p-8 md:p-12 text-center border-[#00f0ff] relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
          <Loader2 className="w-16 h-16 md:w-24 md:h-24 text-[#00f0ff] animate-spin mb-4" />
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white text-glow-cyan animate-pulse">
            جاري حفظ إنجازاتك...
          </h2>
          <p className="text-gray-400 mt-2 md:text-xl">أنت بطل !</p>
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
      <div className="glass-panel w-full max-w-md md:max-w-2xl lg:max-w-4xl p-8 md:p-12 lg:p-16 text-center border-[#39ff14] relative overflow-hidden neon-border-cyan">
        <div className="absolute -top-10 -right-10 w-24 h-24 md:w-48 md:h-48 bg-teal-500 rounded-full filter blur-xl opacity-20 animate-pulse"></div>

        <div className="relative inline-block mb-4 mt-2">
          <Trophy className="w-24 h-24 md:w-32 md:h-32 text-[#fff01f] filter drop-shadow-[0_0_15px_rgba(255,240,31,0.8)] mx-auto animate-bounce" />
          <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-[#39ff14] absolute -top-2 -right-4 animate-pulse" />
        </div>

        <h2 className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-2 md:mb-4 text-glow-green">
          مَبْرُوكْ
        </h2>
        <p className="text-gray-300 mb-6 md:mb-10 text-lg md:text-2xl lg:text-3xl font-medium">
          أَنتَ بَطَلٌ
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-12">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Trophy className="w-6 h-6 text-[#00f0ff] mb-1" />
            <span className="text-xs text-gray-400 block mb-1">النّقَاطُ</span>
            <span className="text-2xl font-black text-[#00f0ff]">{finalScore}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Star className="w-6 h-6 text-[#fff01f] mb-1" />
            <span className="text-xs text-gray-400 block mb-1">النّجُومُ</span>
            <span className="text-2xl font-black text-[#fff01f]">{stars}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Coins className="w-6 h-6 text-yellow-500 mb-1" />
            <span className="text-xs text-gray-400 block mb-1">فِلُوس</span>
            <span className="text-2xl font-black text-yellow-500">{coins}</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center justify-center transform transition hover:scale-105">
            <Zap className="w-6 h-6 text-[#ff007f] mb-1" />
            <span className="text-xs text-gray-400 block mb-1">الخِبْرَةُ</span>
            <span className="text-2xl font-black text-[#ff007f]">{xp}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 justify-center">
          <button
            onClick={handleRestart}
            className="game-btn w-full md:w-auto md:px-12 flex items-center justify-center gap-2 py-4 md:py-5 text-xl md:text-3xl font-bold rounded-2xl"
          >
            <RotateCcw className="w-6 h-6 md:w-8 md:h-8" />
            إِلعَبْ ثَانِيةً
          </button>

          <button
            onClick={handleHome}
            className="w-full md:w-auto bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold py-3 md:py-5 px-6 md:px-10 rounded-xl md:rounded-2xl flex items-center justify-center gap-2 md:text-2xl transition-all"
          >
            <Home className="w-5 h-5 md:w-8 md:h-8" />
            ارْجِعْ
          </button>
        </div>
      </div>
    </div>
  );
};
