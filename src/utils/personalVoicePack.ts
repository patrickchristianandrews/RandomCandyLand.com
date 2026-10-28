import type { TrumpMood } from '../types/game';

/**
 * Optional, personal-use sound pack. Files never leave the user's browser:
 * recordings remain in IndexedDB and are played through local object URLs.
 * This is NOT a license to republish third-party recordings on the website.
 */
export type PersonalClipCategory = TrumpMood | 'any';
export interface PersonalClipMeta {
  id: string;
  title: string;
  category: PersonalClipCategory;
  size: number;
  addedAt: number;
}
export interface PersonalVoiceChoice extends PersonalClipMeta {
  url: string;
}
interface StoredClip extends PersonalClipMeta {
  file: Blob;
}
const DB_NAME = 'trumpagotchi-personal-voices-v1';
const STORE_NAME = 'clips';
const ENABLED_KEY = 'trumpagotchi-personal-voices-enabled';
const MAX_FILES = 150;
const MAX_SINGLE_SIZE = 20 * 1024 * 1024;
const MAX_TOTAL_SIZE = 160 * 1024 * 1024;
const localClips = new Map<string, PersonalVoiceChoice>();
let initialized = false;
let initializing: Promise<PersonalClipMeta[]> | null = null;
let lastPlayedId = '';
let voiceEnabled = (() => {
  try { return localStorage.getItem(ENABLED_KEY) !== 'false'; }
  catch { return true; }
})();

export const PERSONAL_CLIP_CATEGORIES: { value: PersonalClipCategory; label: string }[] = [
  { value: 'any', label: 'Any reaction' },
  { value: 'happy', label: 'Happy / praise' },
  { value: 'rallied', label: 'Rally / victory' },
  { value: 'feisty', label: 'Angry / annoyed' },
  { value: 'golf', label: 'Golf' },
  { value: 'sleepy', label: 'Sleepy / bye' },
  { value: 'hungry', label: 'Food / hungry' },
  { value: 'baby', label: 'Baby Donald' },
  { value: 'dance', label: 'Dance / music' },
  { value: 'fake_news', label: 'TV / news' },
  { value: 'lonely', label: 'Needs attention' },
  { value: 'bored', label: 'Bored / waiting' },
  { value: 'sick', label: 'Not feeling good' },
  { value: 'proud', label: 'Proud / deals' },
];

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('Local audio storage is unavailable in this browser.'));
      return;
    }
    let request: IDBOpenDBRequest;
    try { request = indexedDB.open(DB_NAME, 1); }
    catch (error) { reject(error); return; }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local audio storage.'));
    request.onblocked = () => reject(new Error('Close other open copies of Trumpagotchi, then retry.'));
  });
}
async function allStored(): Promise<StoredClip[]> {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as StoredClip[]);
      request.onerror = () => reject(request.error || new Error('Could not read your stored clips.'));
    });
  } finally { db.close(); }
}
async function saveStored(item: StoredClip): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put(item);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Could not save this audio file.'));
      transaction.onabort = () => reject(transaction.error || new Error('Audio storage is full or unavailable.'));
    });
  } finally { db.close(); }
}
async function removeStored(id: string): Promise<void> {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Could not remove audio.'));
      transaction.onabort = () => reject(transaction.error || new Error('Could not remove audio.'));
    });
  } finally { db.close(); }
}
function publicMeta(clip: PersonalVoiceChoice): PersonalClipMeta {
  const { id, title, category, size, addedAt } = clip;
  return { id, title, category, size, addedAt };
}
export function listPersonalClips(): PersonalClipMeta[] {
  return [...localClips.values()]
    .sort((a, b) => b.addedAt - a.addedAt)
    .map(publicMeta);
}
export function getPersonalClip(id: string): PersonalVoiceChoice | null {
  return localClips.get(id) || null;
}
export function personalVoicesEnabled() { return voiceEnabled; }
export function setPersonalVoicesEnabled(enabled: boolean) {
  voiceEnabled = enabled;
  try { localStorage.setItem(ENABLED_KEY, String(enabled)); } catch { /* session-only */ }
}
export function guessClipCategory(filename: string): PersonalClipCategory {
  const s = filename.toLowerCase();
  if (/food|burger|steak|hungry|eating|delicious|dinner|lunch|meat/.test(s)) return 'hungry';
  if (/sick|hospital|problems|terrible|disaster|not good|wrong/.test(s)) return 'sick';
  if (/golf|courses|hole in one/.test(s)) return 'golf';
  if (/music|dance|singing|song|bing bong/.test(s)) return 'dance';
  if (/sleep|night|nap|tired|bye/.test(s)) return 'sleepy';
  if (/fake|cnn|television|news|media|press/.test(s)) return 'fake_news';
  if (/angry|loser|stupid|incompetent|fired|ridiculous/.test(s)) return 'feisty';
  if (/love|lonely|miss/.test(s)) return 'lonely';
  if (/bored|waiting|nothing/.test(s)) return 'bored';
  if (/billion|rich|money|best|amazing|smart|tremendous|deal/.test(s)) return 'proud';
  if (/president|america|rally|winning|great again|victory|country/.test(s)) return 'rallied';
  if (/beautiful|fantastic|wonderful|happy|great/.test(s)) return 'happy';
  return 'any';
}
function addToCache(item: StoredClip) {
  const existing = localClips.get(item.id);
  if (existing) URL.revokeObjectURL(existing.url);
  const { file, ...meta } = item;
  localClips.set(item.id, { ...meta, url: URL.createObjectURL(file) });
}
export async function loadPersonalVoicePack(): Promise<PersonalClipMeta[]> {
  if (initialized) return listPersonalClips();
  if (initializing) return initializing;
  initializing = (async () => {
    const stored = await allStored();
    for (const item of stored) addToCache(item);
    initialized = true;
    return listPersonalClips();
  })();
  try { return await initializing; }
  finally { initializing = null; }
}
export async function importPersonalVoiceFiles(
  files: File[],
  mode: PersonalClipCategory | 'auto' = 'auto',
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  await loadPersonalVoicePack();
  let totalBytes = [...localClips.values()].reduce((n, c) => n + c.size, 0);
  let imported = 0;
  const errors: string[] = [];
  const accepted = /\.(mp3|m4a|aac|wav|ogg)$/i;
  for (const file of files) {
    if (localClips.size >= MAX_FILES) { errors.push('Maximum of ' + MAX_FILES + ' personal clips reached.'); break; }
    if (!accepted.test(file.name)) { errors.push(file.name + ': unsupported audio format.'); continue; }
    if (!file.size || file.size > MAX_SINGLE_SIZE) { errors.push(file.name + ': must be under 20 MB.'); continue; }
    if (totalBytes + file.size > MAX_TOTAL_SIZE) { errors.push('Device pack limit (160 MB) reached.'); break; }
    const title = file.name.replace(/\.(mp3|m4a|aac|wav|ogg)$/i, '').replace(/[_-]+/g, ' ').trim().slice(0, 110) || 'Personal voice recording';
    const item: StoredClip = {
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
        ? crypto.randomUUID() : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2),
      title,
      category: mode === 'auto' ? guessClipCategory(title) : mode,
      size: file.size,
      addedAt: Date.now() + imported,
      file,
    };
    try {
      await saveStored(item);
      addToCache(item);
      imported++;
      totalBytes += file.size;
    } catch (error) {
      errors.push(file.name + ': ' + (error instanceof Error ? error.message : 'storage failed'));
      break;
    }
  }
  return { imported, skipped: files.length - imported, errors };
}
export async function setPersonalClipCategory(id: string, category: PersonalClipCategory) {
  const current = localClips.get(id);
  if (!current) return;
  const existing = (await allStored()).find(c => c.id === id);
  if (!existing) return;
  await saveStored({ ...existing, category });
  localClips.set(id, { ...current, category });
}
export async function deletePersonalClip(id: string) {
  await removeStored(id);
  const current = localClips.get(id);
  if (current) URL.revokeObjectURL(current.url);
  localClips.delete(id);
}
export function pickPersonalVoiceClip(mood: TrumpMood): PersonalVoiceChoice | null {
  if (!voiceEnabled || !localClips.size) return null;
  // Preserve original bundled recordings too; custom recordings get about
  // three out of every four reactions when the user opts into a sound pack.
  if (Math.random() < .25) return null;
  const all = [...localClips.values()];
  const matching = all.filter(c => c.category === mood || c.category === 'any');
  const options = matching.length ? matching : all;
  const fresh = options.filter(c => c.id !== lastPlayedId);
  const pool = fresh.length ? fresh : options;
  const clip = pool[Math.floor(Math.random() * pool.length)] || null;
  if (clip) lastPlayedId = clip.id;
  return clip;
}
