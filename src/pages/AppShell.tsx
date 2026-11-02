import { NavLink, Route, Routes, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, LayoutGrid, X, LogOut, FolderOpen, Wrench } from 'lucide-react';
import { TOOLS, USER } from '../data.js';
import { auth, signOut } from '../firebase';
import Dashboard from './Dashboard';
import Settings from './Settings';
import * as T from './Tools';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { ToolsDrawer } from '../components/ToolsDrawer';
import { voiceService } from '../services/voiceService';
import { presenceTracker } from '../services/presenceService';
import { syncMemoriesFromFirestore } from '../services/geminiService';
import { COMMUNITY_LINKS } from '../data/communityLinks';

const LINKS = [
  { to: '/app', label: '🏠 Home Studio', end: true },
  { to: '/app/formulas', label: '📐 Math Lab (LaTeX)' },
  { to: '/app/notes', label: '📚 PDF Library & Folders' },
  { to: '/app/voice', label: '💃 3D Voice Mentor' },
  { to: '/app/mock', label: '🎯 Mock Test AI' },
  { to: '/app/doubt', label: '💬 AI Doubt Solver' },
  { to: '/app/scanner', label: '📸 Image-to-Solution AI' },
  { to: '/app/focus', label: '⏳ Focus Study Room' },
  { to: '/app/telegram', label: '✈️ Telegram AI Hub' },
  { to: '/app/streaks', label: '🔥 Verified Streaks' },
  { to: '/app/mistakes', label: '🧠 Mistake Analyzer' },
  { to: '/app/flashcards', label: '🗂️ Flashcards' },
  { to: '/app/mcq', label: '📖 Question Bank' },
  { to: '/app/syllabus', label: '🗺️ Sem 4 Roadmap' },
  { to: '/app/settings', label: '⚙️ Settings & Language' },
];

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const [toolsDrawerOpen, setToolsDrawerOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const currentName = localStorage.getItem('currentUserName') || USER.name;

  // Start real-time presence heartbeat for live admin monitoring and sync account memories
  useEffect(() => {
    presenceTracker.startHeartbeat();
    const uid = localStorage.getItem('currentUserUid');
    if (uid && uid !== 'default') {
      syncMemoriesFromFirestore(uid).catch(() => {});
    }
    const unsub = auth.onAuthStateChanged((u) => {
      if (u?.uid) {
        syncMemoriesFromFirestore(u.uid).catch(() => {});
      }
    });
    return () => unsub();
  }, []);

  // Listen for 'open-tools-drawer' event from any component
  useEffect(() => {
    const handleOpen = () => setToolsDrawerOpen(true);
    window.addEventListener('open-tools-drawer', handleOpen);
    return () => window.removeEventListener('open-tools-drawer', handleOpen);
  }, []);

  // Automatically stop any active Voice AI synthesis or mic recognition when switching tools/routes
  useEffect(() => {
    if (location.pathname !== '/app/voice') {
      voiceService.stop();
      voiceService.stopRecognition();
    }
    setOpen(false);
  }, [location.pathname]);

  async function logout() {
    voiceService.stop();
    voiceService.stopRecognition();
    sessionStorage.removeItem('ss-auth');
    localStorage.removeItem('ss-auth');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserUid');
    localStorage.removeItem('currentUserEmail');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Signout note:', e);
    }
    nav('/login');
  }

  return (
    <div className="app-shell">
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 55,
          }}
        />
      )}
      <aside
        className={`sidebar ${open ? 'open' : ''}`}
        style={{
          paddingBottom: open ? 110 : 28,
        }}
      >
        <div
          className="brand"
          style={{ marginBottom: 12, justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="" />
            <span>Study Stranger</span>
          </div>
          {open && (
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              style={{
                background: '#fff',
                border: '1.5px solid var(--ink)',
                borderRadius: 10,
                width: 32,
                height: 32,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Student Account Strip + Visible Top Log Out Button for Mobile & Desktop */}
        <div
          style={{
            padding: '10px 12px',
            marginBottom: 12,
            borderRadius: 16,
            background: '#fff',
            border: '1.5px solid var(--ink)',
            boxShadow: '2px 2px 0 var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 99,
                background: '#16a34a',
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: 'var(--ink)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentName}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>
                WBCHSE Sem 3
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              border: '1.5px solid var(--ink)',
              borderRadius: 10,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Log Out of Account"
          >
            <LogOut size={12} />
            <span>Log Out</span>
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <PWAInstallButton />
        </div>

        {/* Primary Studio Tools Side Launcher Button */}
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setToolsDrawerOpen(true);
          }}
          className="side-link"
          style={{
            background: 'var(--yellow)',
            border: '2px solid var(--ink)',
            boxShadow: '3px 3px 0 var(--ink)',
            marginBottom: 10,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left',
            padding: '10px 14px',
            borderRadius: 14,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span>🛠️</span>
            <span>All Studio Tools</span>
          </span>
          <span
            style={{
              fontSize: 10,
              background: 'var(--ink)',
              color: '#fff',
              padding: '2px 7px',
              borderRadius: 6,
              fontWeight: 900,
            }}
          >
            24
          </span>
        </button>

        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </NavLink>
        ))}

        {/* Official Community Hub Links */}
        <div style={{ marginTop: 14, marginBottom: 8, padding: '0 4px' }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--muted)',
              marginBottom: 6,
            }}
          >
            Official Community
          </div>

          <a
            href={COMMUNITY_LINKS.whatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="side-link"
            style={{
              background: '#ecfdf5',
              color: '#047857',
              border: '1.5px solid #a7f3d0',
              fontWeight: 800,
              fontSize: 12,
              marginBottom: 5,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            title="Join Official WBCHSE WhatsApp Group"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span>💬</span>
              <span>WhatsApp Group</span>
            </span>
            <span style={{ fontSize: 10, background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: 6, fontWeight: 900 }}>
              JOIN
            </span>
          </a>

          <a
            href={COMMUNITY_LINKS.telegramChannel}
            target="_blank"
            rel="noopener noreferrer"
            className="side-link"
            style={{
              background: '#f0f9ff',
              color: '#0369a1',
              border: '1.5px solid #bae6fd',
              fontWeight: 800,
              fontSize: 12,
              marginBottom: 5,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            title="Join Official Study Stranger Telegram Channel"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span>✈️</span>
              <span>Telegram Channel</span>
            </span>
            <span style={{ fontSize: 10, background: '#0284c7', color: '#fff', padding: '1px 6px', borderRadius: 6, fontWeight: 900 }}>
              JOIN
            </span>
          </a>
        </div>

        {/* Bottom Prominent Log Out Button (Always visible even when scrolling to bottom of Tools Drawer) */}
        <div style={{ marginTop: 12, paddingBottom: 24 }}>
          <button
            type="button"
            onClick={logout}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 14,
              background: '#fff1f2',
              color: '#be123c',
              border: '2px solid var(--ink)',
              boxShadow: '3px 3px 0 var(--ink)',
              fontWeight: 800,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            <span>Log Out of Studio</span>
          </button>
        </div>
      </aside>

      <div className="app-main-wrap">
        {/* Sticky Mobile Header Bar with Tools, PDF Library, Settings & Log Out */}
        <div
          className="mobile-bar"
          style={{
            padding: '8px 12px',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(247, 246, 239, 0.96)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1.5px solid var(--ink)',
            width: '100%',
            boxSizing: 'border-box',
            position: 'sticky',
            top: 0,
            zIndex: 35,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* 3-Icon Hamburger Menu Button */}
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              style={{
                background: open ? 'var(--yellow)' : '#fff',
                border: '1.5px solid var(--ink)',
                borderRadius: 11,
                padding: '6px 9px',
                fontSize: 12,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '1.5px 1.5px 0 var(--ink)',
                cursor: 'pointer',
              }}
              title="Menu Navigation (মেনু)"
            >
              <Menu size={16} strokeWidth={2.5} />
              <span>Menu</span>
            </button>
            <NavLink
              to="/app"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <img src="/logo.svg" alt="Study Stranger" style={{ width: 22, height: 22 }} />
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-serif)' }}>
                Study Stranger
              </span>
            </NavLink>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <NavLink
              to="/app/notes"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
                color: 'var(--ink)',
                background: '#FEF08A',
                border: '1.5px solid var(--ink)',
                borderRadius: 12,
                padding: '5px 8px',
                fontSize: 11,
                fontWeight: 800,
              }}
              title="Open PDF Library"
            >
              <FolderOpen size={12} />
              <span>PDFs</span>
            </NavLink>

            <NavLink
              to="/app/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                textDecoration: 'none',
                color: 'inherit',
                background: '#fff',
                border: '1.5px solid var(--ink)',
                borderRadius: 12,
                padding: '5px 8px',
              }}
              title="Settings & Language"
            >
              <div style={{ width: 6, height: 6, borderRadius: 99, background: '#22c55e' }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  maxWidth: 68,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {currentName}
              </span>
            </NavLink>

            <button
              type="button"
              onClick={logout}
              aria-label="Log Out"
              title="Log Out"
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                border: '1.5px solid var(--ink)',
                borderRadius: 10,
                padding: '5px 7px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>

        <main className="main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="board" element={<Navigate to="/app/voice" replace />} />
            <Route path="mock" element={<T.MockTest />} />
            <Route path="doubt" element={<T.Doubt />} />
            <Route path="voice" element={<T.Voice />} />
            <Route path="flashcards" element={<T.Flash />} />
            <Route path="notes" element={<T.Notes />} />
            <Route path="pdf-vault" element={<T.Notes />} />
            <Route path="mindmap" element={<T.Mind />} />
            <Route path="mcq" element={<T.McqBank />} />
            <Route path="blitz" element={<T.Blitz />} />
            <Route path="focus" element={<T.Focus />} />
            <Route path="notices" element={<T.Notices />} />
            <Route path="scanner" element={<T.Scanner />} />
            <Route path="formulas" element={<T.Formulas />} />
            <Route path="mistakes" element={<T.Mistakes />} />
            <Route path="streaks" element={<T.Streaks />} />
            <Route path="syllabus" element={<T.Syllabus />} />
            <Route path="memory" element={<T.Memory />} />
            <Route path="lab" element={<T.Lab />} />
            <Route path="autopsy" element={<T.Autopsy />} />
            <Route path="voice-quiz" element={<T.VoiceQuiz />} />
            <Route path="duel" element={<T.Duel />} />
            <Route path="model-paper" element={<T.ModelPaper />} />
            <Route path="diary" element={<T.Diary />} />
            <Route path="telegram" element={<T.Telegram />} />
            <Route path="vigilance" element={<T.Vigilance />} />
            <Route path="mentors" element={<T.Mentors />} />
            <Route path="tools" element={<T.ToolsDirectory />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Floating Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav">
          <NavLink
            to="/app"
            end
            onClick={() => setOpen(false)}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">🏠</span>
            <span className="tab-label">Home</span>
          </NavLink>
          <NavLink
            to="/app/notes"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">📚</span>
            <span className="tab-label">PDFs</span>
          </NavLink>
          <NavLink
            to="/app/voice"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">💃</span>
            <span className="tab-label">3D AI</span>
          </NavLink>
          <NavLink
            to="/app/mock"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">🎯</span>
            <span className="tab-label">Mock</span>
          </NavLink>
          <button
            type="button"
            onClick={() => {
              setToolsDrawerOpen(false);
              setOpen((v) => !v);
            }}
            className={`bottom-tab ${open ? 'active' : ''}`}
            aria-label="Open 3-Line Navigation Menu"
            title="3-Line Menu (মেনু)"
          >
            <span
              className="tab-icon"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={18} />
            </span>
            <span className="tab-label">Menu</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setToolsDrawerOpen(true);
            }}
            className={`bottom-tab ${toolsDrawerOpen ? 'active' : ''}`}
            aria-label="Open Tools Directory"
          >
            <span
              className="tab-icon"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LayoutGrid size={18} />
            </span>
            <span className="tab-label">Tools</span>
          </button>
          <NavLink
            to="/app/settings"
            onClick={() => setOpen(false)}
            className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">⚙️</span>
            <span className="tab-label">Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Slide-out Tools Drawer for all 24 tools */}
      <ToolsDrawer isOpen={toolsDrawerOpen} onClose={() => setToolsDrawerOpen(false)} />
    </div>
  );
}
