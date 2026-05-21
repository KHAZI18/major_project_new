import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { ChevronLeft, Check, Award, RefreshCcw } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { normalizeGrade } from '../lib/gradeUtils';

const SVG_BASE = { width: 64, height: 64, viewBox: "0 0 100 100", stroke: "currentColor", strokeWidth: 4, fill: "none" };

const ALL_SHAPES_DB = [
  { id: 'tri', draw: <polygon points="50,15 90,85 10,85" strokeLinejoin="round" />, name: '3 Sides (Triangle)' },
  { id: 'sqr', draw: <rect x="20" y="20" width="60" height="60" rx="4" />, name: '4 Equal Sides (Square)' },
  { id: 'cir', draw: <circle cx="50" cy="50" r="40" />, name: '0 Corners (Circle)' },
  { id: 'hex', draw: <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" strokeLinejoin="round" />, name: '6 Sides (Hexagon)' },
  { id: 'star', draw: <polygon points="50,5 64,35 95,35 70,55 80,85 50,65 20,85 30,55 5,35 36,35" strokeLinejoin="round" />, name: '10 Vertices (Star)' },
  { id: 'rect', draw: <rect x="15" y="30" width="70" height="40" rx="2" />, name: 'Opposite Equal (Rectangle)' }
];

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function GeometryGame() {
  const { addXP } = useGamification();
  const { user } = useAuthStore();
  const grade = normalizeGrade(user?.grade);
  const navigate = useNavigate();

  const [shapes, setShapes] = useState([]);
  const [names, setNames] = useState([]);
  
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const shapeCount = grade <= 2 ? 3 : grade === 3 ? 4 : grade === 4 ? 5 : 6;
    const shapePool = grade <= 2
      ? ALL_SHAPES_DB.filter((s) => ['tri', 'sqr', 'cir', 'rect'].includes(s.id))
      : grade === 3
        ? ALL_SHAPES_DB.filter((s) => ['tri', 'sqr', 'cir', 'rect', 'hex'].includes(s.id))
        : ALL_SHAPES_DB;
    const selectedDB = shuffleArray(shapePool).slice(0, shapeCount);
    
    setShapes(shuffleArray(selectedDB));
    setNames(shuffleArray(selectedDB.map(s => ({ id: s.id, name: s.name }))));
    setMatchedIds([]);
    setSelectedShape(null);
    setSelectedName(null);
    setGameOver(false);
  };

  useEffect(() => {
    if (selectedShape && selectedName) {
      if (selectedShape === selectedName) {
        setMatchedIds(prev => {
          const newMatches = [...prev, selectedShape];
          if (newMatches.length === shapes.length) {
            setTimeout(() => {
              setGameOver(true);
              addXP(100, 'Geometry Explorer', 100, 0, 'Geometry');
            }, 500);
          }
          return newMatches;
        });
      }
      setTimeout(() => {
        setSelectedShape(null);
        setSelectedName(null);
      }, 500);
    }
  }, [selectedShape, selectedName, addXP, shapes.length]);

  return (
    <div className="animate-fade-in-up">
      <header className="flex justify-between items-center mb-8">
        <Link to="/student" className="btn btn-glass px-4 py-2">
          <ChevronLeft size={20} /> Back
        </Link>
        <h2 className="text-xl font-semibold">Geometry Explorer</h2>
        <div className="px-4 py-2 bg-success/20 text-success rounded-full font-medium">
          Grade {grade}
        </div>
      </header>

      <div className="glass-panel p-8 text-center max-w-4xl mx-auto">
        
        {gameOver ? (
          <div className="animate-fade-in-up">
            <Award size={64} className="text-success mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-2">Perfect Match!</h3>
            <p className="text-slate-300 mb-2">You successfully identified all the geometric properties.</p>
            <p className="text-success text-xl font-bold mb-8">+100 XP Earned!</p>
            
            <div className="flex justify-center gap-4">
              <button className="btn btn-primary min-w-[150px]" onClick={initGame}>
                <RefreshCcw size={18} /> Play Again
              </button>
              <button className="btn btn-outline min-w-[150px]" onClick={() => navigate('/student')}>
                Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-slate-300 mb-8 text-lg">
              Select a shape, then select its correct name to pair them. Match all pairs to win.
            </p>

            <div className="flex flex-wrap justify-center gap-10">
              {/* Shapes Column */}
              <div className="flex flex-col gap-4 flex-1 min-w-[150px]">
                <h4 className="text-slate-300 font-medium">Shapes</h4>
                {shapes.map((s) => {
                  const isMatched = matchedIds.includes(s.id);
                  const isSelected = selectedShape === s.id;
                  
                  let stateClasses = "bg-panel border-white/10 cursor-pointer";
                  if (isSelected) stateClasses = "bg-white/20 border-primary ring-2 ring-primary/50";
                  if (isMatched) stateClasses = "opacity-30 cursor-default";

                  return (
                    <button 
                      key={`shape-${s.id}`}
                      disabled={isMatched}
                      onClick={() => setSelectedShape(s.id)}
                      className={`glass-card p-4 flex items-center justify-center min-h-[120px] transition-all ${stateClasses}`}
                    >
                      {isMatched ? <Check size={48} className="text-success" /> : <svg {...SVG_BASE}>{s.draw}</svg>}
                    </button>
                  );
                })}
              </div>

              {/* Names Column */}
              <div className="flex flex-col gap-4 flex-1 min-w-[150px]">
                <h4 className="text-slate-300 font-medium">Properties / Names</h4>
                {names.map((n) => {
                  const isMatched = matchedIds.includes(n.id);
                  const isSelected = selectedName === n.id;
                  
                  let stateClasses = "bg-panel border-white/10 cursor-pointer";
                  if (isSelected) stateClasses = "bg-white/20 border-primary ring-2 ring-primary/50";
                  if (isMatched) stateClasses = "opacity-30 cursor-default";

                  return (
                    <button 
                      key={`name-${n.id}`}
                      disabled={isMatched}
                      onClick={() => setSelectedName(n.id)}
                      className={`glass-card p-4 flex items-center justify-center min-h-[120px] text-xl font-bold transition-all ${stateClasses}`}
                    >
                      {isMatched ? <Check size={48} className="text-success" /> : n.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeometryGame;
