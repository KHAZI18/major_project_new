import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { ChevronLeft, PieChart, Check, X, Award, Flame } from 'lucide-react';

// Helpers for math
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function generateDynamicQuestion() {
  // Generate a valid fraction (value < 1)
  let d = Math.floor(Math.random() * 9) + 2; // 2 to 10
  let n = Math.floor(Math.random() * (d - 1)) + 1; // 1 to d-1
  
  // Simplify
  let divisor = gcd(n, d);
  n = n / divisor;
  d = d / divisor;

  const target = { numerator: n, denominator: d, percentage: (n/d)*100 };
  
  // Generate 3 wrong options
  const optsParams = new Set([`${n}/${d}`]);
  const options = [target];
  
  while(options.length < 4) {
      let fakeD = Math.floor(Math.random() * 9) + 2;
      let fakeN = Math.floor(Math.random() * (fakeD - 1)) + 1;
      let fakeDiv = gcd(fakeN, fakeD);
      fakeN /= fakeDiv; fakeD /= fakeDiv;
      
      const key = `${fakeN}/${fakeD}`;
      if(!optsParams.has(key)) {
         optsParams.add(key);
         options.push({ numerator: fakeN, denominator: fakeD, percentage: (fakeN/fakeD)*100 });
      }
  }

  // Shuffle
  return { target, options: options.sort(() => Math.random() - 0.5) };
}

function FractionFrenzy() {
  const { addXP } = useGamification();
  const navigate = useNavigate();

  const [questionCount, setQuestionCount] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [current, setCurrent] = useState(generateDynamicQuestion());
  const [feedback, setFeedback] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const startGame = () => {
    setQuestionCount(0);
    setScore(0);
    setStreak(0);
    setCurrent(generateDynamicQuestion());
    setGameOver(false);
  };

  const handleOptionClick = (option) => {
    if (feedback) return;
    const isCorrect = option.numerator === current.target.numerator && option.denominator === current.target.denominator;
    
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback('correct');
    } else {
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (questionCount + 1 >= 10) { // Increased to 10 rounds for more gameplay
        setGameOver(true);
        addXP(score * 15 + (isCorrect ? 15 : 0), 'Fraction Frenzy', score + (isCorrect ? 1 : 0));
      } else {
        setQuestionCount(c => c + 1);
        setCurrent(generateDynamicQuestion());
      }
    }, 1200);
  };

  // Pie Chart Rendering Logic
  const renderPie = (percentage) => (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
       <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="#1e293b" strokeWidth="4" />
       {/* The "Slice" */}
       <circle 
          cx="50" cy="50" r="25" 
          fill="none" 
          stroke="url(#sliceGradient)" 
          strokeWidth="50"
          pathLength="100"
          strokeDasharray={`${percentage} 100`}
          className="transition-all duration-[1200ms] ease-out delay-100"
       />
       <defs>
          <linearGradient id="sliceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="#d946ef" /> {/* Tailwind fuchsia-500 */}
             <stop offset="100%" stopColor="#8b5cf6" /> {/* Tailwind violet-500 */}
          </linearGradient>
       </defs>
       {/* Optional inner cutout to make it a donut if needed, currently a full pie */}
    </svg>
  );

  return (
    <div className="animate-fade-in-up">
      <header className="flex justify-between items-center mb-8">
        <Link to="/student" className="btn btn-glass px-4 py-2">
          <ChevronLeft size={20} /> Back
        </Link>
        <h2 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="text-secondary" /> Fraction Frenzy
        </h2>
        <div className="px-5 py-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-full font-bold shadow-[0_0_15px_rgba(217,70,239,0.3)]">
          Round {Math.min(questionCount + 1, 10)}/10
        </div>
      </header>

      <div className="glass-panel p-8 text-center max-w-3xl mx-auto border-secondary/20 relative overflow-hidden">
        
        {streak >= 3 && !gameOver && (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-accent animate-combo-pop font-bold text-xl px-3 py-1 bg-accent/10 rounded-full border border-accent/20 shadow-primary-glow">
               <Flame className="animate-pulse"/> {streak}x STREAK
            </div>
        )}

        {gameOver ? (
          <div className="animate-fade-in-up py-8">
             <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full scale-150 animate-pulse"></div>
                <Award size={128} className="text-secondary relative z-10" />
             </div>
             <h3 className="text-4xl font-bold mb-4">Frenzy Complete!</h3>
             <p className="text-slate-300 mb-2 text-xl">You matched <strong className="text-white">{score}</strong> fractions correctly.</p>
             <p className="text-success text-2xl font-bold mb-10">+{score * 15} XP Earned!</p>
             <div className="flex justify-center gap-4">
              <button className="btn btn-primary min-w-[150px] py-3 text-lg" onClick={startGame}>Play Again</button>
              <button className="btn btn-outline min-w-[150px] py-3 text-lg" onClick={() => navigate('/student')}>Dashboard</button>
             </div>
          </div>
        ) : (
          <div>
            <div className="mb-14 flex justify-center items-center">
              <div className="relative w-64 h-64">
                {renderPie(current.target.percentage)}
              </div>
            </div>

            <p className="text-slate-300 mt-4 mb-8 text-lg font-medium">Select the fraction that perfectly matches the pie chart above.</p>

            <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
              {current.options.map((opt, i) => {
                let stateClass = "bg-black/30 border-white/10 hover:border-secondary hover:bg-secondary/10 hover:-translate-y-2 shadow-lg";
                if (feedback) {
                   const isThisOpt = (opt.numerator === current.target.numerator && opt.denominator === current.target.denominator);
                   if (isThisOpt) stateClass = "bg-success/20 border-success text-success shadow-success-glow scale-105";
                   else stateClass = "opacity-30 scale-95 pointer-events-none border-white/5";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    disabled={feedback !== null}
                    className={`relative p-6 transition-all duration-300 rounded-2xl border-2 overflow-hidden group ${stateClass}`}
                  >
                    <div className="relative z-10 flex flex-col items-center justify-center font-bold font-mono text-4xl">
                        <span>{opt.numerator}</span>
                        <div className="w-12 h-1 bg-current rounded-full my-2"></div>
                        <span>{opt.denominator}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="h-16 flex justify-center items-center mt-8 text-2xl font-bold">
               {feedback === 'correct' && <span className="text-success flex items-center gap-2 animate-combo-pop"><Check size={32}/> Perfect Slice!</span>}
               {feedback === 'wrong' && <span className="text-danger flex items-center gap-2 animate-meteor-shake"><X size={32}/> Not Quite...</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FractionFrenzy;
