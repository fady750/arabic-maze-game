import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import type { Question } from './data/questions';
import { gameAudio } from './utils/audio';

type ViewType = 'welcome' | 'playing' | 'gameover' | 'victory';

function App() {
  const [view, setView] = useState<ViewType>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const [apiQuestions, setApiQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const assessmentId = urlParams.get('assessmentID') || urlParams.get('assessmentId') || urlParams.get('lessonId');
        const token = urlParams.get('token');

        if (!assessmentId || !token) {
          setError('عذراً، الرابط غير مكتمل. يرجى التأكد من وجود رقم التقييم ورمز المرور.');
          setIsLoading(false);
          return;
        }

        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://oasis-eduline-1.onrender.com';
        const response = await fetch(`${baseUrl}/api/v1/student/assessments/${assessmentId}/questions/choice`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
           throw new Error('فشل في جلب البيانات من الخادم.');
        }
        
        const resData = await response.json();
        
        let fetched: any[] = [];
        if (resData && resData.data && Array.isArray(resData.data.answers)) {
            fetched = resData.data.answers;
        } else if (resData && resData.data && Array.isArray(resData.data)) {
            fetched = resData.data;
        } else if (Array.isArray(resData)) {
            fetched = resData;
        }

        if (fetched.length > 0) {
          const mapped = fetched.map((q: any, idx: number) => {
            // Handle the new answers structure if present
            const isAnswerFormat = q.questionTitle !== undefined && q.choices !== undefined;
            
            const questionText = isAnswerFormat ? q.questionTitle : (q.choiceDetails?.title || 'بدون سؤال');
            const choicesArr = isAnswerFormat ? q.choices : (q.choiceDetails?.choices || []);
            
            let word = 'إجابة';
            let distractors: string[] = [];

            if (isAnswerFormat) {
              word = q.correctAnswer;
              distractors = choicesArr
                .map((c: any) => c.text)
                .filter((text: string) => text !== word);
            } else {
              const details = q.choiceDetails || {};
              const correctIndex = details.correctAnswer !== undefined ? details.correctAnswer : 0;
              word = choicesArr[correctIndex] || 'إجابة';
              distractors = choicesArr.filter((_: any, i: number) => i !== correctIndex);
            }

            // Keep maximum of 3 distractors so total words is never more than 4
            distractors = distractors.slice(0, 3);
            
            return {
              id: q.id || q.questionId || idx,
              questionText: questionText,
              image: q.image || q.choiceDetails?.image || null,
              word: word,
              distractors: distractors
            };
          });
          setApiQuestions(mapped);
        } else {
          setError('لا توجد أسئلة متاحة في هذا التقييم.');
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError('حدث خطأ أثناء جلب الأسئلة. يرجى المحاولة مرة أخرى.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleStartGame = () => {
    setScore(0);
    setLives(3);
    setCurrentQuestionIndex(0);
    setView('playing');
  };

  const handleCorrectAnswer = () => {
    setScore((prev) => prev + 100);
    
    // Check if there are more questions
    if (currentQuestionIndex + 1 < apiQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setView('victory');
    }
  };

  const handleWrongAnswer = () => {
    setScore((prev) => Math.max(0, prev - 20));
  };

  const handleLoseLife = () => {
    setLives((prev) => {
      const nextLives = prev - 1;
      if (nextLives <= 0) {
        gameAudio.playGameOver();
        setView('gameover');
      }
      return nextLives;
    });
  };

  if (error) {
    return (
      <div className="w-screen min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl font-bold p-8 text-center" dir="rtl">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl font-bold" dir="rtl">
        جاري تحميل اللعبة...
      </div>
    );
  }

  return (
    <div className="w-screen min-h-screen overflow-x-hidden flex items-center justify-center">
      {view === 'welcome' && (
        <WelcomeScreen onStart={handleStartGame} />
      )}
      
      {view === 'playing' && (
        <GameScreen
          questions={apiQuestions}
          currentQuestionIndex={currentQuestionIndex}
          score={score}
          lives={lives}
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
          onLoseLife={handleLoseLife}
          onBackToWelcome={() => setView('welcome')}
        />
      )}

      {view === 'gameover' && (
        <GameOverModal
          score={score}
          level={currentQuestionIndex + 1}
          onRestart={handleStartGame}
          onHome={() => setView('welcome')}
        />
      )}

      {view === 'victory' && (
        <VictoryModal
          score={score}
          onRestart={handleStartGame}
          onHome={() => setView('welcome')}
        />
      )}
    </div>
  );
}

export default App;
