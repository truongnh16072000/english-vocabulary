import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Volume2, Trophy, AlertCircle } from 'lucide-react';
import { calculateSimilarity, getDiff } from '../../utils/speech';
import { playSound } from '../../utils/sounds';

const PronunciationModal = ({ isOpen, onClose, wordObj, themeColor = 'rose' }) => {
  const [isListening, setIsListening] = useState(false);
  const [pronunciationResult, setPronunciationResult] = useState(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Safari mới nhất.");
      return;
    }

    const recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setPronunciationResult(null);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const result = {
        transcript: transcript,
        accuracy: calculateSimilarity(transcript, wordObj.word),
        diff: getDiff(transcript, wordObj.word)
      };
      setPronunciationResult(result);
      if (result.accuracy >= 80) {
        playSound('success');
      } else {
        playSound('error');
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className={`p-6 bg-gradient-to-r from-${themeColor}-500 to-${themeColor}-600 text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <Mic size={24} />
            </div>
            <h2 className="text-xl font-bold">Luyện Phát Âm</h2>
          </div>
          <p className="text-white/80">Nhấn vào mic và đọc to từ vựng để kiểm tra độ chính xác</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Target Word Display */}
          <div className="text-center space-y-2">
            <h3 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight">
              {wordObj.word}
            </h3>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">
              {wordObj.ipa}
            </p>
            <div className="flex justify-center">
               <button 
                onClick={() => {
                   const utterance = new SpeechSynthesisUtterance(wordObj.word);
                   utterance.lang = 'en-US';
                   window.speechSynthesis.speak(utterance);
                   playSound('click');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${themeColor}-50 dark:bg-${themeColor}-900/30 text-${themeColor}-600 dark:text-${themeColor}-400 hover:bg-${themeColor}-100 dark:hover:bg-${themeColor}-900/50 transition-colors font-semibold`}
               >
                 <Volume2 size={18} />
                 Nghe mẫu
               </button>
            </div>
          </div>

          {/* Result Area */}
          <AnimatePresence mode="wait">
            {pronunciationResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Score Circle */}
                <div className="flex justify-center">
                  <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border-4 ${
                    pronunciationResult.accuracy >= 80 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
                    pronunciationResult.accuracy >= 50 ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 
                    'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                  }`}>
                    <div className="text-center">
                      <span className={`text-4xl font-bold ${
                        pronunciationResult.accuracy >= 80 ? 'text-green-600' : 
                        pronunciationResult.accuracy >= 50 ? 'text-amber-600' : 
                        'text-rose-600'
                      }`}>
                        {pronunciationResult.accuracy}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="text-center space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider font-bold">Bạn đã nói:</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                      "{pronunciationResult.transcript}"
                    </p>
                  </div>
                  
                  {pronunciationResult.accuracy >= 80 ? (
                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold">
                      <Trophy size={18} />
                      Tuyệt vời! Bạn phát âm cực chuẩn.
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-amber-600 font-bold">
                      <AlertCircle size={18} />
                      Gần được rồi! Hãy thử lại nhé.
                    </div>
                  )}
                </div>
              </motion.div>
            ) : isListening ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 space-y-6"
              >
                <div className="flex justify-center gap-1 h-12 items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [12, 48, 12] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                      className={`w-1.5 bg-${themeColor}-500 rounded-full`}
                    />
                  ))}
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Đang lắng nghe...</p>
              </motion.div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-400 dark:text-slate-500 italic">
                  Chưa có dữ liệu. Hãy nhấn Mic bên dưới.
                </p>
              </div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <div className="flex justify-center pb-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startListening}
              disabled={isListening}
              className={`w-20 h-20 flex items-center justify-center rounded-full shadow-lg transition-all ${
                isListening 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' 
                : `bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white shadow-${themeColor}-500/30`
              }`}
            >
              <Mic size={32} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default PronunciationModal;
