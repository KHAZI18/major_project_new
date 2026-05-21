import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useLocation } from 'react-router-dom';
import SyncStatus from './SyncStatus';

/* ── Nav config ────────────────────────────────────────────────────────────── */
const STUDENT_LINKS = [
  { label: 'Home',        path: '/student',             icon: 'home' },
  { label: 'Leaderboard', path: '/student/leaderboard',  icon: 'trophy' },
  { label: 'Profile',     path: '/student/profile',      icon: 'user' },
];

const TEACHER_LINKS = [
  { label: 'Dashboard',  path: '/teacher', icon: 'grid' },
];

/* ── Tiny SVG icon set (avoids importing lucide for the navbar alone) ────── */
const ICONS = {
  home:    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>,
  trophy:  <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>,
  user:    <><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></>,
  grid:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  logout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  menu:    <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>,
  x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
};

function Icon({ name, size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round" className={className}>
      {ICONS[name]}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const { xp, level, coins, streak, avatar } = usePlayerStore();
  const { role, user, logout } = useAuthStore();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* scroll listener */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* close mobile menu on navigate */
  useEffect(() => setMobileOpen(false), [location.pathname]);

  /* close profile dropdown on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  /* XP math */
  const xpFor = (lvl) => Math.pow(lvl, 2) * 100;
  const xpPrev = xpFor(Math.max(1, level - 1));
  const progressPct = Math.min(100, Math.round(((xp - xpPrev) / (xpFor(level) - xpPrev)) * 100)) || 0;
  const xpToNext = xpFor(level) - xp;

  if (!role) return null;

  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const links = isStudent ? STUDENT_LINKS : TEACHER_LINKS;
  const firstName = user?.name?.split(' ')[0] || (isTeacher ? 'Teacher' : 'Explorer');
  const accentColor = isTeacher ? '#0d9488' : '#e65100';

  /* greeting */
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <>
      {/* ═══ MAIN BAR ═══════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -72 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        style={{
          backdropFilter: scrolled ? 'blur(16px) saturate(1.6)' : 'blur(8px) saturate(1.2)',
          WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.6)' : 'blur(8px) saturate(1.2)',
        }}
        className={`sticky top-0 z-50 transition-[background,box-shadow] duration-300
          ${scrolled
            ? 'bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.04)]'
            : 'bg-white/60 shadow-none'
          } border-b border-slate-200/60`}
      >
        <div className="max-w-7xl mx-auto h-[56px] sm:h-[60px] flex items-center justify-between px-4 sm:px-6 gap-4">

          {/* ── LEFT: Logo + Nav ──────────────────────────────────────── */}
          <div className="flex items-center gap-5 sm:gap-7 min-w-0">
            {/* Logo */}
            <Link to={isStudent ? '/student' : '/teacher'}
              className="flex items-center gap-2.5 no-underline shrink-0 group">
              <motion.div whileHover={{ rotate: -8 }} transition={{ type: 'spring', stiffness: 400 }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-base sm:text-lg shadow-sm"
                style={{
                  background: isTeacher
                    ? 'linear-gradient(145deg, #0d9488, #14b8a6)'
                    : 'linear-gradient(145deg, #f59e0b, #f97316)',
                  boxShadow: isTeacher
                    ? '0 2px 8px rgba(13,148,136,0.35)'
                    : '0 2px 8px rgba(249,115,22,0.35)',
                }}>
                🏘️
              </motion.div>
              <span className="font-display font-extrabold text-[15px] sm:text-[17px] text-slate-800 hidden sm:inline tracking-tight">
                Math Village
              </span>
            </Link>

            {/* Desktop separator */}
            <div className="hidden md:block w-px h-5 bg-slate-200/80" />

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {links.map(link => {
                const active = location.pathname === link.path;
                return (
                  <Link key={link.path} to={link.path} className="no-underline relative">
                    <div className={`flex items-center gap-1.5 px-3 py-[7px] rounded-lg text-[13px] font-semibold transition-colors duration-150
                      ${active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'}`}>
                      <Icon name={link.icon} size={15} className={active ? 'text-slate-700' : 'text-slate-400'} />
                      {link.label}
                    </div>
                    {active && (
                      <motion.div layoutId="nav-underline" transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute -bottom-[13px] sm:-bottom-[14px] left-2 right-2 h-[2px] rounded-full"
                        style={{ background: accentColor }} />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── RIGHT: Stats + Profile ────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Student inline stats (lg only) */}
            {isStudent && (
              <div className="hidden lg:flex items-center gap-2">
                {streak > 0 && (
                  <div className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-amber-600">
                    <span className="text-xs">🔥</span>
                    <span className="text-[12px] font-bold tabular-nums">{streak}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-600">
                  <span className="text-xs">🪙</span>
                  <span className="text-[12px] font-bold tabular-nums">{coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 h-8 pl-1.5 pr-3 rounded-lg bg-slate-50 border border-slate-200/60">
                  <div className="w-5 h-5 rounded-md text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: 'linear-gradient(145deg, #f59e0b, #f97316)' }}>
                    {level}
                  </div>
                  <div className="flex flex-col gap-[2px] min-w-[52px]">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-semibold text-slate-400 uppercase">XP</span>
                      <span className="text-[9px] font-bold text-slate-500 tabular-nums">{progressPct}%</span>
                    </div>
                    <div className="h-[4px] w-full bg-slate-200/80 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.8, ease: 'circOut' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher badge (lg) */}
            {isTeacher && (
              <div className="hidden lg:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-teal-50 border border-teal-200/60 text-teal-700 text-[12px] font-semibold">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Live Dashboard
              </div>
            )}

            {/* Sync */}
            <SyncStatus />

            {/* ── Profile dropdown ─────────────────────────────────────── */}
            <div className="relative" ref={profileRef}>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setProfileOpen(v => !v)}
                className={`flex items-center gap-2 h-9 sm:h-10 pl-[5px] pr-2 sm:pr-3 rounded-xl border transition-all duration-150 cursor-pointer
                  ${profileOpen
                    ? 'bg-slate-100 border-slate-200 shadow-sm'
                    : 'bg-white/70 border-slate-200/70 hover:bg-slate-50 hover:border-slate-200'}`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base shrink-0"
                  style={{
                    background: isTeacher
                      ? 'linear-gradient(145deg, #ccfbf1, #99f6e4)'
                      : 'linear-gradient(145deg, #fef3c7, #fde68a)',
                  }}>
                  {isStudent ? (avatar || '🧒') : (user?.avatar || '👩‍🏫')}
                </div>
                <div className="hidden sm:block text-left min-w-0 max-w-[80px]">
                  <p className="text-[11px] font-medium text-slate-400 leading-none truncate">
                    {isTeacher ? 'Teacher' : `Level ${level}`}
                  </p>
                  <p className="text-[13px] font-semibold text-slate-700 leading-tight truncate">
                    {firstName}
                  </p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" className="text-slate-400 shrink-0 ml-0.5 hidden sm:block">
                  <polyline points="6 9 12 14 18 9"/>
                </svg>
              </motion.button>

              {/* Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.97 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.04)] overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{
                            background: isTeacher
                              ? 'linear-gradient(145deg, #ccfbf1, #99f6e4)'
                              : 'linear-gradient(145deg, #fef3c7, #fde68a)',
                          }}>
                          {isStudent ? (avatar || '🧒') : (user?.avatar || '👩‍🏫')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {user?.name || firstName}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {isTeacher ? 'Teacher Account' : `Grade ${user?.grade || '—'} · Level ${level}`}
                          </p>
                        </div>
                      </div>

                      {/* Student XP bar in dropdown */}
                      {isStudent && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                              Level {level} → {level + 1}
                            </span>
                            <span className="text-[10px] font-bold tabular-nums" style={{ color: accentColor }}>
                              {xpToNext} XP left
                            </span>
                          </div>
                          <div className="h-[5px] w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progressPct}%`,
                                background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                              }} />
                          </div>
                          <div className="flex justify-between mt-2 gap-2">
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                              <span>⭐</span> <span className="font-bold text-slate-700 tabular-nums">{xp.toLocaleString()}</span> XP
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                              <span>🪙</span> <span className="font-bold text-slate-700 tabular-nums">{coins.toLocaleString()}</span>
                            </div>
                            {streak > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                                🔥 {streak}d
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Links */}
                    <div className="py-1.5 px-1.5">
                      {isStudent && (
                        <Link to="/student/profile" className="no-underline"
                          onClick={() => setProfileOpen(false)}>
                          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-medium transition-colors">
                            <Icon name="user" size={15} className="text-slate-400" />
                            View Profile
                          </div>
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="px-1.5 pb-2 border-t border-slate-100 pt-1.5">
                      <button onClick={() => { setProfileOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium transition-colors text-left">
                        <Icon name="logout" size={15} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Mobile hamburger ──────────────────────────────────────── */}
            {links.length > 1 && (
              <button onClick={() => setMobileOpen(v => !v)}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu">
                <Icon name={mobileOpen ? 'x' : 'menu'} size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Accent line */}
        <div className="h-[2px]" style={{
          background: isTeacher
            ? 'linear-gradient(90deg, transparent 5%, #14b8a6 50%, transparent 95%)'
            : `linear-gradient(90deg, transparent 0%, #f59e0b ${progressPct * 0.8}%, #f97316 ${progressPct}%, #e2e8f0 ${progressPct}%, #e2e8f0 100%)`,
          opacity: scrolled ? 0 : 0.7,
          transition: 'opacity 0.3s',
        }} />
      </motion.header>

      {/* ═══ MOBILE SHEET ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)} />

            {/* Sheet */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="md:hidden fixed top-[58px] left-3 right-3 z-50 bg-white rounded-2xl border border-slate-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden"
            >
              {/* Nav items */}
              <div className="p-2">
                {links.map(link => {
                  const active = location.pathname === link.path;
                  return (
                    <Link key={link.path} to={link.path} className="no-underline">
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors
                        ${active
                          ? 'bg-slate-100 text-slate-900'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                        <Icon name={link.icon} size={17} className={active ? 'text-slate-700' : 'text-slate-400'} />
                        {link.label}
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Student stats card in mobile */}
              {isStudent && (
                <div className="mx-2 mb-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                      style={{ background: 'linear-gradient(145deg, #fef3c7, #fde68a)' }}>
                      {avatar || '🧒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-700 truncate">{user?.name || 'Explorer'}</p>
                      <p className="text-[11px] text-slate-400 font-medium">Level {level} · Grade {user?.grade || '—'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Progress</span>
                    <span className="text-[10px] font-bold text-orange-500 tabular-nums">{progressPct}%</span>
                  </div>
                  <div className="h-[5px] w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: `${progressPct}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                      }} />
                  </div>
                  <div className="flex gap-3 mt-2.5">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      ⭐ <span className="font-bold text-slate-700 tabular-nums">{xp.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      🪙 <span className="font-bold text-slate-700 tabular-nums">{coins.toLocaleString()}</span>
                    </div>
                    {streak > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                        🔥 {streak}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Greeting banner */}
              <div className="mx-2 mb-2 px-4 py-2.5 rounded-xl text-[12px] text-slate-400 font-medium border-t border-slate-100/80">
                {greeting}, <span className="text-slate-600 font-semibold">{firstName}</span> 👋
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
