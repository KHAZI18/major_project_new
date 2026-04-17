import { Link } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { Trophy, Star, Target, ChevronLeft, Play, PieChart, Scale, Rocket, Puzzle } from 'lucide-react';

function StudentDashboard() {
  const { progress, xpToNext, totalXpForNextLevel } = useGamification();
  
  const progressPercent = ((totalXpForNextLevel - xpToNext) / totalXpForNextLevel) * 100;

  return (
    <div className="animate-fade-in-up pb-8">
      <header className="flex justify-between items-center mb-8">
        <Link to="/" className="btn btn-glass px-4 py-2">
          <ChevronLeft size={20} /> Back
        </Link>
        <h2 className="text-2xl font-semibold">My Journey</h2>
      </header>

      <div className="glass-card p-6 mb-8 relative overflow-hidden">
        <div className="absolute -top-5 -right-5 opacity-10">
          <Trophy size={150} />
        </div>
        
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-3xl font-bold">
            L{progress.level}
          </div>
          <div>
            <h3 className="text-2xl mb-1 font-semibold">Level {progress.level} Scholar</h3>
            <p className="text-slate-300">{progress.xp} Total XP</p>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span>Progress to Level {progress.level + 1}</span>
            <span>{xpToNext} XP needed</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <h3 className="mb-4 text-xl font-semibold">Learning Games</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/20 rounded-xl text-primary">
              <Target size={32} />
            </div>
            <span className="badge badge-primary">+50 XP</span>
          </div>
          <h4 className="text-xl font-semibold mb-2">Number Ninja</h4>
          <p className="text-slate-300 text-sm mb-6 flex-1">
            Master basic arithmetic (addition and subtraction) in this fast-paced 30s challenge.
          </p>
          <Link to="/games/arithmetic" className="no-underline w-full">
            <button className="btn btn-primary w-full">
              <Play size={18} fill="currentColor" /> Play Now
            </button>
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-success/20 rounded-xl text-success">
              <Star size={32} />
            </div>
            <span className="badge badge-success">+100 XP</span>
          </div>
          <h4 className="text-xl font-semibold mb-2">Geometry Explorer</h4>
          <p className="text-slate-300 text-sm mb-6 flex-1">
            Visually match patterns and learn properties of shapes in an interactive environment.
          </p>
          <Link to="/games/geometry" className="no-underline w-full">
            <button className="btn btn-success w-full">
              <Play size={18} fill="currentColor" /> Play Now
            </button>
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-secondary/20 rounded-xl text-secondary">
              <PieChart size={32} />
            </div>
            <span className="badge bg-secondary/20 text-secondary border-secondary">+50 XP</span>
          </div>
          <h4 className="text-xl font-semibold mb-2">Fraction Frenzy</h4>
          <p className="text-slate-300 text-sm mb-6 flex-1">
            Match the fractions to their visual pie chart representations quickly.
          </p>
          <Link to="/games/fractions" className="no-underline w-full">
            <button className="btn bg-secondary text-white w-full hover:bg-fuchsia-400">
              <Play size={18} fill="currentColor" /> Play Now
            </button>
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
              <Scale size={32} />
            </div>
            <span className="badge bg-blue-500/20 text-blue-400 border-blue-400">+15 XP / eq</span>
          </div>
          <h4 className="text-xl font-semibold mb-2">Equation Balancer</h4>
          <p className="text-slate-300 text-sm mb-6 flex-1">
            Drag and drop weights to balance the algebraic seesaw scales.
          </p>
          <Link to="/games/balancer" className="no-underline w-full">
            <button className="btn bg-blue-500 text-white w-full hover:bg-blue-400">
              <Play size={18} fill="currentColor" /> Play Now
            </button>
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-danger/20 rounded-xl text-danger">
              <Rocket size={32} />
            </div>
            <span className="badge badge-danger">Survival</span>
          </div>
          <h4 className="text-xl font-semibold mb-2">Multiplication Meteor</h4>
          <p className="text-slate-300 text-sm mb-6 flex-1">
            Type the answers fast to destroy the falling multiplication meteors!
          </p>
          <Link to="/games/meteor" className="no-underline w-full">
            <button className="btn btn-danger w-full">
              <Play size={18} fill="currentColor" /> Play Now
            </button>
          </Link>
        </div>

        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-warning/20 rounded-xl text-warning">
              <Puzzle size={32} />
            </div>
            <span className="badge badge-warning">+125 XP</span>
          </div>
          <h4 className="text-xl font-semibold mb-2">Pattern Puzzle</h4>
          <p className="text-slate-300 text-sm mb-6 flex-1">
            Deduce the logical rule behind the sequence of numbers to progress.
          </p>
          <Link to="/games/patterns" className="no-underline w-full">
            <button className="btn bg-warning text-yellow-900 w-full hover:bg-yellow-300">
              <Play size={18} fill="currentColor" /> Play Now
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;
