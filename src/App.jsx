import React, { useState, useEffect, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Sparkles, BookOpen, GraduationCap, LayoutDashboard, Trophy,
  Heart, Briefcase, BookMarked, Settings
} from 'lucide-react';

const FlashcardsPage = lazy(() => import('./components/FlashcardsPage'));
const ExaminePage = lazy(() => import('./components/ExaminePage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const FavoriteVocabulary = lazy(() => import('./components/FavoriteVocabulary'));
const InterviewPrep = lazy(() => import('./components/InterviewPrep'));

// Bottom Navigation Items for mobile
const bottomNavItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'flashcards', label: 'Từ vựng', icon: BookOpen },
  { id: 'favorites', label: 'Yêu Thích', icon: Heart },
  { id: 'examine', label: 'Kiểm Tra', icon: Trophy },
  { id: 'interview-prep', label: 'Phỏng Vấn', icon: Briefcase },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderFallback = (color, text) => (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className={`w-10 h-10 ${color} animate-spin`} />
      <p className="font-bold text-slate-400 italic text-sm">{text}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'flashcards':
        return (
          <Suspense fallback={renderFallback('text-indigo-500', 'Loading your vocabulary...')}>
            <FlashcardsPage />
          </Suspense>
        );
      case 'examine':
        return (
          <Suspense fallback={renderFallback('text-rose-500', 'Loading vocabulary quiz...')}>
            <ExaminePage />
          </Suspense>
        );
      case 'favorites':
        return (
          <Suspense fallback={renderFallback('text-rose-500', 'Finding your favorite words...')}>
            <FavoriteVocabulary />
          </Suspense>
        );
      case 'dashboard':
        return (
          <Suspense fallback={renderFallback('text-amber-500', 'Preparing your dashboard stats...')}>
            <Dashboard setActiveTab={setActiveTab} />
          </Suspense>
        );
      case 'interview-prep':
        return (
          <Suspense fallback={renderFallback('text-indigo-600', 'Preparing your mock interview...')}>
            <InterviewPrep />
          </Suspense>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-6 px-6">
            <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300">
              <Sparkles className="w-12 h-12" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Content Under Construction</h2>
              <p className="text-slate-400 font-medium italic text-sm">Tab "{activeTab}" is coming soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] overflow-hidden bg-slate-50 font-sans selection:bg-indigo-100 italic">
      {/* Desktop sidebar - hidden on mobile */}
      {!isMobile && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}
      
      <main className={`flex-1 min-w-0 overflow-y-auto h-screen h-[100dvh] transition-all duration-300 ${isMobile ? 'mobile-content-padding' : ''}`}>
        <section className="w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full min-h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="bottom-nav" id="mobile-bottom-nav">
          <div className="flex items-center justify-around px-2 pt-1.5">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`bottom-nav-item ${isActive ? 'active' : 'text-slate-400'}`}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'text-indigo-600 scale-110' : ''}`} />
                  <span className={`text-[9px] font-bold tracking-tight transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
