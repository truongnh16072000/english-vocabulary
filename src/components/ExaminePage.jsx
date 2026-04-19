import React, { useState, useEffect, useMemo } from 'react';
import { playSound } from '../utils/sounds';
import { motion } from 'framer-motion';
import { 
  CheckCircle, RotateCcw, Volume2, Trophy, Brain, 
  BookOpen, Filter, AlertCircle, Tags, LayoutGrid,
  Heart, Plane, GraduationCap, Leaf, Music, Home, Smile
} from 'lucide-react';
import { a2Vocabulary } from './A2Vocabulary';
import { b1Vocabulary } from './B1Vocabulary';
import { b2Vocabulary } from './B2Vocabulary';
import WrongAnswersReview from './common/WrongAnswersReview';

const ExaminePage = () => {
  // Level selection
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  // Topic filter
  const [filterTopic, setFilterTopic] = useState('All');

  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizPool, setQuizPool] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);

  // Get vocabulary based on selected level
  const allVocabulary = useMemo(() => {
    switch (selectedLevel) {
      case 'a2': return a2Vocabulary;
      case 'b1': return b1Vocabulary;
      case 'b2': return b2Vocabulary;
      default: return [...a2Vocabulary, ...b1Vocabulary, ...b2Vocabulary];
    }
  }, [selectedLevel]);

  // Filter by topic
  const filteredVocab = useMemo(() => {
    if (filterTopic === 'All') return allVocabulary;
    return allVocabulary.filter(item => item.topic === filterTopic);
  }, [allVocabulary, filterTopic]);

  const topicConfig = {
    'All': { label: 'Tất cả', icon: <LayoutGrid className="w-4 h-4" />, color: 'bg-rose-600' },
    'Travel': { label: 'Du lịch', icon: <Plane className="w-4 h-4" />, color: 'bg-blue-500' },
    'Health': { label: 'Sức khỏe', icon: <Heart className="w-4 h-4" />, color: 'bg-red-500' },
    'Work & Edu': { label: 'Học & Làm', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-amber-600' },
    'Nature': { label: 'Thiên nhiên', icon: <Leaf className="w-4 h-4" />, color: 'bg-emerald-600' },
    'Leisure': { label: 'Giải trí', icon: <Music className="w-4 h-4" />, color: 'bg-purple-600' },
    'Life': { label: 'Đời sống', icon: <Home className="w-4 h-4" />, color: 'bg-sky-600' },
    'Feelings': { label: 'Cảm xúc', icon: <Smile className="w-4 h-4" />, color: 'bg-pink-600' },
    'General': { label: 'Tổng hợp', icon: <Tags className="w-4 h-4" />, color: 'bg-slate-500' },
  };

  const topics = Object.keys(topicConfig);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const generateOptions = (correctAnswer) => {
    const pool = allVocabulary.filter(item => item.meaning !== correctAnswer);
    const others = pool
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(item => item.meaning);
    return [...others, correctAnswer].sort(() => 0.5 - Math.random());
  };

  useEffect(() => {
    if (quizActive && !quizFinished && quizPool.length > 0 && quizIndex < quizPool.length) {
      setQuizOptions(generateOptions(quizPool[quizIndex].meaning));
    }
  }, [quizIndex, quizFinished, quizPool, quizActive]);

  const startNewQuiz = (size) => {
    const count = size === 'all' ? filteredVocab.length : Math.min(size, filteredVocab.length);
    const shuffled = [...filteredVocab].sort(() => 0.5 - Math.random());
    const pool = shuffled.slice(0, count);
    
    setQuizPool(pool);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizActive(true);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setWrongAnswers([]);
    setReviewMode(false);
    playSound('success');
  };

  const handleQuizAnswer = (answer) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    if (answer === quizPool[quizIndex].meaning) {
      setQuizScore(quizScore + 1);
      playSound('correct');
    } else {
      playSound('wrong');
      setWrongAnswers(prev => {
        if (prev.find(w => w.word === quizPool[quizIndex].word)) return prev;
        return [...prev, quizPool[quizIndex]];
      });
    }
    
    setTimeout(() => {
      if (quizIndex < quizPool.length - 1) {
        setQuizIndex(quizIndex + 1);
        setSelectedAnswer(null);
        playSound('select');
      } else {
        setQuizFinished(true);
        playSound('success');
      }
    }, 1200);
  };

  const levelConfig = [
    { id: 'all', label: 'Tất cả', count: a2Vocabulary.length + b1Vocabulary.length + b2Vocabulary.length, color: 'bg-gradient-to-r from-rose-500 to-orange-500' },
    { id: 'a2', label: 'A2', count: a2Vocabulary.length, color: 'bg-indigo-600' },
    { id: 'b1', label: 'B1', count: b1Vocabulary.length, color: 'bg-teal-600' },
    { id: 'b2', label: 'B2', count: b2Vocabulary.length, color: 'bg-emerald-600' },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans pb-10">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-200">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2">Kiểm Tra Từ Vựng</h1>
          <p className="text-slate-400 font-medium italic">Thử thách từ vựng ở mọi cấp độ Cambridge</p>
        </div>

        {/* Level Selection */}
        <div className="mb-8">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Chọn cấp độ
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {levelConfig.map(level => (
              <button
                key={level.id}
                onClick={() => { setSelectedLevel(level.id); setQuizActive(false); setFilterTopic('All'); playSound('select'); }}
                className={`p-4 rounded-2xl font-black transition-all border-2 active:scale-95 ${
                  selectedLevel === level.id 
                    ? `${level.color} text-white border-transparent shadow-lg` 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="text-lg">{level.label}</div>
                <div className={`text-xs font-bold ${selectedLevel === level.id ? 'text-white/70' : 'text-slate-400'}`}>{level.count} từ</div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {topics.map(topic => (
              <button 
                key={topic} 
                onClick={() => { setFilterTopic(topic); setQuizActive(false); playSound('select'); }}
                className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-sm border ${
                  filterTopic === topic 
                    ? 'bg-rose-600 text-white border-rose-600 shadow-rose-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {topicConfig[topic].icon}
                {topicConfig[topic].label}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz Area */}
        <div className="max-w-2xl mx-auto">
          {!quizActive ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 sm:p-14 rounded-[40px] sm:rounded-[50px] shadow-2xl border border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Trophy className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Thử thách từ vựng</h2>
              <p className="text-slate-400 font-medium mb-4 italic">Chọn số lượng từ bạn muốn kiểm tra</p>
              <p className="text-sm text-rose-500 font-bold mb-10">
                📚 {selectedLevel === 'all' ? 'Tất cả cấp độ' : selectedLevel.toUpperCase()} • {topicConfig[filterTopic].label} • {filteredVocab.length} từ sẵn sàng
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                {[10, 20, 50, 'all'].map(size => (
                  <button 
                    key={size}
                    onClick={() => startNewQuiz(size)}
                    disabled={filteredVocab.length === 0}
                    className="p-5 rounded-3xl border-2 border-slate-100 hover:border-rose-400 hover:bg-rose-50 transition-all font-black text-slate-700 active:scale-95 group disabled:opacity-30"
                  >
                    <div className="text-2xl group-hover:text-rose-600">{size === 'all' ? filteredVocab.length : Math.min(size, filteredVocab.length)}</div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 group-hover:text-rose-400">{size === 'all' ? 'Tất cả từ' : 'Từ vựng'}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : !quizFinished ? (
            <div className="bg-white p-6 sm:p-10 rounded-[30px] sm:rounded-[40px] shadow-2xl border border-slate-100 animate-slide-up">
              <div className="flex justify-between items-center mb-12">
                <div className="flex flex-col text-left">
                  <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">TIẾN ĐỘ</span>
                  <span className="text-slate-800 font-black text-lg">{quizIndex + 1} / {quizPool.length}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-black text-sm shadow-sm border border-emerald-100 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> {quizScore}
                  </div>
                  <button
                    onClick={() => { setQuizActive(false); playSound('click'); }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Thoát
                  </button>
                </div>
              </div>

              <div className="text-center mb-12">
                <p className="text-slate-400 text-sm font-bold mb-4 uppercase tracking-widest">Từ này nghĩa là gì?</p>
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-800 capitalize mb-6 sm:mb-8 tracking-tighter break-words px-2">{quizPool[quizIndex]?.word}</h3>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-slate-300 text-sm font-medium">{quizPool[quizIndex]?.ipa}</span>
                  <button 
                    onClick={() => speak(quizPool[quizIndex]?.word)} 
                    className="p-3 bg-rose-50 rounded-full text-rose-500 hover:text-rose-700 transition-all hover:scale-110 active:scale-90"
                  >
                    <Volume2 className="w-8 h-8" />
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {quizOptions.map((option, idx) => (
                  <button
                    key={idx} 
                    onClick={() => !selectedAnswer && handleQuizAnswer(option)}
                    className={`w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl text-left border-2 sm:border-4 transition-all font-black text-base sm:text-lg shadow-sm flex justify-between items-center group ${
                      selectedAnswer === option 
                        ? (option === quizPool[quizIndex]?.meaning ? 'bg-emerald-50 border-emerald-500 text-emerald-700 scale-[1.03]' : 'bg-rose-50 border-rose-500 text-rose-700 shake') 
                        : selectedAnswer && option === quizPool[quizIndex]?.meaning 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'bg-white border-slate-100 hover:border-rose-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex-1 pr-2 sm:pr-4 leading-tight">{option}</span>
                    {selectedAnswer === option && (
                      option === quizPool[quizIndex]?.meaning ? <CheckCircle className="w-6 h-6" /> : <RotateCcw className="w-6 h-6" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 sm:p-16 rounded-[40px] sm:rounded-[50px] shadow-2xl text-center border border-rose-50 animate-zoom-in">
              <div className="w-28 h-28 bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <Brain className="w-14 h-14" />
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4 uppercase">KẾT QUẢ</h2>
              <p className="text-slate-500 font-bold mb-12 italic text-lg">
                Bạn đã chinh phục được {quizScore} trên {quizPool.length} thử thách!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="text-3xl font-black text-rose-600">{Math.round((quizScore / quizPool.length) * 100)}%</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Độ chính xác</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="text-3xl font-black text-slate-800">{quizScore}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Câu trả lời đúng</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button 
                  onClick={() => setQuizActive(false)} 
                  className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-3xl font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-95"
                >
                  LÀM BÀI MỚI
                </button>
                {wrongAnswers.length > 0 && (
                  <button 
                    onClick={() => setReviewMode(!reviewMode)} 
                    className={`w-full sm:w-auto px-8 py-5 rounded-3xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      reviewMode ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    <AlertCircle className="w-6 h-6" />
                    {reviewMode ? 'ĐÓNG XEM LẠI' : `XEM ${wrongAnswers.length} CÂU SAI`}
                  </button>
                )}
              </div>

              {reviewMode && wrongAnswers.length > 0 && (
                <WrongAnswersReview 
                  wrongAnswers={wrongAnswers} 
                  onSpeak={speak} 
                  themeColor="indigo" 
                />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-slate-300">
        <div className="flex items-center justify-center gap-2 font-black tracking-widest uppercase text-xs">
          <BookOpen className="w-4 h-4" />
          Vocabulary Examine • All Levels
        </div>
      </footer>
    </div>
  );
};

export default ExaminePage;
