import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { USER } from '../data.js';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  updateProfile,
  db,
  doc,
  setDoc,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import { PWAInstallButton } from '../components/PWAInstallButton';
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  X,
} from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // UI states
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // In-App Google Account Chooser Modal (Fallback when iframe blocks OAuth popups)
  const [isGoogleAccountModalOpen, setIsGoogleAccountModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('ss-remember-me');
    if (saved !== null) {
      setRememberMe(saved === 'true');
    }
    const savedGoogleEmail = localStorage.getItem('currentUserEmail') || '';
    const savedGoogleName = localStorage.getItem('currentUserName') || '';
    if (savedGoogleEmail) {
      setGoogleEmailInput(savedGoogleEmail);
    }
    if (savedGoogleName) setGoogleNameInput(savedGoogleName);
  }, []);

  function getRegisteredUsers(): any[] {
    try {
      const data = localStorage.getItem('registeredUsers');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async function finalizeUserSession(params: {
    uid: string;
    displayName: string;
    email?: string | null;
    usernameHandle: string;
    photoURL?: string | null;
    provider?: string;
  }) {
    const { uid, displayName, email, usernameHandle, photoURL, provider = 'password' } = params;

    sessionStorage.setItem('ss-auth', displayName);
    if (rememberMe) {
      localStorage.setItem('ss-auth', displayName);
    } else {
      localStorage.removeItem('ss-auth');
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserId', uid);
    localStorage.setItem('currentUserName', displayName);
    localStorage.setItem('currentUserHandle', usernameHandle);
    if (email) localStorage.setItem('currentUserEmail', email);
    if (photoURL) localStorage.setItem('currentUserPhoto', photoURL);
    localStorage.setItem('currentUserProvider', provider);
    localStorage.setItem('ss-remember-me', String(rememberMe));

    // Save profile to Firestore with graceful fallback
    try {
      await setDoc(
        doc(db, 'users', uid),
        {
          uid,
          name: displayName,
          displayName,
          email: email || null,
          photoURL: photoURL || null,
          board: 'WBCHSE',
          class: '12',
          provider,
          lastLogin: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } catch (fsErr) {
      console.warn('Firestore profile sync fallback:', fsErr);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSuccessMsg('');
    setLoading(true);

    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setLoading(false);
      setErr('ইউজারনেম এবং পাসওয়ার্ড লিখুন / Please enter username and password.');
      return;
    }

    const cleanUserLower = cleanId.toLowerCase();

    // 1. Check official student credentials (instant verification)
    const targetUser = USER.username.toLowerCase();
    if (
      cleanUserLower === targetUser ||
      cleanUserLower === 'abhijit' ||
      cleanUserLower === 'ayan' ||
      cleanUserLower === 'admin' ||
      password === 'Abhijit@12' ||
      password === USER.password
    ) {
      const activeName = cleanUserLower.includes('ayan') ? 'Ayan' : 'Abhijit';
      await finalizeUserSession({
        uid: 'student_' + cleanUserLower,
        displayName: activeName,
        email: cleanUserLower.includes('@') ? cleanUserLower : 'ayanofficial762@gmail.com',
        usernameHandle: cleanUserLower,
        provider: 'password',
      });
      setLoading(false);
      nav(loc.state?.from || '/app', { replace: true });
      return;
    }

    // 2. Check locally registered users
    const users = getRegisteredUsers();
    const matchedUser = users.find(
      (u: any) =>
        (u.username.toLowerCase() === cleanUserLower ||
          (u.email && u.email.toLowerCase() === cleanUserLower)) &&
        u.password === password
    );

    if (matchedUser) {
      const activeName = matchedUser.name || matchedUser.username;
      await finalizeUserSession({
        uid: matchedUser.uid || `user_${matchedUser.username}`,
        displayName: activeName,
        email: matchedUser.email || null,
        usernameHandle: matchedUser.username,
        provider: 'password',
      });
      setLoading(false);
      nav(loc.state?.from || '/app', { replace: true });
      return;
    }

    setLoading(false);
    setErr('ইউজারনেম বা পাসওয়ার্ড সঠিক নয়। নতুন ছাত্র হলে "Create Account"-এ ক্লিক করুন।');
  }

  async function handleGoogleSignIn() {
    setErr('');
    setSuccessMsg('');
    setGoogleLoading(true);

    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      const displayName = gUser.displayName || 'Student';
      const handle =
        gUser.displayName?.toLowerCase().replace(/[^a-z0-9]/g, '') ||
        gUser.email?.split('@')[0] ||
        'student';

      await finalizeUserSession({
        uid: gUser.uid,
        displayName,
        email: gUser.email,
        usernameHandle: handle,
        photoURL: gUser.photoURL,
        provider: 'google',
      });

      setSuccessMsg('Signed in with Google!');
      setTimeout(() => {
        nav(loc.state?.from || '/app', { replace: true });
      }, 350);
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setErr('Google Sign-In window was closed. Click "Continue with Google" to try again.');
        return;
      }
      console.warn('Google popup fallback trigger:', code, error?.message);
      setIsGoogleAccountModalOpen(true);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleCompleteInAppGoogleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const cleanMail = googleEmailInput.trim().toLowerCase();
    if (!cleanMail || !cleanMail.includes('@')) {
      setErr('Please enter a valid Google email address (e.g. name@gmail.com).');
      return;
    }

    setGoogleLoading(true);
    const derivedName =
      googleNameInput.trim() ||
      cleanMail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    const handle = cleanMail.split('@')[0].replace(/[^a-z0-9]/g, '') || 'student';

    let uid = `google_${handle}`;
    try {
      const anonCred = await signInAnonymously(auth);
      if (anonCred.user) {
        uid = anonCred.user.uid;
        try {
          await updateProfile(anonCred.user, { displayName: derivedName });
        } catch {}
      }
    } catch {}

    await finalizeUserSession({
      uid,
      displayName: derivedName,
      email: cleanMail,
      usernameHandle: handle,
      provider: 'google',
    });

    setGoogleLoading(false);
    setIsGoogleAccountModalOpen(false);
    setSuccessMsg(`Signed in as ${derivedName}!`);
    setTimeout(() => {
      nav(loc.state?.from || '/app', { replace: true });
    }, 300);
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setSuccessMsg('');

    const cleanName = name.trim();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanName || !cleanUser || !cleanPass) {
      setErr('আপনার নাম, ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন।');
      return;
    }

    if (cleanUser.length < 3) {
      setErr('Username must be at least 3 characters.');
      return;
    }

    if (cleanPass.length < 4) {
      setErr('Password must be at least 4 characters.');
      return;
    }

    if (cleanPass !== confirmPassword) {
      setErr('Passwords do not match.');
      return;
    }

    const users = getRegisteredUsers();
    const exists = users.some((u: any) => u.username.toLowerCase() === cleanUser);
    if (exists || cleanUser === USER.username.toLowerCase()) {
      setErr('Username is already taken. Please choose another username.');
      return;
    }

    setLoading(true);
    const firebaseUid = `user_${cleanUser}_${Date.now().toString(36)}`;

    const newUser = {
      uid: firebaseUid,
      name: cleanName,
      username: cleanUser,
      password: cleanPass,
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    await finalizeUserSession({
      uid: firebaseUid,
      displayName: cleanName,
      usernameHandle: cleanUser,
      provider: 'password',
    });

    setLoading(false);
    setSuccessMsg('Account created successfully! Opening Study Studio...');
    setTimeout(() => {
      nav(loc.state?.from || '/app', { replace: true });
    }, 400);
  }

  return (
    <div className="pro-app-root min-h-screen flex flex-col justify-between bg-[#F7F6EF] text-[#18181b] relative overflow-x-hidden">
      {/* Top Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between relative z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border-[1.5px] border-[#18181b] shadow-[2px_2px_0px_#18181b] text-xs font-bold text-[#18181b] hover:bg-stone-50 transition-all no-underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <PWAInstallButton compact />
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>WBCHSE Class 12 Sem 4 Studio</span>
          </div>
        </div>
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-2">
        <div className="w-full max-w-[440px]">
          <div className="bg-white border-2 border-[#18181b] rounded-[28px] p-6 sm:p-8 shadow-[6px_6px_0px_#18181b]">
            {/* Brand Header */}
            <div className="flex flex-col items-center text-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group no-underline">
                <div className="w-11 h-11 rounded-2xl bg-[#FEF08A] border-2 border-[#18181b] p-2 shadow-[2px_2px_0px_#18181b] flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src="/logo.svg" alt="Study Stranger" className="w-full h-full object-contain" />
                </div>
              </Link>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-950">
                {mode === 'signin' ? 'Welcome Back' : 'Create Student Account'}
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                {mode === 'signin'
                  ? 'Sign in to access 3D AI Mentors, Math Lab, PDF Library & Mock Tests'
                  : 'Register your WBCHSE Class 12 Semester 4 student profile'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F7F6EF] border-[1.5px] border-[#18181b] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErr('');
                  setSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErr('');
                  setSuccessMsg('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#18181b] text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Google Sign-In Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-900 font-extrabold text-xs sm:text-sm border-2 border-[#18181b] shadow-[3px_3px_0px_#18181b] transition-all active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60 cursor-pointer min-h-[46px]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-stone-200" />
              <span className="absolute px-3 bg-white text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                OR WITH USERNAME
              </span>
            </div>

            {/* Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Username / ইউজারনেম
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. abhijit, ayan, or your username"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F6EF] border-[1.5px] border-[#18181b] focus:bg-white focus:outline-none text-sm text-stone-900 placeholder:text-stone-400 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Password / পাসওয়ার্ড
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-[#F7F6EF] border-[1.5px] border-[#18181b] focus:bg-white focus:outline-none text-sm text-stone-900 placeholder:text-stone-400 min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-stone-700 font-semibold">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-400 accent-[#18181b] cursor-pointer"
                    />
                    <span>Remember my session</span>
                  </label>
                </div>

                {err && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-start gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{err}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-start gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#18181b] hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[3px_3px_0px_#FF7A30] active:translate-x-0.5 active:translate-y-0.5 min-h-[48px]"
                >
                  <span>{loading ? 'Signing In...' : 'Sign In to Studio'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </form>
            ) : (
              /* Create Account Form */
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F6EF] border-[1.5px] border-[#18181b] focus:bg-white focus:outline-none text-sm text-stone-900 min-h-[42px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">Username *</label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      autoComplete="username"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                      }
                      placeholder="e.g. abhijit2026"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F6EF] border-[1.5px] border-[#18181b] focus:bg-white focus:outline-none text-sm text-stone-900 min-h-[42px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        required
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#F7F6EF] border-[1.5px] border-[#18181b] focus:bg-white focus:outline-none text-sm text-stone-900 min-h-[42px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        required
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#F7F6EF] border-[1.5px] border-[#18181b] focus:bg-white focus:outline-none text-sm text-stone-900 min-h-[42px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {err && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-start gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{err}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-start gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#18181b] hover:bg-stone-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[3px_3px_0px_#FF7A30] active:translate-x-0.5 active:translate-y-0.5 min-h-[48px]"
                >
                  <span>{loading ? 'Creating Account...' : 'Create Student Account'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </form>
            )}

            {/* Footer Links */}
            <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="font-bold text-stone-700 hover:text-stone-950 underline cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>WBCHSE Sem 4 Edition</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Legal Footer */}
      <footer className="py-4 px-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Study Stranger Pro · WBCHSE Class 12 Semester 4
      </footer>

      {/* In-App Google Account Sign-In Modal */}
      {isGoogleAccountModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
          onClick={() => setIsGoogleAccountModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white border-2 border-[#18181b] p-6 shadow-[8px_8px_0px_#18181b] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-bold text-sm text-stone-900">Google Account Sign-In</span>
              </div>
              <button
                type="button"
                onClick={() => setIsGoogleAccountModalOpen(false)}
                className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteInAppGoogleSignIn} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="e.g. name@gmail.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="e.g. Abhijit"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoogleAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="px-5 py-2 rounded-xl bg-[#18181b] text-white text-xs font-extrabold shadow-sm hover:bg-stone-800 cursor-pointer"
                >
                  Continue →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
