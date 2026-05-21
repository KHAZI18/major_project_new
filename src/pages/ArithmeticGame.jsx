import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { ChevronLeft, Timer, Check, X, Award, Flame } from 'lucide-react';

import { useAuthStore } from '../store/useAuthStore';
import { normalizeGrade } from '../lib/gradeUtils';

const BASE_GAME_DURATION = 30;

function generateQuestion(grade) {
  let num1, num2, op, answer;
  if (grade <= 2) {
    op = Math.random() > 0.5 ? '+' : '-';
    num1 = Math.floor(Math.random() * 15) + 1;
    num2 = Math.floor(Math.random() * 15) + 1;
    if (op === '-') {
      if (num1 < num2) [num1, num2] = [num2, num1];
    }
    answer = op === '+' ? num1 + num2 : num1 - num2;
  } else if (grade <= 4) {
    op = '×';
    const max = grade >= 4 ? 12 : 10;
    num1 = Math.floor(Math.random() * max) + 2;
    num2 = Math.floor(Math.random() * max) + 2;
    answer = num1 * num2;
  } else {
    op = '÷';
    const max = grade >= 5 ? 12 : 10;
    num2 = Math.floor(Math.random() * max) + 2;
    answer = Math.floor(Math.random() * max) + 2;
    num1 = num2 * answer;
  }
  return { q: `${num1} ${op} ${num2}`, a: answer };
}

function ArithmeticGame() {
  // Top-level debug message to confirm mount
  if (typeof window !== 'undefined') {
    window.__ARITHMETIC_GAME_MOUNTED = true;
  }
  const { addXP } = useGamification();
  const { user } = useAuthStore();
  // Fallback UI if user is missing
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold text-danger mb-4">User not found</h2>
        <p className="mb-2">You must be logged in to play Number Ninja.</p>
        <a href="/login" className="btn btn-primary mb-4">Go to Login</a>
        <pre className="bg-black text-white p-4 rounded-lg text-left max-w-xl mx-auto overflow-x-auto">
          localStorage['mv_auth'] = {JSON.stringify(localStorage.getItem('mv_auth'))}
        </pre>
      </div>
    );
  }
  // Show user object for debugging
  if (!user.grade) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-2xl font-bold text-danger mb-4">User object incomplete</h2>
        <p className="mb-2">User data loaded, but missing grade property.</p>
        <pre className="bg-black text-white p-4 rounded-lg text-left max-w-xl mx-auto overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    );
  }
  const grade = normalizeGrade(user?.grade);
  const difficulty = grade <= 2 ? 'easy' : grade <= 4 ? 'medium' : 'hard';
  const gameDuration = grade >= 4 ? 25 : BASE_GAME_DURATION;
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({ q: '?', a: 0 });
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'
  
  const inputRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      const difficultyMultiplier = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
      addXP(score * 5 * difficultyMultiplier + (combo * 2), `Number Ninja (${difficulty})`, score, 0,'Arithmetic');
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, addXP, score, difficulty, combo]);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(gameDuration);
    setScore(0);
    setCombo(0);
    setInputValue('');
    setCurrentQuestion(generateQuestion(grade));
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPlaying) return;

    if (parseInt(inputValue) === currentQuestion.a) {
      setScore(score + 1);
      setCombo(c => c + 1);
      setFeedback('correct');
    } else {
      setCombo(0); // Break combo
      setFeedback('wrong');
    }

    setInputValue('');
    setCurrentQuestion(generateQuestion(grade));
    
    setTimeout(() => setFeedback(null), 300);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <Link to="/student" className="btn btn-glass px-4 py-2">
          <ChevronLeft size={20} /> Back
        </Link>
        <h2 className="text-xl font-semibold">Number Ninja</h2>
        <div className="flex gap-2">
           <div className="px-4 py-2 bg-white/10 rounded-full font-medium">
             Score: {score}
           </div>
        </div>
      </div>

      <div className="glass-panel p-8 text-center max-w-lg mx-auto relative overflow-hidden">
        
        {combo >= 3 && (
            <div className="absolute top-2 right-4 flex items-center gap-1 text-accent animate-combo-pop font-bold text-xl">
               <Flame className="animate-pulse"/> {combo}x COMBO!
            </div>
        )}

        {!isPlaying && timeLeft === GAME_DURATION && (
          <div className="animate-fade-in-up">
            <h3 className="text-2xl mb-4 font-semibold">Difficulty: {difficulty.toUpperCase()}</h3>
            <p className="text-slate-300 mb-6">
              Solve as many equations as you can in {gameDuration} seconds. Build a combo for extra XP!
            </p>
            <button className="btn btn-primary w-full text-lg py-4" onClick={startGame}>
              Start Match
            </button>
          </div>
        )}

        {isPlaying && (
          <div>
            <div className="flex justify-between mb-8 items-center">
              <div className={`flex items-center gap-2 text-xl font-bold ${timeLeft <= 5 ? 'text-danger' : 'text-slate-50'}`}>
                <Timer size={24} className={timeLeft <= 5 ? 'animate-pulse' : ''} /> 00:{timeLeft.toString().padStart(2, '0')}
              </div>
              <div className="text-xl font-bold text-success">
                Score: {score}
              </div>
            </div>

            <div className={`text-6xl font-extrabold tracking-widest font-mono mb-8 transition-colors duration-200 ${feedback === 'correct' ? 'text-success' : feedback === 'wrong' ? 'text-danger' : 'text-slate-50'}`}>
              {currentQuestion.q} = ?
            </div>

            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full p-6 text-4xl text-center bg-black/20 border-2 border-white/10 text-white rounded-2xl mb-4 outline-none focus:border-primary transition-colors"
                autoFocus
                placeholder="?"
              />
              <button type="submit" className="hidden">Submit</button>
            </form>
            
            <div className="h-12 flex justify-center items-center">
              {feedback === 'correct' && <Check size={48} className="text-success animate-fade-in-up" />}
              {feedback === 'wrong' && <X size={48} className="text-danger animate-fade-in-up" />}
            </div>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div className="animate-fade-in-up">
            <Award size={64} className="text-warning mx-auto mb-4" />
            <h3 className="text-4xl font-bold mb-2">Time's Up!</h3>
            <p className="text-lg mb-2">You scored <strong className="text-xl">{score}</strong> correctly on {difficulty.toUpperCase()}.</p>
            {combo > 0 && <p className="text-accent mb-2">Max Combo: {combo}x</p>}
            <p className="text-success text-xl font-bold mb-8">+{score * 5 * (difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1) + (combo * 2)} XP Earned!</p>
            
            <div className="flex gap-4">
              <button className="btn btn-primary flex-1" onClick={startGame}>Play Again</button>
              <button className="btn btn-outline flex-1" onClick={() => navigate('/student')}>Dashboard</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ArithmeticGame;
