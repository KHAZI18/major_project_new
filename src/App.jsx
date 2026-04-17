import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ArithmeticGame from './pages/ArithmeticGame';
import GeometryGame from './pages/GeometryGame';
import FractionFrenzy from './pages/FractionFrenzy';
import EquationBalancer from './pages/EquationBalancer';
import MultiplicationMeteor from './pages/MultiplicationMeteor';
import PatternPuzzle from './pages/PatternPuzzle';
import { InstallPrompter } from './components/InstallPrompter';

function App() {
  return (
    <div className="flex flex-col min-h-screen max-w-6xl mx-auto p-4 w-full">
      <InstallPrompter />
      <div className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/games/arithmetic" element={<ArithmeticGame />} />
          <Route path="/games/geometry" element={<GeometryGame />} />
          <Route path="/games/fractions" element={<FractionFrenzy />} />
          <Route path="/games/balancer" element={<EquationBalancer />} />
          <Route path="/games/meteor" element={<MultiplicationMeteor />} />
          <Route path="/games/patterns" element={<PatternPuzzle />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
