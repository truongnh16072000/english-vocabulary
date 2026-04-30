import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Brain, Trophy, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-60" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-100 rounded-full blur-[100px] opacity-50" />
      <div className="absolute top-[20%] left-[10%] w-[200px] h-[200px] bg-rose-100 rounded-full blur-[80px] opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-6 rounded-[28px] bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-200"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
            Vocabulary Pro
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Master English with smart flashcards & AI
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[40px] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100"
        >
          <h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
            Chào mừng bạn! 👋
          </h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Đăng nhập để đồng bộ tiến trình học tập trên mọi thiết bị và không bao giờ mất dữ liệu.
          </p>

          {/* Features preview */}
          <div className="space-y-4 mb-8">
            <FeatureRow 
              icon={<BookOpen className="w-4 h-4" />} 
              color="bg-indigo-100 text-indigo-600"
              text="2,625+ từ vựng từ A2 đến B2"
              delay={0.4}
            />
            <FeatureRow 
              icon={<Brain className="w-4 h-4" />} 
              color="bg-purple-100 text-purple-600"
              text="AI Assistant giải thích & luyện phát âm"
              delay={0.5}
            />
            <FeatureRow 
              icon={<Trophy className="w-4 h-4" />} 
              color="bg-amber-100 text-amber-600"
              text="Theo dõi tiến trình & đồng bộ dữ liệu"
              delay={0.6}
            />
          </div>

          {/* Google Sign-in Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm transition-all hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-slate-900/10"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}</span>
          </motion.button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-rose-500 text-xs font-bold"
            >
              {error}
            </motion.p>
          )}

          <p className="mt-6 text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            Dữ liệu được bảo mật bởi Google Firebase
          </p>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-xs text-slate-300 font-bold tracking-wider"
        >
          BUILT WITH ♥ FOR ENGLISH LEARNERS
        </motion.p>
      </motion.div>
    </div>
  );
};

const FeatureRow = ({ icon, color, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3"
  >
    <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-600">{text}</span>
  </motion.div>
);

export default LoginPage;
