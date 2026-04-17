import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { ChevronLeft, Puzzle, Award, RefreshCcw, Check, X } from 'lucide-react';

const PATTERNS = [
  { seq: [2, 4, 6, 8], answer: 10, rule: 'Add 2' },
  { seq: [5, 10, 15, 20], answer: 25, rule: 'Add 5' },
  { seq: [3, 6, 12, 24], answer: 48, rule: 'Multiply by 2' },
  { seq: [1, 4, 9, 16], answer: 25, rule: 'Perfect Squares' },
  { seq: [21, 18, 15, 12], answer: 9, rule: 'Subtract 3' },
];

function PatternPuzzle() {
  const { addXP } = useGamification();
  const navigate = useNavigate();

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    setPuzzleIndex(0);
    setScore(0);
    setGameOver(false);
    generateOptions(0);
  };

  const generateOptions = (index) => {
    const p = PATTERNS[index];
    const opts = new Set([p.answer]);
    while (opts.size < 4) {
      opts.add(p.answer + (Math.floor(Math.random() * 10) - 5));
    }
    setOptions(Array.from(opts).sort(() => Math.random() - 0.5));
    setFeedback(null);
  };

  const handleSelect = (opt) => {
    if (feedback) return;
    
    const p = PATTERNS[puzzleIndex];
    if (opt === p.answer) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('wrong');
    }

    setTimeout(() => {
      if (puzzleIndex + 1 < PATTERNS.length) {
        setPuzzleIndex(i => i + 1);
        generateOptions(puzzleIndex + 1);
      } else {
        setGameOver(true);
        addXP(score * 25 + (opt === p.answer ? 25 : 0), 'Pattern Puzzle', score + (opt === p.answer ? 1 : 0));
      }
    }, 1500);
  };

  const currentPattern = PATTERNS[Math.min(puzzleIndex, PATTERNS.length - 1)];

  return (
    <div className="animate-fade-in-up">
      <header className="flex justify-between items-center mb-8">
        <Link to="/student" className="btn btn-glass px-4 py-2">
          <ChevronLeft size={20} /> Back
        </Link>
        <h2 className="text-xl font-semibold flex items-center gap-2"><Puzzle className="text-warning"/> Pattern Puzzle</h2>
        <div className="px-4 py-2 bg-warning/20 text-warning rounded-full font-medium">
          Puzzle {Math.min(puzzleIndex + 1, PATTERNS.length)} / {PATTERNS.length}
        </div>
      </header>

      <div className="glass-panel p-8 text-center max-w-2xl mx-auto">
        {gameOver ? (
           <div className="animate-fade-in-up">
             <Award size={64} className="text-warning mx-auto mb-4" />
             <h3 className="text-3xl font-bold mb-2">Master Logician!</h3>
             <p className="text-slate-300 mb-2">You solved {score} out of {PATTERNS.length} sequences.</p>
             <p className="text-success text-xl font-bold mb-8">+{score * 25} XP Earned!</p>
             <div className="flex justify-center gap-4">
               <button className="btn btn-primary min-w-[150px]" onClick={initGame}><RefreshCcw size={18}/> Replay</button>
               <button className="btn btn-outline min-w-[150px]" onClick={() => navigate('/student')}>Dashboard</button>
             </div>
           </div>
        ) : (
          <div>
            <p className="text-lg text-slate-300 mb-12">Analyze the sequence and find the next logical number.</p>

            <div className="flex justify-center flex-wrap gap-4 mb-16">
               {currentPattern.seq.map((num, i) => (
                  <div key={i} className="w-16 h-16 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center text-2xl font-bold shadow-md">
                     {num}
                  </div>
               ))}
               <div className={`w-16 h-16 border-2 border-dashed rounded-xl flex items-center justify-center text-2xl font-bold transition-colors ${feedback === 'correct' ? 'border-success bg-success/20 text-success' : feedback === 'wrong' ? 'border-danger bg-danger/20 text-danger' : 'border-warning text-warning'}`}>
                  {feedback === 'correct' ? currentPattern.answer : '?'}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((opt, i) => {
                 let btnClass = "glass-card p-6 text-2xl font-bold hover:bg-warning/20 hover:border-warning";
                 if (feedback && opt === currentPattern.answer) btnClass = "glass-card p-6 text-2xl font-bold bg-success/30 border-success text-success";
                 else if (feedback === 'wrong') btnClass = "glass-card p-6 text-2xl font-bold opacity-50";

                 return (
                   <button key={i} onClick={() => handleSelect(opt)} disabled={feedback !== null} className={btnClass}>
                     {opt}
                   </button>
                 );
              })}
            </div>

            <div className="h-10 mt-8 text-lg font-medium opacity-80">
              {feedback === 'correct' && <span className="text-success flex items-center justify-center gap-2 animate-fade-in-up"><Check/> Great job! Rule: {currentPattern.rule}</span>}
              {feedback === 'wrong' && <span className="text-danger flex items-center justify-center gap-2 animate-fade-in-up"><X/> Not quite. Rule was: {currentPattern.rule}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatternPuzzle;
