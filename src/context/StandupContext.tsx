import React, { createContext, useContext, useState, useEffect } from 'react';
import { Joke, JokeCategory, NotebookNote, Setlist, Gig, AudioRecording, AudioMarker, RiffSession, RiffPersona, RiffMessage } from '../types';
import { StorageService, saveAudioBlob, deleteAudioBlob } from '../services/storage';
import { INITIAL_JOKES, INITIAL_NOTES, INITIAL_SETLISTS, INITIAL_GIGS, INITIAL_RECORDINGS } from '../services/initialData';
import confetti from 'canvas-confetti';

export type ActiveTab = 'jokes' | 'riffs' | 'notebook' | 'setlists' | 'camera' | 'video' | 'recorder' | 'calendar';

export const DEFAULT_TAB_ORDER: ActiveTab[] = ['jokes', 'riffs', 'notebook', 'setlists', 'camera', 'video', 'recorder', 'calendar'];

interface StandupContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  tabOrder: ActiveTab[];
  setTabOrder: (order: ActiveTab[]) => void;
  moveTab: (fromIndex: number, toIndex: number) => void;
  resetTabOrder: () => void;

  // Video Editor bridge
  activeVideoUrl: string | null;
  activeVideoTitle: string | null;
  loadVideoIntoEditor: (url: string, title?: string) => void;

  // Comedy Riffing & Writers Room (Разгоны с ИИ)
  riffSessions: RiffSession[];
  activeRiffSessionId: string | null;
  setActiveRiffSessionId: (id: string | null) => void;
  createRiffSession: (topic: string, persona?: RiffPersona) => RiffSession;
  updateRiffSession: (id: string, updates: Partial<RiffSession>) => void;
  deleteRiffSession: (id: string) => void;
  addRiffMessage: (sessionId: string, message: Omit<RiffMessage, 'id' | 'timestamp'>) => void;
  startRiffFromJoke: (joke: Joke) => void;
  startRiffFromNote: (note: NotebookNote) => void;

  // Jokes
  jokes: Joke[];
  addJoke: (joke: Omit<Joke, 'id' | 'createdAt' | 'updatedAt'>) => Joke;
  updateJoke: (id: string, updates: Partial<Joke>) => void;
  deleteJoke: (id: string) => void;

  // Notebook
  notes: NotebookNote[];
  activeNoteId: string | null;
  setActiveNoteId: (id: string | null) => void;
  addNote: (title?: string, content?: string) => NotebookNote;
  updateNote: (id: string, updates: Partial<NotebookNote>) => void;
  deleteNote: (id: string) => void;

  // Setlists
  setlists: Setlist[];
  activeStageSetlist: Setlist | null;
  startStageMode: (setlist: Setlist) => void;
  exitStageMode: () => void;
  addSetlist: (setlist: Omit<Setlist, 'id' | 'createdAt' | 'updatedAt'>) => Setlist;
  updateSetlist: (id: string, updates: Partial<Setlist>) => void;
  deleteSetlist: (id: string) => void;

  // Gigs
  gigs: Gig[];
  addGig: (gig: Omit<Gig, 'id'>) => Gig;
  updateGig: (id: string, updates: Partial<Gig>) => void;
  deleteGig: (id: string) => void;

  // Recordings & Analyzer
  recordings: AudioRecording[];
  selectedRecordingId: string | null;
  setSelectedRecordingId: (id: string | null) => void;
  addRecording: (recording: Omit<AudioRecording, 'id' | 'createdAt'>, audioBlob?: Blob) => Promise<AudioRecording>;
  updateRecording: (id: string, updates: Partial<AudioRecording>) => void;
  deleteRecording: (id: string) => Promise<void>;
  addMarkerToRecording: (recordingId: string, marker: Omit<AudioMarker, 'id'>) => void;
  updateMarker: (recordingId: string, markerId: string, updates: Partial<AudioMarker>) => void;
  deleteMarker: (recordingId: string, markerId: string) => void;

  // Subscription & Limits
  isPro: boolean;
  proExpiryDate: string | null;
  upgradeToPro: () => void;
  downgradeToBasic: () => void;
  isProModalOpen: boolean;
  proModalReason: string | undefined;
  openProModal: (reason?: string) => void;
  closeProModal: () => void;
  canAddJokeToCategory: (category: JokeCategory) => { allowed: boolean; currentCount: number; maxLimit: number; reason?: string };
  aiReelsCount: number;
  incrementAiReelsCount: () => number;
  resetAiReelsCount: () => void;
  canCreateAiReel: () => { allowed: boolean; count: number; limit: number; remaining: number; reason?: string };

  // Demo / Tester Mode for guest testing
  isDemoMode: boolean;
  setIsDemoMode: (enabled: boolean) => void;
  toggleDemoMode: () => void;
  isFeedbackModalOpen: boolean;
  feedbackTopic: string | undefined;
  openFeedbackModal: (topic?: string) => void;
  closeFeedbackModal: () => void;

  // Utilities
  celebrate: () => void;
  resetToSampleData: () => void;
}

const StandupContext = createContext<StandupContextType | undefined>(undefined);

export const StandupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('jokes');
  const [activeStageSetlist, setActiveStageSetlist] = useState<Setlist | null>(null);

  const [tabOrder, setTabOrderState] = useState<ActiveTab[]>(() => {
    try {
      const saved = localStorage.getItem('standuplab_tab_order');
      if (saved) {
        const parsed = JSON.parse(saved) as ActiveTab[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validExisting = parsed.filter(t => DEFAULT_TAB_ORDER.includes(t));
          const missing = DEFAULT_TAB_ORDER.filter(t => !validExisting.includes(t));
          const merged = [...validExisting, ...missing];
          if (merged.length === DEFAULT_TAB_ORDER.length) return merged;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_TAB_ORDER;
  });

  const setTabOrder = (order: ActiveTab[]) => {
    setTabOrderState(order);
    try {
      localStorage.setItem('standuplab_tab_order', JSON.stringify(order));
    } catch {}
  };

  const moveTab = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= tabOrder.length || toIndex < 0 || toIndex >= tabOrder.length) return;
    const newOrder = [...tabOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setTabOrder(newOrder);
  };

  const resetTabOrder = () => {
    setTabOrder(DEFAULT_TAB_ORDER);
  };

  // Video editor bridge state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string | null>(null);

  const loadVideoIntoEditor = (url: string, title?: string) => {
    setActiveVideoUrl(url);
    if (title) setActiveVideoTitle(title);
    setActiveTab('video');
  };

  // Initialize or load from local storage
  const [jokes, setJokes] = useState<Joke[]>(() => {
    const saved = StorageService.getJokes();
    if (saved && saved.length > 0) return saved;
    StorageService.saveJokes(INITIAL_JOKES);
    return INITIAL_JOKES;
  });

  const [notes, setNotes] = useState<NotebookNote[]>(() => {
    const saved = StorageService.getNotes();
    if (saved && saved.length > 0) return saved;
    StorageService.saveNotes(INITIAL_NOTES);
    return INITIAL_NOTES;
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => notes[0]?.id || null);

  const [setlists, setSetlists] = useState<Setlist[]>(() => {
    const saved = StorageService.getSetlists();
    if (saved && saved.length > 0) return saved;
    StorageService.saveSetlists(INITIAL_SETLISTS);
    return INITIAL_SETLISTS;
  });

  const [gigs, setGigs] = useState<Gig[]>(() => {
    const saved = StorageService.getGigs();
    if (saved && saved.length > 0) return saved;
    StorageService.saveGigs(INITIAL_GIGS);
    return INITIAL_GIGS;
  });

  const [recordings, setRecordings] = useState<AudioRecording[]>(() => {
    const saved = StorageService.getRecordings();
    if (saved && saved.length > 0) return saved;
    StorageService.saveRecordings(INITIAL_RECORDINGS);
    return INITIAL_RECORDINGS;
  });
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(() => recordings[0]?.id || null);

  // Comedy Riff Sessions (Разгоны с ИИ)
  const [riffSessions, setRiffSessions] = useState<RiffSession[]>(() => {
    return StorageService.getRiffSessions();
  });
  const [activeRiffSessionId, setActiveRiffSessionId] = useState<string | null>(() => {
    const sessions = StorageService.getRiffSessions();
    return sessions[0]?.id || null;
  });

  // Save changes
  useEffect(() => {
    StorageService.saveJokes(jokes);
  }, [jokes]);

  useEffect(() => {
    StorageService.saveNotes(notes);
  }, [notes]);

  useEffect(() => {
    StorageService.saveSetlists(setlists);
  }, [setlists]);

  useEffect(() => {
    StorageService.saveGigs(gigs);
  }, [gigs]);

  useEffect(() => {
    StorageService.saveRecordings(recordings);
  }, [recordings]);

  useEffect(() => {
    StorageService.saveRiffSessions(riffSessions);
  }, [riffSessions]);

  // Confetti helper
  const celebrate = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#e11d48', '#8b5cf6', '#10b981']
      });
    } catch {
      // ignore
    }
  };

  // Subscription States
  const [isPro, setIsPro] = useState<boolean>(() => StorageService.getIsPro());
  const [proExpiryDate, setProExpiryDate] = useState<string | null>(() => StorageService.getProExpiry());
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [proModalReason, setProModalReason] = useState<string | undefined>(undefined);

  const openProModal = (reason?: string) => {
    setProModalReason(reason);
    setIsProModalOpen(true);
  };

  const closeProModal = () => {
    setIsProModalOpen(false);
    setProModalReason(undefined);
  };

  const upgradeToPro = () => {
    // 6 months (полгода) from now
    const now = new Date();
    const expiry = new Date(now.setMonth(now.getMonth() + 6));
    const formatted = expiry.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    
    setIsPro(true);
    setProExpiryDate(formatted);
    StorageService.setIsPro(true, formatted);
  };

  const downgradeToBasic = () => {
    setIsPro(false);
    setProExpiryDate(null);
    StorageService.setIsPro(false);
  };

  // Demo Mode for external testers / guest trial
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('demo') === 'true' || window.location.hash.includes('demo')) {
        StorageService.setIsDemoMode(true);
        return true;
      }
    }
    return StorageService.getIsDemoMode();
  });

  const setIsDemoMode = (enabled: boolean) => {
    setIsDemoModeState(enabled);
    StorageService.setIsDemoMode(enabled);
  };

  const toggleDemoMode = () => {
    setIsDemoModeState(prev => {
      const next = !prev;
      StorageService.setIsDemoMode(next);
      return next;
    });
  };

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTopic, setFeedbackTopic] = useState<string | undefined>(undefined);

  const openFeedbackModal = (topic?: string) => {
    setFeedbackTopic(topic);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackTopic(undefined);
  };

  // Check category limit (10 jokes max per category in basic mode; 5 total in demo mode)
  const canAddJokeToCategory = (category: Joke['category']) => {
    if (isDemoMode) {
      const maxDemoJokes = 5;
      if (jokes.length >= maxDemoJokes) {
        return {
          allowed: false,
          currentCount: jokes.length,
          maxLimit: maxDemoJokes,
          reason: `🧪 В тестовой демо-версии действует лимит: не более ${maxDemoJokes} шуток в базе (сейчас: ${jokes.length}). Очистите ненужные или переключитесь на полную версию.`
        };
      }
    }
    const currentCount = jokes.filter(j => j.category === category).length;
    const maxLimit = 10;
    if (isPro && !isDemoMode) {
      return { allowed: true, currentCount, maxLimit: Infinity };
    }
    const allowed = currentCount < maxLimit;
    return {
      allowed,
      currentCount,
      maxLimit,
      reason: !allowed
        ? `В базовом режиме действует ограничение: не более ${maxLimit} шуток в любой категории. В категории "${category}" уже ${currentCount} шуток. Оформите подписку за 250 ₽ на полгода для снятия лимита!`
        : undefined
    };
  };

  // AI Reels limits (3 generations in basic mode, unlimited in Pro)
  const [aiReelsCount, setAiReelsCount] = useState<number>(() => StorageService.getAiReelsCount());

  const incrementAiReelsCount = (): number => {
    const updated = StorageService.incrementAiReelsCount();
    setAiReelsCount(updated);
    return updated;
  };

  const resetAiReelsCount = () => {
    StorageService.resetAiReelsCount();
    setAiReelsCount(0);
  };

  const canCreateAiReel = () => {
    const maxLimit = isDemoMode ? 2 : 3;
    if (isPro && !isDemoMode) {
      return { allowed: true, count: aiReelsCount, limit: Infinity, remaining: Infinity };
    }
    const allowed = aiReelsCount < maxLimit;
    const remaining = Math.max(0, maxLimit - aiReelsCount);
    return {
      allowed,
      count: aiReelsCount,
      limit: maxLimit,
      remaining,
      reason: !allowed
        ? (isDemoMode 
            ? `🧪 В тестовой демо-версии лимит: ${maxLimit} создания рилса от ИИ. Вы использовали все ${maxLimit}.`
            : 'В базовой версии доступно только 3 создания рилса от ИИ. Вы использовали все 3 попытки. Оформите подписку за 250 ₽ на полгода для безлимитной нарезки!')
        : undefined
    };
  };

  // Joke methods
  const addJoke = (data: Omit<Joke, 'id' | 'createdAt' | 'updatedAt'>): Joke => {
    const check = canAddJokeToCategory(data.category);
    if (!check.allowed) {
      openProModal(check.reason);
      throw new Error(check.reason);
    }

    const now = new Date().toISOString();
    const newJoke: Joke = {
      ...data,
      id: 'joke-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setJokes(prev => [newJoke, ...prev]);
    return newJoke;
  };

  const updateJoke = (id: string, updates: Partial<Joke>) => {
    setJokes(prev => prev.map(j => {
      if (j.id === id) {
        return { ...j, ...updates, updatedAt: new Date().toISOString() };
      }
      return j;
    }));
  };

  const deleteJoke = (id: string) => {
    setJokes(prev => prev.filter(j => j.id !== id));
  };

  // Notebook methods
  const addNote = (title?: string, content?: string): NotebookNote => {
    if (isDemoMode && notes.length >= 3) {
      const reason = `🧪 В тестовой демо-версии лимит: не более 3 заметок в блокноте (сейчас: ${notes.length}). Удалите ненужную или переключитесь на полную версию.`;
      openProModal(reason);
      throw new Error(reason);
    }

    const now = new Date().toISOString();
    const newNote: NotebookNote = {
      id: 'note-' + Date.now(),
      title: title || 'Новая идея для бита',
      content: content || 'Сетап:\n\nПанчлайн:\n',
      tags: [],
      createdAt: now,
      updatedAt: now,
      isFavorite: false
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<NotebookNote>) => {
    setNotes(prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, ...updates, updatedAt: new Date().toISOString() };
      }
      return n;
    }));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      if (activeNoteId === id) {
        setActiveNoteId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  // Comedy Riffing & Writers Room (Разгоны с ИИ)
  const createRiffSession = (topic: string, persona: RiffPersona = 'observational'): RiffSession => {
    const now = new Date().toISOString();
    const newSession: RiffSession = {
      id: 'riff-' + Date.now(),
      title: topic.slice(0, 45) || 'Новый разгон',
      topic: topic,
      persona: persona,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'ai',
          persona: persona,
          text: `Йоу! Тема "${topic}" — отличный задел для комедии. С чего начнем? Напиши, что тебя здесь бесит, удивляет или с чего всё началось, либо жми любую кнопку быстрой раскрутки ниже!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setRiffSessions(prev => [newSession, ...prev]);
    setActiveRiffSessionId(newSession.id);
    setActiveTab('riffs');
    return newSession;
  };

  const updateRiffSession = (id: string, updates: Partial<RiffSession>) => {
    setRiffSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
  };

  const deleteRiffSession = (id: string) => {
    setRiffSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeRiffSessionId === id) {
        setActiveRiffSessionId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const addRiffMessage = (sessionId: string, message: Omit<RiffMessage, 'id' | 'timestamp'>) => {
    const newMsg: RiffMessage = {
      ...message,
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setRiffSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: [...s.messages, newMsg],
          updatedAt: new Date().toISOString()
        };
      }
      return s;
    }));
  };

  const startRiffFromJoke = (joke: Joke) => {
    const title = `Разгон: ${joke.title}`;
    const existing = riffSessions.find(s => s.title === title || s.topic.includes(joke.title));
    if (existing) {
      setActiveRiffSessionId(existing.id);
      setActiveTab('riffs');
      return;
    }

    const now = new Date().toISOString();
    const newSession: RiffSession = {
      id: 'riff-' + Date.now(),
      title: title,
      topic: `${joke.title} (Сетап: ${joke.premise})`,
      persona: 'head_writer',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'msg-start-1',
          sender: 'user',
          text: `Давай разгоним и усилим эту шутку:\nСетап: "${joke.premise}"\nПанч: "${joke.punchline}"\n${joke.tags?.length ? 'Тэги: ' + joke.tags.join(', ') : ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'msg-start-2',
          sender: 'ai',
          persona: 'head_writer',
          text: `Принято! Сетап "${joke.premise}" уже цепляет, но давай выжмем максимум. Мы можем:\n1. Срезать воду в сетапе для моментального удара\n2. Накинуть 3 добивки вдогонку (тэги), чтобы зал смеялся дольше\n3. Сделать смешной акт-аут (отыгрыш в лицах)\n\nС чего начнем, или жми кнопку снизу?`,
          suggestedPremise: joke.premise,
          suggestedPunchline: joke.punchline,
          tags: joke.tags || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setRiffSessions(prev => [newSession, ...prev]);
    setActiveRiffSessionId(newSession.id);
    setActiveTab('riffs');
  };

  const startRiffFromNote = (note: NotebookNote) => {
    const title = `Разгон заметки: ${note.title}`;
    const now = new Date().toISOString();
    const newSession: RiffSession = {
      id: 'riff-' + Date.now(),
      title: title,
      topic: note.title,
      persona: 'observational',
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'msg-note-1',
          sender: 'user',
          text: `Разгоняем заметку из блокнота "${note.title}":\n\n${note.content}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          id: 'msg-note-2',
          sender: 'ai',
          persona: 'observational',
          text: `Отличный сырой материал! В таких наблюдениях обычно прячется самое золото. Давай отделим сетап от лишних деталей и найдем главный нерв, который рассмешит зал!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setRiffSessions(prev => [newSession, ...prev]);
    setActiveRiffSessionId(newSession.id);
    setActiveTab('riffs');
  };

  // Setlist methods
  const addSetlist = (data: Omit<Setlist, 'id' | 'createdAt' | 'updatedAt'>): Setlist => {
    if (isDemoMode && setlists.length >= 2) {
      const reason = `🧪 В тестовой демо-версии лимит: не более 2 сет-листов для сцены (сейчас: ${setlists.length}). Удалите ненужный или переключитесь на полную версию.`;
      openProModal(reason);
      throw new Error(reason);
    }

    const now = new Date().toISOString();
    const newSetlist: Setlist = {
      ...data,
      id: 'setlist-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setSetlists(prev => [newSetlist, ...prev]);
    return newSetlist;
  };

  const updateSetlist = (id: string, updates: Partial<Setlist>) => {
    setSetlists(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates, updatedAt: new Date().toISOString() };
        if (activeStageSetlist?.id === id) {
          setActiveStageSetlist(updated);
        }
        return updated;
      }
      return s;
    }));
  };

  const deleteSetlist = (id: string) => {
    setSetlists(prev => prev.filter(s => s.id !== id));
    if (activeStageSetlist?.id === id) {
      setActiveStageSetlist(null);
    }
  };

  const startStageMode = (setlist: Setlist) => {
    setActiveStageSetlist(setlist);
  };

  const exitStageMode = () => {
    setActiveStageSetlist(null);
  };

  // Gig methods
  const addGig = (data: Omit<Gig, 'id'>): Gig => {
    const newGig: Gig = {
      ...data,
      id: 'gig-' + Date.now()
    };
    setGigs(prev => [newGig, ...prev]);
    return newGig;
  };

  const updateGig = (id: string, updates: Partial<Gig>) => {
    setGigs(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteGig = (id: string) => {
    setGigs(prev => prev.filter(g => g.id !== id));
  };

  // Recording methods
  const addRecording = async (data: Omit<AudioRecording, 'id' | 'createdAt'>, audioBlob?: Blob): Promise<AudioRecording> => {
    if (isDemoMode && recordings.length >= 2) {
      const reason = `🧪 В тестовой демо-версии лимит: не более 2 аудиозаписей в архиве (сейчас: ${recordings.length}). Удалите старую или переключитесь на полную версию.`;
      openProModal(reason);
      throw new Error(reason);
    }

    const id = 'rec-' + Date.now();
    const now = new Date().toISOString();
    let blobKey = undefined;

    if (audioBlob) {
      blobKey = id;
      await saveAudioBlob(id, audioBlob);
    }

    const newRec: AudioRecording = {
      ...data,
      id,
      blobKey,
      createdAt: now
    };

    setRecordings(prev => [newRec, ...prev]);
    setSelectedRecordingId(id);
    return newRec;
  };

  const updateRecording = (id: string, updates: Partial<AudioRecording>) => {
    setRecordings(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRecording = async (id: string) => {
    await deleteAudioBlob(id);
    setRecordings(prev => {
      const filtered = prev.filter(r => r.id !== id);
      if (selectedRecordingId === id) {
        setSelectedRecordingId(filtered[0]?.id || null);
      }
      return filtered;
    });
  };

  const addMarkerToRecording = (recordingId: string, marker: Omit<AudioMarker, 'id'>) => {
    const newMarker: AudioMarker = {
      ...marker,
      id: 'mark-' + Date.now() + Math.random().toString(36).substring(2, 6)
    };

    setRecordings(prev => prev.map(r => {
      if (r.id === recordingId) {
        const sortedMarkers = [...r.markers, newMarker].sort((a, b) => a.timestampSec - b.timestampSec);
        return { ...r, markers: sortedMarkers };
      }
      return r;
    }));
  };

  const updateMarker = (recordingId: string, markerId: string, updates: Partial<AudioMarker>) => {
    setRecordings(prev => prev.map(r => {
      if (r.id === recordingId) {
        return {
          ...r,
          markers: r.markers.map(m => m.id === markerId ? { ...m, ...updates } : m)
        };
      }
      return r;
    }));
  };

  const deleteMarker = (recordingId: string, markerId: string) => {
    setRecordings(prev => prev.map(r => {
      if (r.id === recordingId) {
        return {
          ...r,
          markers: r.markers.filter(m => m.id !== markerId)
        };
      }
      return r;
    }));
  };

  const resetToSampleData = () => {
    setJokes(INITIAL_JOKES);
    setNotes(INITIAL_NOTES);
    setSetlists(INITIAL_SETLISTS);
    setGigs(INITIAL_GIGS);
    setRecordings(INITIAL_RECORDINGS);
    setActiveNoteId(INITIAL_NOTES[0].id);
    setSelectedRecordingId(INITIAL_RECORDINGS[0].id);
    StorageService.saveJokes(INITIAL_JOKES);
    StorageService.saveNotes(INITIAL_NOTES);
    StorageService.saveSetlists(INITIAL_SETLISTS);
    StorageService.saveGigs(INITIAL_GIGS);
    StorageService.saveRecordings(INITIAL_RECORDINGS);
  };

  return (
    <StandupContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tabOrder,
        setTabOrder,
        moveTab,
        resetTabOrder,
        activeVideoUrl,
        activeVideoTitle,
        loadVideoIntoEditor,
        riffSessions,
        activeRiffSessionId,
        setActiveRiffSessionId,
        createRiffSession,
        updateRiffSession,
        deleteRiffSession,
        addRiffMessage,
        startRiffFromJoke,
        startRiffFromNote,
        jokes,
        addJoke,
        updateJoke,
        deleteJoke,
        notes,
        activeNoteId,
        setActiveNoteId,
        addNote,
        updateNote,
        deleteNote,
        setlists,
        activeStageSetlist,
        startStageMode,
        exitStageMode,
        addSetlist,
        updateSetlist,
        deleteSetlist,
        gigs,
        addGig,
        updateGig,
        deleteGig,
        recordings,
        selectedRecordingId,
        setSelectedRecordingId,
        addRecording,
        updateRecording,
        deleteRecording,
        addMarkerToRecording,
        updateMarker,
        deleteMarker,
        celebrate,
        resetToSampleData,
        isPro,
        proExpiryDate,
        upgradeToPro,
        downgradeToBasic,
        isProModalOpen,
        proModalReason,
        openProModal,
        closeProModal,
        canAddJokeToCategory,
        aiReelsCount,
        incrementAiReelsCount,
        resetAiReelsCount,
        canCreateAiReel,
        isDemoMode,
        setIsDemoMode,
        toggleDemoMode,
        isFeedbackModalOpen,
        feedbackTopic,
        openFeedbackModal,
        closeFeedbackModal
      }}
    >
      {children}
    </StandupContext.Provider>
  );
};

export const useStandup = () => {
  const context = useContext(StandupContext);
  if (!context) {
    throw new Error('useStandup must be used within a StandupProvider');
  }
  return context;
};
