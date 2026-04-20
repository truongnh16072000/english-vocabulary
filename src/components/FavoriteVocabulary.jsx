import React, { useState, useEffect, useMemo } from 'react';
import { playSound } from '../utils/sounds';
import { 
  Search, Volume2, BookOpen,
  ChevronLeft, ChevronRight, Play, 
  Tags, LayoutGrid, Heart, Plane, GraduationCap, 
  Leaf, Music, Home, Smile, Filter, Sparkles,
  Mic, Trophy, Star
} from 'lucide-react';
import { callAIStream } from '../utils/openai';
import { topicMap, topicLabels, topicColors } from '../utils/vocabularyData';
import { a2Vocabulary } from './A2Vocabulary';
import { b1Vocabulary } from './B1Vocabulary';
import { b2Vocabulary } from './B2Vocabulary';
import PronunciationModal from './common/PronunciationModal';
import AiAssistantModal from './common/AiAssistantModal';

const FavoriteVocabulary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Favorites state for all levels
  const [favA2, setFavA2] = useState(() => JSON.parse(localStorage.getItem('a2_favorite_words') || '[]'));
  const [favB1, setFavB1] = useState(() => JSON.parse(localStorage.getItem('b1_favorite_words') || '[]'));
  const [favB2, setFavB2] = useState(() => JSON.parse(localStorage.getItem('b2_favorite_words') || '[]'));

  useEffect(() => localStorage.setItem('a2_favorite_words', JSON.stringify(favA2)), [favA2]);
  useEffect(() => localStorage.setItem('b1_favorite_words', JSON.stringify(favB1)), [favB1]);
  useEffect(() => localStorage.setItem('b2_favorite_words', JSON.stringify(favB2)), [favB2]);

  // AI & Pronunciation Modal States
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiCurrentWord, setAiCurrentWord] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [userSentence, setUserSentence] = useState('');
  const [isPronounceModalOpen, setIsPronounceModalOpen] = useState(false);

  // Topic Config (same as other pages for consistency)
  const topicConfig = {
    'All': { label: 'Tất cả', icon: <LayoutGrid className="w-4 h-4" />, color: 'bg-indigo-600' },
    'Travel': { label: 'Du lịch', icon: <Plane className="w-4 h-4" />, color: 'bg-blue-500' },
    'Health': { label: 'Sức khỏe', icon: <Heart className="w-4 h-4" />, color: 'bg-red-500' },
    'Work & Edu': { label: 'Học & Làm', icon: <GraduationCap className="w-4 h-4" />, color: 'bg-amber-600' },
    'Nature': { label: 'Thiên nhiên', icon: <Leaf className="w-4 h-4" />, color: 'bg-emerald-600' },
    'Leisure': { label: 'Giải trí', icon: <Music className="w-4 h-4" />, color: 'bg-purple-600' },
    'Life': { label: 'Đời sống', icon: <Home className="w-4 h-4" />, color: 'bg-sky-600' },
    'Feelings': { label: 'Cảm xúc', icon: <Smile className="w-4 h-4" />, color: 'bg-pink-600' },
    'General': { label: 'Tổng hợp', icon: <Tags className="w-4 h-4" />, color: 'bg-slate-500' },
  };

  // Level colors
  const levelColors = {
    'A2': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'B1': 'bg-teal-100 text-teal-700 border-teal-200',
    'B2': 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  // Compile all favorites
  const filteredFavs = useMemo(() => {
    const a2 = a2Vocabulary.filter(item => favA2.includes(item.word)).map(item => ({ ...item, level: 'A2' }));
    const b1 = b1Vocabulary.filter(item => favB1.includes(item.word)).map(item => ({ ...item, level: 'B1' }));
    const b2 = b2Vocabulary.filter(item => favB2.includes(item.word)).map(item => ({ ...item, level: 'B2' }));
    
    return [...a2, ...b1, ...b2].filter(item => {
      const matchQuery = item.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchQuery;
    });
  }, [favA2, favB1, favB2, searchQuery]);

  const toggleFavorite = (e, item) => {
    e.stopPropagation();
    const { word, level } = item;
    playSound('click');
    
    if (level === 'A2') setFavA2(prev => prev.filter(w => w !== word));
    else if (level === 'B1') setFavB1(prev => prev.filter(w => w !== word));
    else if (level === 'B2') setFavB2(prev => prev.filter(w => w !== word));
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleOpenAiModal = (wordObj) => {
    setAiCurrentWord(wordObj);
    setIsAiModalOpen(true);
    setAiResponse('');
    setUserSentence('');
  };

  const handleOpenPronounce = (item) => {
    setAiCurrentWord(item);
    setIsPronounceModalOpen(true);
  };

  const handleExplainWord = async (wordObj, lang = 'vi') => {
    const cacheKey = `ai_explain_fav_${wordObj.word}_${lang}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setAiResponse(cached);
      return;
    }

    setIsAiLoading(true);
    setAiResponse('');
    
    let prompt;
    if (lang === 'vi') {
      prompt = `Hãy giải thích chi tiết cách sử dụng từ tiếng Anh "${wordObj.word}" (trình độ ${wordObj.level}, từ loại: ${wordObj.pos}, nghĩa: ${wordObj.meaning}). Cung cấp 2 ví dụ thực tế kèm lời dịch. Trình bày ngắn gọn, dễ hiểu.`;
    } else {
      prompt = `Explain the usage of the English word "${wordObj.word}" (level ${wordObj.level}, pos: ${wordObj.pos}, meaning: ${wordObj.meaning}) in clear English. Provide 2 realistic examples with translations into Vietnamese. Keep the explanation suitable for a ${wordObj.level} learner. Respond ONLY in English for the explanation parts.`;
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
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-rose-500 text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-200 animate-pulse">
            <Heart className="w-10 h-10 fill-current" />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Từ Vựng Yêu Thích</h1>
          <p className="text-slate-400 font-medium italic mt-2">Kho báu từ vựng của riêng bạn ở mọi cấp độ</p>
        </div>

        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type="text" placeholder="Tìm kiếm trong danh sách yêu thích..." 
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-rose-100 focus:border-rose-500 outline-none shadow-sm transition-all"
              value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentFlashcard(0); }}
            />
          </div>
        </div>

        {filteredFavs.length > 0 ? (
          <div className="flex flex-col items-center py-4 gap-8">
            <div 
              className={`relative w-full max-w-md h-[min(480px,65vh)] cursor-pointer transition-all duration-700 preserve-3d group ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => { setIsFlipped(!isFlipped); playSound('click'); }}
              style={{ perspective: '1200px' }}
            >
              {/* Front Side */}
              <div className={`absolute inset-0 bg-white rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 md:p-10 border-4 border-white ring-1 ring-slate-100 backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute top-6 left-6 flex gap-2 items-center">
                   <div className="bg-slate-100 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {currentFlashcard + 1} / {filteredFavs.length}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${levelColors[filteredFavs[currentFlashcard].level]}`}>
                    {filteredFavs[currentFlashcard].level}
                  </div>
                </div>

                <button 
                  onClick={(e) => toggleFavorite(e, filteredFavs[currentFlashcard])}
                  className="absolute top-6 right-6 bg-rose-50 p-2.5 rounded-xl transition-all hover:scale-110 active:scale-90 shadow-sm text-rose-500"
                  title="Xóa khỏi yêu thích"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>

                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-6 ${topicConfig[filteredFavs[currentFlashcard].topic]?.color || 'bg-slate-500'}`}>
                   {topicConfig[filteredFavs[currentFlashcard].topic]?.icon || <Tags className="w-6 h-6" />}
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-slate-800 capitalize mb-4 tracking-tighter text-center break-words px-4 leading-tight">
                  {filteredFavs[currentFlashcard].word}
                </h2>
                <p className="text-slate-400 text-2xl font-medium tracking-wide">{filteredFavs[currentFlashcard].ipa}</p>

                <div className="mt-16 flex items-center gap-3 text-slate-300 text-xs font-black uppercase tracking-[0.2em]">
                  <Play className="w-4 h-4" /> Chạm để lật thẻ
                </div>
              </div>

              {/* Back Side */}
              <div 
                className={`absolute inset-0 bg-rose-600 rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-8 text-white backface-hidden transform rotate-y-180 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="absolute top-6 right-6 bg-white/20 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase">
                  {filteredFavs[currentFlashcard].level}
                </div>
                <span className="text-rose-200 text-xs font-black uppercase mb-2 tracking-widest">
                  {topicConfig[filteredFavs[currentFlashcard].topic]?.label || 'Tổng hợp'}
                </span>
                <h3 className="text-3xl font-black mb-6 text-center leading-tight underline decoration-rose-300 underline-offset-8">
                  {filteredFavs[currentFlashcard].meaning}
                </h3>
                
                <div className="w-full flex flex-col gap-3 mb-6 bg-white/10 p-5 rounded-2xl text-left border border-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
                  <p className="text-[14px] leading-relaxed">
                    <span className="font-bold text-rose-200">🔗 Đồng nghĩa:</span> {filteredFavs[currentFlashcard].synonyms || 'N/A'}
                  </p>
                  <p className="text-[14px] leading-relaxed">
                    <span className="font-bold text-rose-200">📝 Cụm từ:</span> {filteredFavs[currentFlashcard].collocations || 'N/A'}
                  </p>
                </div>

                <p className="italic text-rose-50 text-[15px] text-center mb-2 font-medium px-2 leading-relaxed italic">
                  "{filteredFavs[currentFlashcard].example}"
                </p>
                <p className="text-[11px] text-rose-200 text-center font-bold tracking-wider uppercase opacity-90">
                  {filteredFavs[currentFlashcard].translation}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-center flex-wrap justify-center">
              <button 
                disabled={currentFlashcard === 0} 
                onClick={() => { setCurrentFlashcard(prev => prev - 1); setIsFlipped(false); playSound('click'); }} 
                className="p-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
              
              <button 
                onClick={() => speak(filteredFavs[currentFlashcard].word)} 
                className="p-4 rounded-full bg-white border border-slate-200 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95"
                title="Nghe"
              >
                <Volume2 className="w-7 h-7" />
              </button>

              <button 
                onClick={() => handleOpenPronounce(filteredFavs[currentFlashcard])}
                className="px-8 py-4 rounded-full font-black shadow-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 ring-8 bg-rose-600 text-white hover:bg-rose-700 ring-rose-50"
              >
                <Mic className="w-5 h-5" /> PHÁT ÂM
              </button>

              <button 
                onClick={() => handleOpenAiModal(filteredFavs[currentFlashcard])}
                className="p-4 rounded-full bg-white border border-slate-200 text-purple-600 hover:bg-purple-600 hover:text-white transition-all shadow-lg active:scale-95"
                title="Hỏi AI"
              >
                <Sparkles className="w-7 h-7" />
              </button>

              <button 
                disabled={currentFlashcard === filteredFavs.length - 1} 
                onClick={() => { setCurrentFlashcard(prev => prev + 1); setIsFlipped(false); playSound('click'); }} 
                className="p-4 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-500 disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-10 md:mt-20 text-center animate-fade-in">
            <div className="w-24 h-24 bg-white rounded-[40px] shadow-xl flex items-center justify-center mx-auto mb-8 border border-slate-100">
              <Star className="w-12 h-12 text-slate-200" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Danh sách trống</h2>
            <p className="text-slate-400 font-medium italic mb-10 leading-relaxed px-6">
              Bạn chưa có từ nào trong danh sách yêu thích. Hãy quay lại các trang bài học và nhấn vào biểu tượng trái tim để lưu lại nhé!
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
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
        themeColor="rose"
      />
      
      <PronunciationModal 
        isOpen={isPronounceModalOpen}
        onClose={() => setIsPronounceModalOpen(false)}
        wordObj={aiCurrentWord}
        themeColor="rose"
      />

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-300 font-black tracking-widest uppercase text-xs">
          <Trophy className="w-4 h-4" />
          My Favorites Collection
        </div>
      </footer>
    </div>
  );
};

export default FavoriteVocabulary;
