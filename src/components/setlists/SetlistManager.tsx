import React, { useState } from 'react';
import { useStandup } from '../../context/StandupContext';
import { Setlist, SetlistItem, Joke } from '../../types';
import { formatSeconds, formatMinutesHuman, calculateSetlistDuration } from '../../utils/formatters';
import { 
  Play, Plus, Trash2, Edit2, Copy, Check, ChevronUp, ChevronDown, 
  Clock, Mic, Sparkles, HelpCircle, FileText, ArrowRight, X, ListPlus, Printer 
} from 'lucide-react';
import { SetlistPdfModal } from './SetlistPdfModal';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

export const SetlistManager: React.FC = () => {
  const { setlists, jokes, addSetlist, updateSetlist, deleteSetlist, startStageMode, celebrate } = useStandup();
  const [selectedSetlistId, setSelectedSetlistId] = useState<string>(setlists[0]?.id || '');
  const [isAddSetlistModalOpen, setIsAddSetlistModalOpen] = useState(false);
  const [isAddJokeModalOpen, setIsAddJokeModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [copiedCheatSheet, setCopiedCheatSheet] = useState(false);

  // New setlist modal state
  const [newTitle, setNewTitle] = useState('');
  const [newTargetMinutes, setNewTargetMinutes] = useState(5);
  const [newDesc, setNewDesc] = useState('');
  const [newStageNotes, setNewStageNotes] = useState('');

  // Custom item state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [customDuration, setCustomDuration] = useState(30);

  // Search in add joke modal
  const [jokeSearch, setJokeSearch] = useState('');

  const currentSetlist = setlists.find(s => s.id === selectedSetlistId) || setlists[0] || null;

  const totalDurationSec = currentSetlist ? calculateSetlistDuration(currentSetlist.items, jokes) : 0;
  const targetDurationSec = (currentSetlist?.targetDurationMinutes || 5) * 60;
  const diffSec = totalDurationSec - targetDurationSec;

  const handleCreateSetlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created = addSetlist({
      title: newTitle.trim(),
      targetDurationMinutes: Number(newTargetMinutes) || 5,
      description: newDesc.trim(),
      stageNotes: newStageNotes.trim(),
      items: []
    });

    setSelectedSetlistId(created.id);
    setIsAddSetlistModalOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewStageNotes('');
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (!currentSetlist) return;
    const items = [...currentSetlist.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;

    // re-order
    const reordered = items.map((it, idx) => ({ ...it, order: idx + 1 }));
    updateSetlist(currentSetlist.id, { items: reordered });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!currentSetlist) return;
    const filtered = currentSetlist.items.filter(it => it.id !== itemId);
    const reordered = filtered.map((it, idx) => ({ ...it, order: idx + 1 }));
    updateSetlist(currentSetlist.id, { items: reordered });
  };

  const handleAddJokeToSetlist = (joke: Joke) => {
    if (!currentSetlist) return;
    const newItem: SetlistItem = {
      id: 'item-' + Date.now() + Math.random().toString(36).substr(2, 4),
      jokeId: joke.id,
      durationSec: joke.durationSec || 45,
      order: currentSetlist.items.length + 1
    };
    updateSetlist(currentSetlist.id, {
      items: [...currentSetlist.items, newItem]
    });
  };

  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSetlist || !customTitle.trim()) return;

    const newItem: SetlistItem = {
      id: 'item-' + Date.now(),
      customTitle: customTitle.trim(),
      customText: customText.trim(),
      durationSec: Number(customDuration) || 30,
      order: currentSetlist.items.length + 1
    };

    updateSetlist(currentSetlist.id, {
      items: [...currentSetlist.items, newItem]
    });

    setCustomTitle('');
    setCustomText('');
    setIsAddingCustom(false);
  };

  const handleCopyCheatSheet = () => {
    if (!currentSetlist) return;
    let cheat = `📜 ШПАРГАЛКА ДЛЯ СЦЕНЫ: ${currentSetlist.title.toUpperCase()}\n`;
    cheat += `Хронометраж: ${formatMinutesHuman(totalDurationSec)} из ${currentSetlist.targetDurationMinutes} мин\n`;
    if (currentSetlist.stageNotes) {
      cheat += `Заметка: ${currentSetlist.stageNotes}\n`;
    }
    cheat += `---------------------------------\n`;
    currentSetlist.items.forEach((it, idx) => {
      const joke = it.jokeId ? jokes.find(j => j.id === it.jokeId) : null;
      const title = it.customTitle || joke?.title || 'Без названия';
      const punch = joke?.punchline ? ` -> ПАНЧ: "${joke.punchline}"` : '';
      cheat += `${idx + 1}. [${formatSeconds(it.durationSec || joke?.durationSec || 45)}] ${title}${punch}\n`;
    });

    navigator.clipboard.writeText(cheat);
    setCopiedCheatSheet(true);
    setTimeout(() => setCopiedCheatSheet(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Stage Floor Gaffer Tape & Setlist Banner */}
      <StandupSectionBanner
        tab="setlists"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSetlistId}
              onChange={e => setSelectedSetlistId(e.target.value)}
              className="px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
            >
              {setlists.map(s => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.targetDurationMinutes} мин)
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAddSetlistModalOpen(true)}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 rounded-xl transition"
              title="Создать новый сет-лист"
            >
              <Plus className="w-4 h-4" />
            </button>

            {currentSetlist && (
              <>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-amber-400 text-xs font-bold rounded-xl transition shadow-sm"
                  title="Распечатать шпаргалку или экспортировать в PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Печать / PDF</span>
                </button>

                <button
                  onClick={() => startStageMode(currentSetlist)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>На сцену!</span>
                </button>
              </>
            )}
          </div>
        }
      />

      {currentSetlist ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Main: Ordered Setlist Beats (approx 8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Header info & Timing Meter */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-neutral-100">{currentSetlist.title}</h3>
                  {currentSetlist.description && (
                    <p className="text-xs text-neutral-400 mt-0.5">{currentSetlist.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCheatSheet}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold rounded-xl transition"
                    title="Скопировать шпаргалку"
                  >
                    {copiedCheatSheet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCheatSheet ? 'Скопировано!' : 'Шпаргалка'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Удалить этот сет-лист?')) deleteSetlist(currentSetlist.id);
                    }}
                    className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Timing progress bar */}
              <div className="pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-neutral-400">
                    Хронометраж сета: <span className="font-mono text-neutral-200">{formatSeconds(totalDurationSec)}</span> / {formatSeconds(targetDurationSec)}
                  </span>
                  <span className={`font-bold font-mono ${
                    Math.abs(diffSec) <= 30
                      ? 'text-emerald-400'
                      : diffSec > 30
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}>
                    {diffSec === 0 ? 'Идеально' : diffSec > 0 ? `+${formatSeconds(diffSec)} перебор` : `-${formatSeconds(Math.abs(diffSec))} запас`}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      Math.abs(diffSec) <= 30
                        ? 'bg-emerald-500'
                        : diffSec > 30
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (totalDurationSec / targetDurationSec) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Setlist Items list */}
            <div className="space-y-2">
              {currentSetlist.items.map((item, idx) => {
                const joke = item.jokeId ? jokes.find(j => j.id === item.jokeId) : null;
                const title = item.customTitle || joke?.title || 'Без названия';
                const duration = item.durationSec || joke?.durationSec || 45;

                return (
                  <div
                    key={item.id}
                    className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 flex items-center justify-between gap-3 transition"
                  >
                    {/* Index & Title */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-100 truncate">
                            {title}
                          </h4>
                          {item.customTitle && (
                            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-semibold rounded-md">
                              Кастом
                            </span>
                          )}
                        </div>

                        {joke && (
                          <p className="text-xs text-neutral-400 truncate mt-0.5">
                            {joke.premise}
                          </p>
                        )}
                        {item.customText && (
                          <p className="text-xs text-sky-400/80 truncate mt-0.5">
                            {item.customText}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Duration badge & move up/down */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono px-2 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300">
                        {formatSeconds(duration)}
                      </span>

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleMoveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-neutral-500 hover:text-white disabled:opacity-20"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveItem(idx, 'down')}
                          disabled={idx === currentSetlist.items.length - 1}
                          className="p-1 text-neutral-500 hover:text-white disabled:opacity-20"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentSetlist.items.length === 0 && (
                <div className="p-8 bg-neutral-900 border border-dashed border-neutral-800 rounded-2xl text-center space-y-2">
                  <p className="text-sm text-neutral-400">В этом сет-листе пока нет битов</p>
                  <p className="text-xs text-neutral-500">
                    Добавьте шутки из базы или вставьте кастомные блоки (разогрев, краудворк) справа
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Add jokes from Vault / Add custom block (approx 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Stage Notes */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-2">
              <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Заметки перед сценой
              </label>
              <textarea
                rows={3}
                placeholder="Что помнить на сцене: темп, проверка микрофона, кому передать..."
                value={currentSetlist.stageNotes || ''}
                onChange={e => updateSetlist(currentSetlist.id, { stageNotes: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />
            </div>

            {/* Add Custom Stage Block */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  + Сценический блок
                </span>
                <button
                  onClick={() => setIsAddingCustom(!isAddingCustom)}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  {isAddingCustom ? 'Скрыть' : 'Открыть'}
                </button>
              </div>

              {isAddingCustom && (
                <form onSubmit={handleAddCustomBlock} className="space-y-2.5 pt-2 border-t border-neutral-800">
                  <input
                    type="text"
                    required
                    placeholder="Название (например: Краудворк про пары)"
                    value={customTitle}
                    onChange={e => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  />
                  <input
                    type="text"
                    placeholder="План / Вопрос в зал..."
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      max={300}
                      step={5}
                      value={customDuration}
                      onChange={e => setCustomDuration(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                    />
                    <span className="text-xs text-neutral-500">секунд</span>
                    <button
                      type="submit"
                      className="flex-1 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl"
                    >
                      Вставить в сет
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Add from Joke Vault */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                  Добавить из Базы шуток
                </span>
                <span className="text-xs text-neutral-500 font-mono">{jokes.length} шуток</span>
              </div>

              <input
                type="text"
                placeholder="Фильтр по названию или тегу..."
                value={jokeSearch}
                onChange={e => setJokeSearch(e.target.value)}
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
              />

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {jokes
                  .filter(j => {
                    if (!jokeSearch.trim()) return true;
                    const q = jokeSearch.toLowerCase();
                    return j.title.toLowerCase().includes(q) || j.tags?.some(t => t.toLowerCase().includes(q));
                  })
                  .map(j => {
                    const isAlreadyIn = currentSetlist.items.some(it => it.jokeId === j.id);
                    return (
                      <div
                        key={j.id}
                        className="p-2.5 bg-neutral-950/70 hover:bg-neutral-800/80 rounded-xl border border-neutral-800/80 flex items-center justify-between gap-2 transition"
                      >
                        <div className="truncate flex-1">
                          <p className="text-xs font-bold text-neutral-200 truncate">{j.title}</p>
                          <span className="text-[10px] text-neutral-500 font-mono">{j.durationSec}с • {j.category}</span>
                        </div>
                        <button
                          onClick={() => handleAddJokeToSetlist(j)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-neutral-950 text-xs font-bold rounded-lg transition"
                        >
                          + Добавить
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-neutral-500">
          Сет-листы отсутствуют. Создайте свой первый сет-лист.
        </div>
      )}

      {/* Add Setlist Modal */}
      {isAddSetlistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full text-neutral-100 shadow-2xl">
            <h3 className="text-lg font-bold text-neutral-100 mb-4">Создать новый сет-лист</h3>
            <form onSubmit={handleCreateSetlist} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Название сета</label>
                <input
                  type="text"
                  required
                  placeholder="например: Открытый микрофон (5 мин), Сольный блок..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Целевой хронометраж (минут)
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={newTargetMinutes}
                  onChange={e => setNewTargetMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Описание / Площадка</label>
                <input
                  type="text"
                  placeholder="Standup Club #1, Money Mic..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddSetlistModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
                >
                  Создать сет-лист
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Export & Print Modal */}
      {currentSetlist && (
        <SetlistPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          setlist={currentSetlist}
          jokes={jokes}
        />
      )}
    </div>
  );
};
