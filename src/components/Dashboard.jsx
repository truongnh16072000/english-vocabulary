import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, BookOpen, Brain, Star, TrendingUp, 
  CheckCircle2, Clock, Calendar, BarChart3, 
  Award, Target, ChevronRight, Sparkles 
} from 'lucide-react';

const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    a2Total: 869,
    b1Total: 915,
    b2Total: 841,
    a2Learned: 0,
    b1Learned: 0,
    b2Learned: 0,
    a2Flashcard: 0,
    b1Flashcard: 0,
    b2Flashcard: 0,
    a2Fav: 0,
    b1Fav: 0,
    b2Fav: 0,
    streak: 3, 
    lastStudy: 'Hôm nay'
  });

  useEffect(() => {
    const a2Learned = JSON.parse(localStorage.getItem('a2_learned_words') || '[]');
    const b1Learned = JSON.parse(localStorage.getItem('b1_learned_words') || '[]');
    const b2Learned = JSON.parse(localStorage.getItem('b2_learned_words') || '[]');
    const a2Flash = parseInt(localStorage.getItem('a2_flashcard_progress') || '0', 10);
    const b1Flash = parseInt(localStorage.getItem('b1_flashcard_progress') || '0', 10);
    const b2Flash = parseInt(localStorage.getItem('b2_flashcard_progress') || '0', 10);
    const a2Fav = JSON.parse(localStorage.getItem('a2_favorite_words') || '[]');
    const b1Fav = JSON.parse(localStorage.getItem('b1_favorite_words') || '[]');
    const b2Fav = JSON.parse(localStorage.getItem('b2_favorite_words') || '[]');

    setStats(prev => ({
      ...prev,
      a2Learned: a2Learned.length,
      b1Learned: b1Learned.length,
      b2Learned: b2Learned.length,
      a2Flashcard: a2Flash,
      b1Flashcard: b1Flash,
      b2Flashcard: b2Flash,
      a2Fav: a2Fav.length,
      b1Fav: b1Fav.length,
      b2Fav: b2Fav.length
    }));
  }, []);

  const totalLearned = stats.a2Learned + stats.b1Learned + stats.b2Learned;
  const totalWords = stats.a2Total + stats.b1Total + stats.b2Total;
  const totalPercentage = Math.round((totalLearned / totalWords) * 100) || 0;
  
  const totalFav = stats.a2Fav + stats.b1Fav + stats.b2Fav;
  const a2Percentage = Math.round((stats.a2Learned / stats.a2Total) * 100) || 0;
  const b1Percentage = Math.round((stats.b1Learned / stats.b1Total) * 100) || 0;
  const b2Percentage = Math.round((stats.b2Learned / stats.b2Total) * 100) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 md:p-10 bg-[#F8FAFC] min-h-screen font-sans text-slate-900"
    >
      {/* Welcome Header - Stacked on mobile */}
      <div className="mb-6 sm:mb-10 flex flex-col gap-4 sm:gap-6 text-left">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">Pro Member</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">• {stats.lastStudy}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900">Flashcard Center</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Lộ trình học tập của bạn đang đạt mức <span className="text-indigo-600 font-bold">{totalPercentage}%</span></p>
        </div>
        
        {/* Stats row - Horizontal scrollable on mobile */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm shadow-indigo-100/20 shrink-0"
          >
            <div className="p-2.5 sm:p-3 bg-amber-500 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-amber-200">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none">{stats.streak} Ngày</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Study Streak</div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => setActiveTab('favorites')}
            className="flex items-center gap-3 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm shadow-rose-100/20 cursor-pointer shrink-0"
          >
            <div className="p-2.5 sm:p-3 bg-rose-500 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-rose-200">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none">{totalFav}</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Favorites</div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8 text-left">
        {/* Main Learning Column */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-8">
          
          {/* Daily Goal Card - Compact on mobile */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] text-white shadow-2xl shadow-indigo-200"
          >
            <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-10">
              <Brain className="w-24 sm:w-40 h-24 sm:h-40" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start sm:items-center mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black mb-1">Mục tiêu hôm nay</h2>
                  <p className="text-indigo-100 opacity-80 text-xs sm:text-sm">Hãy hoàn thành ít nhất 20 thẻ mới!</p>
                </div>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white/20 flex items-center justify-center font-black text-base sm:text-xl shrink-0 ml-3">
                  75%
                </div>
              </div>
              <div className="h-2.5 sm:h-3 bg-white/20 rounded-full overflow-hidden mb-4 sm:mb-6">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                />
              </div>
              <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                <button 
                  onClick={() => setActiveTab('b1-vocab')}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-indigo-600 rounded-xl sm:rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95"
                >
                  Học ngay
                </button>
                <div className="flex items-center gap-2 text-indigo-100 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> 15/20 Thẻ đã học
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Progress Grid - Horizontal scroll on mobile */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:pb-0">
             <LevelProgressCard 
                level="A2"
                title="Sơ cấp"
                percentage={a2Percentage}
                learned={stats.a2Learned}
                total={stats.a2Total}
                color="indigo"
                delay={0.3}
             />
             <LevelProgressCard 
                level="B1"
                title="Trung cấp"
                percentage={b1Percentage}
                learned={stats.b1Learned}
                total={stats.b1Total}
                color="teal"
                delay={0.4}
             />
             <LevelProgressCard 
                level="B2"
                title="Cao cấp"
                percentage={b2Percentage}
                learned={stats.b2Learned}
                total={stats.b2Total}
                color="purple"
                delay={0.5}
             />
          </div>

          {/* Quick Resume Sections */}
          <div>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight">Học tiếp tục</h2>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest cursor-pointer hover:underline">Xem tất cả thẻ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
               <ResumeFlashcard 
                  level="A2 Vocabulary"
                  current={stats.a2Flashcard}
                  total={stats.a2Total}
                  title="Greetings & Basics"
                  color="indigo"
                  onClick={() => setActiveTab('a2-vocab')}
                  delay={0.6}
               />
               <ResumeFlashcard 
                  level="B1 Vocabulary"
                  current={stats.b1Flashcard}
                  total={stats.b1Total}
                  title="Daily Conversation"
                  color="teal"
                  onClick={() => setActiveTab('b1-vocab')}
                  delay={0.7}
               />
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-5 sm:space-y-8">
          {/* Flashcard Stats Card */}
          <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
            <h3 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Thống kê thẻ
            </h3>
            <div className="space-y-4 sm:space-y-6">
              <MiniStat label="Tổng số từ vựng" value={totalWords} color="bg-slate-100 text-slate-600" />
              <MiniStat label="Đã thuộc lòng" value={totalLearned} color="bg-emerald-100 text-emerald-600" />
              <MiniStat label="Đang học" value={totalWords - totalLearned} color="bg-amber-100 text-amber-600" />
              <MiniStat label="Từ yêu thích" value={totalFav} color="bg-rose-100 text-rose-600" />
            </div>
            
            <div className="mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-slate-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hoạt động tuần này</span>
                <span className="text-[10px] font-bold text-indigo-600 underline">Chi tiết</span>
              </div>
              <div className="flex items-end justify-between h-16 sm:h-20 gap-2">
                {[40, 70, 45, 90, 65, 30, 50].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.8 + (i * 0.05) }}
                    className={`w-full rounded-t-lg ${i === 3 ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-slate-100'}`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[8px] font-black text-slate-300 uppercase tracking-tighter">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          {/* Quick Review Card */}
          <div className="bg-slate-900 p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-rose-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-black mb-2">Thẻ cần ôn tập</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4 sm:mb-6">Bạn có 12 từ trong danh sách yêu thích cần được ôn lại ngay bây giờ.</p>
              <button 
                onClick={() => setActiveTab('favorites')}
                className="w-full py-3.5 sm:py-4 bg-rose-500 text-white rounded-xl sm:rounded-2xl font-black text-sm transition-all hover:bg-rose-600 active:scale-95 shadow-lg shadow-rose-500/20"
              >
                Ôn tập yêu thích
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MiniStat = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-bold text-slate-500">{label}</span>
    <span className={`px-3 py-1 rounded-xl text-xs font-black ${color}`}>{value}</span>
  </div>
);

const LevelProgressCard = ({ level, title, percentage, learned, total, color, delay }) => {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 ring-indigo-50',
    teal: 'from-teal-500 to-teal-600 text-teal-600 ring-teal-50',
    purple: 'from-purple-500 to-purple-600 text-purple-600 ring-purple-50'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white p-4 sm:p-6 rounded-[20px] sm:rounded-[32px] border border-slate-100 shadow-lg shadow-slate-100/50 flex flex-col items-center text-center group transition-all hover:-translate-y-1 min-w-[140px] sm:min-w-0 shrink-0"
    >
      <div className={`relative w-16 h-16 sm:w-20 sm:h-20 mb-3 sm:mb-4 flex items-center justify-center rounded-full ring-4 sm:ring-8 ${colors[color].split(' ')[2]}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
          <circle 
            cx="40" cy="40" r="36" 
            stroke="currentColor" strokeWidth="8" fill="transparent" 
            className="text-slate-50"
          />
          <motion.circle 
            cx="40" cy="40" r="36" 
            stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray={226}
            initial={{ strokeDashoffset: 226 }}
            animate={{ strokeDashoffset: 226 - (226 * percentage) / 100 }}
            transition={{ duration: 1.5, delay: delay + 0.5 }}
            className={`${colors[color].split(' ')[1]}`}
          />
        </svg>
        <span className="absolute text-base sm:text-lg font-black">{percentage}%</span>
      </div>
      <h4 className="font-black text-slate-800 text-sm sm:text-base">{level}</h4>
      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      <div className="mt-2 sm:mt-4 px-3 py-1 bg-slate-50 rounded-lg text-[9px] sm:text-[10px] font-black text-slate-400 italic">
        {learned} / {total} từ
      </div>
    </motion.div>
  );
};

const ResumeFlashcard = ({ level, current, total, title, color, onClick, delay }) => {
  const colors = {
    indigo: 'bg-indigo-600 shadow-indigo-100',
    teal: 'bg-teal-600 shadow-teal-100',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`${colors[color]} p-4 sm:p-6 rounded-[20px] sm:rounded-[32px] text-white shadow-xl flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.02] active:scale-95`}
    >
      <div className="space-y-1">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">{level}</span>
        <h4 className="text-base sm:text-xl font-black">{title}</h4>
        <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
          <div className="w-20 sm:w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full" style={{ width: `${(current/total)*100}%` }} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold">Thẻ {current}</span>
        </div>
      </div>
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shrink-0 ml-3">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </motion.div>
  );
};

export default Dashboard;
