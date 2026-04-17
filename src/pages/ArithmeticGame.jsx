import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { ChevronLeft, Timer, Check, X, Award, Flame } from 'lucide-react';

const GAME_DURATION = 30;

function generateQuestion(difficulty) {
  let num1, num2, op, answer;
  if (difficulty === 'easy') {
    // Addition and Subtraction 1-20
    op = Math.random() > 0.5 ? '+' : '-';
    if (op === '+') {
      num1 = Math.floor(Math.random() * 15) + 1;
      num2 = Math.floor(Math.random() * 15) + 1;
      answer = num1 + num2;
    } else {
      num1 = Math.floor(Math.random() * 20) + 5;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      answer = num1 - num2;
    }
  } else if (difficulty === 'medium') {
    // Multiplication 1-12
    op = '×';
    num1 = Math.floor(Math.random() * 10) + 2;
    num2 = Math.floor(Math.random() * 10) + 2;
    answer = num1 * num2;
  } else {
    // Division
    op = '÷';
    num2 = Math.floor(Math.random() * 10) + 2;
    answer = Math.floor(Math.random() * 10) + 2;
    num1 = num2 * answer; // Ensure clean division
  }
  return { q: `${num1} ${op} ${num2}`, a: answer };
}

function ArithmeticGame() {
  const { addXP } = useGamification();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [difficulty, setDifficulty] = useState('easy'); // easy, medium, hard
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
      addXP(score * 5 * difficultyMultiplier + (combo * 2), `Number Ninja (${difficulty})`, score);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, addXP, score, difficulty, combo]);

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setCombo(0);
    setInputValue('');
    setCurrentQuestion(generateQuestion(difficulty));
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
    setCurrentQuestion(generateQuestion(difficulty));
    
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
            <h3 className="text-2xl mb-4 font-semibold">Select Difficulty</h3>
            <div className="flex gap-4 justify-center mb-8">
                <button onClick={() => setDifficulty('easy')} className={`btn ${difficulty === 'easy' ? 'btn-primary' : 'btn-glass'}`}>Easy (+ -)</button>
                <button onClick={() => setDifficulty('medium')} className={`btn ${difficulty === 'medium' ? 'btn-primary' : 'btn-glass'}`}>Med (×)</button>
                <button onClick={() => setDifficulty('hard')} className={`btn ${difficulty === 'hard' ? 'btn-primary' : 'btn-glass'}`}>Hard (÷)</button>
            </div>
            <p className="text-slate-300 mb-6">
              Solve as many equations as you can in {GAME_DURATION} seconds. Build a combo for extra XP!
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
