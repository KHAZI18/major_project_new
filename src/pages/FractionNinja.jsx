import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { normalizeGrade } from '../lib/gradeUtils';

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function simplifyFraction(numer, denom) {
  const d = gcd(numer, denom);
  return { numer: numer / d, denom: denom / d };
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildDenominators(grade) {
  if (grade <= 2) return [2, 3, 4, 5, 6];
  if (grade === 3) return [2, 3, 4, 5, 6, 8];
  if (grade === 4) return [2, 3, 4, 5, 6, 8, 10];
  return [2, 3, 4, 5, 6, 8, 10, 12];
}

function generateQuestion(grade) {
  const denoms = buildDenominators(grade);
  const denom = randomFrom(denoms);
  const numer = Math.max(1, Math.floor(Math.random() * (denom - 1)) + 1);
  const simple = simplifyFraction(numer, denom);

  const types = ['build', 'identify', 'compare'];
  const type = randomFrom(types);

  if (type === 'compare') {
    const useEquivalent = Math.random() > 0.45;
    let left = { numer, denom };
    let right;
    let relation;

    if (useEquivalent) {
      const factorChoices = [2, 3];
      const factor = randomFrom(factorChoices);
      right = { numer: numer * factor, denom: denom * factor };
      relation = '=';
    } else {
      const offset = Math.random() > 0.5 ? 1 : -1;
      const altered = Math.min(denom - 1, Math.max(1, numer + offset));
      right = { numer: altered, denom };
      relation = altered > numer ? '<' : '>';
      if (numer === altered) relation = '=';
    }

    return {
      type,
      target: { numer, denom },
      left,
      right,
      relation,
      simple,
      prompt: 'Compare the fractions and choose the correct symbol.',
    };
  }

  if (type === 'identify') {
    return {
      type,
      target: { numer, denom },
      simple,
      prompt: 'How many equal parts make one whole?',
    };
  }

  return {
    type: 'build',
    target: { numer, denom },
    simple,
    prompt: 'Shade the model to represent the fraction.',
  };
}

function FractionTiles({ denominator, selected, onToggle, disabled }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}>
      {Array.from({ length: denominator }).map((_, idx) => {
        const active = selected.has(idx);
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onToggle(idx)}
            disabled={disabled}
            className={`h-14 sm:h-16 rounded-xl border-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-violet-400 ${
              active
                ? 'bg-violet-500 text-white border-violet-600 shadow-md scale-[1.02]'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
          >
            {active ? '✓' : idx + 1}
          </button>
        );
      })}
    </div>
  );
}

function ScoreCard({ score, streak, round, totalRounds }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="rounded-2xl bg-violet-50 border border-violet-100 p-3 text-center">
        <p className="text-[11px] uppercase tracking-widest text-violet-500 font-bold">Round</p>
        <p className="text-xl font-black text-violet-700">{round}/{totalRounds}</p>
      </div>
      <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-center">
        <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-bold">Score</p>
        <p className="text-xl font-black text-emerald-700">{score}</p>
      </div>
      <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3 text-center">
        <p className="text-[11px] uppercase tracking-widest text-amber-600 font-bold">Streak</p>
        <p className="text-xl font-black text-amber-700">{streak}x</p>
      </div>
      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3 text-center">
        <p className="text-[11px] uppercase tracking-widest text-indigo-600 font-bold">Mode</p>
        <p className="text-base font-black text-indigo-700">Concept</p>
      </div>
    </div>
  );
}

export default function FractionNinja() {
  const { user } = useAuthStore();
  const { addXP } = usePlayerStore();

  const grade = normalizeGrade(user?.grade);
  const totalRounds = grade <= 2 ? 8 : grade === 3 ? 10 : grade === 4 ? 12 : 14;

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctRounds, setCorrectRounds] = useState(0);
  const [gameState, setGameState] = useState('playing');
  const [question, setQuestion] = useState(() => generateQuestion(grade));

  const [selectedParts, setSelectedParts] = useState(new Set());
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [inputDenominator, setInputDenominator] = useState('');
  const [feedback, setFeedback] = useState(null);

  const target = question.target;
  const progressPercent = useMemo(() => {
    if (!target?.denom) return 0;
    return Math.max(0, Math.min(100, (selectedParts.size / target.denom) * 100));
  }, [selectedParts, target]);

  const resetInteraction = () => {
    setSelectedParts(new Set());
    setSelectedSymbol('');
    setInputDenominator('');
    setFeedback(null);
  };

  const moveNext = (nextScore, nextCorrect) => {
    if (round >= totalRounds) {
      setGameState('won');
      addXP(
        nextScore,
        'Fraction Ninja',
        nextScore,
        Math.round((nextCorrect / totalRounds) * 100),
        'Fractions',
      );
      return;
    }

    setRound((r) => r + 1);
    setQuestion(generateQuestion(grade));
    resetInteraction();
  };

  const checkAnswer = () => {
    if (gameState !== 'playing' || feedback) return;

    let isCorrect = false;
    let learningText = '';

    if (question.type === 'build') {
      isCorrect = selectedParts.size === target.numer;
      learningText = isCorrect
        ? `Correct! ${target.numer}/${target.denom} means ${target.numer} selected out of ${target.denom} equal parts.`
        : `Try again: numerator is shaded parts. You need ${target.numer} selected parts.`;
    }

    if (question.type === 'identify') {
      isCorrect = Number(inputDenominator) === target.denom;
      learningText = isCorrect
        ? `Correct! Denominator ${target.denom} tells total equal parts in one whole.`
        : `Not yet. Count all equal pieces. Denominator is the total parts.`;
    }

    if (question.type === 'compare') {
      isCorrect = selectedSymbol === question.relation;
      learningText = isCorrect
        ? `Great compare! ${question.left.numer}/${question.left.denom} ${question.relation} ${question.right.numer}/${question.right.denom}`
        : 'Try again: compare sizes or simplify to compare.';
    }

    if (isCorrect) {
      const points = 20 + streak * 4;
      const nextScore = score + points;
      const nextCorrect = correctRounds + 1;
      setScore(nextScore);
      setStreak((s) => s + 1);
      setCorrectRounds(nextCorrect);
      setFeedback({ correct: true, text: `${learningText} +${points} points` });
      setTimeout(() => moveNext(nextScore, nextCorrect), 900);
      return;
    }

    setStreak(0);
    setFeedback({ correct: false, text: learningText });
    setTimeout(() => setFeedback(null), 1200);
  };

  const restart = () => {
    setRound(1);
    setScore(0);
    setStreak(0);
    setCorrectRounds(0);
    setGameState('playing');
    setQuestion(generateQuestion(grade));
    resetInteraction();
  };

  const equivalentText = target
    ? `${target.numer}/${target.denom} simplifies to ${question.simple.numer}/${question.simple.denom}`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-fuchsia-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link to="/student" className="btn btn-glass btn-sm">← Back</Link>
          <h1 className="font-display text-lg sm:text-2xl font-black text-violet-700">Fraction Ninja: Learning Arena</h1>
          <div className="badge badge-success text-xs">Grade {grade}</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-6 shadow-[0_18px_45px_rgba(30,41,59,0.08)]">
            <ScoreCard score={score} streak={streak} round={round} totalRounds={totalRounds} />

            {gameState === 'playing' && (
              <>
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] font-bold text-violet-500">Concept Challenge</p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-black text-slate-800">{question.prompt}</h2>
                </div>

                {question.type === 'build' && (
                  <div className="mt-5 space-y-4">
                    <p className="text-slate-700 font-semibold">Build <span className="text-violet-700">{target.numer}/{target.denom}</span> using the bar model.</p>
                    <FractionTiles
                      denominator={target.denom}
                      selected={selectedParts}
                      disabled={Boolean(feedback)}
                      onToggle={(idx) => {
                        if (feedback) return;
                        setSelectedParts((prev) => {
                          const next = new Set(prev);
                          if (next.has(idx)) next.delete(idx);
                          else next.add(idx);
                          return next;
                        });
                      }}
                    />
                    <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ type: 'spring', stiffness: 130, damping: 20 }}
                      />
                    </div>
                  </div>
                )}

                {question.type === 'identify' && (
                  <div className="mt-5 space-y-4">
                    <p className="text-slate-700 font-semibold">Fraction shown: <span className="text-violet-700">{target.numer}/{target.denom}</span></p>
                    <label className="block text-sm font-bold text-slate-700">Enter denominator (total equal parts)</label>
                    <input
                      type="number"
                      min="2"
                      className="input input-bordered w-full max-w-xs"
                      value={inputDenominator}
                      onChange={(e) => setInputDenominator(e.target.value)}
                      disabled={Boolean(feedback)}
                    />
                  </div>
                )}

                {question.type === 'compare' && (
                  <div className="mt-5 space-y-4">
                    <p className="text-lg font-black text-slate-800">
                      {question.left.numer}/{question.left.denom} ? {question.right.numer}/{question.right.denom}
                    </p>
                    <div className="flex gap-3 flex-wrap">
                      {['<', '=', '>'].map((symbol) => (
                        <button
                          key={symbol}
                          type="button"
                          onClick={() => setSelectedSymbol(symbol)}
                          disabled={Boolean(feedback)}
                          className={`btn ${selectedSymbol === symbol ? 'btn-primary' : 'btn-glass'}`}
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {feedback && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`mt-5 rounded-xl px-4 py-3 text-sm sm:text-base font-bold border ${
                        feedback.correct
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border-rose-200'
                      }`}
                    >
                      {feedback.text}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={checkAnswer} disabled={Boolean(feedback)} className="btn btn-primary flex-1">
                    ✅ Check Answer
                  </button>
                  <button type="button" onClick={resetInteraction} disabled={Boolean(feedback)} className="btn btn-glass flex-1">
                    Reset
                  </button>
                </div>
              </>
            )}

            {gameState === 'won' && (
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                <div className="text-5xl mb-3">🏆</div>
                <h3 className="text-2xl sm:text-3xl font-black text-violet-700 mb-2">Fraction Mastered</h3>
                <p className="text-slate-700">Final Score: <strong>{score}</strong></p>
                <p className="text-slate-700 mb-1">Accuracy: <strong>{Math.round((correctRounds / totalRounds) * 100)}%</strong></p>
                <p className="text-slate-700 mb-5">You practiced building, identifying, and comparing fractions.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={restart} className="btn btn-primary">🔄 Play Again</button>
                  <Link to="/student" className="btn btn-glass no-underline">🏘️ Dashboard</Link>
                </div>
              </motion.div>
            )}
          </div>

          <div className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-6 shadow-[0_18px_45px_rgba(30,41,59,0.08)] h-fit">
            <h3 className="text-lg font-black text-slate-800 mb-3">Fraction Coach</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="font-bold text-slate-900">Numerator</p>
                <p>How many parts are selected or counted.</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="font-bold text-slate-900">Denominator</p>
                <p>Total equal parts in one complete whole.</p>
              </div>
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                <p className="font-bold text-indigo-800">Equivalent Fraction Tip</p>
                <p className="mt-1">{equivalentText}</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                <p className="font-bold text-amber-800">How to Think</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>First count all equal pieces → denominator.</li>
                  <li>Then count selected pieces → numerator.</li>
                  <li>For compare: simplify or use same denominator.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
