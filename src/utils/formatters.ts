import { Joke, JokeCategory, JokeStatus, MarkerType, SetlistItem } from '../types';

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatMinutesHuman(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs} сек`;
  if (secs === 0) return `${mins} мин`;
  return `${mins} мин ${secs} сек`;
}

export function calculateSetlistDuration(items: SetlistItem[], jokes: Joke[]): number {
  return items.reduce((acc, item) => {
    if (item.jokeId) {
      const joke = jokes.find(j => j.id === item.jokeId);
      return acc + (joke?.durationSec || item.durationSec || 45);
    }
    return acc + (item.durationSec || 30);
  }, 0);
}

export function getCategoryBadge(category: JokeCategory) {
  switch (category) {
    case 'Отношения':
      return { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' };
    case 'Быт и город':
      return { bg: 'bg-blue-500/15', text: 'text-blue-300', border: 'border-blue-500/30' };
    case 'Работа и карьера':
      return { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' };
    case 'Здоровье и возраст':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' };
    case 'Технологии и соцсети':
      return { bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-500/30' };
    case 'Деньги':
      return { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' };
    case 'Абсурд':
      return { bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/30' };
    case 'Семья и детство':
      return { bg: 'bg-orange-500/15', text: 'text-orange-300', border: 'border-orange-500/30' };
    case 'Наблюдения':
      return { bg: 'bg-teal-500/15', text: 'text-teal-300', border: 'border-teal-500/30' };
    default:
      return { bg: 'bg-neutral-500/15', text: 'text-neutral-300', border: 'border-neutral-500/30' };
  }
}

export function getStatusBadge(status: JokeStatus) {
  switch (status) {
    case 'solid':
      return { label: 'Хит / Разрыв 💥', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40', badge: 'Разрыв' };
    case 'testing':
      return { label: 'На проверке 🔍', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40', badge: 'Тестируется' };
    case 'draft':
      return { label: 'Черновик 📝', bg: 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40', badge: 'Черновик' };
    case 'bombed':
      return { label: 'Провал 💀', bg: 'bg-red-500/20 text-red-300 border-red-500/40', badge: 'Провал' };
    case 'archived':
      return { label: 'Архив 📦', bg: 'bg-zinc-800/80 text-zinc-400 border-zinc-700', badge: 'Архив' };
  }
}

export function getMarkerConfig(type: MarkerType) {
  switch (type) {
    case 'kill':
      return {
        label: 'Разрыв (смех)',
        emoji: '💥',
        color: 'text-amber-400',
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/50',
        dot: 'bg-amber-400'
      };
    case 'smile':
      return {
        label: 'Улыбка',
        emoji: '🙂',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/50',
        dot: 'bg-emerald-400'
      };
    case 'bomb':
      return {
        label: 'Провал (тишина)',
        emoji: '💀',
        color: 'text-rose-400',
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/50',
        dot: 'bg-rose-500'
      };
    case 'improv':
      return {
        label: 'Импровизация / Идея',
        emoji: '💡',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/50',
        dot: 'bg-cyan-400'
      };
  }
}

export function getBombReasonLabel(reason?: string): string {
  switch (reason) {
    case 'too_wordy':
      return 'Затянут сетап (слишком много слов)';
    case 'bad_timing':
      return 'Сбился тайминг / пауза';
    case 'wrong_crowd':
      return 'Холодный зал / не та аудитория';
    case 'unclear_punch':
      return 'Непонятный или слабый панчлайн';
    case 'weak_delivery':
      return 'Неуверенная подача / мимика';
    default:
      return 'Требует переработки';
  }
}
