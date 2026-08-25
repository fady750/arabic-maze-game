import React, { useState, useEffect, useRef } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    if (currentQuestion?.audioUrl) {
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, currentQuestion?.audioUrl]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Play prevented:', e));
    }
  };

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
    triggerNotification(`❌ كلمة "${word}" خاطئة!`, 'error');
  };

  const handleCorrect = () => {
    triggerNotification('⭐ إجابة صحيحة! أحسنت!', 'success');
    onCorrectAnswer();
  };

  const renderHearts = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      hearts.push(
        <Heart
          key={i}
          className={`w-6 h-6 transition-all duration-300 ${i < lives
            ? 'text-[#ff007f] fill-[#ff007f] filter drop-shadow-[0_0_5px_rgba(255,0,127,0.7)]'
            : 'text-gray-600 fill-transparent'
            }`}
        />
      );
    }
    return <div className="flex gap-1">{hearts}</div>;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-2 flex flex-col items-center justify-start gap-2 h-[100dvh] overflow-hidden">

      {/* 1. Header panel */}
      <div className="glass-panel w-full flex items-center justify-between px-6 py-3 relative z-10 flex-shrink-0">
        <button
          onClick={onBackToWelcome}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="hidden sm:inline font-bold">خروج</span>
        </button>

        {/* HUD Info */}
        <div className="flex items-center gap-8">
          {/* Level */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">المرحلة</span>
            <span className="text-xl font-black text-[#00f0ff]" dir="ltr">{currentQuestionIndex + 1} / {questions.length}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">النقاط</span>
            <span className="text-xl font-black text-[#39ff14]" dir="ltr">{score}</span>
          </div>

          {/* Lives */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">المحاولات</span>
            <div dir="ltr">{renderHearts()}</div>
          </div>
        </div>
      </div>

      {/* 2. Main layout: side-by-side starting at 768px */}
      <div className="flex-1 w-full min-h-0 flex flex-col md:flex-row items-stretch justify-center gap-2 md:gap-4 lg:gap-8 pb-1">

        {/* Left Side: Question Display — fixed width on md+ */}
        <div className="glass-panel w-full md:w-[220px] lg:w-[280px] p-2 text-center flex flex-col items-center justify-center min-h-0 border border-[#00f0ff]/20 shadow-lg rounded-2xl relative overflow-hidden flex-shrink-0 md:flex-shrink-0">
          {/* Question Elements (Text, Image, Audio) */}
          {currentQuestion && (
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-1 lg:p-2 gap-2 lg:gap-4">

              {/* Optional Image */}
              {currentQuestion.image && (
                <div className="w-full max-h-[15vh] lg:flex-1 lg:max-h-none min-h-0 flex items-center justify-center">
                  <img
                    src={currentQuestion.image}
                    alt="سؤال المتاهة"
                    className="max-w-full max-h-full object-contain drop-shadow-lg rounded-lg"
                  />
                </div>
              )}

              {/* Optional Text */}
              {currentQuestion.questionText && currentQuestion.questionText !== 'بدون سؤال' && (
                <div className={`${currentQuestion.image ? 'text-lg lg:text-2xl shrink-0' : 'text-2xl lg:text-3xl'} text-white font-black text-center leading-relaxed px-2`}>
                  {currentQuestion.questionText}
                </div>
              )}

              {/* Optional Audio */}
              {currentQuestion.audioUrl && (
                <div className="w-full shrink-0 flex items-center justify-center mt-3 lg:mt-5">
                  <audio
                    ref={audioRef}
                    src={currentQuestion.audioUrl}
                    onPlay={() => setIsPlayingAudio(true)}
                    onPause={() => setIsPlayingAudio(false)}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                  <button
                    onClick={toggleAudio}
                    style={{ background: 'transparent', border: 'none', outline: 'none' }}
                    className={`appearance-none bg-transparent border-none outline-none focus:outline-none shadow-none transition-all duration-300 transform active:scale-90 hover:scale-110 ${isPlayingAudio ? 'translate-y-1 opacity-80' : 'animate-[bounce_2.5s_infinite]'
                      }`}
                  >
                    <div className={`filter drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-transform ${isPlayingAudio ? 'animate-pulse text-[#39ff14]' : 'text-[#ff007f]'}`}>
                      {isPlayingAudio ? (
                        <MusicNoteIcon className="!text-[6rem] lg:!text-[10rem]" />
                      ) : (
                        <VolumeUpIcon className="!text-[6rem] lg:!text-[10rem]" />
                      )}
                    </div>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Center: Maze Board */}
        <div className="relative flex-1 flex flex-col items-center justify-center w-full h-full min-h-0 min-w-0">
          {/* Toast Notification overlay */}
          {notification && (
            <div
              className={`absolute top-4 px-6 py-3 rounded-full font-black text-white shadow-lg transition-all duration-300 z-20 ${notification.type === 'success'
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
