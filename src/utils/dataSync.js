import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// All localStorage keys that store user learning data
const DATA_KEYS = [
  'a2_learned_words',
  'b1_learned_words',
  'b2_learned_words',
  'a2_flashcard_progress',
  'b1_flashcard_progress',
  'b2_flashcard_progress',
  'a2_favorite_words',
  'b1_favorite_words',
  'b2_favorite_words',
];

// Keys that store JSON arrays
const JSON_KEYS = [
  'a2_learned_words',
  'b1_learned_words',
  'b2_learned_words',
  'a2_favorite_words',
  'b1_favorite_words',
  'b2_favorite_words',
];

/**
 * Collect all user data from localStorage into a single object
 */
export function collectLocalData() {
  const data = {};
  for (const key of DATA_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      data[key] = raw;
    }
  }

  // Also collect any AI cache entries
  const aiCacheKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('ai_explain_')) {
      aiCacheKeys.push(k);
    }
  }
  for (const k of aiCacheKeys) {
    data[k] = localStorage.getItem(k);
  }

  return data;
}

/**
 * Restore data from a cloud snapshot into localStorage
 */
export function restoreToLocal(cloudData) {
  if (!cloudData) return;
  for (const [key, value] of Object.entries(cloudData)) {
    if (value !== null && value !== undefined) {
      localStorage.setItem(key, value);
    }
  }
}

/**
 * Merge local data with cloud data.
 * For JSON arrays (learned words, favorites): union of both sets.
 * For numeric progress (flashcard_progress): take the higher value.
 * For AI cache: keep both (cloud wins on conflict since it's deterministic).
 */
export function mergeData(localData, cloudData) {
  if (!cloudData) return localData;
  if (!localData || Object.keys(localData).length === 0) return cloudData;

  const merged = { ...cloudData };

  for (const [key, localValue] of Object.entries(localData)) {
    if (JSON_KEYS.includes(key)) {
      // Merge arrays by union
      try {
        const localArr = JSON.parse(localValue || '[]');
        const cloudArr = JSON.parse(cloudData[key] || '[]');
        const union = [...new Set([...cloudArr, ...localArr])];
        merged[key] = JSON.stringify(union);
      } catch {
        merged[key] = localValue;
      }
    } else if (key.endsWith('_flashcard_progress')) {
      // Take the higher progress
      const localNum = parseInt(localValue || '0', 10);
      const cloudNum = parseInt(cloudData[key] || '0', 10);
      merged[key] = String(Math.max(localNum, cloudNum));
    } else {
      // For AI cache and other keys, cloud wins unless local has it and cloud doesn't
      if (!cloudData[key]) {
        merged[key] = localValue;
      }
    }
  }

  return merged;
}

/**
 * Save user data to Firestore
 */
export async function saveToCloud(userId) {
  const data = collectLocalData();
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, {
    learningData: data,
    lastSyncAt: new Date().toISOString(),
  }, { merge: true });
}

/**
 * Load user data from Firestore
 */
export async function loadFromCloud(userId) {
  const userDocRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userDocRef);
  if (snapshot.exists()) {
    return snapshot.data().learningData || {};
  }
  return null;
}

/**
 * Full sync: merge local + cloud, then save to both
 */
export async function syncUserData(userId) {
  const localData = collectLocalData();
  const cloudData = await loadFromCloud(userId);
  const merged = mergeData(localData, cloudData);

  // Restore merged data to localStorage
  restoreToLocal(merged);

  // Save merged data to cloud
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, {
    learningData: merged,
    lastSyncAt: new Date().toISOString(),
  }, { merge: true });

  return merged;
}
