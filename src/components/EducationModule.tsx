import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  GraduationCap, 
  Star, 
  Coffee, 
  Zap, 
  Moon, 
  Heart, 
  Info, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Check, 
  X,
  BookOpen
} from 'lucide-react';

interface EducationModuleProps {
  onBack: () => void;
}

const ARTICLES = [
  {
    id: '1',
    title: 'The Half-Life Mystery',
    summary: 'Why your 2 PM espresso is still haunting your sleep at midnight. Learn how to time your last sip.',
    icon: <Clock className="w-6 h-6" />,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    readTime: '3 min',
    tag: 'Science'
  },
  {
    id: '2',
    title: 'The 90-Minute Rule',
    summary: 'Waiting 90 minutes after waking up can naturally cure your afternoon crash. Here is the protocol.',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    readTime: '4 min',
    tag: 'Daily Hack'
  },
  {
    id: '3',
    title: 'Deep Sleep Mastery',
    summary: 'Caffeine blocks your "sleep pressure" signals. Discover how to clear it before bedtime.',
    icon: <Moon className="w-6 h-6" />,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    readTime: '5 min',
    tag: 'Wellness'
  },
  {
    id: '4',
    title: 'Tea: The Jitter-Free IQ',
    summary: 'Why L-Theanine in tea makes you focused without the anxiety. A guide for high performers.',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    readTime: '3 min',
    tag: 'Performance'
  }
];

const ARTICLE_DETAILS: Record<string, {
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string[];
  protocol: string[];
}> = {
  'hero': {
    title: 'Mastering Your Energy Cycles',
    category: 'Circadian Biology',
    readTime: '6 min',
    summary: 'Discover how working with your body’s natural cortisol awakening response can cure afternoon crashes forever.',
    content: [
      "Human wakefulness is regulated by two primary forces: the Circadian Rhythm (sleep-wake homeostatic drive) and Adenosine accumulation (sleep pressure). When you wake up, your body is in a state of sleep inertia.",
      "A healthy, natural spike in cortisol (known as the cortisol awakening response) begins to lift you out of brain fog in the first hour of waking.",
      "If you introduce caffeine immediately upon waking, you interfere with this transition. Caffeine acts as an adenosine antagonist, binding to receptors before they have a chance to clear yesterday’s remaining sleep pressure.",
      "By timing your intake correctly, you allow natural morning alertness to do the heavy lifting, reserving caffeine to bolster high-intensity deep focus blocks later in the morning."
    ],
    protocol: [
      "Delay your first cup of coffee by 90 to 120 minutes after waking up.",
      "Get 10 minutes of direct sunlight as soon as possible after rising to calibrate your circadian clock.",
      "Hydrate fully with 500ml of water before any caffeine matches your lips."
    ]
  },
  '1': {
    title: 'The Half-Life Mystery',
    category: 'Science',
    readTime: '3 min',
    summary: 'Why your 2 PM espresso is still haunting your sleep at midnight. Learn how to time your last sip.',
    content: [
      "Caffeine has an average metabolic half-life of 5 to 7 hours, and a quarter-life of up to 12 hours. This is heavily dependent on the CYP1A2 hepatic enzyme pathway in your liver.",
      "This means if you consume a double espresso (approx. 150mg of caffeine) at 2:00 PM, around 75mg remains fully active in your bloodstream at 8:00 PM. By midnight, there is still nearly 37.5mg active in your receptors.",
      "While you might feel like you can fall asleep with that level of circulating caffeine, researchers have shown it impairs Stage 3 and Stage 4 deep slow-wave sleep by up to 20%, ruining restore cycles."
    ],
    protocol: [
      "Set a strict 10-hour cutoff prior to your scheduled bedtime.",
      "Switch to high-quality decaf or L-Theanine containing chamomile in the afternoon.",
      "If you must consume afternoon drinks, limit caffeine to under 30mg."
    ]
  },
  '2': {
    title: 'The 90-Minute Rule',
    category: 'Daily Hack',
    readTime: '4 min',
    summary: 'Waiting 90 minutes after waking up can naturally cure your afternoon crash. Here is the protocol.',
    content: [
      "Adenosine builds up progressively in your brain for every minute you are awake, building 'sleep pressure'. When you sleep, your brain clears this adenosine.",
      "Waiting 90 minutes to drink coffee lets your natural cortisol peak properly clear any residual adenosine. If you bypass this and drink coffee immediately, you artificially mask sleep pressure.",
      "When the caffeine wears off 5 hours later, that accumulated sleep pressure returns simultaneously, causing a severe afternoon crash."
    ],
    protocol: [
      "Delay your first coffee until exactly 90 minutes after waking.",
      "Take a short 5-minute movement break when you experience morning grogginess.",
      "Sip warm water or herbal teas first if you crave a warm morning mug."
    ]
  },
  '3': {
    title: 'Deep Sleep Mastery',
    category: 'Wellness',
    readTime: '5 min',
    summary: 'Caffeine blocks your "sleep pressure" signals. Discover how to clear it before bedtime.',
    content: [
      "Adequate slow-wave deep sleep is the single greatest cognitive enhancer. During deep sleep, the brain's glymphatic system opens up, flushing cerebrospinal fluid to clear accumulated waste.",
      "Caffeine molecules molecularly mimic adenosine, fitting perfectly into your brain’s A1 and A2A receptors. This prevents real adenosine from binding: your brain is tired, but it cannot hear the sleep signal.",
      "To protect deep sleep, one must secure early clearance of these receptors and establish calm circadian cues."
    ],
    protocol: [
      "Keep all of your major caffeine intake before noon.",
      "Supplement with magnesium glycinate or L-Theanine before bed to calm excited neurons.",
      "Maintain a cool, completely dark bedroom environment."
    ]
  },
  '4': {
    title: 'Tea: The Jitter-Free IQ',
    category: 'Performance',
    readTime: '3 min',
    summary: 'Why L-Theanine in tea makes you focused without the anxiety. A guide for high performers.',
    content: [
      "Coffee caffeine is a rapid-release stimulant. It causes a sharp spike in vasoconstriction, blood pressure, and epinephrine (adrenaline), which can trigger tracking anxiety and muscle jitters.",
      "Green tea, particularly Matcha, Gyokuro, and high-grade Sencha, contains high volumes of the amino acid L-Theanine.",
      "When combined, caffeine and L-Theanine trigger 'relaxed alert focus'. L-Theanine crosses the blood-brain barrier to promote alpha brainwaves (associated with creative flow states), softening caffeine's harsh, hyper-stimulated edges."
    ],
    protocol: [
      "Substitute at least one cup of coffee a day with Ceremonial Matcha or organic green tea.",
      "If drinking coffee, consider taking supplemental L-Theanine alongside it.",
      "Use green tea as your primary vehicle for creative or long-form writing tasks."
    ]
  }
};

export default function EducationModule({ onBack }: EducationModuleProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('mycoffee_read_articles') || '[]');
    setReadArticles(list);
  }, []);

  const handleMarkAsRead = (id: string) => {
    if (!readArticles.includes(id)) {
      const updated = [...readArticles, id];
      setReadArticles(updated);
      localStorage.setItem('mycoffee_read_articles', JSON.stringify(updated));
    }
    setSelectedArticleId(null);
  };

  const selectedData = selectedArticleId ? ARTICLE_DETAILS[selectedArticleId] : null;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32 font-sans">
      <header className="mb-12">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 group px-5 py-2.5 bg-espresso text-soft-white hover:bg-caramel dark:bg-soft-white dark:text-espresso dark:hover:bg-caramel dark:hover:text-soft-white transition-all rounded-full font-sans font-black text-xs uppercase tracking-widest mb-8 shadow-md hover:scale-105 active:scale-95 duration-200 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <h1 className="text-5xl font-display font-black text-espresso dark:text-soft-white tracking-tight">Caffeine Academy</h1>
        <p className="text-espresso/40 dark:text-soft-white/40 font-medium mt-2">Expert tips for a smarter, sharper you.</p>
      </header>

      {/* Main Feature Article Banner */}
      <section className="mb-12 relative overflow-hidden bg-coffee-brown rounded-[3.5rem] p-10 text-soft-white group shadow-2xl shadow-coffee-brown/20">
         <div className="absolute inset-0 z-0">
            <img 
              src="/assets/mycoffe3.jpg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200&auto=format&fit=crop';
              }}
              alt="Education Wellness Background"
              className="w-full h-full object-cover opacity-15 filter contrast-125 brightness-75 group-hover:scale-105 transition-transform duration-[2000ms]"
              referrerPolicy="no-referrer"
            />
         </div>

         <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:scale-110 group-hover:rotate-45 transition-all duration-1000 z-10">
            <GraduationCap className="w-64 h-64 text-white" />
         </div>
         <div className="relative z-10 max-w-lg">
           <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full w-fit mb-8 text-[10px] font-bold uppercase tracking-widest text-[#FAF9F6]">
             <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
             <span className="text-latte-cream">Must Read {readArticles.includes('hero') && ' • Read ✅'}</span>
           </div>
           <h2 className="text-4xl font-display font-black mb-6 leading-tight text-white">Mastering Your <br />Energy Cycles</h2>
           <p className="text-soft-white/90 font-medium leading-relaxed mb-10 text-sm">Stop crashing at 3 PM. Learn how to work with your body's natural rhythms instead of fighting them with more coffee.</p>
           <button 
             onClick={() => setSelectedArticleId('hero')}
             className="px-10 py-5 bg-caramel hover:bg-caramel/90 text-espresso rounded-3xl font-display font-black text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group shadow-xl shadow-caramel/30"
           >
             Unlock Insight
             <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>
      </section>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {ARTICLES.map((article, i) => {
          const isRead = readArticles.includes(article.id);
          return (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedArticleId(article.id)}
              className="bg-white dark:bg-espresso/70 border border-warm-beige/40 dark:border-white/15 p-8 rounded-[3rem] hover:border-caramel/50 shadow-md hover:shadow-2xl dark:hover:shadow-black/70 hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative"
            >
              {isRead && (
                <span className="absolute top-6 right-6 flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-sans font-bold text-[9px] uppercase tracking-wider">
                  <Check className="w-3 h-3" /> Read
                </span>
              )}

              <div className={`w-14 h-14 ${article.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                {article.icon}
              </div>
              <div className="flex items-center gap-2 mb-4">
                 <span className="text-[10px] font-bold text-espresso/60 dark:text-soft-white/60 uppercase tracking-widest">{article.readTime} Read</span>
                 <span className="w-1 h-1 bg-warm-beige rounded-full" />
                 <span className="text-[10px] font-bold text-caramel dark:text-muted-gold uppercase tracking-widest">{article.tag}</span>
              </div>
              <h3 className="text-2xl font-display font-black text-espresso dark:text-soft-white mb-4 group-hover:text-caramel transition-colors leading-tight">{article.title}</h3>
              <p className="text-espresso/70 dark:text-soft-white/75 font-medium text-sm leading-relaxed mb-0">{article.summary}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="p-12 rounded-[4rem] bg-latte-cream/30 dark:bg-espresso/40 border border-warm-beige/40 dark:border-white/10 text-center relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-500">
         <div className="absolute inset-0 bg-gradient-to-br from-caramel/5 to-transparent transition-opacity opacity-0 group-hover:opacity-100" />
         <div className="w-16 h-16 bg-white dark:bg-espresso rounded-xl flex items-center justify-center mx-auto mb-8 shadow-md relative z-10 border border-warm-beige/20">
            <Info className="w-8 h-8 text-caramel" />
         </div>
         <h3 className="text-2xl font-display font-black text-espresso dark:text-soft-white mb-3 relative z-10">Beyond the Beans</h3>
         <p className="text-espresso/70 dark:text-soft-white/70 font-medium max-w-sm mx-auto leading-relaxed mb-0 text-sm relative z-10">Our coffee community has research insights analyzed over 500+ premium drinks. Enjoy smart biological command center recommendations.</p>
         <button 
           onClick={() => setInfoModal({
             title: "Beyond the Beans • Full Library",
             content: "Deep-dive research papers: Metabolic analysis guidelines, circadian disruption thresholds, and full CYP1A2 hepatic response datasets can be customized inside settings. New volumes are periodically uploaded by the MyCoffee Intelligence Lab."
           })} 
           className="mt-10 px-8 py-4 border border-caramel/30 hover:border-caramel text-xs font-bold text-caramel uppercase tracking-widest hover:bg-caramel hover:text-white dark:hover:text-espresso rounded-3xl transition-all duration-300 relative z-10 hover:scale-105 active:scale-95 shadow-sm"
         >
           Browse Full Library
         </button>
      </div>

      {/* Stateful Alert Modal Replacement */}
      <AnimatePresence>
        {infoModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoModal(null)}
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
                onClick={() => setInfoModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-espresso/5 hover:bg-espresso/10 dark:bg-white/10 dark:hover:bg-white/25 text-espresso dark:text-soft-white hover:scale-105 transition-all outline-none"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-caramel/10 text-caramel rounded-2xl flex items-center justify-center mb-6">
                <Info className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-2xl font-display font-black text-espresso dark:text-soft-white tracking-tight mb-4">{infoModal.title}</h3>
              <p className="text-sm font-medium text-espresso/70 dark:text-soft-white/70 leading-relaxed mb-6">{infoModal.content}</p>
              <button 
                onClick={() => setInfoModal(null)}
                className="w-full py-4 bg-coffee-brown text-white dark:bg-caramel dark:text-espresso rounded-2xl font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-md"
              >
                Dismiss Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sliding Dialog Modal Reader */}
      <AnimatePresence>
        {selectedArticleId && selectedData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticleId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white dark:bg-espresso max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-[3.5rem] p-8 md:p-12 border border-warm-beige/40 dark:border-white/15 shadow-2xl relative z-10 flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedArticleId(null)}
                className="absolute top-8 right-8 p-3 rounded-full bg-espresso/5 hover:bg-espresso/15 dark:bg-white/10 dark:hover:bg-white/20 text-espresso dark:text-soft-white hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-8 flex-1">
                 <div>
                    <span className="inline-block px-4 py-1.5 bg-caramel/10 dark:bg-caramel/25 text-caramel dark:text-muted-gold rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                      {selectedData.category}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-black text-espresso dark:text-soft-white tracking-tight">
                      {selectedData.title}
                    </h2>
                    <p className="text-xs font-bold text-espresso/60 dark:text-soft-white/60 mt-3 uppercase tracking-wider flex items-center gap-2">
                       <Clock className="w-4 h-4 text-caramel dark:text-muted-gold" /> {selectedData.readTime} reading time
                    </p>
                 </div>

                 <div className="w-full h-px bg-warm-beige/35 dark:bg-white/10" />

                 {/* Article Paragraphs */}
                 <div className="space-y-6 text-espresso/85 dark:text-soft-white/95 font-medium text-sm leading-relaxed">
                   {selectedData.content.map((p, index) => (
                     <p key={index}>{p}</p>
                   ))}
                 </div>

                 {/* Protocols Highlights */}
                 <div className="p-8 rounded-[2.5rem] bg-latte-cream/20 dark:bg-white/5 border border-warm-beige/25 space-y-5">
                    <h4 className="font-display font-black text-espresso dark:text-soft-white text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-caramel fill-caramel dark:text-muted-gold dark:fill-muted-gold" />
                      Recommended Protocol
                    </h4>
                    <ul className="space-y-4">
                       {selectedData.protocol.map((step, idx) => (
                         <li key={idx} className="flex gap-4 items-start text-sm font-medium text-espresso/80 dark:text-soft-white/80">
                            <span className="w-6 h-6 rounded-full bg-coffee-brown/15 text-coffee-brown dark:bg-caramel/25 dark:text-latte-cream flex items-center justify-center shrink-0 text-xs font-bold font-mono">
                              0{idx+1}
                            </span>
                            <span>{step}</span>
                         </li>
                       ))}
                    </ul>
                 </div>
              </div>

              {/* Complete Action Button */}
              <div className="mt-10 pt-6 border-t border-warm-beige/10 flex gap-4">
                <button 
                  onClick={() => handleMarkAsRead(selectedArticleId)}
                  className="flex-1 py-5 bg-coffee-brown text-white dark:bg-caramel dark:text-espresso rounded-3xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Check className="w-5 h-5" />
                  {readArticles.includes(selectedArticleId) ? 'Keep Reading (Done)' : 'Mark as Read & Earn XP'}
                </button>
                <button 
                  onClick={() => setSelectedArticleId(null)}
                  className="px-8 py-5 border border-warm-beige/35 text-espresso dark:text-soft-white font-bold rounded-3xl hover:bg-espresso/5 dark:hover:bg-white/5 transition-all text-xs"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
