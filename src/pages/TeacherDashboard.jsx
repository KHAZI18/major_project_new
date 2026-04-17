import { Link } from 'react-router-dom';
import { useGamification } from '../hooks/useGamification';
import { ChevronLeft, Users, Activity, Target } from 'lucide-react';

function TeacherDashboard() {
  // In a real app, this would fetch from a database.
  // For the PWA, we'll simulate a small class using the local user's data + mocks.
  const { progress } = useGamification();
  
  const mockStudents = [
    { id: 1, name: 'Current Local User', level: progress.level, xp: progress.xp, gamesPlayed: progress.gamesPlayed },
    { id: 2, name: 'Aarav K.', level: 4, xp: 1850, gamesPlayed: 24 },
    { id: 3, name: 'Diya M.', level: 3, xp: 1200, gamesPlayed: 18 },
    { id: 4, name: 'Vikram S.', level: 1, xp: 200, gamesPlayed: 4 },
  ];

  return (
    <div className="animate-fade-in-up">
      <header className="flex items-center justify-between mb-6">
        <Link to="/" className="btn btn-glass px-4 py-2">
          <ChevronLeft size={20} /> Back
        </Link>
        <h2 className="text-2xl font-semibold">Teacher Analytics</h2>
      </header>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl text-primary">
            <Users size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Total Students</p>
            <p className="text-2xl font-bold">24</p>
          </div>
        </div>
        
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="p-3 bg-success/20 rounded-xl text-success">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-slate-300 text-sm">Avg. Engagement</p>
            <p className="text-2xl font-bold">82%</p>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold">Student Progress Overview</h3>
          <button className="btn btn-outline px-3 py-1.5 text-sm">Export Data</button>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-300">
                <th className="p-3 font-medium">Student Name</th>
                <th className="p-3 font-medium">Level</th>
                <th className="p-3 font-medium">Total XP</th>
                <th className="p-3 font-medium">Games Played</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockStudents.map(student => (
                <tr key={student.id} className="border-b border-white/5">
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm">
                      {student.name.charAt(0)}
                    </div>
                    {student.name}
                  </td>
                  <td className="p-3"><span className="badge badge-primary">Lvl {student.level}</span></td>
                  <td className="p-3">{student.xp}</td>
                  <td className="p-3">{student.gamesPlayed}</td>
                  <td className="p-3">
                    {student.level >= 3 ? <span className="text-success">On Track</span> : <span className="text-warning">Needs Review</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;
