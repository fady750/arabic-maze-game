import React, { useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { MazeCanvas } from './MazeCanvas';
import type { Question } from '../data/questions';

interface GameScreenProps {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  lives: number;
  onCorrectAnswer: () => void;
  onWrongAnswer: (word: string) => void;
  onLoseLife: () => void;
  onBackToWelcome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  questions,
  currentQuestionIndex,
  score,
  lives,
  onCorrectAnswer,
  onWrongAnswer,
  onLoseLife,
  onBackToWelcome,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  
  // Distribute correct word + 3 distractors randomly
  // To keep it persistent for this question, we memoize it or generate it once.
  // We can use a simple seeded shuffle based on currentQuestionIndex, or state.
  // Using state is simple: when currentQuestionIndex changes, we generate a shuffled array of words.
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [lastIndex, setLastIndex] = useState<number>(-1);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  // Touch pad external direction input
  const extDir = null;

  if (lastIndex !== currentQuestionIndex && currentQuestion) {
    const allWords = [currentQuestion.word, ...currentQuestion.distractors];
    // Simple random shuffle
    for (let i = allWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
    }
    setShuffledWords(allWords);
    setLastIndex(currentQuestionIndex);
  }

  const triggerNotification = (text: string, type: 'success' | 'error') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 2000);
  };

  const handleWrong = (word: string) => {
    onWrongAnswer(word);
    triggerNotification(`❌ كلمة "${word}" خاطئة! (-20 نقطة)`, 'error');
  };

  const handleCorrect = () => {
    triggerNotification('⭐ إجابة صحيحة! أحسنت! (+100 نقطة)', 'success');
    onCorrectAnswer();
  };

  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <Heart
          key={i}
          className={`w-6 h-6 transition-all duration-300 ${
            i < lives
              ? 'text-[#ff007f] fill-[#ff007f] filter drop-shadow-[0_0_5px_rgba(255,0,127,0.7)]'
              : 'text-gray-600 fill-transparent'
          }`}
        />
      );
    }
    return <div className="flex gap-1">{hearts}</div>;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-2 sm:p-4 flex flex-col items-center justify-start gap-3 h-auto overflow-y-auto lg:h-screen lg:overflow-hidden">
      
      {/* 1. Header panel */}
      <div className="glass-panel w-full flex items-center justify-between px-6 py-3 relative z-10 flex-shrink-0">
        <button
          onClick={onBackToWelcome}
          className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4 ml-1" />
          الرئيسية
        </button>

        {/* HUD Info */}
        <div className="flex items-center gap-6">
          {/* Level */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">المرحلة</span>
            <span className="text-xl font-black text-[#00f0ff]">{currentQuestionIndex + 1} / {questions.length}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">النقاط</span>
            <span className="text-xl font-black text-[#39ff14]">{score}</span>
          </div>

          {/* Lives */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">المحاولات</span>
            {renderHearts()}
          </div>
        </div>
      </div>

      {/* 2. Main layout */}
      <div className="flex-1 w-full min-h-0 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 overflow-hidden">
        
        {/* Left Side: Question Display */}
        <div className="glass-panel w-fit h-auto p-2 sm:p-3 lg:h-full lg:max-h-full lg:p-6 text-center flex flex-col items-center justify-center min-h-0 flex-shrink-0">
          {/* Question Image */}
          {currentQuestion && (
            <div className="relative group overflow-hidden rounded-2xl border-2 border-[#00f0ff] bg-slate-900 pulse-glow-cyan w-32 h-32 sm:w-48 sm:h-48 lg:w-auto lg:h-full lg:max-h-full lg:aspect-square flex items-center justify-center p-2">
              <img
                src={currentQuestion.image}
                alt="سؤال المتاهة"
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </div>
          )}
        </div>

        {/* Center: Maze Board */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-[90vw] aspect-square h-auto lg:h-full lg:max-h-full lg:w-auto flex-shrink-0">
          {/* Toast Notification overlay */}
          {notification && (
            <div
              className={`absolute top-4 px-6 py-3 rounded-full font-black text-white shadow-lg transition-all duration-300 z-20 ${
                notification.type === 'success'
                  ? 'bg-emerald-600/90 border border-emerald-400 neon-border-cyan'
                  : 'bg-rose-600/90 border border-rose-400 animate-shake neon-border-pink'
              }`}
            >
              {notification.text}
            </div>
          )}

          <MazeCanvas
            words={shuffledWords}
            correctWord={currentQuestion?.word}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onLoseLife={onLoseLife}
            lives={lives}
            isPaused={false}
            externalDirection={extDir}
          />
        </div>

      </div>

    </div>
  );
};
