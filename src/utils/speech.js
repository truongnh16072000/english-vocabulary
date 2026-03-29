/**
 * SPEECH UTILITIES
 */

// Similarity scoring using Levenshtein distance
export const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
  for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator, // substitution
      );
    }
  }
  
  const distance = track[s2.length][s1.length];
  const maxLength = Math.max(s1.length, s2.length);
  return Math.round(((maxLength - distance) / maxLength) * 100);
};

// Simple diff to highlight differences
export const getDiff = (original, spoken) => {
  const target = original.toLowerCase().trim();
  const input = spoken.toLowerCase().trim();
  
  const result = [];
  let i = 0;
  let j = 0;

  // This is a very basic alignment for single words
  // For better results, a real diff algorithm would be better
  // But for "where are wrong", we can just compare char by char if they are similar lengths
  
  const maxLength = Math.max(target.length, input.length);
  
  for (let k = 0; k < maxLength; k++) {
    const charT = target[k] || '';
    const charI = input[k] || '';
    
    if (charT === charI) {
      result.push({ char: charT || charI, type: 'correct' });
    } else {
      result.push({ char: charI || '_', expected: charT, type: 'wrong' });
    }
  }
  
  return result;
};
