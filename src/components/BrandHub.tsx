import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  Copy, 
  Check, 
  Play, 
  RotateCcw, 
  Zap, 
  Shield, 
  Heart, 
  Coffee, 
  BookOpen, 
  Activity, 
  Award,
  Smartphone,
  Eye,
  Settings,
  HelpCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { View } from '../types';

interface BrandHubProps {
  onBack: () => void;
}

const COLORS = [
  { name: 'Coffee Brown', hex: '#6B4E31', desc: 'Primary deep brand container background and primary typography.', lightText: true },
  { name: 'Latte Cream', hex: '#EAD9C0', desc: 'Secondary cozy neutral accent color for borders and backgrounds.', lightText: false },
  { name: 'Warm Beige', hex: '#F7F3ED', desc: 'Soft secondary background supporting high comfort and eye relaxation.', lightText: false },
  { name: 'Soft White', hex: '#FFFDF9', desc: 'Body canvas backdrop maximizing readability with smooth contrast.', lightText: false },
  { name: 'Sage Green', hex: '#A8C686', desc: 'Eco-conscious health and security badge accent signaling optimal state.', lightText: false }
];

const ANIMATIONS = [
  { 
    id: 'greeting', 
    title: '1. Greeting Animation',
    desc: 'Cat waves hand, blinks eyes with cute blush, and tail moves slowly',
    actionLabel: 'Trigger Hello Wave'
  },
  { 
    id: 'tracking', 
    title: '2. Coffee Tracking',
    desc: 'Cat checks caffeine tablet dashboard with numbers incrementing dynamically',
    actionLabel: 'Track Caffeine Loading'
  },
  { 
    id: 'reminder', 
    title: '3. Healthy Reminder',
    desc: 'Cat gives warm thumbs-up in green safe zone or raises warning ears over limit',
    actionLabel: 'Simulate Safe vs Warning'
  },
  { 
    id: 'loading', 
    title: '4. Loading App State',
    desc: 'Cat prepares custom drip coffee slowly with animated dynamic steam loops',
    actionLabel: 'Simulate Drip Load'
  },
  { 
    id: 'celebration', 
    title: '5. Achievement Celebration',
    desc: 'Cat sparkles with joy and floating coffee-bean hearts',
    actionLabel: 'Celebrate Success!'
  }
];

export default function BrandHub({ onBack }: BrandHubProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeAnim, setActiveAnim] = useState<string>('greeting');
  const [simulatedCaffeine, setSimulatedCaffeine] = useState(0);
  const [reminderState, setReminderState] = useState<'safe' | 'warning'>('safe');
  const [dripBrewing, setDripBrewing] = useState(false);
  const [triggerCelebrationCount, setTriggerCelebrationCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'mascot' | 'logos' | 'animations' | 'ui-preview'>('mascot');

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-espresso pb-24 relative overflow-hidden">
      {/* Decorative Brand Accent Background Circles */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#EAD9C0]/20 rounded-full blur-3xl pointer-events-none -translate-x-12 -translate-y-12" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[#A8C686]/10 rounded-full blur-3xl pointer-events-none translate-x-24" />

      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-[#FFFDF9]/80 backdrop-blur-md border-b border-[#EAD9C0]/40 py-5 px-6 sm:px-10 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-3 bg-[#6B4E31]/5 hover:bg-[#6B4E31]/10 text-[#6B4E31] rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <div className="h-6 w-px bg-[#EAD9C0]" />
          <div className="flex items-center gap-2">
            <div className="bg-[#6B4E31] p-1.5 rounded-lg text-white">
              <Coffee className="w-4 h-4" />
            </div>
            <span className="font-display font-black text-lg tracking-tight text-[#6B4E31]">MyCoffe Brand Book</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-[#A8C686]/15 text-[#6B4E31] rounded-full text-[10px] font-bold tracking-wider uppercase border border-[#A8C686]/35">
            ✨ Cute Mascot v2.5
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-10 mt-10 relative z-10 text-left">
        {/* Banner Section */}
        <div className="bg-gradient-to-br from-[#6B4E31] to-[#45311F] text-[#FFFDF9] rounded-[2.5rem] md:rounded-[4rem] p-8 sm:p-12 md:p-16 shadow-[0_30px_70px_rgba(107,78,49,0.18)] mb-12 relative overflow-hidden">
          {/* Sparkles backdrop */}
          <div className="absolute top-8 right-12 text-[#EAD9C0]/35 animate-pulse">
            <Sparkles className="w-16 h-16" />
          </div>
          <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EAD9C0]/15 rounded-full text-[10px] font-bold tracking-[0.2em] text-[#EAD9C0] uppercase mb-6 border border-[#EAD9C0]/20">
              <Sparkles className="w-3.5 h-3.5 fill-[#EAD9C0]" />
              Official Identity System
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-display font-black leading-[0.95] tracking-tighter mb-6">
              MyCoffe Mascot <br />
              & Logo Guidelines
            </h1>
            
            <p className="text-base sm:text-xl text-[#FFFDF9]/85 mb-8 font-medium leading-relaxed max-w-2xl">
              Meet Barista Cat, your friendly caffeine tracking companion! MyCoffe is a physiological health platform designed to help you balance wellness, deep sleep, and coffee routine.
            </p>

            <div className="flex flex-wrap gap-4 items-center text-xs font-bold text-[#EAD9C0] uppercase tracking-widest bg-black/10 p-4 rounded-2xl w-fit">
              <span>Tagline:</span>
              <span className="text-white">“Enjoy Coffee. Track Smart. Live Healthy.”</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAD9C0]/40 mb-10 overflow-x-auto gap-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('mascot')}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-widest border-b-4 transition-all shrink-0 cursor-pointer ${
              activeTab === 'mascot' ? 'border-[#6B4E31] text-[#6B4E31]' : 'border-transparent text-[#6B4E31]/40'
            }`}
          >
            🐈 Core Mascot
          </button>
          <button
            onClick={() => setActiveTab('logos')}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-widest border-b-4 transition-all shrink-0 cursor-pointer ${
              activeTab === 'logos' ? 'border-[#6B4E31] text-[#6B4E31]' : 'border-transparent text-[#6B4E31]/40'
            }`}
          >
            🎨 Logo & Colors
          </button>
          <button
            onClick={() => setActiveTab('animations')}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-widest border-b-4 transition-all shrink-0 cursor-pointer ${
              activeTab === 'animations' ? 'border-[#6B4E31] text-[#6B4E31]' : 'border-transparent text-[#6B4E31]/40'
            }`}
          >
            🎬 Animations
          </button>
          <button
            onClick={() => setActiveTab('ui-preview')}
            className={`pb-4 px-4 text-sm font-black uppercase tracking-widest border-b-4 transition-all shrink-0 cursor-pointer ${
              activeTab === 'ui-preview' ? 'border-[#6B4E31] text-[#6B4E31]' : 'border-transparent text-[#6B4E31]/40'
            }`}
          >
            📱 UI Live Mockups
          </button>
        </div>

        {/* TAB 1: CORE MASCOT */}
        <AnimatePresence mode="wait">
          {activeTab === 'mascot' && (
            <motion.div
              key="mascot-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid lg:grid-cols-12 gap-10 items-start"
            >
              {/* Mascot Vector Render Preview */}
              <div className="lg:col-span-5 bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-8 shadow-sm flex flex-col items-center justify-center relative text-center">
                <p className="text-[9px] font-black tracking-widest uppercase text-[#6B4E31]/40 mb-6 font-sans">Brand Hero Mascot</p>
                
                {/* Visual rendering of Barista Cat using Tailwind CSS & SVG vectors */}
                <div className="relative w-56 h-56 flex items-center justify-center bg-[#F7F3ED] rounded-full p-4 mb-6 shadow-inner group">
                  {/* Floating Elements */}
                  <div className="absolute top-2 left-6 text-2xl animate-bounce">☕</div>
                  <div className="absolute top-1 right-8 text-2xl animate-pulse delay-700">📈</div>
                  <div className="absolute bottom-6 right-2 text-xl">🛡️</div>
                  <div className="absolute bottom-2 left-8 text-xl">❤️</div>

                  {/* HTML / CSS Custom Interactive Mascot Render */}
                  <div className="w-40 h-40 relative flex flex-col items-center">
                    {/* Cat Ear Left */}
                    <div className="absolute top-4 left-6 w-12 h-12 bg-[#6B4E31] rounded-tl-full rounded-br-2xl rotate-12 flex items-center justify-center shadow-sm">
                      <div className="w-8 h-8 bg-pink-100 rounded-tl-full rounded-br-xl" />
                    </div>
                    {/* Cat Ear Right */}
                    <div className="absolute top-3 right-6 w-12 h-12 bg-[#EAD9C0] rounded-tr-full rounded-bl-2xl -rotate-12 flex items-center justify-center shadow-sm">
                      <div className="w-8 h-8 bg-pink-100 rounded-tr-full rounded-bl-xl" />
                    </div>

                    {/* Barista Coffee Hat Tiny */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-6 bg-[#6B4E31] rounded-t-lg z-20 flex items-center justify-center">
                      <div className="w-12 h-2 bg-amber-500 rounded-full mt-2.5" />
                    </div>

                    {/* Cat Head */}
                    <div className="absolute top-8 w-32 h-28 bg-[#FFFDF9] border-4 border-[#6B4E31] rounded-[2.5rem] flex flex-col items-center justify-center shadow-md z-10 transition-transform group-hover:scale-105 duration-300">
                      {/* Cream patched eye */}
                      <div className="absolute top-4 right-2 w-14 h-14 bg-[#EAD9C0] rounded-full opacity-60 pointer-events-none" />

                      {/* Eyes container */}
                      <div className="flex gap-8 mt-5 relative z-10">
                        {/* Eye Left (Open & sparkling) */}
                        <div className="w-5 h-5 bg-[#6B4E31] rounded-full flex items-center justify-center relative">
                          <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 left-1 animate-pulse" />
                        </div>
                        {/* Eye Right (Winking!) */}
                        <div className="w-5 h-5 flex items-center justify-center pt-2">
                          <div className="w-4 h-1 bg-[#6B4E31] rounded-full rotate-[-12deg]" />
                        </div>
                      </div>

                      {/* Cheeks blush */}
                      <div className="flex gap-16 absolute top-11 justify-between w-full px-4">
                        <div className="w-3.5 h-1.5 bg-pink-300 rounded-full opacity-70 filter blur-[0.5px]" />
                        <div className="w-3.5 h-1.5 bg-pink-300 rounded-full opacity-70 filter blur-[0.5px]" />
                      </div>

                      {/* Nose & Mouth */}
                      <div className="mt-1 relative z-10 flex flex-col items-center">
                        <div className="w-2.5 h-1.5 bg-pink-400 rounded-full" />
                        <div className="text-xs font-bold leading-none text-[#6B4E31] -mt-1 select-none">w</div>
                      </div>
                    </div>

                    {/* Cat Body wearing Coffee Apron */}
                    <div className="absolute top-[100px] w-28 h-20 bg-[#6B4E31] rounded-b-3xl border-2 border-[#EAD9C0] flex items-center justify-center z-10 shadow">
                      {/* Apron text */}
                      <span className="text-[9px] font-sans font-black text-[#FFFDF9] tracking-widest select-none pt-2">MyCoffe</span>
                    </div>

                    {/* Left Paw holding Latte Cup */}
                    <div className="absolute top-[105px] -left-3 bg-[#EAD9C0] w-7 h-7 rounded-full border border-[#6B4E31] z-20 shadow flex items-center justify-center text-[10px] scale-[1.05] hover:scale-110 active:scale-95 transition-all">
                      ☕
                    </div>
                    {/* Right Paw holding Caffeine Chart Tablet */}
                    <div className="absolute top-[102px] -right-3 bg-white w-9 h-11 border border-[#6B4E31] rounded-md z-20 shadow-md flex flex-col items-center justify-center p-1 hover:rotate-6 transition-all">
                      <span className="text-[7px] font-bold text-emerald-600 scale-95">135m</span>
                      <div className="w-5 h-1.5 bg-emerald-500 rounded-full mt-0.5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-black text-2xl text-[#6B4E31]">Barista Cat Mascot</h3>
                  <p className="text-sm font-medium text-espresso/60 max-w-xs leading-relaxed">
                    Main Mascot & brand ambassador. A light cream and brown chibi cat styled dynamically to deliver supportive physiological guidance.
                  </p>
                </div>

                <div className="w-full h-px bg-[#EAD9C0]/40 my-6" />

                {/* Characteristics Checklist */}
                <div className="grid grid-cols-2 gap-4 text-left w-full">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="w-2 h-2 rounded-full bg-[#A8C686]" />
                    <span>Cream & Light Brown</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="w-2 h-2 rounded-full bg-[#A8C686]" />
                    <span>Mindful Winking Eye</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="w-2 h-2 rounded-full bg-[#A8C686]" />
                    <span>Cozy Coffee Apron</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <div className="w-2 h-2 rounded-full bg-[#A8C686]" />
                    <span>Barista Hat Identity</span>
                  </div>
                </div>
              </div>

              {/* Identity & Concept breakdown info */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-8 shadow-sm">
                  <h3 className="text-xl font-display font-black text-[#6B4E31] mb-4">Metabolic Representation</h3>
                  <div className="space-y-4">
                    <p className="text-sm text-espresso/70 leading-relaxed font-medium">
                      Barista Cat is not promoting coffee sales or rapid consumption. Instead, he represents <strong>safe coffee habits, mindful caffeine tracking, wellness balance, and sleep prevention protocol</strong>. He acts as an empathetic advisor rather than a cold calculation formula.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 pt-4">
                      <div className="p-4 bg-[#F7F3ED] rounded-2xl">
                        <h4 className="font-bold text-xs text-[#6B4E31] uppercase tracking-wider mb-1.5">Empathetic Coaching</h4>
                        <p className="text-[11px] text-espresso/60 leading-normal">
                          Gives congratulations on water hydration limits and warm warnings if late cup options threaten slow-decay metabolizers.
                        </p>
                      </div>
                      <div className="p-4 bg-[#A8C686]/10 rounded-2xl border border-[#A8C686]/30">
                        <h4 className="font-bold text-xs text-[#6B4E31] uppercase tracking-wider mb-1.5">Caffeine Tracker Slate</h4>
                        <p className="text-[11px] text-espresso/60 leading-normal">
                          Holds a clean, digital metabolic monitor in paws to bridge cozy coffee culture and scientific metrics seamlessly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                  <h3 className="text-xl font-display font-black text-[#6B4E31]">Brand Supporting Elements</h3>
                  <p className="text-sm text-espresso/60 font-medium">We paired the chibi mascot with supportive high-contrast visual indicators:</p>
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { icon: '🍃', title: 'Leaves (Health)', desc: 'Sage green foliage symbolizing tea alternatives & natural focus.' },
                      { icon: '🛡️', title: 'Shield (Safety)', desc: 'Validates caffeine compliance with personal genetic metrics.' },
                      { icon: '💖', title: 'Heart (Wellness)', desc: 'Reminds users to prioritize sleep depth and heart-rate recovery.' },
                      { icon: '☕', title: 'Coffee Bean', desc: 'Represents pure ingredients and smart brewing routines.' },
                      { icon: '📈', title: 'Caffeine Chart', desc: 'Indicates real-time metabolization level in bloodstream.' },
                      { icon: '⚡', title: 'Drip Progress Bar', desc: 'Interactive indicator displaying total biological clearance.' }
                    ].map((el, i) => (
                      <div key={i} className="p-4 bg-[#FFFDF9] border border-[#EAD9C0]/30 rounded-2xl">
                        <span className="text-xl mb-2 block">{el.icon}</span>
                        <h4 className="font-black text-xs text-[#6B4E31] mb-1">{el.title}</h4>
                        <p className="text-[10px] text-espresso/50 leading-normal font-medium">{el.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: LOGO & COLORS */}
          {activeTab === 'logos' && (
            <motion.div
              key="logos-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {/* Logo Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: '1. Primary Main Logo',
                    desc: 'Combined wordmark and mascot brand mark centered with tagline. Used for cover slides and presentations.',
                    previewElement: (
                      <div className="flex flex-col items-center justify-center p-6 bg-[#F7F3ED] rounded-3xl h-44 text-center">
                        <span className="text-4xl mb-1">🐈</span>
                        <p className="text-2xl font-display font-black text-[#6B4E31] tracking-tight">MyCoffe</p>
                        <p className="text-[8px] font-black uppercase text-[#6B4E31]/45 tracking-[0.3em]">Caffeine Tracker</p>
                      </div>
                    )
                  },
                  {
                    title: '2. Rounded Icon Logo',
                    desc: 'Compact emblem within warm organic circles. Suitable for profile images, stickers, and headers.',
                    previewElement: (
                      <div className="flex items-center justify-center p-6 bg-[#F7F3ED] rounded-3xl h-44">
                        <div className="w-24 h-24 rounded-full bg-white border-2 border-[#EAD9C0] shadow-sm flex flex-col items-center justify-center">
                          <span className="text-3xl mb-0.5">🐈</span>
                          <span className="text-[10px] font-black tracking-tighter text-[#6B4E31]">MyCoffe</span>
                        </div>
                      </div>
                    )
                  },
                  {
                    title: '3. App Icon (Launcher)',
                    desc: 'High density chibi visual with cozy shadows. Designed for iOS/Android home launcher grids.',
                    previewElement: (
                      <div className="flex items-center justify-center p-6 bg-[#F7F3ED] rounded-3xl h-44">
                        <div className="w-20 h-20 bg-[#6B4E31] rounded-[1.8rem] shadow-xl flex items-center justify-center border border-white/10">
                          <span className="text-4xl">🐱</span>
                        </div>
                      </div>
                    )
                  },
                  {
                    title: '4. Minimal Favicon',
                    desc: '16x16, 32x32, or 180x180 px browser address bar asset. Concentrated on small espresso cup & cat ear contour.',
                    previewElement: (
                      <div className="flex items-center justify-center p-6 bg-[#F7F3ED] rounded-3xl h-44">
                        <div className="w-10 h-10 bg-[#EAD9C0]/40 rounded-xl flex items-center justify-center border border-[#6B4E31]/20 font-bold text-xs font-sans">
                          ☕
                        </div>
                      </div>
                    )
                  },
                  {
                    title: '5. Transparent Version',
                    desc: 'Mascot wordmark formatted on alpha channel. Ready to blend on any container, banner, or app layout background.',
                    previewElement: (
                      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#EAD9C0] rounded-3xl h-44">
                        <span className="text-3xl mb-1">🐈</span>
                        <p className="text-2xl font-display font-black text-[#6B4E31] opacity-75">MyCoffe</p>
                        <span className="text-[7px] text-espresso/45 uppercase tracking-widest mt-1">Alpha Channel Layer</span>
                      </div>
                    )
                  },
                  {
                    title: '6. Mode Adaptations (Light / Dark)',
                    desc: 'Adaptive palette utilizing high-contrast soft white or deep espresso grounds dynamically based on system themes.',
                    previewElement: (
                      <div className="grid grid-cols-2 gap-2 h-44 w-full">
                        <div className="bg-[#FFFDF9] rounded-2xl flex flex-col items-center justify-center border border-[#EAD9C0]/40">
                          <span className="text-[9px] font-bold text-[#6B4E31]/40 uppercase mb-2">Light Style</span>
                          <span className="text-base font-black text-[#6B4E31]">MyCoffe</span>
                        </div>
                        <div className="bg-[#120804] rounded-2xl flex flex-col items-center justify-center border border-white/5 text-white">
                          <span className="text-[9px] font-bold text-white/40 uppercase mb-2">Dark Style</span>
                          <span className="text-base font-black text-white">MyCoffe</span>
                        </div>
                      </div>
                    )
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white border border-[#EAD9C0]/40 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-display font-black text-base text-[#6B4E31] mb-2">{item.title}</h4>
                      <p className="text-xs text-espresso/60 leading-normal font-medium mb-4">{item.desc}</p>
                    </div>
                    {item.previewElement}
                  </div>
                ))}
              </div>

              {/* Color Palette Panel */}
              <div className="bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-8 shadow-sm text-left">
                <div className="mb-8">
                  <h3 className="text-xl font-display font-black text-[#6B4E31] mb-1">Warm Calming Coffee Palette</h3>
                  <p className="text-sm text-espresso/60 font-medium">Designed for high comfort, low eye fatigue during morning or bedtime logs.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {COLORS.map((color, i) => (
                    <div 
                      key={i}
                      className="bg-[#F7F3ED] rounded-3xl p-4 border border-[#EAD9C0]/20 flex flex-col justify-between relative group hover:shadow-md transition-all"
                    >
                      <div 
                        className="w-full h-24 rounded-2xl mb-4 relative shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: color.hex }}
                      >
                        <button
                          onClick={() => copyToClipboard(color.hex)}
                          className={`absolute opacity-0 group-hover:opacity-100 p-2.5 rounded-xl text-xs uppercase font-bold tracking-wider cursor-pointer duration-200 flex items-center gap-1.5 ${
                            color.lightText ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/15 text-[#6B4E31] hover:bg-black/25'
                          }`}
                        >
                          {copiedColor === color.hex ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedColor === color.hex ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <div className="space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-[#6B4E31]">{color.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-[#EAD9C0]/40 text-[#6B4E31] px-1.5 py-0.5 rounded">{color.hex}</span>
                        </div>
                        <p className="text-[10px] text-espresso/50 leading-relaxed font-semibold">{color.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography */}
              <div className="bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-8 shadow-sm grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-xl font-display font-black text-[#6B4E31] mb-3">Typography Direction</h3>
                  <p className="text-sm text-espresso/65 leading-relaxed font-semibold">
                    We pair high-charity system foundations with organic retro headers to deliver a premium startup look & feel.
                  </p>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <span className="text-[10px] font-bold text-caramel uppercase tracking-widest block mb-1">Primary UI Body</span>
                      <p className="font-sans text-xl font-bold">Inter (Variable Sans)</p>
                      <p className="text-[11px] text-espresso/50">Clean, crisp, legible at tiny metadata tables on mobile devices.</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-caramel uppercase tracking-widest block mb-1">Display Headings</span>
                      <p className="font-display font-black text-2xl text-[#6B4E31] tracking-tight">Space Grotesk / Outfit</p>
                      <p className="text-[11px] text-espresso/50 font-bold">Geometric, impactful curves echoing mascot playful structures.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F7F3ED] p-6 rounded-3xl border border-[#EAD9C0]/35 text-left font-display">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#6B4E31]/40 block mb-3">Scale Specimen</span>
                  <p className="text-4xl font-black text-[#6B4E31] mb-2 leading-none">Smart Sipper.</p>
                  <p className="text-xl font-bold text-caramel mb-4">Metabolic Balance.</p>
                  <p className="font-sans text-xs text-espresso/60 font-medium leading-relaxed">
                    ABCDEFGHIJKLMOPQRSTUVWXYZ<br />
                    abcdefghijklmnopqrstuvwxyz<br />
                    1234567890 !@#$%^&*()_+
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ANIMATION STORYBOARD SYSTEM */}
          {activeTab === 'animations' && (
            <motion.div
              key="animations-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* Animation Selector */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-6 shadow-sm">
                  <h3 className="text-lg font-display font-black text-[#6B4E31] mb-1">UI Micro Interaction Board</h3>
                  <p className="text-xs text-espresso/50 font-semibold mb-6">Select an action below to visualize live mascot storyboard frames.</p>
                  
                  <div className="space-y-3">
                    {ANIMATIONS.map(anim => (
                      <button
                        key={anim.id}
                        onClick={() => {
                          setActiveAnim(anim.id);
                          if (anim.id === 'tracking') setSimulatedCaffeine(0);
                          if (anim.id === 'loading') setDripBrewing(true);
                        }}
                        className={`w-full p-4 rounded-2xl cursor-pointer text-left border flex items-center justify-between transition-all ${
                          activeAnim === anim.id 
                            ? 'bg-[#6B4E31] border-[#6B4E31] text-white shadow-md' 
                            : 'bg-[#FFFDF9] border-[#EAD9C0]/35 text-espresso/70 hover:bg-[#F7F3ED]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-black mb-1">{anim.title}</p>
                          <p className={`text-[10px] leading-tight ${activeAnim === anim.id ? 'text-white/70' : 'text-espresso/50'}`}>{anim.desc.slice(0, 52)}...</p>
                        </div>
                        <Play className="w-3.5 h-3.5 shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Animation Render Stage */}
              <div className="lg:col-span-7 bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-8 md:p-12 shadow-sm flex flex-col justify-between h-[520px] relative text-center">
                <div className="absolute top-4 right-6 bg-[#A8C686]/10 border border-[#A8C686]/35 rounded-full px-3 py-1 text-[9px] font-bold text-[#A8C686] uppercase tracking-widest select-none">
                  Storyboard Screen
                </div>

                {/* Stage Canvas */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#F7F3ED]/45 rounded-3xl border border-[#EAD9C0]/25 relative overflow-hidden">
                  
                  {/* Floating hearts container for Celebration */}
                  <AnimatePresence>
                    {activeAnim === 'celebration' && (
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i + triggerCelebrationCount * 10}
                            initial={{ opacity: 0, y: 120, x: Math.random() * 300 - 150, scale: 0.5 }}
                            animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.5, 1.2, 1, 0.7] }}
                            transition={{ duration: 3, delay: i * 0.25 }}
                            className="absolute text-xl select-none"
                            style={{ bottom: '10%' }}
                          >
                            {i % 2 === 0 ? '❤️' : '☕'}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>

                  {/* ACTIVE ANIMATION PREVIEW CARD */}
                  <AnimatePresence mode="wait">
                    {activeAnim === 'greeting' && (
                      <motion.div 
                        key="anim-greeting"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-4 z-10"
                      >
                        {/* Waving Mascot Chibi Head container */}
                        <div className="w-36 h-36 bg-white border-2 border-[#6B4E31] rounded-full flex items-center justify-center relative shadow-sm">
                          {/* Winking blinking face */}
                          <div className="flex flex-col items-center">
                            <span className="text-4xl animate-bounce">😸</span>
                            {/* Blush */}
                            <div className="flex gap-10 mt-1">
                              <span className="w-2.5 h-1 bg-pink-300 rounded-full animate-pulse" />
                              <span className="w-2.5 h-1 bg-pink-300 rounded-full animate-pulse" />
                            </div>
                          </div>
                          
                          {/* Waving Hand Paw */}
                          <motion.div 
                            animate={{ rotate: [0, 20, -10, 20, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -right-1 bottom-8 text-3xl select-none origin-bottom-left"
                          >
                            🐾
                          </motion.div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-[#6B4E31]/40 tracking-widest font-sans">Active Frames</p>
                          <p className="text-sm font-black text-[#6B4E31]">Cat waves warmly, blush beams blink</p>
                        </div>
                      </motion.div>
                    )}

                    {activeAnim === 'tracking' && (
                      <motion.div 
                        key="anim-tracking"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-4 z-10 w-full"
                      >
                        <div className="w-36 h-36 bg-white border-2 border-[#6B4E31] rounded-full flex flex-col items-center justify-center p-3 relative shadow-inner">
                          <span className="text-4xl">🤔</span>
                          <span className="text-[9px] font-bold text-[#6B4E31]/40 uppercase mt-1">CAT CALCULATES</span>
                          <span className="text-xs font-black text-[#6B4E31] mt-0.5">{simulatedCaffeine} mg load</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSimulatedCaffeine(0);
                            let val = 0;
                            const clock = setInterval(() => {
                              val += 15;
                              if (val >= 165) {
                                clearInterval(clock);
                                setSimulatedCaffeine(160);
                              } else {
                                setSimulatedCaffeine(val);
                              }
                            }, 100);
                          }}
                          className="px-5 py-2.5 bg-[#6B4E31] text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow"
                        >
                          Trigger Digital Slate Sync
                        </button>
                      </motion.div>
                    )}

                    {activeAnim === 'reminder' && (
                      <motion.div 
                        key="anim-reminder"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-4 z-10 text-center"
                      >
                        <div className={`w-36 h-36 rounded-full border-2 border-[#6B4E31] flex flex-col items-center justify-center transition-all duration-300 p-2 bg-white`}>
                          {reminderState === 'safe' ? (
                            <>
                              <span className="text-5xl animate-bounce">😸👍</span>
                              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-600 mt-2">SAFE HEALTH ZONE</span>
                            </>
                          ) : (
                            <>
                              <span className="text-5xl animate-shake">😿⚠️</span>
                              <span className="text-[8px] font-black uppercase tracking-wider text-amber-600 mt-2">OVER CAP LOAD DEFER</span>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setReminderState('safe')}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 cursor-pointer"
                          >
                            Safe Zone (Thumbs Up)
                          </button>
                          <button
                            onClick={() => setReminderState('warning')}
                            className="px-4 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 cursor-pointer"
                          >
                            Limit Alert
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {activeAnim === 'loading' && (
                      <motion.div 
                        key="anim-loading"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-6 z-10"
                      >
                        {/* Brewing Pot with real CSS vector animation */}
                        <div className="relative flex flex-col items-center justify-center">
                          {/* Drip Steaming Loops */}
                          <div className="flex gap-1.5 justify-center mb-1">
                            <div className="w-1.5 h-6 bg-[#6B4E31]/40 rounded-full animate-pulse" />
                            <div className="w-1.5 h-6 bg-[#6B4E31]/40 rounded-full animate-pulse delay-200" />
                            <div className="w-1.5 h-6 bg-[#6B4E31]/40 rounded-full animate-pulse delay-500" />
                          </div>

                          <div className="w-20 h-20 bg-[#6B4E31] border border-white/10 rounded-br-[1.5rem] rounded-bl-[1.5rem] rounded-t-xl relative flex items-center justify-center shadow-lg">
                            <div className="absolute left-full top-4 w-7 h-10 border-4 border-l-0 border-[#6B4E31] rounded-r-2xl" />
                            <span className="text-2xl">☕🐾</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-black uppercase text-[#6B4E31]/40 tracking-widest font-sans">Active Loader state</p>
                          <p className="text-sm font-black text-amber-800">Cat brewing customized drip coffee slowly...</p>
                        </div>
                      </motion.div>
                    )}

                    {activeAnim === 'celebration' && (
                      <motion.div 
                        key="anim-celebration"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center gap-4 z-10 text-center"
                      >
                        <div className="w-36 h-36 bg-white border-2 border-[#6B4E31] rounded-full flex flex-col items-center justify-center p-3 relative shadow-md">
                          <span className="text-5xl animate-bounce">🥳🎉</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-caramel mt-2">BADGE AWARD UNLOCKED</span>
                        </div>
                        <button
                          onClick={() => setTriggerCelebrationCount(c => c + 1)}
                          className="px-5 py-2.5 bg-caramel hover:bg-[#6B4E31] text-white rounded-full text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 duration-200 cursor-pointer shadow"
                        >
                          Spawn Floating Hearts!
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Footer Controls info */}
                <div className="pt-6 border-t border-[#EAD9C0]/40 flex items-center justify-between text-left">
                  <div>
                    <h5 className="font-sans font-black text-sm text-[#6B4E31]">{ANIMATIONS.find(a => a.id === activeAnim)?.title}</h5>
                    <p className="text-[11px] text-[#6B4E31]/70 leading-tight font-semibold">{ANIMATIONS.find(a => a.id === activeAnim)?.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: APP UI LIVE PREVIEWS */}
          {activeTab === 'ui-preview' && (
            <motion.div
              key="ui-preview-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 text-left"
            >
              <div className="bg-white border border-[#EAD9C0]/40 rounded-[2.5rem] p-8 shadow-sm">
                <div className="max-w-xl mb-8">
                  <h3 className="text-xl font-display font-black text-[#6B4E31] flex items-center gap-2">
                    <Smartphone className="w-6 h-6 text-[#6B4E31]" />
                    UI Integration Previews
                  </h3>
                  <p className="text-sm text-espresso/60 leading-relaxed font-semibold">
                    We’ve designed and simulated how the chibi cat mascot integrates across primary user screens. Each interaction creates immediate friendly support.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
                  {[
                    {
                      screen: 'A. Splash / Onboarding Screen',
                      caption: 'Cat welcomes first-time users cozying up with warm blush.',
                      ui: (
                        <div className="bg-[#FFFDF9] border border-[#EAD9C0]/40 rounded-3xl p-5 text-center relative overflow-hidden h-72 flex flex-col justify-between">
                          <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#A8C686] rounded-full" />
                          <p className="text-[8px] font-bold text-espresso/30 uppercase tracking-widest pl-2 font-sans">Splash Screen</p>
                          <div className="my-auto space-y-3">
                            <span className="text-4xl block animate-pulse">😸☕</span>
                            <h5 className="font-display font-black text-espresso text-base">Hello, Friend!</h5>
                            <p className="text-[9px] text-[#6B4E31]/50 leading-relaxed font-semibold">Let’s secure your deep sleep state profile before brewing coffee.</p>
                          </div>
                          <span className="w-full py-1.5 bg-[#6B4E31] text-white rounded-lg text-[9px] font-black uppercase tracking-widest block">Get Started</span>
                        </div>
                      )
                    },
                    {
                      screen: 'B. Dashboard Advisor Panel',
                      caption: 'Cat appears in dynamic statistics box presenting sleep latency.',
                      ui: (
                        <div className="bg-[#FFFDF9] border border-[#EAD9C0]/40 rounded-3xl p-5 text-left relative overflow-hidden h-72 flex flex-col justify-between">
                          <p className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest pl-1 font-sans">Dashboard Panel</p>
                          <div className="bg-white my-auto p-3 rounded-2xl border border-[#EAD9C0]/30 shadow-sm relative">
                            <div className="absolute -top-3 -right-1 text-2xl">🐱</div>
                            <span className="text-[7px] font-bold text-caramel uppercase block">Barista Cat Advisor</span>
                            <p className="text-[10px] font-bold text-[#6B4E31]/80 leading-snug mt-1">"With sensitive clearance, caffeine after <strong>1:45 PM</strong> will block sleep."</p>
                          </div>
                          <div className="flex justify-between items-center text-[7px] font-bold text-espresso/40 border-t border-[#EAD9C0]/10 pt-2">
                            <span>12h Decay Graph</span>
                            <span className="text-emerald-600">👍 Stable</span>
                          </div>
                        </div>
                      )
                    },
                    {
                      screen: 'C. Caffeine Tracker Bottom Sheet',
                      caption: 'Cat guides drink size selection and confirms active mg load.',
                      ui: (
                        <div className="bg-white border border-[#EAD9C0]/40 rounded-3xl p-5 text-center relative overflow-hidden h-72 flex flex-col justify-between">
                          <div className="bg-[#6B4E31] p-3 rounded-2xl text-white relative">
                            <div className="absolute -top-2 right-2 text-xl">☕🐾</div>
                            <p className="text-[8px] opacity-75 font-bold uppercase tracking-wider block">Log Drink confirm</p>
                            <p className="text-sm font-black mt-1">Cold Brew: 155mg</p>
                          </div>
                          <div className="my-auto p-2 bg-[#F7F3ED] rounded-xl border border-dashed border-[#EAD9C0] text-[9px] text-espresso/60 leading-normal font-semibold">
                            Cat gives thumbs up: "We have water queued up after this!"
                          </div>
                          <span className="w-full py-2 bg-[#A8C686] text-[#6B4E31] rounded-lg text-[9px] font-black uppercase tracking-widest">LOG CONFIRMED</span>
                        </div>
                      )
                    },
                    {
                      screen: 'D. Consistency Achievements',
                      caption: 'Exclusive chibi badges for reaching weekly water limits.',
                      ui: (
                        <div className="bg-[#FFFDF9] border border-[#EAD9C0]/40 rounded-3xl p-5 text-center relative overflow-hidden h-72 flex flex-col justify-between">
                          <p className="text-[8px] font-bold text-orange-500 uppercase tracking-widest pl-2">Unlocked Badges</p>
                          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#6B4E31] to-[#EAD9C0]/40 flex items-center justify-center p-2 border-4 border-white shadow-md my-auto animate-bounce">
                            <span className="text-3xl">🏆😼</span>
                          </div>
                          <div className="space-y-0.5">
                            <h5 className="font-display font-black text-xs text-espresso">Smart Sipper v2.4</h5>
                            <p className="text-[8px] text-espresso/40">3-Day consistent limits met</p>
                          </div>
                        </div>
                      )
                    }
                  ].map((preview, idx) => (
                    <div key={idx} className="space-y-3">
                      <p className="text-xs font-black text-[#6B4E31]">{preview.screen}</p>
                      {preview.ui}
                      <p className="text-[10px] text-espresso/50 leading-relaxed font-semibold">{preview.caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closing presentation card */}
        <div className="mt-12 bg-[#F7F3ED] border border-[#EAD9C0]/50 rounded-[2.5rem] p-8 md:p-12 text-left relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl relative z-10">
            <h3 className="text-2xl font-display font-black text-[#6B4E31]">Ready to explore the Prototype lab?</h3>
            <p className="text-sm text-espresso/60 font-medium leading-relaxed">
              We’ve integrated these mascot parameters into onboarding guidance systems, dynamic warnings, and loaders. Log inside to access physiological intelligence!
            </p>
          </div>

          <button 
            onClick={onBack}
            className="px-8 py-4 bg-[#6B4E31] text-[#FFFDF9] hover:bg-[#45311F] rounded-2xl font-black font-display text-sm uppercase tracking-widest mt-2 md:mt-0 shadow-md hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap"
          >
            Go back to Home Screen
          </button>
        </div>
      </main>
    </div>
  );
}
