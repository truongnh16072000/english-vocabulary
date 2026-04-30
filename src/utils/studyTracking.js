/**
 * STUDY TRACKING UTILITIES
 * Records daily study activity for Dashboard stats (streak, weekly chart, daily goal)
 */

const getToday = () => new Date().toISOString().split('T')[0];

const getStudyHistory = () => {
  try { return JSON.parse(localStorage.getItem('study_history') || '{}'); }
  catch { return {}; }
};

/**
 * Record that the user studied cards today.
 * Call this whenever flashcard progress advances.
 * @param {number} count - Number of new cards viewed (default 1)
 */
export const recordStudyActivity = (count = 1) => {
  const today = getToday();
  const history = getStudyHistory();
  history[today] = (history[today] || 0) + count;
  localStorage.setItem('study_history', JSON.stringify(history));
  localStorage.setItem('last_study_date', today);
};
