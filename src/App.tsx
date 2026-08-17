import { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { QUESTIONS, type Question } from './data/questions';
import { gameAudio } from './utils/audio';

type ViewType = 'welcome' | 'playing' | 'gameover' | 'victory';

function App() {
  const [view, setView] = useState<ViewType>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const [apiQuestions, setApiQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const lessonId = urlParams.get('lessonId');
        const token = urlParams.get('token');

        if (!lessonId || !token) {
          console.warn("Missing lessonId or token in URL. Using static questions.");
          setApiQuestions(QUESTIONS);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`https://learning-platform-1euu.onrender.com/api/v1/student/games/1/questions?lessonId=${lessonId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const resData = await response.json();
        
        let fetched: any[] = [];
        // Support { data: { questions: [] } } structure
        if (resData && resData.data && Array.isArray(resData.data.questions)) {
            fetched = resData.data.questions;
        } else if (Array.isArray(resData)) {
            fetched = resData;
        } else if (resData && Array.isArray(resData.data)) {
            fetched = resData.data;
        } else if (resData && Array.isArray(resData.questions)) {
            fetched = resData.questions;
        }

        if (fetched.length > 0) {
          const mapped = fetched.map((q: any, idx: number) => {
            const word = q.correctAnswer || q.word || q.text || 'Word';
            const questionText = q.question || '';
            
            let distractors: string[] = [];
            
            if (Array.isArray(q.options)) {
                distractors = q.options.map((o: any) => typeof o === 'string' ? o : o.text || '').filter((t: string) => t !== word && t !== '');
            } else if (typeof q.options === 'string') {
                try {
                    const parsed = JSON.parse(q.options);
                    if (Array.isArray(parsed)) {
                        distractors = parsed.filter((t: string) => t !== word);
                    }
                } catch (e) {
                    console.error("Failed to parse options string", e);
                }
            }

            // Fill missing distractors if there are less than 3
            if (!distractors || distractors.length < 3) {
               const placeholders = ['خيار أ', 'خيار ب', 'خيار ج'];
               while (distractors.length < 3) distractors.push(placeholders[distractors.length]);
            }
            // Keep exactly 3 distractors so total words is 4
            distractors = distractors.slice(0, 3);
            
            return {
              id: q.id || idx,
              questionText: questionText,
              image: q.imageUrl || q.image || null,
              word: word,
              distractors: distractors
            };
          });
          setApiQuestions(mapped);
        } else {
          console.warn("No questions found from API. Using static questions.");
          setApiQuestions(QUESTIONS);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        setApiQuestions(QUESTIONS);
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

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl font-bold">
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
