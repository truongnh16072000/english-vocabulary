import React, { useState, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, BookOpen, GraduationCap, LayoutDashboard, Trophy } from 'lucide-react';

const A2Vocabulary = lazy(() => import('./components/A2Vocabulary'));
const B1Vocabulary = lazy(() => import('./components/B1Vocabulary'));
const B2Vocabulary = lazy(() => import('./components/B2Vocabulary'));
const ExaminePage = lazy(() => import('./components/ExaminePage'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const FavoriteVocabulary = lazy(() => import('./components/FavoriteVocabulary'));

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans selection:bg-indigo-100 italic">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 min-w-0 overflow-y-auto h-screen transition-all duration-300">
        {/* Header removed as requested */}

        <section className="w-full h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              {activeTab === 'a2-vocab' ? (
                <Suspense fallback={
                  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="font-bold text-slate-400 italic">Curating your A2 vocabulary...</p>
                  </div>
                }>
                  <div className="w-full h-full min-h-screen bg-slate-50">
                     <A2Vocabulary />
                  </div>
                </Suspense>
              ) : activeTab === 'b1-vocab' ? (
                <Suspense fallback={
                  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                    <p className="font-bold text-slate-400 italic">Curating your B1 vocabulary...</p>
                  </div>
                }>
                  <div className="w-full h-full min-h-screen bg-slate-50">
                     <B1Vocabulary />
                  </div>
                </Suspense>
              ) : activeTab === 'b2-vocab' ? (
                <Suspense fallback={
                  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                    <p className="font-bold text-slate-400 italic">Curating your B2 vocabulary...</p>
                  </div>
                }>
                  <div className="w-full h-full min-h-screen bg-slate-50">
                     <B2Vocabulary />
                  </div>
                </Suspense>
              ) : activeTab === 'examine' ? (
                <Suspense fallback={
                  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
                    <p className="font-bold text-slate-400 italic">Loading vocabulary quiz...</p>
                  </div>
                }>
                  <div className="w-full h-full min-h-screen bg-slate-50">
                     <ExaminePage />
                  </div>
                </Suspense>
              ) : activeTab === 'favorites' ? (
                <Suspense fallback={
                  <div className="w-full h-full min-h-screen flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
                    <p className="font-bold text-slate-400 italic">Finding your favorite words...</p>
                  </div>
                }>
                  <div className="w-full h-full min-h-screen bg-slate-50">
                     <FavoriteVocabulary />
                  </div>
                </Suspense>
              ) : activeTab === 'dashboard' ? (
                <Suspense fallback={
                  <div className="w-full h-96 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                    <p className="font-bold text-slate-400 italic">Preparing your dashboard stats...</p>
                  </div>
                }>
                  <Dashboard setActiveTab={setActiveTab} />
                </Suspense>
              ) : (
                <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                  <div className="w-32 h-32 bg-slate-100 rounded-[40px] flex items-center justify-center text-slate-300">
                    <Sparkles className="w-16 h-16" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Content Under Construction</h2>
                    <p className="text-slate-400 font-medium italic">Tab "{activeTab}" is coming soon!</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
};

export default App;
