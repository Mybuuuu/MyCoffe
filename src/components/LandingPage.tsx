import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coffee, 
  ChevronRight, 
  Zap, 
  Shield, 
  Moon, 
  Star, 
  ArrowRight, 
  Play, 
  Sparkles, 
  X, 
  Info, 
  Menu, 
  TrendingUp, 
  Clock, 
  Activity 
} from 'lucide-react';
import { View } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (view: View) => void;
}

const DEMO_DRINKS = [
  { id: 'espresso', name: 'Espresso', base: 63, icon: '☕' },
  { id: 'latte', name: 'Latte', base: 77, icon: '🥛' },
  { id: 'cold-brew', name: 'Cold Brew', base: 155, icon: '🧊' },
  { id: 'matcha', name: 'Matcha', base: 70, icon: '🍵' },
  { id: 'energy', name: 'Energy Drink', base: 160, icon: '⚡' }
];

const DEMO_SIZES = [
  { id: 'S', label: 'Small (8oz)', mult: 0.8 },
  { id: 'M', label: 'Medium (12oz)', mult: 1.0 },
  { id: 'L', label: 'Large (16oz)', mult: 1.5 }
];

const DEMO_METABOLISMS = [
  { id: 'fast', label: 'Fast Runner (4.5h Half-Life)', hl: 4.5, desc: 'Highly active CYP1A2 pathway. You process caffeine rapidly.' },
  { id: 'medium', label: 'Standard (6.0h Half-Life)', hl: 6.0, desc: 'Standard genetic pattern. Average metabolic breakdown rate.' },
  { id: 'slow', label: 'Sensitive (8.5h Half-Life)', hl: 8.5, desc: 'Caffeine binds tightly. Stays active in your system for up to 15 hours.' }
];

export default function LandingPage({ onStart, onNavigate }: LandingPageProps) {
  const [heroImg, setHeroImg] = React.useState('/assets/mycoffe1.jpg');
  const [videoUrl, setVideoUrl] = React.useState('/assets/mycoffe4.mp4');
  const [activeModal, setActiveModal] = useState<{ title: string; content: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleGlobalEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (!activeModal) {
          e.preventDefault();
          onStart();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalEnter);
    return () => window.removeEventListener('keydown', handleGlobalEnter);
  }, [onStart, activeModal]);

  // Interactive Live Dashboard Simulator State
  const [selectedDemoDrink, setSelectedDemoDrink] = useState(DEMO_DRINKS[2]); // Default: Cold Brew
  const [selectedDemoSize, setSelectedDemoSize] = useState(DEMO_SIZES[1]); // Default: Medium (1.0x)
  const [selectedDemoMetabolism, setSelectedDemoMetabolism] = useState(DEMO_METABOLISMS[1]); // Default: Standard

  // Calculated values for simulation view
  const simulatedCaffeineAmt = Math.round(selectedDemoDrink.base * selectedDemoSize.mult);
  const halfLife = selectedDemoMetabolism.hl;
  
  // Sleep impact calculation
  const hoursToClear = Math.round(halfLife * 1.5); // Clearance safety window estimation
  
  // Generating curve data points for dynamic preview graph
  const curvePoints = Array.from({ length: 13 }, (_, h) => {
    const amount = simulatedCaffeineAmt * Math.pow(0.5, h / halfLife);
    return { hour: h, amount };
  });

  // SVG dimensions for the curve
  const graphWidth = 500;
  const graphHeight = 160;
  const pointsString = curvePoints.map((p, i) => {
    const x = (i / 12) * graphWidth;
    const y = graphHeight - (p.amount / 240) * graphHeight; // 240mg max ceiling scale
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="min-h-screen bg-soft-white overflow-hidden relative">
      {/* Sticky Premium Navbar with modern glassmorphism blur */}
      <nav id="sticky-landing-navbar" className="sticky top-0 w-full z-50 bg-soft-white/60 backdrop-blur-xl border-b border-warm-beige/10 transition-all duration-300 shadow-sm">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 max-w-7xl mx-auto relative z-25">
          <div className="flex items-center gap-3">
            <div className="bg-espresso p-2 rounded-xl">
               <Coffee className="w-5 h-5 text-soft-white" />
            </div>
            <span className="font-display font-black text-xl text-espresso tracking-tight">MyCoffee</span>
          </div>

          {/* Core Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 font-sans bg-espresso/5 p-1 rounded-full border border-warm-beige/25 shadow-inner">
            <button 
              onClick={() => onNavigate('EDUCATION')} 
              className="px-5 py-2 text-xs font-black uppercase tracking-widest text-espresso/70 hover:text-espresso hover:bg-white rounded-full transition-all duration-300 cursor-pointer"
            >
              Protocol
            </button>
            <button 
              onClick={() => onNavigate('ANALYTICS')} 
              className="px-5 py-2 text-xs font-black uppercase tracking-widest text-espresso/70 hover:text-espresso hover:bg-white rounded-full transition-all duration-300 cursor-pointer"
            >
              Science
            </button>
            <button 
              onClick={() => onNavigate('BRAND')} 
              className="px-5 py-2 text-xs font-black uppercase tracking-widest text-espresso/70 hover:text-[#6B4E31] hover:bg-white rounded-full transition-all duration-300 cursor-pointer flex items-center gap-1 font-semibold"
            >
              <span>Mascot Hub 🐈</span>
            </button>
            <button 
              onClick={() => onNavigate('SETTINGS')} 
              className="px-5 py-2 text-xs font-black uppercase tracking-widest text-espresso/70 hover:text-espresso hover:bg-white rounded-full transition-all duration-300 cursor-pointer"
            >
              Lab
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onStart}
              className="hidden sm:inline-block px-6 py-3 bg-espresso text-soft-white hover:bg-caramel rounded-xl font-bold transition-all text-xs tracking-wider uppercase shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer"
            >
              Initialize Lab
            </button>

            {/* Mobile Navigation Trigger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 bg-espresso/5 rounded-xl text-espresso hover:bg-espresso/10 transition-all cursor-pointer"
              aria-label="Toggle navigation drawer menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="md:hidden bg-white/95 border-t border-warm-beige/20 shadow-lg px-6 py-6 space-y-4 overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('BRAND');
                  }}
                  className="w-full text-left px-4 py-3 bg-[#EAD9C0]/25 hover:bg-latte-cream/40 rounded-xl font-sans font-bold text-sm text-[#6B4E31] uppercase tracking-widest flex items-center justify-between"
                >
                  <span>Mascot Brand Hub 🐈✨</span>
                  <ChevronRight className="w-4 h-4 text-espresso/40" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('EDUCATION');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-latte-cream/40 rounded-xl font-sans font-bold text-sm text-espresso uppercase tracking-widest flex items-center justify-between"
                >
                  <span>Protocol (Guides)</span>
                  <ChevronRight className="w-4 h-4 text-espresso/40" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('ANALYTICS');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-latte-cream/40 rounded-xl font-sans font-bold text-sm text-espresso uppercase tracking-widest flex items-center justify-between"
                >
                  <span>Science (Analytics)</span>
                  <ChevronRight className="w-4 h-4 text-espresso/40" />
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('SETTINGS');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-latte-cream/40 rounded-xl font-sans font-bold text-sm text-espresso uppercase tracking-widest flex items-center justify-between"
                >
                  <span>Lab (Settings)</span>
                  <ChevronRight className="w-4 h-4 text-espresso/40" />
                </button>
              </div>

              <div className="pt-4 border-t border-warm-beige/20">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onStart();
                  }}
                  className="w-full py-4 bg-coffee-brown text-white font-sans font-bold text-center rounded-xl text-xs uppercase tracking-wider hover:bg-espresso cursor-pointer active:scale-95 transition-all"
                >
                  Initialize Lab Access
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Dynamic Looping Background Video for Vibe */}
      <div className="absolute inset-x-0 top-0 h-[650px] pointer-events-none overflow-hidden z-0">
        <video 
          src={videoUrl}
          autoPlay 
          loop 
          muted
          playsInline 
          onError={() => setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-coffee-cup-with-steam-close-up-15777-large.mp4')}
          className="absolute inset-0 w-full h-full object-cover opacity-15 dark:opacity-30 transition-opacity duration-1000"
        />
        {/* Soft elegant warm color gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-soft-white" />
      </div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 md:pt-20 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-latte-cream rounded-full text-[9px] font-bold uppercase tracking-[0.25em] text-coffee-brown mb-8 shadow-sm border border-warm-beige/20">
               <Sparkles className="w-3.5 h-3.5 fill-coffee-brown" />
               Metabolic Intelligence v2.4
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black text-espresso leading-[0.9] tracking-tighter mb-8 bg-gradient-to-br from-espresso to-espresso/80 bg-clip-text text-transparent">
              Drink Smart.<br />
              <span className="text-caramel">Stay Sharp.</span>
            </h1>
            <p className="text-lg md:text-xl text-espresso/50 font-medium leading-relaxed max-w-lg mb-10">
              Optimize your caffeine intake patterns with biometric precision. Engineer your flow metrics, protect deep sleep recovery.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={onStart}
                className="w-full sm:w-auto px-10 py-6 bg-coffee-brown text-white hover:bg-espresso rounded-[2rem] font-display font-black text-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all premium-shadow shadow-coffee-brown/30 cursor-pointer"
              >
                Access Prototype
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-caramel/5 rounded-full blur-[100px]" />
             <div className="relative bg-white p-4 sm:p-6 rounded-[3.5rem] sm:rounded-[5rem] border border-warm-beige/30 shadow-[0_50px_100px_-20px_rgba(111,78,55,0.15)]">
                <img 
                  src={heroImg} 
                  onError={() => setHeroImg("https://images.unsplash.com/photo-1511920170033-f83969a4c348?q=80&w=1000&auto=format&fit=crop")}
                  alt="Premium Coffee" 
                  className="rounded-[2.8rem] sm:rounded-[4.5rem] w-full h-[400px] sm:h-[550px] md:h-[600px] object-cover transition-opacity duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-espresso p-6 rounded-[2.2rem] text-soft-white shadow-2xl border border-white/10 hidden sm:block"
                >
                   <p className="text-[9px] font-bold text-caramel uppercase tracking-widest mb-2.5">Deep Focus Active</p>
                   <div className="flex items-center gap-5">
                      <div>
                         <p className="text-2xl font-display font-black text-white">160mg</p>
                         <p className="text-[8px] text-white/40 uppercase">Total Load</p>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <Zap className="w-8 h-8 text-caramel fill-caramel" />
                   </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[2.2rem] text-espresso shadow-2xl border border-warm-beige/30 hidden sm:block text-left"
                >
                   <div className="flex items-center gap-3.5 mb-2.5">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                         <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Safe Zone</span>
                   </div>
                   <p className="text-xs font-semibold text-espresso/45">Next cup: <span className="font-bold text-espresso">Recommended in 4h</span></p>
                </motion.div>
             </div>
          </motion.div>
        </div>
      </main>

      {/* FULLY INTERACTIVE LIVE ESTIMATOR (PRE-LOGIN VISITOR DASHBOARD MENUS) */}
      <section className="py-20 px-6 sm:px-8 max-w-7xl mx-auto relative z-10 border-t border-warm-beige/20 mt-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/10 text-amber-800 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Try metabolic simulator
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-espresso mb-4 leading-tight">
            Metabolic Curve Simulator
          </h2>
          <p className="text-espresso/50 font-medium text-base">
            No signup required. Test our clearance prototype below. Adjust parameters to watch the decay curve simulate inside your bloodstream.
          </p>
        </div>

        {/* Dashboard Simulation Container Mock */}
        <div className="bg-white/90 border border-warm-beige/35 rounded-[2.5rem] md:rounded-[3.5rem] p-6 sm:p-10 md:p-12 shadow-[0_20px_50px_rgba(44,24,16,0.06)] grid md:grid-cols-2 gap-10 md:gap-14 items-stretch">
          {/* Left Inputs Controls */}
          <div className="space-y-8 flex flex-col justify-between text-left">
            <div>
              <p className="text-[10px] font-black uppercase text-caramel tracking-widest mb-3.5">01. Select Demo Beverage</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                {DEMO_DRINKS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDemoDrink(item)}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center ${
                      selectedDemoDrink.id === item.id 
                        ? 'bg-espresso text-white border-espresso shadow-md scale-[1.02]' 
                        : 'bg-soft-white border-warm-beige/25 text-espresso/70 hover:border-warm-beige/80'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[11px] font-black tracking-tight block shrink-0">{item.name}</span>
                    <span className="text-[9px] opacity-60 font-bold block shrink-0">{item.base}mg</span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] font-black uppercase text-caramel tracking-widest mb-3.5">02. Selected Servings Size</p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_SIZES.map(sz => (
                  <button
                    key={sz.id}
                    onClick={() => setSelectedDemoSize(sz)}
                    className={`py-3 rounded-xl border text-center font-bold text-xs cursor-pointer transition-all ${
                      selectedDemoSize.id === sz.id
                        ? 'bg-coffee-brown text-white border-coffee-brown shadow'
                        : 'bg-soft-white border-warm-beige/25 text-espresso/60 hover:bg-latte-cream/25'
                    }`}
                  >
                    <div>{sz.label}</div>
                    <div className="text-[9px] opacity-50 font-normal">{sz.mult}x yield</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase text-caramel tracking-widest mb-3.5">03. Simulated Clearance Speed</p>
              <div className="space-y-2.5">
                {DEMO_METABOLISMS.map(met => (
                  <button
                    key={met.id}
                    onClick={() => setSelectedDemoMetabolism(met)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 cursor-pointer transition-all ${
                      selectedDemoMetabolism.id === met.id
                        ? 'bg-latte-cream/40 border-caramel/50 text-espresso shadow-inner'
                        : 'bg-soft-white border-warm-beige/25 text-espresso/40 hover:bg-latte-cream/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${selectedDemoMetabolism.id === met.id ? 'bg-caramel text-white' : 'bg-espresso/5'}`}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black mb-0.5 text-espresso">{met.label}</p>
                      <p className="text-[11px] font-medium leading-tight text-espresso/60">{met.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual Simulated Outputs Panel */}
          <div className="bg-latte-cream/20 border border-warm-beige/20 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between text-left relative overflow-hidden">
            {/* Background pattern glowing visual indicator */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-caramel/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between border-b border-warm-beige/20 pb-4 mb-6">
                <div>
                  <p className="text-[8px] font-black uppercase text-espresso/35 tracking-widest mt-0.5">EST. LOAD CAPACITY</p>
                  <h4 className="text-xl font-display font-black text-espresso">Pre-Login Sim-Metrics</h4>
                </div>
                <div className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-600 text-[9px] font-bold tracking-widest uppercase">
                  ⚡ Interactive Prototype
                </div>
              </div>

              {/* Dynamic Simulated Gauge Values */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border border-warm-beige/25">
                  <p className="text-[8px] font-bold text-espresso/35 uppercase tracking-widest">Active Bloodstream Load</p>
                  <p className="text-3xl font-display font-black text-espresso mt-1">
                    {simulatedCaffeineAmt}<span className="text-xs text-espresso/45 ml-1 select-none">mg</span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-warm-beige/25">
                  <p className="text-[8px] font-bold text-espresso/35 uppercase tracking-widest">Clearance Duration</p>
                  <p className="text-3xl font-display font-black text-amber-600 mt-1">
                    ~{hoursToClear}<span className="text-xs text-amber-600/65 ml-1 select-none">hours</span>
                  </p>
                </div>
              </div>

              {/* Clearance decay curve title */}
              <p className="text-[8px] font-black uppercase text-espresso/35 tracking-widest mb-3">CYP1A2 Metabolic Decay Curve (12-Hour Projection)</p>
              
              {/* SVG dynamic line chart display */}
              <div className="bg-white p-4 rounded-2xl border border-warm-beige/35 mb-6 relative">
                <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-24 overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1={graphHeight} x2={graphWidth} y2={graphHeight} stroke="#EEDCCB" strokeWidth="1" strokeDasharray="2" />
                  <line x1="0" y1="0" x2={graphWidth} y2="0" stroke="#EEDCCB" strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
                  
                  {/* The Curve Line */}
                  <polyline
                    fill="none"
                    stroke="#8c6239"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={pointsString}
                  />

                  {/* Gradient Area Fill under the curve */}
                  <path
                    d={`M 0,${graphHeight} L ${pointsString} L ${graphWidth},${graphHeight} Z`}
                    fill="url(#caffeine-gradient)"
                    opacity="0.12"
                  />
                  
                  <defs>
                    <linearGradient id="caffeine-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8c6239" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>

                  {/* Highlighting active key frames circles */}
                  <circle cx="0" cy={graphHeight - (simulatedCaffeineAmt / 240) * graphHeight} r="6" fill="#8c6239" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx={graphWidth / 2} cy={graphHeight - (curvePoints[6].amount / 240) * graphHeight} r="6" fill="#8c6239" stroke="#ffffff" strokeWidth="2.5" />
                  <circle cx={graphWidth} cy={graphHeight - (curvePoints[12].amount / 240) * graphHeight} r="6" fill="#c39b7d" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* Graph Annotations */}
                <div className="flex items-center justify-between text-[9px] font-bold text-espresso/35 uppercase mt-2 select-none">
                  <span>Intake (0h)</span>
                  <span>Half Life (6h is {Math.round(simulatedCaffeineAmt / 2)}mg)</span>
                  <span>12 Hours Out</span>
                </div>
              </div>
            </div>

            {/* Simulated Advice banner */}
            <div className="p-4 bg-espresso text-soft-white rounded-xl text-xs space-y-1.5 flex items-start gap-3">
              <Clock className="w-5 h-5 text-caramel shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-bold text-caramel text-[10px] tracking-widest uppercase truncate">Bedtime Clearance Warning</p>
                <p className="text-[11px] leading-relaxed text-white/80">
                  With {selectedDemoMetabolism.label.split(' ')[0]} clearance, drinking a {selectedDemoSize.label.split(' ')[0]} {selectedDemoDrink.name} after <strong>1:45 PM</strong> will disrupt stage-4 deep sleep state configurations by midnight.
                </p>
              </div>
            </div>
            
            <button 
              onClick={onStart}
              className="mt-4 w-full py-4 bg-caramel text-espresso hover:bg-espresso hover:text-white rounded-xl font-bold font-display text-center text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Initialize My Custom Bio-Profile
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Mascot Branding Callout Banner */}
      <section id="mascot-branding-promotion-section" className="py-12 px-6 sm:px-8 max-w-7xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-[#6B4E31] to-[#45311F] text-white p-8 md:p-14 rounded-[3.5rem] shadow-xl flex flex-col lg:flex-row items-center justify-between gap-10 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EAD9C0]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EAD9C0]/20 rounded-full text-[9px] font-black tracking-widest text-[#EAD9C0] uppercase">
              ✨ Meet Barista Cat
            </div>
            <h3 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none">
              Discover Our New Mascot & <br className="hidden md:block" />
              Healthy Lifestyle Brand Hub
            </h3>
            <p className="text-sm md:text-base text-white/80 font-medium leading-relaxed">
              We co-created a modern chibi-style brand book centered around safe caffeine routines. Interact with dynamic animation storyboards (Greetings, brewing loading states, overconsumption warnings) and play with our color swatches.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-[#EAD9C0]/85">
              <span className="flex items-center gap-1">🐈 cream/brown mascot</span>
              <span className="flex items-center gap-1">📈 responsive animations</span>
              <span className="flex items-center gap-1">🛡️ safe caffeine tracker</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0 justify-center">
            <button
              onClick={() => onNavigate('BRAND')}
              className="px-8 py-5 bg-[#EAD9C0] hover:bg-white text-[#6B4E31] rounded-2xl font-black font-display text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md text-center"
            >
              Explore Mascot Hub 🐈
            </button>
            <button
              onClick={onStart}
              className="px-8 py-5 border-2 border-white/20 hover:bg-white/10 text-white rounded-2xl font-black font-display text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-espresso py-24">
        <div className="max-w-7xl mx-auto px-8">
           <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] mb-16 underline decoration-caramel decoration-2 underline-offset-8">Engineered for High-Performance Teams</p>
           <div className="flex flex-wrap justify-center items-center gap-20 opacity-30 grayscale contrast-125">
             <span className="text-3xl font-display font-black text-white italic tracking-tighter">Stripe</span>
             <span className="text-3xl font-display font-black text-white italic tracking-tighter">Linear</span>
             <span className="text-3xl font-display font-black text-white italic tracking-tighter">Figma</span>
             <span className="text-3xl font-display font-black text-white italic tracking-tighter">Vercel</span>
             <span className="text-3xl font-display font-black text-white italic tracking-tighter">Notion</span>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-24">
           <h2 className="text-5xl font-display font-black text-espresso mb-6">Metabolic Command Center.</h2>
           <p className="text-xl text-espresso/40 font-medium max-w-2xl mx-auto">More than a tracker. A biological engineering tool for modern digital operators.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Real-time Clearance"
            desc="Track the half-life of your specific drink types with metabolic adjustment logic."
          />
          <FeatureCard 
            icon={<Moon className="w-8 h-8" />}
            title="Sleep Shield"
            desc="Predict the optimal timestamp for your last cup to ensure 90%+ sleep quality scores."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8" />}
            title="Threshold Alarms"
            desc="Smart alerts that trigger when you hit personalized cardiovascular saturation levels."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-warm-beige/20 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-3">
             <Coffee className="w-8 h-8 text-coffee-brown" />
             <span className="font-display font-black text-2xl text-espresso">MyCoffee</span>
          </div>
          <div className="flex items-center gap-10">
             <button onClick={() => setActiveModal({
               title: "Privacy Commitment",
               content: "MyCoffee runs 100% locally on your device or via secure proxied back-ends. We store absolutely zero information on external data brokers or permanent public clouds. Your physiological parameters and caffeine logs stay contained within your local secure container."
             })} className="text-xs font-bold text-espresso/40 uppercase tracking-widest hover:text-espresso transition-colors cursor-pointer">Privacy</button>
             <button onClick={() => setActiveModal({
               title: "Terms & Guidelines",
               content: "This client application is a metabolic tracking interface designed for high-performance cognitive calibration and individual biometric discovery. We recommend consulting health guidelines regarding strict daily cardiovascular thresholds."
             })} className="text-xs font-bold text-espresso/40 uppercase tracking-widest hover:text-espresso transition-colors cursor-pointer">Terms</button>
             <button onClick={onStart} className="text-xs font-bold text-espresso/40 uppercase tracking-widest hover:text-espresso transition-colors cursor-pointer">Lab Access</button>
          </div>
          <p className="text-xs font-bold text-espresso/20 uppercase tracking-widest">© 2026 MyCoffee Intelligence Lab</p>
        </div>
      </footer>

      {/* Stateful Alert Modal Replacement for Landing Page */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white dark:bg-espresso max-w-md w-full rounded-[3rem] p-8 md:p-10 border border-warm-beige/40 dark:border-white/15 shadow-2xl relative z-10 text-left"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-espresso/5 hover:bg-espresso/10 dark:bg-white/10 dark:hover:bg-white/25 text-espresso dark:text-soft-white hover:scale-105 transition-all outline-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-caramel/10 text-caramel rounded-2xl flex items-center justify-center mb-6">
                <Info className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-2xl font-display font-black text-espresso dark:text-soft-white tracking-tight mb-4">{activeModal.title}</h3>
              <p className="text-sm font-medium text-espresso/70 dark:text-soft-white/70 leading-relaxed mb-6">{activeModal.content}</p>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-full py-4 bg-coffee-brown text-white dark:bg-caramel dark:text-espresso rounded-2xl font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                Dismiss Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-12 rounded-[4rem] bg-white border border-warm-beige/30 shadow-xl hover:shadow-2xl transition-all group">
       <div className="w-16 h-16 bg-latte-cream rounded-2xl flex items-center justify-center text-coffee-brown mb-8 group-hover:scale-110 transition-transform">
          {icon}
       </div>
       <h3 className="text-2xl font-display font-black text-espresso mb-4">{title}</h3>
       <p className="text-espresso/40 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
