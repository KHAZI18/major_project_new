import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';

function Home() {
  return (
    <div className="animate-fade-in-up min-h-[80vh] flex flex-col justify-center items-center text-center">
      
      <div className="glass-panel p-10 max-w-2xl w-full">
        <div className="animate-float mb-5 flex justify-center">
          <GraduationCap size={64} className="text-primary" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-gradient">MathNinja</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8">
          An interactive, gamified offline mathematics platform designed to make learning fun and rewarding.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link to="/student" className="no-underline block">
            <button className="btn btn-primary w-full py-4 text-lg">
              <BookOpen size={24} />
              Start Learning (Student)
            </button>
          </Link>
          
          <Link to="/teacher" className="no-underline block">
            <button className="btn btn-glass w-full">
              <LayoutDashboard size={20} />
              Teacher Analytics
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
