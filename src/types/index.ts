export type JokeStatus = 'draft' | 'testing' | 'solid' | 'bombed' | 'archived';

export type JokeCategory = 
  | 'Отношения'
  | 'Работа и карьера'
  | 'Семья и детство'
  | 'Быт и город'
  | 'Здоровье и возраст'
  | 'Абсурд'
  | 'Наблюдения'
  | 'Технологии и соцсети'
  | 'Деньги'
  | 'Другое';

export interface Joke {
  id: string;
  title: string;
  premise: string; // Сетап
  punchline: string; // Панчлайн
  tags: string[]; // Альтернативные панчи, добивки, тэги
  category: JokeCategory;
  status: JokeStatus;
  durationSec: number; // Хронометраж в секундах (~15-120 сек)
  rating: number; // Оценка реакции зала 1-5 (5 = разрыв)
  notes?: string; // Подача, мимика, работа с залом
  createdAt: string;
  updatedAt: string;
}

export interface SetlistItem {
  id: string;
  jokeId?: string; // Привязка к шутке из базы
  customTitle?: string; // Или кастомный блок (разогрев, краудворк, прощание)
  customText?: string;
  durationSec: number;
  order: number;
  notes?: string;
}

export interface Setlist {
  id: string;
  title: string;
  targetDurationMinutes: number; // например, 5, 10, 15 минут
  description?: string;
  items: SetlistItem[];
  createdAt: string;
  updatedAt: string;
  stageNotes?: string;
}

export type GigType = 'open_mic' | 'check_in' | 'showcase' | 'solo' | 'festival' | 'other';
export type GigStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

export interface Gig {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  venue: string;
  address?: string; // Точный адрес для Яндекс Карт
  city: string;
  coords?: [number, number]; // [lat, lon]
  yandexMapsUrl?: string; // Прямая ссылка на Яндекс Карты / маршрут
  metroStation?: string; // Ближайшее метро
  type: GigType;
  status: GigStatus;
  setlistId?: string;
  fee?: number; // Гонорар в рублях
  allottedMinutes: number; // Отведённое время на сцене
  rating?: number; // Оценка выступления 1-10
  reviewNotes?: string; // Анализ выступления (что зашло, что провалилось)
  recordingId?: string; // Привязанная аудиозапись
}

export type MarkerType = 'kill' | 'smile' | 'bomb' | 'improv';

export interface AudioMarker {
  id: string;
  timestampSec: number;
  type: MarkerType;
  label: string;
  notes?: string;
  bombReason?: 'too_wordy' | 'bad_timing' | 'wrong_crowd' | 'unclear_punch' | 'weak_delivery' | 'other';
}

export interface AudioRecording {
  id: string;
  title: string;
  date: string;
  durationSec: number;
  markers: AudioMarker[];
  gigId?: string;
  setlistId?: string;
  blobKey?: string; // ключ в IndexedDB
  overallFeedback?: string;
  createdAt: string;
}

export interface NotebookNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
}

export type SubtitleStyle = 'karaoke' | 'bold_yellow' | 'headline_only' | 'minimal';
export type VideoAspectRatio = '9:16' | '1:1' | '16:9';

export interface SubtitlePhrase {
  text: string;
  timeOffsetSec: number;
}

export interface ReelClip {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  hookHeadline: string;
  punchlineQuote: string;
  viralScore: number;
  caption: string;
  subtitlePhrases: SubtitlePhrase[];
  aspectRatio: VideoAspectRatio;
  subtitleStyle: SubtitleStyle;
  watermarkText?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  videoUrl: string;
  durationSec: number;
  reels: ReelClip[];
  createdAt: string;
}

export type CameraFilterType = 
  | 'normal' 
  | 'spotlight' 
  | 'noir' 
  | 'vhs' 
  | 'velvet' 
  | 'neon' 
  | 'golden_hour' 
  | 'cinematic';

export type CameraAspectRatio = '9:16' | '1:1' | '16:9';

export interface CapturedMediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  blob?: Blob;
  createdAt: string;
  durationSec?: number;
  filter: CameraFilterType;
  aspectRatio: CameraAspectRatio;
  title: string;
}

// Comedy Riffing & Brainstorming (Разгоны с ИИ)
export type RiffPersona = 'head_writer' | 'absurdist' | 'observational' | 'skeptic' | 'character_pov';

export interface RiffMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  persona?: RiffPersona;
  timestamp: string;
  suggestedPremise?: string;
  suggestedPunchline?: string;
  tags?: string[];
  type?: 'chat' | 'escalation' | 'escalate' | 'punchlines' | 'pov' | 'tags' | 'actout';
}

export interface RiffSession {
  id: string;
  title: string;
  topic: string;
  persona: RiffPersona;
  messages: RiffMessage[];
  createdAt: string;
  updatedAt: string;
}

