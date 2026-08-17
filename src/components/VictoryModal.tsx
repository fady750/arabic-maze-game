import React, { useEffect } from 'react';
import { Trophy, RotateCcw, Home, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { gameAudio } from '../utils/audio';

interface VictoryModalProps {
  score: number;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  onRestart,
  onHome,
}) => {
  useEffect(() => {
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
  }, []);

  const handleRestart = () => {
    gameAudio.playCorrect();
    onRestart();
  };

  const handleHome = () => {
    gameAudio.playCorrect();
    onHome();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-panel w-full max-w-md p-8 text-center border-[#39ff14] relative overflow-hidden neon-border-cyan">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500 rounded-full filter blur-xl opacity-20 animate-pulse"></div>

        <div className="relative inline-block mb-4">
          <Trophy className="w-20 h-20 text-[#fff01f] filter drop-shadow-[0_0_12px_rgba(255,240,31,0.8)] mx-auto animate-bounce" />
          <Sparkles className="w-8 h-8 text-[#39ff14] absolute -top-2 -right-2 animate-pulse" />
        </div>

        <h2 className="text-3xl font-black text-white mb-2 text-glow-green">
          تهانينا! أنت بطل المتاهة!
        </h2>
        <p className="text-gray-300 mb-6 text-lg font-medium">
          لقد أجبت على جميع الأسئلة بنجاح وتفاديت وحوش المتاهة باحترافية!
        </p>

        {/* Stats */}
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-gray-800 mb-8 max-w-xs mx-auto">
          <span className="text-sm text-gray-500 block mb-1">النتيجة النهائية</span>
          <span className="text-3xl font-black text-[#39ff14] text-glow-green">{score} نقطة</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleRestart}
            className="game-btn w-full flex items-center justify-center gap-2 py-3 text-lg font-bold"
          >
            <RotateCcw className="w-5 h-5" />
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
