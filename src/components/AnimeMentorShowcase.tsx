import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Sparkles, Box, MessageSquare, ArrowRight, Play, Square } from 'lucide-react';
import { TiltContainer } from './TiltContainer';
import { voiceService } from '../services/voiceService';
import mahiAvatar from '../assets/images/mahi_avatar_1780353082547.png';

interface AnimeMentorCard {
  id: 'anjali' | 'stranger' | 'mahi' | 'rohan';
  name: string;
  nameBn: string;
  archetype: 'Anime Girl 3D Mentor' | 'Anime Boy Elder Brother' | 'Anime Study Partner' | 'Anime Exam Strategist';
  role: string;
  accentBg: string;
  badgeText: string;
  sampleVoice: string;
  gender: 'girl' | 'boy';
}

const ANIME_MENTORS: AnimeMentorCard[] = [
  {
    id: 'anjali',
    name: 'Anjali Didi (3D Live)',
    nameBn: 'অঞ্জলি দিদি • ৩ডি অ্যানিমে মেন্টর',
    archetype: 'Anime Girl 3D Mentor',
    role: 'Biology Reproduction, ZP3 Diagrams & Interactive 3D Gestures',
    accentBg: '#FCE7F3',
    badgeText: '💃 3D Rigged Anime Girl',
    sampleVoice: 'হ্যালো বন্ধু! আমি অঞ্জলি। তোমার কথার সাথে সাথে আমি ৩ডি মডেলে হাত নাড়িয়ে, হেসে এবং মাথা নেড়ে পুরো জীববিদ্যা ও সাহিত্য সহজ করে বুঝিয়ে দেব!',
    gender: 'girl',
  },
  {
    id: 'stranger',
    name: 'Stranger Dada (AI Hero)',
    nameBn: 'স্ট্রেঞ্জার দাদা • অ্যানিমে ব্রাদার মেন্টর',
    archetype: 'Anime Boy Elder Brother',
    role: 'Physics, Calculus, Genetics & Board Exam Strategy',
    accentBg: '#E0F2FE',
    badgeText: '⚡ Anime Boy Mentor',
    sampleVoice: 'আরে ভাই, কোনো চিন্তা করবি না একদম! আমি তো আছি রে। ডিএনএ রেপ্লিকেশন থেকে শুরু করে ক্যালকুলাস—সব একদম ক্রিস্টাল ক্লিয়ার করে দিচ্ছি!',
    gender: 'boy',
  },
  {
    id: 'mahi',
    name: 'Mahi Didi (Anime Companion)',
    nameBn: 'মাহি দিদি • এক্সপ্রেসিভ স্টাডি পার্টনার',
    archetype: 'Anime Study Partner',
    role: 'Bengali A (Adarini), English B (The Bet, Deoli) & Rapid Recall',
    accentBg: '#FEF3C7',
    badgeText: '🌸 Expressive Anime Girl',
    sampleVoice: 'শোনো না! আজ কিন্তু আমরা আদিরিনী আর দ্য বেট অধ্যায়ের সব গুরুত্বপূর্ণ প্রশ্নগুলো একসাথে রিভিশন করব। একদম ফাঁকি দেওয়া চলবে না!',
    gender: 'girl',
  },
  {
    id: 'rohan',
    name: 'Rohan (Speed Blitz Senpai)',
    nameBn: 'রোহন • বোর্ড টপার সিনিয়র',
    archetype: 'Anime Exam Strategist',
    role: 'High-Speed MCQ Tricks, Memory Hacks & Last-Minute Boosters',
    accentBg: '#DCFCE7',
    badgeText: '🚀 Anime Boy Strategist',
    sampleVoice: 'ইয়ো বস! পরীক্ষার আর বেশি দেরি নেই, চলো আজকে মক টেস্টে একদম ফাটিয়ে স্কোর করি!',
    gender: 'boy',
  },
];

function CustomAnimeBoyArtwork() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="boySky" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EFF6FF" />
          <stop offset="50%" stopColor="#DBEAFE" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="boyJacket" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" fill="url(#boySky)" />
      {/* Glowing 3D Atomic Orbitals in Background */}
      <ellipse cx="120" cy="115" rx="92" ry="32" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="5 4" transform="rotate(-24 120 115)" />
      <ellipse cx="120" cy="115" rx="92" ry="32" fill="none" stroke="#818CF8" strokeWidth="2" strokeDasharray="5 4" transform="rotate(28 120 115)" />
      <circle cx="48" cy="82" r="5" fill="#0284C7" />
      <circle cx="194" cy="142" r="5" fill="#4F46E5" />
      {/* Shoulders & Modern Academic Jacket */}
      <path d="M 42 240 C 46 178 78 164 120 164 C 162 164 194 178 198 240 Z" fill="url(#boyJacket)" stroke="#18181b" strokeWidth="3" />
      {/* Crisp White Shirt & Tie */}
      <polygon points="96,164 120,214 144,164" fill="#FFFFFF" stroke="#18181b" strokeWidth="2.5" />
      <polygon points="115,174 125,174 123,212 120,218 117,212" fill="#EF4444" />
      {/* Neck */}
      <rect x="106" y="138" width="28" height="32" rx="10" fill="#FFE4D6" stroke="#18181b" strokeWidth="2.5" />
      {/* Anime Boy Face */}
      <path d="M 78 92 C 78 58 162 58 162 92 C 162 126 142 150 120 152 C 98 150 78 126 78 92 Z" fill="#FFE4D6" stroke="#18181b" strokeWidth="3" />
      {/* Anime Spiky Layered Hair */}
      <path d="M 70 98 C 65 62 92 36 122 36 C 154 36 176 60 170 98 C 164 78 154 68 144 76 C 136 62 122 58 112 74 C 100 62 86 70 78 88 Z" fill="#1E293B" stroke="#18181b" strokeWidth="3" />
      {/* Stylish Glasses */}
      <rect x="86" y="92" width="28" height="19" rx="5" fill="#FFFFFF" fillOpacity="0.45" stroke="#18181b" strokeWidth="2.5" />
      <rect x="126" y="92" width="28" height="19" rx="5" fill="#FFFFFF" fillOpacity="0.45" stroke="#18181b" strokeWidth="2.5" />
      <line x1="114" y1="100" x2="126" y2="100" stroke="#18181b" strokeWidth="2.5" />
      {/* Eyes */}
      <ellipse cx="100" cy="101" rx="5.5" ry="6.5" fill="#0F172A" />
      <circle cx="98" cy="99" r="2" fill="#FFFFFF" />
      <ellipse cx="140" cy="101" rx="5.5" ry="6.5" fill="#0F172A" />
      <circle cx="138" cy="99" r="2" fill="#FFFFFF" />
      {/* Confident Warm Smile */}
      <path d="M 108 128 Q 120 137 132 128" fill="none" stroke="#18181b" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function CustomAnimeGirlArtwork() {
  return (
    <svg viewBox="0 0 240 240" className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="girlBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDF2F8" />
          <stop offset="50%" stopColor="#FCE7F3" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" fill="url(#girlBg)" />
      {/* Floating DNA / Sparkle Rings */}
      <circle cx="120" cy="116" r="84" fill="none" stroke="#F472B6" strokeWidth="2" strokeDasharray="6 6" />
      {/* Back Long Flowing Hair */}
      <path d="M 64 96 C 54 148 52 195 62 240 L 178 240 C 188 195 186 148 176 96 Z" fill="#1E1B4B" stroke="#18181b" strokeWidth="3" />
      {/* Academic Blazer & Sailor Collar */}
      <path d="M 48 240 C 54 182 82 166 120 166 C 158 166 186 182 192 240 Z" fill="#FFFFFF" stroke="#18181b" strokeWidth="3" />
      <polygon points="84,166 120,206 156,166" fill="#1E3A8A" stroke="#18181b" strokeWidth="2.5" />
      {/* Red Ribbon Bow */}
      <polygon points="120,192 102,182 106,204" fill="#E11D48" stroke="#18181b" strokeWidth="2" />
      <polygon points="120,192 138,182 134,204" fill="#E11D48" stroke="#18181b" strokeWidth="2" />
      <circle cx="120" cy="192" r="5" fill="#F43F5E" stroke="#18181b" strokeWidth="2" />
      {/* Neck */}
      <rect x="108" y="140" width="24" height="30" rx="10" fill="#FFE4D6" stroke="#18181b" strokeWidth="2.5" />
      {/* Anime Girl Face */}
      <path d="M 80 94 C 80 60 160 60 160 94 C 160 128 140 150 120 152 C 100 150 80 128 80 94 Z" fill="#FFE4D6" stroke="#18181b" strokeWidth="3" />
      {/* Anime Bangs & Hair Clips */}
      <path d="M 72 98 C 70 58 94 38 120 38 C 146 38 170 58 168 98 C 158 76 146 72 138 88 C 130 70 112 70 102 88 C 94 72 82 76 72 98 Z" fill="#1E1B4B" stroke="#18181b" strokeWidth="3" />
      {/* Expressive Anime Eyes */}
      <ellipse cx="101" cy="104" rx="7" ry="8.5" fill="#1D4ED8" stroke="#18181b" strokeWidth="2" />
      <circle cx="99" cy="101" r="2.8" fill="#FFFFFF" />
      <circle cx="104" cy="107" r="1.4" fill="#FFFFFF" />
      <ellipse cx="139" cy="104" rx="7" ry="8.5" fill="#1D4ED8" stroke="#18181b" strokeWidth="2" />
      <circle cx="137" cy="101" r="2.8" fill="#FFFFFF" />
      <circle cx="142" cy="107" r="1.4" fill="#FFFFFF" />
      {/* Soft Rosy Blush */}
      <ellipse cx="89" cy="118" rx="6" ry="3.5" fill="#FB7185" opacity="0.55" />
      <ellipse cx="151" cy="118" rx="6" ry="3.5" fill="#FB7185" opacity="0.55" />
      {/* Cheerful Smile */}
      <path d="M 110 127 Q 120 138 130 127 Z" fill="#F43F5E" stroke="#18181b" strokeWidth="2.2" />
    </svg>
  );
}

export const AnimeMentorShowcase: React.FC<{ onLaunchMentor?: (mentorId: string) => void }> = ({
  onLaunchMentor,
}) => {
  const nav = useNavigate();
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const handleVoicePreview = (mentor: AnimeMentorCard) => {
    if (speakingId === mentor.id) {
      voiceService.stop();
      setSpeakingId(null);
      return;
    }
    voiceService.stop();
    setSpeakingId(mentor.id);
    voiceService.speak(mentor.sampleVoice, {
      character: mentor.id as any,
      rate: 1.08,
      onStart: () => setSpeakingId(mentor.id),
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  return (
    <div className="w-full bg-white rounded-[32px] border-2 border-[#18181b] shadow-[6px_6px_0px_#18181b] p-5 sm:p-7 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FEF08A] border-[1.5px] border-[#18181b] text-xs font-extrabold text-[#18181b]">
            <Sparkles size={13} /> AI Anime Mentor Studio • Boy &amp; Girl Interactive Companions
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight font-serif">
            Meet Your 3D &amp; Anime Study Companions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Natural human-like Bengali &amp; English voice conversation with live 3D hand gestures, nodding, and smiling.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (onLaunchMentor ? onLaunchMentor('anjali') : nav('/app/voice'))}
          className="px-4 py-2.5 rounded-full bg-[#18181b] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold inline-flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-[3px_3px_0px_#FF7A30]"
        >
          <Box size={15} className="text-amber-300" />
          <span>Launch 3D Mentor Studio</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ANIME_MENTORS.map((m) => {
          const isSpeaking = speakingId === m.id;
          return (
            <TiltContainer key={m.id} className="w-full h-full">
              <div
                className="h-full rounded-[24px] border-2 border-[#18181b] p-4 flex flex-col justify-between transition-all"
                style={{
                  background: m.accentBg,
                  boxShadow: isSpeaking ? '5px 5px 0px #10b981' : '4px 4px 0px #18181b',
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-white border-[1.5px] border-[#18181b] text-[10px] font-black text-[#18181b]">
                      {m.badgeText}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-300">
                      {m.gender === 'girl' ? 'Anime Girl' : 'Anime Boy'}
                    </span>
                  </div>

                  {/* Character Portrait Box */}
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-white border-2 border-[#18181b] mb-3 shadow-inner">
                    {m.id === 'mahi' ? (
                      <img
                        src={mahiAvatar}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : m.gender === 'girl' ? (
                      <CustomAnimeGirlArtwork />
                    ) : (
                      <CustomAnimeBoyArtwork />
                    )}

                    {isSpeaking && (
                      <div className="absolute bottom-2 inset-x-2 px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center gap-1.5 shadow-md animate-pulse">
                        <Volume2 size={12} /> Speaking Natural Bengali Voice...
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug">{m.name}</h3>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{m.nameBn}</div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{m.role}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/10 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleVoicePreview(m)}
                    className={`w-full py-2 px-3 rounded-xl border-[1.5px] border-[#18181b] text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isSpeaking ? 'bg-rose-600 text-white' : 'bg-white hover:bg-slate-50 text-[#18181b]'
                    }`}
                  >
                    {isSpeaking ? <Square size={12} /> : <Play size={12} />}
                    <span>{isSpeaking ? 'Stop Voice Sample' : 'Hear Realistic Voice'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => (onLaunchMentor ? onLaunchMentor(m.id) : nav('/app/voice'))}
                    className="w-full py-2 px-3 rounded-xl bg-[#18181b] hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <MessageSquare size={12} />
                    <span>Talk Live in 3D</span>
                  </button>
                </div>
              </div>
            </TiltContainer>
          );
        })}
      </div>
    </div>
  );
};
