import React, { useState, useMemo } from 'react';
import { useStandup } from '../../context/StandupContext';
import { NotebookNote, JokeCategory } from '../../types';
import { 
  FileText, Plus, Trash2, Star, Sparkles, Clock, ArrowRight, 
  Lightbulb, Wand2, Copy, Check, Hash, Shuffle, BookOpen, Flame 
} from 'lucide-react';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

const COMEDY_FORMULAS = [
  {
    name: 'Правило трёх (Rule of Three)',
    desc: 'Два обычных примера создают паттерн, третий ломает ожидание',
    snippet: '\n- Первый нормальный факт: ...\n- Второй нормальный факт: ...\n- Третий абсурдный/неожиданный факт (панч): ...\n'
  },
  {
    name: 'Контраст: Ожидание vs Реальность',
    desc: 'Резкое столкновение пафоса с приземлённой правдой',
    snippet: '\nОжидание (как в кино / как хотелось бы): ...\nРеальность (как это происходит на самом деле в хрущёвке): ...\n'
  },
  {
    name: 'Гипербола (Преувеличение)',
    desc: 'Раздувание маленькой бытовой проблемы до масштаба апокалипсиса',
    snippet: '\nМаленькая проблема: ...\nЭскалация х10: ...\nФинальный абсурд х100: ...\n'
  },
  {
    name: 'Смена угла зрения',
    desc: 'Посмотреть на ситуацию глазами кота, официанта, кассира или предмета',
    snippet: '\nКак это вижу я: ...\nКак это в этот момент видит [персонаж/предмет]: ...\n'
  },
  {
    name: '"Что если..." (Эскалация)',
    desc: 'Довести логику до самого бредового предела',
    snippet: '\nЧто если это правило доведут до абсолюта: ...\n'
  }
];

const WRITING_PROMPTS = [
  'Вспомни самую нелепую вещь, за которую ты когда-либо заплатил деньги.',
  'Что тебя дико раздражает в общественных местах, но все делают вид, что это норма?',
  'Какая твоя привычка или черта характера сильнее всего бесит партнёра или друзей?',
  'Вспомни ситуацию за эту неделю, когда ты почувствовал себя старым.',
  'Что ты делал на этой неделе, что со стороны выглядело максимально подозрительно?',
  'Какая глупая ложь из детства преследовала тебя дольше всего?',
  'Свидание, на котором тебе захотелось сбежать через окно туалета.',
  'Какую технологию нам продали как "облегчающую жизнь", а она только добавила невроза?'
];

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

export const Notebook: React.FC = () => {
  const { notes, activeNoteId, setActiveNoteId, addNote, updateNote, deleteNote, addJoke, celebrate, startRiffFromNote } = useStandup();
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);

  // Conversion to joke modal state
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertTitle, setConvertTitle] = useState('');
  const [convertPremise, setConvertPremise] = useState('');
  const [convertPunchline, setConvertPunchline] = useState('');
  const [convertCategory, setConvertCategory] = useState<JokeCategory>('Быт и город');
  const [convertDuration, setConvertDuration] = useState(45);

  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    });
  }, [notes, search]);

  // Word count & timing estimation (approx 125 words per minute in conversational stand-up tempo)
  const timingStats = useMemo(() => {
    if (!activeNote?.content) return { words: 0, estSeconds: 0 };
    const words = activeNote.content.trim().split(/\s+/).filter(Boolean).length;
    const estSeconds = Math.round((words / 125) * 60);
    return { words, estSeconds };
  }, [activeNote]);

  const handleInsertFormula = (snippet: string) => {
    if (!activeNote) return;
    const newContent = activeNote.content + snippet;
    updateNote(activeNote.id, { content: newContent });
  };

  const handleRandomPrompt = () => {
    const random = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
    setCurrentPrompt(random);
  };

  const handleInsertPromptIntoNote = () => {
    if (!activeNote || !currentPrompt) return;
    const insert = `\n\n[Комедийный стимул]: ${currentPrompt}\nРазгон мысли:\n`;
    updateNote(activeNote.id, { content: activeNote.content + insert });
    setCurrentPrompt(null);
  };

  const handleCopyNote = () => {
    if (!activeNote) return;
    navigator.clipboard.writeText(`${activeNote.title}\n\n${activeNote.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenConvert = () => {
    if (!activeNote) return;
    setConvertTitle(activeNote.title);
    
    // Attempt naive split if "Сетап" or "Панч" words are in text
    const lines = activeNote.content.split('\n').filter(Boolean);
    if (lines.length >= 2) {
      setConvertPremise(lines.slice(0, Math.ceil(lines.length / 2)).join('\n'));
      setConvertPunchline(lines.slice(Math.ceil(lines.length / 2)).join('\n'));
    } else {
      setConvertPremise(activeNote.content);
      setConvertPunchline('');
    }
    setConvertCategory('Быт и город');
    setConvertDuration(timingStats.estSeconds || 45);
    setIsConvertModalOpen(true);
  };

  const handleSaveToVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertPremise.trim() || !convertPunchline.trim()) return;

    addJoke({
      title: convertTitle.trim() || 'Шутка из блокнота',
      premise: convertPremise.trim(),
      punchline: convertPunchline.trim(),
      category: convertCategory,
      status: 'draft',
      durationSec: Number(convertDuration) || 45,
      rating: 0,
      tags: ['Из блокнота: ' + activeNote?.title]
    });

    celebrate();
    setIsConvertModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Standup Comedian's Moleskine & Legal Pad Banner */}
      <StandupSectionBanner 
        tab="notebook"
        actions={
          <button
            onClick={() => addNote()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Новая заметка</span>
          </button>
        }
      />

      <div className="h-[calc(100vh-16rem)] min-h-[580px] flex flex-col md:flex-row gap-4">
        {/* Left Column: Notes List */}
        <div className="w-full md:w-80 bg-[#16120b]/90 border border-amber-950/60 rounded-2xl flex flex-col shrink-0 overflow-hidden shadow-lg">
        {/* Header & New Button */}
        <div className="p-4 border-b border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">✍️</span>
              <h2 className="font-bold text-sm text-neutral-200 uppercase tracking-wider">
                Блокнот автора
              </h2>
            </div>
            <button
              onClick={() => addNote()}
              className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg transition"
              title="Создать заметку"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <input
            type="text"
            placeholder="Поиск по заметкам..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-200 placeholder-neutral-500"
          />
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredNotes.map(note => {
            const isSelected = activeNote?.id === note.id;
            return (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition text-left ${
                  isSelected
                    ? 'bg-amber-500/15 border border-amber-500/30'
                    : 'bg-neutral-950/40 hover:bg-neutral-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-neutral-200'}`}>
                    {note.title || 'Без названия'}
                  </h4>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      updateNote(note.id, { isFavorite: !note.isFavorite });
                    }}
                    className="text-neutral-600 hover:text-amber-400"
                  >
                    <Star className={`w-3.5 h-3.5 ${note.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1 leading-normal">
                  {note.content || 'Пустая заметка...'}
                </p>

                <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-800/40 text-[10px] text-neutral-500">
                  <span>{new Date(note.updatedAt).toLocaleDateString('ru-RU')}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm('Удалить эту заметку?')) deleteNote(note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-neutral-500 text-xs">
              Заметок не найдено
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Writing Canvas & Comedy Mechanics */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            {/* Note Editor Header */}
            <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-900/60">
              <input
                type="text"
                value={activeNote.title}
                onChange={e => updateNote(activeNote.id, { title: e.target.value })}
                placeholder="Заголовок разгона..."
                className="text-base sm:text-lg font-bold bg-transparent border-none focus:outline-none text-neutral-100 placeholder-neutral-600 flex-1 min-w-[200px]"
              />

              <div className="flex items-center gap-2">
                {/* Reading speed meter */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>≈ {timingStats.estSeconds}с речи</span>
                  <span className="text-neutral-600">({timingStats.words} слов)</span>
                </div>

                {/* Riff with AI button */}
                <button
                  onClick={() => activeNote && startRiffFromNote(activeNote)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-bold rounded-xl transition shadow-sm"
                  title="Разогнать эту заметку в Комнате Разгонов с ИИ"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Разогнать с ИИ</span>
                </button>

                {/* Transfer to joke vault button */}
                <button
                  onClick={handleOpenConvert}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-bold rounded-xl shadow-md transition"
                  title="Оформить как шутку в Базу"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>В Базу шуток</span>
                </button>

                {/* Copy */}
                <button
                  onClick={handleCopyNote}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition"
                  title="Скопировать текст"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Comedy Mechanics Toolbar */}
            <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-950/50 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-neutral-500 font-semibold mr-1 flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" /> Формулы:
                </span>
                {COMEDY_FORMULAS.map(f => (
                  <button
                    key={f.name}
                    onClick={() => handleInsertFormula(f.snippet)}
                    title={f.desc}
                    className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 rounded-lg border border-neutral-800 transition"
                  >
                    + {f.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              {/* Prompt generator */}
              <button
                onClick={handleRandomPrompt}
                className="flex items-center gap-1 px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 rounded-lg transition"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Идея для разгона</span>
              </button>
            </div>

            {/* Active Prompt Banner if triggered */}
            {currentPrompt && (
              <div className="mx-4 mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-200">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{currentPrompt}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleInsertPromptIntoNote}
                    className="px-2.5 py-1 bg-amber-500 text-neutral-950 font-bold rounded-lg hover:bg-amber-400 transition"
                  >
                    Вставить в текст
                  </button>
                  <button
                    onClick={() => setCurrentPrompt(null)}
                    className="text-neutral-400 hover:text-white"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}

            {/* Textarea styled like an authentic Comedian's Yellow Legal Pad with red margin */}
            <div className="flex-1 p-3 sm:p-4 flex flex-col">
              <div className="flex-1 standup-legal-pad p-4 sm:p-6 rounded-2xl border border-amber-900/50 shadow-inner flex flex-col pl-14 sm:pl-16 relative">
                <textarea
                  value={activeNote.content}
                  onChange={e => updateNote(activeNote.id, { content: e.target.value })}
                  placeholder="Пиши здесь мысли, наблюдения, диалоги, наброски сетапов и добивок..."
                  className="w-full flex-1 bg-transparent border-none resize-none focus:outline-none text-amber-100 text-sm leading-[28px] font-mono placeholder-amber-400/30"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500 space-y-3">
            <BookOpen className="w-12 h-12 text-neutral-700" />
            <p className="text-sm">Выберите заметку или создайте новую для написания комедии</p>
            <button
              onClick={() => addNote()}
              className="px-4 py-2 bg-amber-500 text-neutral-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
            >
              Создать заметку
            </button>
          </div>
        )}
      </div>
      </div>

      {/* Convert to Joke Modal */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full text-neutral-100 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span>Перенести в Базу шуток</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Разделите черновик на чистый сетап и панчлайн для добавления в картотеку битов.
            </p>

            <form onSubmit={handleSaveToVault} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Название бита</label>
                <input
                  type="text"
                  required
                  value={convertTitle}
                  onChange={e => setConvertTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-400 mb-1">Сетап (Завязка)</label>
                <textarea
                  rows={2}
                  required
                  value={convertPremise}
                  onChange={e => setConvertPremise(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Панчлайн (Добивка)</label>
                <textarea
                  rows={2}
                  required
                  value={convertPunchline}
                  onChange={e => setConvertPunchline(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-amber-500/40 rounded-xl text-xs focus:outline-none text-amber-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Категория</label>
                  <select
                    value={convertCategory}
                    onChange={e => setConvertCategory(e.target.value as JokeCategory)}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-400 mb-1">Хронометраж (сек)</label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={convertDuration}
                    onChange={e => setConvertDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsConvertModalOpen(false)}
                  className="px-3.5 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl transition"
                >
                  Сохранить в Базу шуток
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
