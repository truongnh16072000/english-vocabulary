import React, { useState, useEffect, useMemo } from 'react';
import { playSound } from '../utils/sounds';
import { 
  Search, Volume2, BookOpen,
  ChevronLeft, ChevronRight, Play, 
  Tags, LayoutGrid, Heart, Plane, GraduationCap, 
  Leaf, Music, Home, Smile, Filter, Sparkles,
  Mic
} from 'lucide-react';
import { callAIStream } from '../utils/openai';
import PronunciationModal from './common/PronunciationModal';
import AiAssistantModal from './common/AiAssistantModal';
import FilterModal from './common/FilterModal';
import { recordStudyActivity } from '../utils/studyTracking';

import { a2Vocabulary } from './A2Vocabulary';
import { b1Vocabulary } from './B1Vocabulary';
import { b2Vocabulary } from './B2Vocabulary';

const FlashcardsPage = () => {
  const [level, setLevel] = useState('B1'); // 'A2', 'B1', 'B2'
  
  const getThemeColor = (lvl) => {
    switch(lvl) {
      case 'A2': return 'indigo';
      case 'B1': return 'teal';
      case 'B2': return 'emerald';
      default: return 'teal';
    }
  };

  const themeColor = getThemeColor(level);

  const fullVocabulary = useMemo(() => {
    if (level === 'A2') return a2Vocabulary;
    if (level === 'B1') return b1Vocabulary;
    if (level === 'B2') return b2Vocabulary;
    return b1Vocabulary;
  }, [level]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  
  // Flashcard states need to be level-specific
  const [currentFlashcard, setCurrentFlashcard] = useState(() => {
    const saved = localStorage.getItem(`${level.toLowerCase()}_flashcard_progress`);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    const saved = localStorage.getItem(`${level.toLowerCase()}_flashcard_progress`);
    setCurrentFlashcard(saved ? parseInt(saved, 10) : 0);
  }, [level]);

  useEffect(() => {
    localStorage.setItem(`${level.toLowerCase()}_flashcard_progress`, currentFlashcard);
    if (currentFlashcard > 0) recordStudyActivity(1);
  }, [currentFlashcard, level]);
  
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCurrentWord, setAiCurrentWord] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [userSentence, setUserSentence] = useState('');
  const [isPronounceModalOpen, setIsPronounceModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Trạng thái từ đã học
  const [showLearned, setShowLearned] = useState(false);
  const [learnedWords, setLearnedWords] = useState(() => {
    const saved = localStorage.getItem(`${level.toLowerCase()}_learned_words`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem(`${level.toLowerCase()}_learned_words`);
    setLearnedWords(saved ? JSON.parse(saved) : []);
  }, [level]);

  useEffect(() => {
    localStorage.setItem(`${level.toLowerCase()}_learned_words`, JSON.stringify(learnedWords));
  }, [learnedWords, level]);

  const toggleLearned = (word) => {
    setLearnedWords(prev => {
      if (prev.includes(word)) {
        playSound('click');
        return prev.filter(w => w !== word);
      } else {
        playSound('success');
        return [...prev, word];
      }
    });
  };

  // Trạng thái từ yêu thích
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoriteWords, setFavoriteWords] = useState(() => {
    const saved = localStorage.getItem(`${level.toLowerCase()}_favorite_words`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem(`${level.toLowerCase()}_favorite_words`);
    setFavoriteWords(saved ? JSON.parse(saved) : []);
  }, [level]);

  useEffect(() => {
    localStorage.setItem(`${level.toLowerCase()}_favorite_words`, JSON.stringify(favoriteWords));
  }, [favoriteWords, level]);

  const toggleFavorite = (e, word) => {
    e.stopPropagation();
    setFavoriteWords(prev => {
      const isRemoving = prev.includes(word);
      if (isRemoving) {
        playSound('click');
        return prev.filter(w => w !== word);
      } else {
        playSound('success');
        return [...prev, word];
      }
    });
  };

  // Danh mục Topic
  const topicConfig = {
    'All': { label: 'Tất cả', icon: <LayoutGrid className="w-4 h-4" />, color: `bg-${themeColor}-600` },
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

  // Lọc từ vựng
  const filteredVocab = useMemo(() => {
    if (!fullVocabulary) return [];
    return fullVocabulary.filter(item => {
      const matchesSearch = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTopic = filterTopic === 'All' || item.topic === filterTopic;
      const matchesLearned = showLearned || !learnedWords.includes(item.word);
      const matchesFavorite = !showFavorites || favoriteWords.includes(item.word);
      return matchesSearch && matchesTopic && matchesLearned && matchesFavorite;
    });
  }, [fullVocabulary, searchQuery, filterTopic, learnedWords, showLearned, showFavorites, favoriteWords]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // --- AI Handlers ---
  const handleOpenAiModal = (wordObj) => {
    setAiCurrentWord(wordObj);
    setIsAiModalOpen(true);
    setAiResponse('');
    setUserSentence('');
  };

  const handleOpenPronounce = (wordObj) => {
    setAiCurrentWord(wordObj);
    setIsPronounceModalOpen(true);
  };

  const handleExplainWord = async (wordObj, lang = 'vi') => {
    const cacheKey = `ai_explain_${level.toLowerCase()}_${wordObj.word}_${lang}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setAiResponse(cached);
      return;
    }

    setIsAiLoading(true);
    setAiResponse('');
    
    let prompt;
    if (lang === 'vi') {
      prompt = `Hãy giải thích chi tiết cách sử dụng từ tiếng Anh "${wordObj.word}" (từ loại: ${wordObj.pos}, nghĩa: ${wordObj.meaning}). Cung cấp 2 ví dụ thực tế kèm lời dịch, và chỉ ra các sắc thái nghĩa hoặc lỗi sai thường gặp khi dùng từ này ở trình độ ${level}. Trình bày ngắn gọn, dễ hiểu.`;
    } else {
      prompt = `Explain the usage of the English word "${wordObj.word}" (pos: ${wordObj.pos}, meaning: ${wordObj.meaning}) in clear English for a ${level} learner. Provide 2 realistic examples with transitions into Vietnamese, and highlight common usage patterns or mistakes at the ${level} level. Respond ONLY in English for the explanation parts. Keep it concise and helpful.`;
    }
    
    let fullResponse = '';
    await callAIStream(prompt, (chunk) => {
      setIsAiLoading(false);
      fullResponse += chunk;
      setAiResponse(fullResponse);
    });

    if (fullResponse.trim()) {
      localStorage.setItem(cacheKey, fullResponse);
    }
  };

  const handleCheckSentence = async () => {
    if (!userSentence.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    const prompt = `Tôi đang học từ tiếng Anh "${aiCurrentWord.word}". Đánh giá câu sau của tôi: "${userSentence}". Hãy chỉ ra lỗi ngữ pháp hoặc cách dùng từ (nếu có), giải thích lý do, và đề xuất 1-2 cách viết tự nhiên hơn. Trình bày ngắn gọn, thân thiện.`;
    
    let fullResponse = '';
    await callAIStream(prompt, (chunk) => {
      setIsAiLoading(false);
      fullResponse += chunk;
      setAiResponse(fullResponse);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-10">

      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10">
        
        {/* Level Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 flex w-full sm:w-auto sm:inline-flex gap-1 sm:gap-2">
            {['A2', 'B1', 'B2'].map(lvl => (
              <button
                key={lvl}
                onClick={() => {
                  setLevel(lvl);
                  setSearchQuery('');
                  setFilterTopic('All');
                  setIsFlipped(false);
                }}
                className={`flex-1 sm:flex-none px-2 sm:px-8 py-3 rounded-xl font-black text-sm transition-all duration-300 ${level === lvl ? `bg-${getThemeColor(lvl)}-500 text-white shadow-md` : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                {lvl} <span className="hidden sm:inline">Level</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-${themeColor}-500 transition-colors`} />
              <input 
                type="text" placeholder="Tìm kiếm theo từ tiếng Anh hoặc nghĩa tiếng Việt..." 
                className={`w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-${themeColor}-100 focus:border-${themeColor}-500 outline-none shadow-sm transition-all text-sm sm:text-base`}
                value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentFlashcard(0); }}
              />
            </div>

            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="px-5 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Filter className="w-5 h-5" /> <span className="hidden sm:inline">Bộ lọc</span>
            </button>
          </div>
        </div>

        {filteredVocab.length > 0 && (
          <div className="flex flex-col items-center py-4 md:py-6 gap-6 md:gap-8">
            <div 
              className={`relative w-full max-w-md h-[min(450px,60vh)] cursor-pointer transition-all duration-700 preserve-3d group ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => { setIsFlipped(!isFlipped); playSound('click'); }}
              style={{ perspective: '1200px' }}
            >
              {/* MẶT TRƯỚC */}
              <div className={`absolute inset-0 bg-white rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 md:p-10 border-4 border-white ring-1 ring-slate-100 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute top-5 left-5 md:top-6 md:left-6 bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest uppercase">
                  {currentFlashcard + 1} / {filteredVocab.length}
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, filteredVocab[currentFlashcard].word)}
                  className="absolute top-5 right-5 md:top-6 md:right-6 bg-slate-100 p-2.5 rounded-xl transition-all hover:scale-110 active:scale-90 shadow-sm"
                >
                  <Heart className={`w-5 h-5 ${favoriteWords.includes(filteredVocab[currentFlashcard].word) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                </button>
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-6 ${topicConfig[filteredVocab[currentFlashcard].topic]?.color || 'bg-slate-500'}`}>
                   {topicConfig[filteredVocab[currentFlashcard].topic]?.icon || <Tags className="w-4 h-4"/>}
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 capitalize mb-4 tracking-tighter text-center break-words px-4 leading-tight">{filteredVocab[currentFlashcard].word}</h2>
                <p className="text-slate-400 text-2xl font-medium tracking-wide">{filteredVocab[currentFlashcard].ipa}</p>
                <div className="mt-16 flex items-center gap-3 text-slate-300 text-xs font-black uppercase tracking-[0.2em]">
                  <Play className="w-4 h-4" /> Chạm để lật thẻ
                </div>
              </div>

              {/* MẶT SAU */}
              <div 
                className={`absolute inset-0 bg-${themeColor}-600 rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-6 md:p-8 text-white backface-hidden transform rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="absolute top-5 left-5 md:top-6 md:left-6 bg-white/20 text-white px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-black tracking-widest uppercase">
                  {currentFlashcard + 1} / {filteredVocab.length}
                </div>
                <button 
                  onClick={(e) => toggleFavorite(e, filteredVocab[currentFlashcard].word)}
                  className="absolute top-5 right-5 md:top-6 md:right-6 bg-white/20 p-2.5 rounded-xl transition-all hover:scale-110 active:scale-90"
                >
                  <Heart className={`w-5 h-5 ${favoriteWords.includes(filteredVocab[currentFlashcard].word) ? 'fill-white text-white' : 'text-white/60'}`} />
                </button>
                <span className={`text-${themeColor}-200 text-xs font-black uppercase mb-2 tracking-widest`}>{topicConfig[filteredVocab[currentFlashcard].topic]?.label || 'Tổng hợp'}</span>
                <h3 className={`text-3xl font-black mb-4 text-center leading-tight underline decoration-${themeColor}-300 underline-offset-8`}>{filteredVocab[currentFlashcard].meaning}</h3>
                
                {(filteredVocab[currentFlashcard].synonyms || filteredVocab[currentFlashcard].collocations) && (
                  <div className={`w-full flex flex-col gap-1.5 mb-4 bg-${themeColor}-700/50 p-4 rounded-2xl text-left border border-${themeColor}-500/30`}>
                    {filteredVocab[currentFlashcard].synonyms && <p className="text-[13px]"><span className={`font-bold text-${themeColor}-200`}>🔗 Đồng nghĩa:</span> {filteredVocab[currentFlashcard].synonyms}</p>}
                    {filteredVocab[currentFlashcard].collocations && <p className="text-[13px]"><span className={`font-bold text-${themeColor}-200`}>📝 Cụm từ hay:</span> {filteredVocab[currentFlashcard].collocations}</p>}
                  </div>
                )}

                <p className={`italic text-${themeColor}-50 text-[15px] text-center mb-2 font-medium px-2 leading-relaxed`}>"{filteredVocab[currentFlashcard].example}"</p>
                <p className={`text-[11px] text-${themeColor}-200 text-center font-bold tracking-wider uppercase opacity-90`}>{filteredVocab[currentFlashcard].translation}</p>
              </div>
            </div>

            <div className="flex gap-3 sm:gap-5 items-center flex-wrap justify-center">
              <button 
                disabled={currentFlashcard === 0} 
                onClick={() => { setCurrentFlashcard(prev => prev - 1); setIsFlipped(false); playSound('click'); }} 
                className={`p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-${themeColor}-600 hover:border-${themeColor}-500 disabled:opacity-30 transition-all shadow-lg active:scale-95`}
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button 
                onClick={() => speak(filteredVocab[currentFlashcard].word)} 
                className={`p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-${themeColor}-500 hover:bg-${themeColor}-600 hover:text-white transition-all shadow-lg active:scale-95`}
                title="Nghe"
              >
                <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button 
                onClick={() => handleOpenPronounce(filteredVocab[currentFlashcard])}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full font-black shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ring-4 sm:ring-8 bg-rose-600 text-white hover:bg-rose-700 ring-rose-50`}
              >
                <Mic className="w-5 h-5" /> PHÁT ÂM
              </button>
              <button 
                onClick={() => handleOpenAiModal(filteredVocab[currentFlashcard])}
                className="p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95"
                title="Hỏi AI"
              >
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button 
                disabled={currentFlashcard === filteredVocab.length - 1} 
                onClick={() => { setCurrentFlashcard(prev => prev + 1); setIsFlipped(false); playSound('click'); }} 
                className={`p-3 sm:p-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-${themeColor}-600 hover:border-${themeColor}-500 disabled:opacity-30 transition-all shadow-lg active:scale-95`}
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>
          </div>
        )}
      </main>

      <AiAssistantModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        wordObj={aiCurrentWord}
        onExplain={handleExplainWord}
        onCheckSentence={handleCheckSentence}
        aiResponse={aiResponse}
        isAiLoading={isAiLoading}
        userSentence={userSentence}
        setUserSentence={setUserSentence}
        themeColor={themeColor}
      />
      
      <PronunciationModal 
        isOpen={isPronounceModalOpen}
        onClose={() => setIsPronounceModalOpen(false)}
        wordObj={aiCurrentWord}
        themeColor={themeColor}
      />

      <FilterModal 
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        topics={topics}
        topicConfig={topicConfig}
        filterTopic={filterTopic}
        onTopicSelect={(topic) => {
          setFilterTopic(topic);
          setCurrentFlashcard(0);
          setIsFilterModalOpen(false);
          playSound('select');
        }}
        showLearned={showLearned}
        onToggleLearned={() => {
          setShowLearned(!showLearned);
          setCurrentFlashcard(0);
          playSound('click');
        }}
        showFavorites={showFavorites}
        onToggleFavorites={() => {
          setShowFavorites(!showFavorites);
          setCurrentFlashcard(0);
          playSound('click');
        }}
        themeColor={themeColor}
      />

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center text-slate-300">
        <div className="flex items-center justify-center gap-2 font-black tracking-widest uppercase text-xs">
          <BookOpen className="w-4 h-4" />
          {level} Level Vocabulary • AI Assistant
        </div>
      </footer>
    </div>
  );
};

export default FlashcardsPage;
