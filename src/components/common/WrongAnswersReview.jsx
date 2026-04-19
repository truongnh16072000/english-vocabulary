import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Volume2 } from 'lucide-react';

const WrongAnswersReview = ({ wrongAnswers, onSpeak, themeColor = 'indigo' }) => {
  if (!wrongAnswers || wrongAnswers.length === 0) return null;

  const colorThemes = {
    indigo: {
      text: 'text-indigo-600',
      hoverBg: 'hover:bg-indigo-600'
    },
    teal: {
      text: 'text-teal-600',
      hoverBg: 'hover:bg-teal-600'
    },
    emerald: {
      text: 'text-emerald-600',
      hoverBg: 'hover:bg-emerald-600'
    }
  };

  const theme = colorThemes[themeColor] || colorThemes.indigo;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 text-left space-y-4 font-sans"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shadow-sm">
          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cần luyện tập thêm các từ sau:</h3>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {wrongAnswers.map((item, idx) => (
          <div key={idx} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-rose-200 transition-all group relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h4 className="text-lg font-black text-slate-800 capitalize group-hover:text-rose-600 transition-colors duration-300">{item.word}</h4>
                <p className="text-slate-400 text-xs font-medium tracking-wide">
                  {item.ipa} • <span className={`${theme.text} italic font-black`}>{item.pos}</span>
                </p>
              </div>
              <button 
                onClick={() => onSpeak(item.word)} 
                className={`p-2.5 rounded-full bg-white transition-all shadow-sm ${theme.text} ${theme.hoverBg} hover:text-white active:scale-90`}
                title="Nghe phát âm"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-700 font-black text-sm mb-3 relative z-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Nghĩa: {item.meaning}
            </p>
            
            <div className="bg-white/60 p-4 rounded-2xl border-l-4 border-rose-400 shadow-sm relative z-10 transition-colors group-hover:bg-white/80">
              <p className="text-[11px] text-slate-600 italic leading-relaxed mb-1.5">"{item.example}"</p>
              {item.translation && (
                <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">{item.translation}</p>
              )}
            </div>

            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WrongAnswersReview;
