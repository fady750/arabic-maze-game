import React from 'react';
// import './scenario.css'; // Make sure this matches your CSS filename

// Import the specific assets exactly as requested
import QuestionCoin from '../assets/QuestionCoin.png';
import QuestionNumberBg from '../assets/QuestionNumber.png';
import DescriptionImg from '../assets/description.png';
import StartButtonBg from '../assets/startButton.png';
import DaddCoin from '../assets/daddcoin.webp';

import { gameAudio } from '../utils/audio';

interface WelcomeScreenProps {
  totalQuestions: number;
  isLoading: boolean;
  error: string | null;
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  totalQuestions,
  isLoading,
  error,
  onStart
}) => {
  const handleStart = () => {
    gameAudio.playCorrect();
    onStart();
  };

  // Calculate XP based on 10 points per question
  const xpCount = totalQuestions * 10;

  return (
    <div className="welcome-screen-new">

      {/* 1. Header (Stats Badge) */}
      <div className="welcome-header-new">
        <div
          className="welcome-stats-bg"
          style={{ backgroundImage: `url(${QuestionNumberBg})` }}
        >
          {/* Forced LTR ensures Question Coin is on the left, DaddCoin is on the right */}
          <img src={QuestionCoin} alt="Questions" className="welcome-q-coin" />
          <span className="welcome-stat-text q-count">{totalQuestions}</span>
          <span className="welcome-stat-arrow">{'>'}</span>
          <span className="welcome-stat-text xp-count">{xpCount}</span>
          <img src={DaddCoin} alt="DaddCoin" className="welcome-dadd-coin" />
        </div>
      </div>

      {/* 2. Body (How to Play Description) */}
      <div className="welcome-body-new">
        <img
          src={DescriptionImg}
          alt="How to play"
          className="welcome-description-img"
        />
      </div>

      {/* 3. Footer (Start Button / Loading States) */}
      <div className="welcome-footer-new">
        {isLoading ? (
          <p className="welcome-loading">جاري تحميل الأسئلة...</p>
        ) : error ? (
          <div className="welcome-error-new">
            <p>{error}</p>
          </div>
        ) : totalQuestions === 0 ? (
          <div className="welcome-error-new">
            <p>لا توجد أسئلة متاحة حالياً.</p>
          </div>
        ) : (
          <button
            className="welcome-start-btn-new"
            onClick={handleStart}
            style={{ backgroundImage: `url(${StartButtonBg})` }}
            disabled={isLoading}
          >
            ابدَأ!
          </button>
        )}
      </div>

    </div>
  );
};

export default WelcomeScreen;
