import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Filter, Heart } from 'lucide-react';

const FilterModal = ({ 
  isOpen, 
  onClose, 
  topics, 
  topicConfig, 
  filterTopic, 
  onTopicSelect, 
  showLearned, 
  onToggleLearned,
  showFavorites,
  onToggleFavorites,
  themeColor = 'indigo'
}) => {
  if (!isOpen) return null;

  const colorMap = {
    indigo: {
      toggleBg: 'bg-indigo-600',
      toggleRing: 'ring-indigo-100',
      activeTopic: 'bg-indigo-600 border-indigo-600 shadow-indigo-200 text-white',
      accent: 'text-indigo-600',
      btnHover: 'hover:bg-indigo-50 hover:text-indigo-600'
    },
    teal: {
      toggleBg: 'bg-teal-600',
      toggleRing: 'ring-teal-100',
      activeTopic: 'bg-teal-600 border-teal-600 shadow-teal-200 text-white',
      accent: 'text-teal-600',
      btnHover: 'hover:bg-teal-50 hover:text-teal-600'
    },
    emerald: {
      toggleBg: 'bg-emerald-600',
      toggleRing: 'ring-emerald-100',
      activeTopic: 'bg-emerald-600 border-emerald-600 shadow-emerald-200 text-white',
      accent: 'text-emerald-600',
      btnHover: 'hover:bg-emerald-50 hover:text-emerald-600'
    }
  };

  const theme = colorMap[themeColor] || colorMap.indigo;

  // We must return the portal structure unconditionally if we want AnimatePresence to handle exit animations,
  // but portal requires an actual mounted DOM element to some extent.
  // We can just use AnimatePresence wrapping the condition inside the portal.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-5 sm:p-6 flex items-center justify-between border-b border-slate-100/60">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl bg-slate-50 ${theme.accent}`}>
                  <Filter className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Bộ lọc từ vựng</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-3 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-6 no-scrollbar bg-slate-50/50">
              
              {/* Learned Toggle Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Trạng thái học</h3>
                <button 
                  onClick={onToggleLearned}
                  className={`w-full flex items-center justify-between p-5 rounded-[24px] font-bold transition-all border-2 ${showLearned ? `${theme.toggleBg} text-white border-transparent shadow-lg shadow-slate-200/50` : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    {showLearned ? <Eye className="w-5 h-5 opacity-90" /> : <EyeOff className="w-5 h-5 text-slate-400" />}
                    <span className="text-base sm:text-lg">{showLearned ? 'Đang hiển thị từ đã học' : 'Đang ẩn từ đã học'}</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${showLearned ? 'bg-white/30' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${showLearned ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </button>
                <p className="text-xs font-semibold text-slate-400 px-3 opacity-80">
                  {showLearned ? "Tất cả thẻ từ vựng (kể cả những thẻ bạn đánh dấu đã học) sẽ xuất hiện trong bộ bài." : "Hệ thống tự động lọc bỏ các thẻ bạn đã đánh dấu hoàn thành để tập trung vào từ mới."}
                </p>
              </section>

              {/* Favorites Toggle Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Từ vựng yêu thích</h3>
                <button 
                  onClick={onToggleFavorites}
                  className={`w-full flex items-center justify-between p-5 rounded-[24px] font-bold transition-all border-2 ${showFavorites ? `${theme.toggleBg} text-white border-transparent shadow-lg shadow-slate-200/50` : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-sm'}`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className={`w-5 h-5 ${showFavorites ? 'fill-current opacity-90' : 'text-slate-400'}`} />
                    <span className="text-base sm:text-lg">{showFavorites ? 'Chỉ hiện từ yêu thích' : 'Hiện tất cả từ vựng'}</span>
                  </div>
                  <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${showFavorites ? 'bg-white/30' : 'bg-slate-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${showFavorites ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </div>
                </button>
              </section>

              {/* Categories Section */}
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Chủ đề từ vựng</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {topics.map(topic => (
                    <button 
                      key={topic} 
                      onClick={() => onTopicSelect(topic)}
                      className={`p-4 rounded-2xl text-sm font-bold flex flex-col items-start gap-3 transition-all ring-1 ring-inset ${filterTopic === topic ? theme.activeTopic : 'bg-white text-slate-600 ring-slate-200 shadow-sm hover:ring-slate-300 hover:bg-slate-50'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${filterTopic === topic ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                        {topicConfig[topic].icon}
                      </div>
                      <span>{topicConfig[topic].label}</span>
                    </button>
                  ))}
                </div>
              </section>

            </div>

            <div className="p-5 sm:p-6 border-t border-slate-100 border-solid bg-white">
              <button 
                onClick={onClose}
                className="w-full py-4 rounded-[20px] bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
              >
                Hoàn tất & Đóng
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default FilterModal;
