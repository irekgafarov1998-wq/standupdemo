import { Joke, NotebookNote, Setlist, Gig, AudioRecording, CapturedMediaItem, RiffSession } from '../types';

const JOKES_KEY = 'standuplab_jokes';
const NOTES_KEY = 'standuplab_notes';
const SETLISTS_KEY = 'standuplab_setlists';
const GIGS_KEY = 'standuplab_gigs';
const RECORDINGS_KEY = 'standuplab_recordings';
const GALLERY_KEY = 'standuplab_media_gallery';
const RIFFS_KEY = 'standuplab_riff_sessions';

export const INITIAL_GALLERY_MEDIA: CapturedMediaItem[] = [
  {
    id: 'sample-photo-1',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    title: 'Финал сета под аплодисменты (Сценический софит)',
    createdAt: '2026-10-15T21:30:00.000Z',
    filter: 'spotlight',
    aspectRatio: '9:16'
  },
  {
    id: 'sample-video-1',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'Стендап-дубль: Разгон про стоматолога и субботу',
    createdAt: '2026-10-16T19:45:00.000Z',
    durationSec: 15,
    filter: 'spotlight',
    aspectRatio: '9:16'
  },
  {
    id: 'sample-photo-2',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1200&q=80',
    title: 'Бэкстейдж: Вычитка сет-листа перед выходом (Винтаж 35мм)',
    createdAt: '2026-10-16T20:10:00.000Z',
    filter: 'noir',
    aspectRatio: '1:1'
  },
  {
    id: 'sample-video-2',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    title: 'Открытый микрофон (Блок про технологии)',
    createdAt: '2026-10-17T18:00:00.000Z',
    durationSec: 15,
    filter: 'neon',
    aspectRatio: '16:9'
  }
];

// --- IndexedDB for Audio Blobs ---
const DB_NAME = 'StandupLabAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioBlobs';

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioBlob(id: string, blob: Blob): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save audio to IndexedDB', err);
  }
}

export async function getAudioBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get audio from IndexedDB', err);
    return null;
  }
}

export async function deleteAudioBlob(id: string): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete audio from IndexedDB', err);
  }
}

// --- LocalStorage helpers ---
function getJson<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (err) {
    console.error(`Failed to read ${key}`, err);
    return fallback;
  }
}

function setJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key}`, err);
  }
}

export const StorageService = {
  getJokes: (): Joke[] => getJson<Joke[]>(JOKES_KEY, []),
  saveJokes: (jokes: Joke[]): void => setJson(JOKES_KEY, jokes),

  getNotes: (): NotebookNote[] => getJson<NotebookNote[]>(NOTES_KEY, []),
  saveNotes: (notes: NotebookNote[]): void => setJson(NOTES_KEY, notes),

  getSetlists: (): Setlist[] => getJson<Setlist[]>(SETLISTS_KEY, []),
  saveSetlists: (setlists: Setlist[]): void => setJson(SETLISTS_KEY, setlists),

  getGigs: (): Gig[] => getJson<Gig[]>(GIGS_KEY, []),
  saveGigs: (gigs: Gig[]): void => setJson(GIGS_KEY, gigs),

  getRecordings: (): AudioRecording[] => getJson<AudioRecording[]>(RECORDINGS_KEY, []),
  saveRecordings: (recordings: AudioRecording[]): void => setJson(RECORDINGS_KEY, recordings),

  getIsPro: (): boolean => {
    try {
      return localStorage.getItem('standuplab_is_pro') === 'true';
    } catch {
      return false;
    }
  },
  setIsPro: (isPro: boolean, expiry?: string): void => {
    try {
      localStorage.setItem('standuplab_is_pro', isPro ? 'true' : 'false');
      if (expiry) {
        localStorage.setItem('standuplab_pro_expiry', expiry);
      }
    } catch (err) {
      console.error('Failed to set pro status', err);
    }
  },
  getProExpiry: (): string | null => {
    try {
      return localStorage.getItem('standuplab_pro_expiry');
    } catch {
      return null;
    }
  },

  // Demo / Tester mode for other users
  getIsDemoMode: (): boolean => {
    try {
      const val = localStorage.getItem('standuplab_demo_mode');
      // If not explicitly set, default to false (or can be toggled)
      return val === 'true';
    } catch {
      return false;
    }
  },
  setIsDemoMode: (isDemo: boolean): void => {
    try {
      localStorage.setItem('standuplab_demo_mode', isDemo ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save demo mode', e);
    }
  },

  // Tester Feedbacks collection
  getTesterFeedbacks: (): any[] => {
    try {
      const data = localStorage.getItem('standuplab_tester_feedbacks');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveTesterFeedback: (item: any): void => {
    try {
      const list = StorageService.getTesterFeedbacks();
      list.unshift({ ...item, id: 'fb-' + Date.now(), createdAt: new Date().toISOString() });
      localStorage.setItem('standuplab_tester_feedbacks', JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save tester feedback', e);
    }
  },

  // AI Reels limits (3 for basic tier, unlimited for pro)
  getAiReelsCount: (): number => {
    try {
      const val = localStorage.getItem('standuplab_ai_reels_count');
      return val ? parseInt(val, 10) || 0 : 0;
    } catch {
      return 0;
    }
  },
  incrementAiReelsCount: (): number => {
    try {
      const current = StorageService.getAiReelsCount();
      const updated = current + 1;
      localStorage.setItem('standuplab_ai_reels_count', String(updated));
      return updated;
    } catch {
      return 1;
    }
  },
  resetAiReelsCount: (): void => {
    try {
      localStorage.setItem('standuplab_ai_reels_count', '0');
    } catch {}
  },

  // Multilingual preference
  getLanguage: (): string | null => {
    try {
      return localStorage.getItem('standuplab_language');
    } catch {
      return null;
    }
  },
  setLanguage: (lang: string): void => {
    try {
      localStorage.setItem('standuplab_language', lang);
    } catch {}
  },

  // Media Gallery (Performance Photos & Videos)
  getGalleryMedia: (): CapturedMediaItem[] => {
    try {
      const data = localStorage.getItem(GALLERY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_GALLERY_MEDIA;
  },
  saveGalleryMedia: (items: CapturedMediaItem[]): void => {
    try {
      const serializable = items.map(item => ({
        id: item.id,
        type: item.type,
        url: item.url,
        createdAt: item.createdAt,
        durationSec: item.durationSec,
        filter: item.filter,
        aspectRatio: item.aspectRatio,
        title: item.title
      }));
      localStorage.setItem(GALLERY_KEY, JSON.stringify(serializable));
    } catch (e) {
      console.warn('Failed to save gallery to localStorage', e);
    }
  },

  // Comedy Riffing Sessions (Разгоны)
  getRiffSessions: (): RiffSession[] => {
    const defaultSessions: RiffSession[] = [
      {
        id: 'riff-sample-1',
        title: 'Разгон: Покупка авокадо в супермаркете 🥑',
        topic: 'Как люди выбирают авокадо в магазине и делают вид, что разбираются в плотности',
        persona: 'observational',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        messages: [
          {
            id: 'm-1',
            sender: 'user',
            text: 'Хочу разогнать про то, как я выбираю авокадо. Я же вообще не понимаю, какое спелое, но стою и с важным лицом щупаю каждый плод.',
            timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'm-2',
            sender: 'ai',
            persona: 'observational',
            text: 'О да! Это величайший стендап-театр в отделе овощей. Ты стоишь и трогаешь его большим пальцем, как будто принимаешь роды у тропического дерева. \n\nА рядом стоит другой мужик, тоже трогает, вы переглядываетесь — и оба молчите, потому что боитесь спалиться, что не понимаете разницу между "спелый" и "вчера упал с погрузчика"!\n\n💡 Эскалация мысли: А дома у авокадо окно спелости — ровно 11 минут. В 14:00 он ещё деревянный, а в 14:12 — уже нефть.',
            timestamp: new Date(Date.now() - 3600000 * 2 + 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedPremise: 'Я до сих пор не знаю, как выбирать авокадо, но в магазине делаю лицо сомелье.',
            suggestedPunchline: 'У него окно спелости ровно 11 минут: в два часа дня он еще дубовый, а в два пятнадцать — внутри уже нефтяное месторождение.',
            tags: ['авокадо', 'магазин', 'быт', 'жиза']
          }
        ]
      }
    ];
    return getJson<RiffSession[]>(RIFFS_KEY, defaultSessions);
  },
  saveRiffSessions: (sessions: RiffSession[]): void => setJson(RIFFS_KEY, sessions),

  // Export full backup
  exportBackup: () => {
    return {
      jokes: StorageService.getJokes(),
      notes: StorageService.getNotes(),
      setlists: StorageService.getSetlists(),
      gigs: StorageService.getGigs(),
      recordings: StorageService.getRecordings(),
      riffs: StorageService.getRiffSessions(),
      exportedAt: new Date().toISOString(),
      version: 1,
    };
  },

  // Import backup
  importBackup: (data: any) => {
    if (data.jokes && Array.isArray(data.jokes)) StorageService.saveJokes(data.jokes);
    if (data.notes && Array.isArray(data.notes)) StorageService.saveNotes(data.notes);
    if (data.setlists && Array.isArray(data.setlists)) StorageService.saveSetlists(data.setlists);
    if (data.gigs && Array.isArray(data.gigs)) StorageService.saveGigs(data.gigs);
    if (data.recordings && Array.isArray(data.recordings)) StorageService.saveRecordings(data.recordings);
    if (data.riffs && Array.isArray(data.riffs)) StorageService.saveRiffSessions(data.riffs);
  }
};
