import React from 'react';
import { Gamepad2, Play, HelpCircle } from 'lucide-react';
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
      <div className="glass-panel w-full max-w-xl p-8 text-center flex flex-col items-center relative overflow-hidden animate-float">
        {/* Floating background blobs */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-indigo-500 rounded-full filter blur-xl opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500 rounded-full filter blur-xl opacity-20"></div>

        {/* Title */}
        <div className="mb-8 relative">
          <Gamepad2 className="w-16 h-16 text-[#00f0ff] mb-2 mx-auto filter drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 text-glow-cyan">
            متاهة الكلمات
          </h1>
          <p className="text-[#00f0ff] font-semibold text-lg tracking-wide uppercase">
            تحدي الذكاء والسرعة 👾🎮
          </p>
        </div>

        {/* Description / Instructions */}
        <div className="space-y-4 text-right w-full mb-8 text-gray-300">
          <h3 className="text-xl font-bold text-white mb-3 flex items-center justify-start gap-2 border-b border-gray-700 pb-2">
            <HelpCircle className="w-5 h-5 text-[#ff007f]" />
            طريقة اللعب:
          </h3>
          
          <div className="flex items-start gap-3 justify-start">
            <span className="text-[#39ff14] text-xl">◀</span>
            <p className="leading-relaxed">
              ستظهر لك <strong>صورة</strong> في أعلى الشاشة تمثل شيئاً أو فعلاً معيناً.
            </p>
          </div>

          <div className="flex items-start gap-3 justify-start">
            <span className="text-[#39ff14] text-xl">◀</span>
            <p className="leading-relaxed">
              المتاهة تحتوي على <strong>أربع غرف في الزوايا</strong>، بكل غرفة كلمة باللغة العربية.
            </p>
          </div>

          <div className="flex items-start gap-3 justify-start">
            <span className="text-[#39ff14] text-xl">◀</span>
            <p className="leading-relaxed">
              عليك توجيه اللاعب للوصول إلى <strong>الغرفة التي تحتوي على الكلمة الصحيحة</strong> للفوز بالمستوى والانتقال للمستوى التالي.
            </p>
          </div>

          <div className="flex items-start gap-3 justify-start">
            <span className="text-[#39ff14] text-xl">◀</span>
            <p className="leading-relaxed">
              <strong>احذر!</strong> هناك وحوش تتحرك داخل المتاهة، يجب تجنبها حتى لا تقتلك وتفقد قلوبك (لديك 3 قلوب).
            </p>
          </div>

          <div className="flex items-start gap-3 justify-start border-t border-gray-800 pt-4">
            <span className="text-[#fff01f] text-xl">⌨</span>
            <p className="leading-relaxed text-gray-400">
              <strong>التحكم:</strong> استخدم الأسهم <span className="text-[#00f0ff]">↑ ↓ ← →</span> أو أزرار <span className="text-[#00f0ff]">W A S D</span> للحركة. أو استخدم أزرار التحكم على الشاشة.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="game-btn px-10 py-4 text-xl flex items-center gap-3 w-full max-w-xs pulse-glow-cyan"
        >
          <Play className="w-6 h-6 fill-current" />
          ابدأ اللعب الآن
        </button>
      </div>
    </div>
  );
};
