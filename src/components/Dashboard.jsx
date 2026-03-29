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
    a2Learned: 0,
    b1Learned: 0,
    a2Flashcard: 0,
    b1Flashcard: 0,
    streak: 3, // Giả lập streak
    lastStudy: 'Hôm nay'
  });

  useEffect(() => {
    const a2Learned = JSON.parse(localStorage.getItem('a2_learned_words') || '[]');
    const b1Learned = JSON.parse(localStorage.getItem('b1_learned_words') || '[]');
    const a2Flash = parseInt(localStorage.getItem('a2_flashcard_progress') || '0', 10);
    const b1Flash = parseInt(localStorage.getItem('b1_flashcard_progress') || '0', 10);

    setStats(prev => ({
      ...prev,
      a2Learned: a2Learned.length,
      b1Learned: b1Learned.length,
      a2Flashcard: a2Flash,
      b1Flashcard: b1Flash
    }));
  }, []);

  const totalLearned = stats.a2Learned + stats.b1Learned;
  const totalWords = stats.a2Total + stats.b1Total;
  const totalPercentage = Math.round((totalLearned / totalWords) * 100) || 0;
  
  const a2Percentage = Math.round((stats.a2Learned / stats.a2Total) * 100) || 0;
  const b1Percentage = Math.round((stats.b1Learned / stats.b1Total) * 100) || 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-10 bg-white min-h-screen font-sans text-slate-900"
    >
      {/* Welcome Header */}
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium italic">Chào mừng quay trở lại! Bạn đã hoàn thành {totalPercentage}% lộ trình.</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-4 bg-amber-50 px-6 py-4 rounded-3xl border border-amber-100 shadow-sm shadow-amber-50"
        >
          <div className="p-3 bg-amber-500 rounded-2xl text-white float-anim">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 leading-none">{stats.streak} Ngày</div>
            <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">Chuỗi học tập</div>
          </div>
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          icon={<BookOpen className="text-indigo-500" />} 
          title="Tổng từ học" 
          value={totalLearned} 
          subtitle={`trong tổng số ${totalWords}`}
          color="bg-indigo-50"
          delay={0.1}
        />
        <StatCard 
          icon={<Brain className="text-teal-500" />} 
          title="Từ trình độ B1" 
          value={stats.b1Learned} 
          subtitle={`${b1Percentage}% hoàn thành`}
          color="bg-teal-50"
          delay={0.2}
        />
        <StatCard 
          icon={<Star className="text-purple-500" />} 
          title="Từ trình độ A2" 
          value={stats.a2Learned} 
          subtitle={`${a2Percentage}% hoàn thành`}
          color="bg-purple-50"
          delay={0.3}
        />
        <StatCard 
          icon={<TrendingUp className="text-rose-500" />} 
          title="Tốc độ học" 
          value="~15" 
          subtitle="từ mới / tuần"
          color="bg-rose-50"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Progress Overview */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 rounded-[40px] shadow-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
                Tiến độ chi tiết
              </h2>
              <div className="text-xs font-black uppercase tracking-widest text-slate-400">Dữ liệu thời gian thực</div>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-sm font-black uppercase tracking-wider text-indigo-600">A2 Vocabulary</span>
                    <h3 className="text-lg font-bold">Làm chủ căn bản</h3>
                  </div>
                  <span className="text-3xl font-black text-slate-900 leading-none">{a2Percentage}%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${a2Percentage}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                  />
                </div>
                <p className="text-xs font-bold text-slate-400 italic">Học {stats.a2Learned} / {stats.a2Total} từ vựng cấp độ A2</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-sm font-black uppercase tracking-wider text-teal-600">B1 Vocabulary</span>
                    <h3 className="text-lg font-bold">Nâng tầm giao tiếp</h3>
                  </div>
                  <span className="text-3xl font-black text-slate-900 leading-none">{b1Percentage}%</span>
                </div>
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${b1Percentage}%` }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                  />
                </div>
                <p className="text-xs font-bold text-slate-400 italic">Học {stats.b1Learned} / {stats.b1Total} từ vựng cấp độ B1</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Resume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <ResumeCard 
              level="A2" 
              progress={stats.a2Flashcard} 
              total={stats.a2Total}
              color="bg-indigo-600"
              onClick={() => setActiveTab('a2-vocab')}
              delay={1}
            />
            <ResumeCard 
              level="B1" 
              progress={stats.b1Flashcard} 
              total={stats.b1Total}
              color="bg-teal-600"
              onClick={() => setActiveTab('b1-vocab')}
              delay={1.1}
            />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-6">
              <div className="p-4 bg-white/10 rounded-3xl w-fit">
                <Target className="w-8 h-8 text-indigo-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">Mục tiêu sắp tới</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Tiếp cận trình độ B1 bằng việc hoàn thành ít nhất 50 từ vựng mỗi tuần. Sử dụng AI để đặt câu thực tế.</p>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-black uppercase text-indigo-300 tracking-widest underline decoration-2 underline-offset-4 cursor-pointer">Xem chi tiết</span>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-dotted border-slate-200 rounded-[40px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-500" />
              <h3 className="font-black text-lg text-slate-800">Huy chương đạt được</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              <Badge delay="delay-100" />
              <Badge delay="delay-200" opacity="opacity-40" />
              <Badge delay="delay-300" opacity="opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-50 transition-all hover:-translate-y-1 hover:shadow-xl group"
  >
    <div className={`p-4 rounded-2xl ${color} w-fit mb-4 transition-transform group-hover:scale-110`}>
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </div>
    <div className="space-y-0.5">
      <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{title}</div>
      <div className="text-3xl font-black text-slate-900">{value}</div>
      <div className="text-[11px] font-bold text-slate-400 italic">{subtitle}</div>
    </div>
  </motion.div>
);

const ResumeCard = ({ level, progress, total, color, onClick, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    onClick={onClick}
    className={`p-8 rounded-[40px] shadow-2xl ${color} text-white relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] active:scale-95`}
  >
    <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-125 transition-transform">
      <Sparkles className="w-32 h-32" />
    </div>
    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-black">Học tiếp {level}</h3>
        <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
      </div>
      <div className="space-y-2">
        <div className="text-xs uppercase font-black tracking-widest opacity-60">Thẻ nhớ đang dừng ở:</div>
        <div className="text-xl font-bold flex items-baseline gap-1">
          {progress} <span className="text-xs opacity-50">/ {total} từ</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const Badge = ({ delay = '', opacity = '' }) => (
  <div className={`w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 transition-all hover:scale-110 ${delay} ${opacity}`}>
    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
  </div>
);

export default Dashboard;
