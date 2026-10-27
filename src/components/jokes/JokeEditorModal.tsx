import React, { useState, useEffect } from 'react';
import { Joke, JokeCategory, JokeStatus } from '../../types';
import { X, Sparkles, Plus, Star, Hash, Tag, Flame } from 'lucide-react';
import { useStandup } from '../../context/StandupContext';

interface JokeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jokeData: Omit<Joke, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Joke | null;
  existingTags?: string[];
}

const CATEGORIES: JokeCategory[] = [
  'Отношения',
  'Быт и город',
  'Работа и карьера',
  'Здоровье и возраст',
  'Технологии и соцсети',
  'Деньги',
  'Абсурд',
  'Семья и детство',
  'Наблюдения',
  'Другое'
];

const SUGGESTED_TAGS = [
  'колбэк',
  'проверенный панч',
  'актуальное',
  'краудворк',
  'черный юмор',
  'абсурд',
  'жиза',
  'наблюдение',
  'разгон',
  'импровизация',
  'самоирония',
  'родители'
];

export const JokeEditorModal: React.FC<JokeEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  existingTags = []
}) => {
  const [title, setTitle] = useState('');
  const [premise, setPremise] = useState('');
  const [punchline, setPunchline] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [category, setCategory] = useState<JokeCategory>('Быт и город');
  const [status, setStatus] = useState<JokeStatus>('draft');
  const [durationSec, setDurationSec] = useState<number>(45);
  const [rating, setRating] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const { createRiffSession } = useStandup();

  const handleRiffWithAi = () => {
    const riffTopic = title.trim() || premise.trim().slice(0, 40) || 'Новая стендап-мысль';
    createRiffSession(riffTopic, 'head_writer');
    onClose();
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setPremise(initialData.premise);
      setPunchline(initialData.punchline);
      setTags(initialData.tags || []);
      setCategory(initialData.category);
      setStatus(initialData.status);
      setDurationSec(initialData.durationSec || 45);
      setRating(initialData.rating || 3);
      setNotes(initialData.notes || '');
    } else {
      setTitle('');
      setPremise('');
      setPunchline('');
      setTags([]);
      setCategory('Быт и город');
      setStatus('draft');
      setDurationSec(45);
      setRating(0);
      setNotes('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd?: string) => {
    const raw = tagToAdd || newTagInput;
    const clean = raw.trim().replace(/^#+/, '');
    if (clean && !tags.includes(clean)) {
      setTags(prev => [...prev, clean]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !premise.trim()) return;

    onSave({
      title: title.trim() || 'Без названия',
      premise: premise.trim(),
      punchline: punchline.trim(),
      tags,
      category,
      status,
      durationSec: Number(durationSec) || 45,
      rating: Number(rating) || 0,
      notes: notes.trim()
    });
    onClose();
  };

  // Combine unique suggestions
  const availableSuggestions = Array.from(
    new Set([...SUGGESTED_TAGS, ...existingTags])
  ).filter(t => !tags.includes(t)).slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 text-neutral-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🎤
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {initialData ? 'Редактировать шутку' : 'Добавить новую шутку в базу'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Рабочее название шутки / бита
            </label>
            <input
              type="text"
              required
              placeholder="например: Робот-пылесос и кот, Звонок от стоматолога..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-sm font-medium transition"
            />
          </div>

          {/* Premise (Setup) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Сетап (Заход / Наблюдение)</span>
              </label>
              <span className="text-xs text-neutral-500">Предыстория и завязка мысли</span>
            </div>
            <textarea
              rows={3}
              required
              placeholder="Создай контекст или поделись наблюдением, которое поймет зритель..."
              value={premise}
              onChange={e => setPremise(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-amber-500 text-sm leading-relaxed transition resize-y"
            />
          </div>

          {/* Punchline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Панчлайн (Добивка / Разворот)</span>
              </label>
              <button
                type="button"
                onClick={handleRiffWithAi}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-lg transition"
                title="Перейти в комнату разгонов с ИИ для накидывания панчей"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Разогнать в Разгонах 🔥</span>
              </button>
            </div>
            <textarea
              rows={3}
              required
              placeholder="То, что вызывает взрыв смеха..."
              value={punchline}
              onChange={e => setPunchline(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-amber-500/40 focus:border-amber-400 rounded-xl focus:outline-none text-sm leading-relaxed text-amber-100 transition resize-y"
            />
          </div>

          {/* Tagging System Section */}
          <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>Теги шутки (поиск, темы, маркеры)</span>
              </label>
              <span className="text-[11px] text-neutral-500">Добавьте несколько тегов</span>
            </div>

            {/* Input & add */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Введи тег и нажми Enter (например: жиза, колбэк, коты)..."
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 transition text-neutral-200"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Добавить
              </button>
            </div>

            {/* Selected Tags list */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-500/15 text-amber-300 rounded-lg border border-amber-500/30 font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-amber-400 hover:text-red-400 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick Suggestions */}
            {availableSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-neutral-500">
                <span className="font-semibold text-neutral-400">Быстрые теги:</span>
                {availableSuggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddTag(s)}
                    className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 rounded-md border border-neutral-800 transition"
                  >
                    +{s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category & Status & Timing & Rating Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Категория
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as JokeCategory)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-200"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Статус
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as JokeStatus)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-200"
              >
                <option value="draft">📝 Черновик</option>
                <option value="testing">🔍 На проверке</option>
                <option value="solid">💥 Разрыв / Хит</option>
                <option value="bombed">💀 Провал</option>
                <option value="archived">📦 В архив</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Хронометраж
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={300}
                  step={5}
                  value={durationSec}
                  onChange={e => setDurationSec(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-200"
                />
                <span className="absolute right-2.5 top-2 text-xs text-neutral-500">сек</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
                Реакция зала
              </label>
              <div className="flex items-center gap-1 py-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition text-amber-400"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes for delivery */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">
              Сценическая подача и подсказки (мимика, паузы, интонация)
            </label>
            <input
              type="text"
              placeholder="например: Длинная пауза после сетапа, высокомерный взгляд в зал..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-300 transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              {initialData ? 'Сохранить изменения' : 'Добавить шутку в базу'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
