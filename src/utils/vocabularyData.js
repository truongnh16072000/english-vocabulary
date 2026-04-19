/**
 * SHARED VOCABULARY UTILITIES
 * Topic configuration, parsing logic, and shared exports
 */

// Topic mapping codes → full names
export const topicMap = {
  'T': 'Travel', 'H': 'Health', 'W': 'Work & Edu', 'N': 'Nature',
  'E': 'Leisure', 'L': 'Life', 'F': 'Feelings', 'G': 'General'
};

// Topic UI config (icons are applied at component level)
export const topicLabels = {
  'All': 'Tất cả',
  'Travel': 'Du lịch',
  'Health': 'Sức khỏe',
  'Work & Edu': 'Học & Làm',
  'Nature': 'Thiên nhiên',
  'Leisure': 'Giải trí',
  'Life': 'Đời sống',
  'Feelings': 'Cảm xúc',
  'General': 'Tổng hợp',
};

export const topicColors = {
  'All': 'bg-indigo-600',
  'Travel': 'bg-blue-500',
  'Health': 'bg-red-500',
  'Work & Edu': 'bg-amber-600',
  'Nature': 'bg-emerald-600',
  'Leisure': 'bg-purple-600',
  'Life': 'bg-sky-600',
  'Feelings': 'bg-pink-600',
  'General': 'bg-slate-500',
};

/**
 * Parse A2-format raw string (7 fields, no synonyms/collocations)
 * Format: word|ipa|pos|meaning|topic_code|example|translation
 */
export const parseA2 = (rawString) => {
  return rawString.split('\n').filter(Boolean).map(row => {
    const [word, ipa, pos, meaning, tCode, example, translation] = row.split('|');
    return { 
      word, ipa, pos, meaning, 
      topic: topicMap[tCode] || 'General', 
      example, translation 
    };
  }).sort((a, b) => a.word.localeCompare(b.word));
};

/**
 * Parse B1/B2-format raw string (9 fields, with synonyms/collocations)
 * Format: word|ipa|pos|meaning|topic_code|example|translation|synonyms|collocations
 */
export const parseB1B2 = (rawString) => {
  return rawString.split('\n').filter(Boolean).map(row => {
    const [word, ipa, pos, meaning, tCode, example, translation, synonyms, collocations] = row.split('|');
    return { 
      word, ipa, pos, meaning, 
      topic: topicMap[tCode] || 'General', 
      example, translation,
      synonyms: synonyms || 'Đang cập nhật...',
      collocations: collocations || 'Đang cập nhật...'
    };
  }).sort((a, b) => a.word.localeCompare(b.word));
};
