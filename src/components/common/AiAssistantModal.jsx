import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, BookOpen, PenTool, Brain, Volume2, Languages } from 'lucide-react';

const AiAssistantModal = ({ 
  isOpen, 
  onClose, 
  wordObj, 
  onExplain, 
  onCheckSentence, 
  aiResponse, 
  isAiLoading, 
  userSentence, 
  setUserSentence,
  themeColor = 'indigo' 
}) => {
  const [aiMode, setAiMode] = useState('practice');
  const [explanationLang, setExplanationLang] = useState('vi');

  // Automatically trigger explanation when language or word changes
  React.useEffect(() => {
    if (isOpen && aiMode === 'explain' && wordObj) {
      onExplain(wordObj, explanationLang);
    }
  }, [explanationLang, aiMode, isOpen, wordObj]);

  const speak = (text) => {
    // Remove markdown symbols for better speech
    const cleanText = text.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = explanationLang === 'vi' ? 'vi-VN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const renderBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, j) => 
      part.startsWith('**') && part.endsWith('**') 
        ? <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong> 
        : part
    );
  };

  const renderAiText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <br key={i} />;
      
      if (trimmedLine.startsWith('#')) {
        const level = trimmedLine.match(/^#+/)[0].length;
        const content = trimmedLine.replace(/^#+\s*/, '');
        const sizeClass = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-md';
        return <h4 key={i} className={`${sizeClass} font-black text-slate-800 mt-4 mb-2`}>{content}</h4>;
      }

      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const content = trimmedLine.replace(/^[-*]\s*/, '');
        return (
          <div key={i} className="flex gap-3 mb-2 ml-2">
            <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${themeColor === 'indigo' ? 'bg-indigo-400' : 'bg-purple-400'}`}></div>
            <p className="text-[15px] leading-relaxed flex-1">{renderBoldText(content)}</p>
          </div>
        );
      }

      return (
        <p key={i} className="mb-2 text-[15px] leading-relaxed">
          {renderBoldText(line)}
        </p>
      );
    });
  };

  if (!isOpen || !wordObj) return null;

  const colorClasses = {
    indigo: 'bg-indigo-600 ring-indigo-50 border-indigo-100 text-indigo-600',
    purple: 'bg-purple-600 ring-purple-50 border-purple-100 text-purple-600',
    emerald: 'bg-emerald-600 ring-emerald-50 border-emerald-100 text-emerald-600',
  };

  const selectedColor = colorClasses[themeColor] || colorClasses.indigo;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
      >
        
        {/* Modal Header */}
        <div className={`${selectedColor.split(' ')[0]} p-6 sm:p-8 flex justify-between items-center text-white shrink-0`}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-xl sm:text-2xl uppercase tracking-tighter">AI Trợ Giảng</h3>
              <p className="text-white/80 text-xs sm:text-sm font-bold">Đang học: <span className="text-white capitalize">{wordObj.word}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Navigation */}
        <div className="flex border-b border-slate-100 shrink-0 font-sans px-2">
          {[
            { id: 'explain', label: 'GIẢI THÍCH', icon: <BookOpen className="w-5 h-5" /> },
            { id: 'practice', label: 'LUYỆN TẬP', icon: <Brain className="w-5 h-5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setAiMode(tab.id); }}
              className={`flex-1 py-5 text-xs sm:text-sm font-black flex justify-center items-center gap-3 transition-colors relative ${
                aiMode === tab.id ? selectedColor.split(' ')[2] : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon} {tab.label}
              {aiMode === tab.id && (
                <motion.div 
                  layoutId="activeTab" 
                  className={`absolute bottom-0 left-0 right-0 h-1 ${selectedColor.split(' ')[0]}`} 
                />
              )}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30">
          {aiMode === 'practice' && (
            <div className="mb-8 animate-slide-up">
              <label className="block text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">ĐỀ BÀI</label>
              <div className={`bg-white p-6 rounded-3xl border-2 mb-6 group transition-all hover:shadow-lg ${themeColor === 'indigo' ? 'border-indigo-50' : 'border-purple-50'}`}>
                <p className="text-slate-700 font-bold leading-relaxed italic">
                  "Hãy viết một câu tiếng Anh sử dụng từ <span className={`${selectedColor.split(' ')[2]} underline underline-offset-4 decoration-2`}>"{wordObj.word}"</span> để mình chấm điểm và sửa lỗi cho bạn nhé!"
                </p>
              </div>
              
              <div className="relative">
                <textarea 
                  value={userSentence}
                  onChange={(e) => setUserSentence(e.target.value)}
                  placeholder="Nhập câu của bạn tại đây..."
                  className="w-full p-6 rounded-[32px] border-2 border-slate-100 focus:border-slate-300 focus:ring-0 transition-all min-h-[140px] font-medium text-slate-700 shadow-inner resize-none outline-none"
                />
                <button 
                  onClick={onCheckSentence}
                  disabled={isAiLoading || !userSentence.trim()}
                  className={`${selectedColor.split(' ')[0]} text-white px-8 py-4 rounded-2xl font-black text-xs tracking-widest flex items-center gap-3 absolute bottom-4 right-4 hover:opacity-90 disabled:opacity-50 transition-all shadow-xl active:scale-95`}
                >
                  {isAiLoading ? 'AI ĐANG XEM...' : 'CHẤM ĐIỂM'} <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {aiMode === 'explain' && (
            <div className="flex flex-col items-center py-4 animate-bounce-slow">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8 gap-1 shadow-inner border border-slate-200/50">
                <button 
                  onClick={() => setExplanationLang('vi')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 ${
                    explanationLang === 'vi' 
                      ? `${selectedColor.split(' ')[0]} text-white shadow-md scale-105` 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" /> TIẾNG VIỆT
                </button>
                <button 
                  onClick={() => setExplanationLang('en')}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 ${
                    explanationLang === 'en' 
                      ? `${selectedColor.split(' ')[0]} text-white shadow-md scale-105` 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" /> ENGLISH
                </button>
              </div>

              {!aiResponse && !isAiLoading && (
                <>
                  <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mb-6 shadow-sm ${themeColor === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                    <Sparkles className="w-10 h-10" />
                  </div>
                  <button 
                    onClick={() => onExplain(wordObj, explanationLang)}
                    className={`${selectedColor.split(' ')[0]} text-white px-10 py-5 rounded-[25px] font-black text-lg shadow-2xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-3`}
                  >
                    {explanationLang === 'vi' ? 'NHỜ AI GIẢI THÍCH CHI TIẾT' : 'ASK AI TO EXPLAIN'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* AI Response Area */}
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm min-h-[120px]">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-10 gap-6">
                <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin ${selectedColor.split(' ')[2]}`}></div>
                <p className={`${selectedColor.split(' ')[2]} font-black uppercase tracking-widest text-xs animate-pulse`}>AI đang suy nghĩ...</p>
              </div>
            ) : aiResponse ? (
              <div className="text-slate-700 leading-relaxed relative group">
                <button 
                  onClick={() => speak(aiResponse)}
                  className={`absolute -top-12 -right-4 p-3 rounded-2xl bg-white border border-slate-100 shadow-xl transition-all hover:scale-110 active:scale-90 flex items-center gap-2 font-black text-[10px] tracking-widest ${selectedColor.split(' ')[2]}`}
                  title="Nghe giải thích"
                >
                  <Volume2 className="w-4 h-4" /> <span>PLAY AUDIO</span>
                </button>
                {renderAiText(aiResponse)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-slate-300">
                <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xs font-black uppercase tracking-[0.2em] italic">
                  {aiMode === 'explain' 
                    ? 'Nhấn nút phía trên để bắt đầu' 
                    : 'Viết câu để AI chấm điểm'}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default AiAssistantModal;
