import React from 'react';
import { Gamepad2, Play, HelpCircle, Keyboard, Trophy, Skull } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    gameAudio.playCorrect();
    onStart();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen w-full">
      <div className="glass-panel w-full max-w-xl p-8 text-center flex flex-col items-center relative overflow-hidden animate-float short:scale-80">
        {/* Floating background blobs */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-500 rounded-full filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500 rounded-full filter blur-xl opacity-20"></div>

        {/* Title */}
        <div className="mb-8 relative">
          <Gamepad2 className="w-16 h-16 text-[#00f0ff] mb-2 mx-auto filter drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 text-glow-cyan">
            مَتَاهَةُ الكَلِمَاتْ
          </h1>
        </div>

        {/* Description / Instructions */}
        <div className="space-y-4 text-right w-full mb-8 text-gray-300 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-start gap-2 border-b border-gray-700/50 pb-3">
            <HelpCircle className="w-6 h-6 text-[#ff007f]" />
            طريقة اللعب:
          </h3>

          <div className="flex items-start gap-3 justify-start">
            <Trophy className="w-6 h-6 text-[#39ff14] flex-shrink-0 mt-1" />
            <p className="leading-relaxed text-lg">
              ستظهر لك <strong>كلمة</strong> على جانب الشاشة. المتاهة تحتوي على <strong>أربع غرف</strong>، وكل غرفة بها نص.
            </p>
          </div>

          <div className="flex items-start gap-3 justify-start">
            <Gamepad2 className="w-6 h-6 text-[#00f0ff] flex-shrink-0 mt-1" />
            <p className="leading-relaxed text-lg">
              عليك توجيه اللاعب للوصول إلى <strong>الغرفة التي تحتوي على الترجمة أو الكلمة الصحيحة</strong> للفوز بالمستوى.
            </p>
          </div>

          <div className="flex items-start gap-3 justify-start">
            <Skull className="w-6 h-6 text-[#fff01f] flex-shrink-0 mt-1" />
            <p className="leading-relaxed text-lg">
              <strong>احذر!</strong> هناك وحوش تتحرك داخل المتاهة، تجنبها حتى لا تفقد قلوبك (لديك 3 محاولات).
            </p>
          </div>

          <div className="flex items-center gap-3 justify-start border-t border-gray-700/50 pt-5 mt-2">
            <Keyboard className="w-6 h-6 text-[#ff5f00] flex-shrink-0" />
            <p className="leading-relaxed text-gray-400 text-lg">
              <strong>التحكم:</strong> الأسهم أو <span className="text-[#00f0ff] font-bold mx-1">W A S D</span> أو أزرار الشاشة للحركة.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="game-btn px-10 py-5 text-2xl font-black flex items-center gap-4 w-full max-w-sm pulse-glow-cyan rounded-2xl"
        >
          <Play className="w-8 h-8 fill-current" />
          إِِبْدَأْ اللَعِبَ الأَن
        </button>
      </div>
    </div>
  );
};
