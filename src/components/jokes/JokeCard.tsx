import React, { useState } from 'react';
import { Joke, JokeStatus } from '../../types';
import { getCategoryBadge, getStatusBadge } from '../../utils/formatters';
import { 
  Star, Clock, Edit2, Trash2, Copy, Check, ChevronDown, ChevronUp, 
  PlusCircle, Sparkles, Hash, Plus, X, Flame 
} from 'lucide-react';
import { useStandup } from '../../context/StandupContext';

interface JokeCardProps {
  joke: Joke;
  onEdit: (joke: Joke) => void;
  onDelete: (id: string) => void;
  onTagClick?: (tag: string) => void;
  selectedTags?: string[];
}

export const JokeCard: React.FC<JokeCardProps> = ({
  joke,
  onEdit,
  onDelete,
  onTagClick,
  selectedTags = []
}) => {
  const { updateJoke, setlists, updateSetlist, startRiffFromJoke } = useStandup();
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSetlistDropdown, setShowSetlistDropdown] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [quickTagText, setQuickTagText] = useState('');

  const categoryStyle = getCategoryBadge(joke.category);
  const statusStyle = getStatusBadge(joke.status);

  const handleCopy = () => {
    const textToCopy = `[${joke.title}]\nСетап: ${joke.premise}\nПанч: ${joke.punchline}${
      joke.tags?.length ? '\nТеги: #' + joke.tags.join(' #') : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = (newStatus: JokeStatus) => {
    updateJoke(joke.id, { status: newStatus });
  };

  const handleAddDirectToSetlist = (setlistId: string) => {
    const targetSetlist = setlists.find(s => s.id === setlistId);
    if (!targetSetlist) return;

    const newItem = {
      id: 'item-' + Date.now(),
      jokeId: joke.id,
      durationSec: joke.durationSec || 45,
      order: targetSetlist.items.length + 1
    };

    updateSetlist(setlistId, {
      items: [...targetSetlist.items, newItem]
    });
    setShowSetlistDropdown(false);
  };

  const handleAddQuickTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickTagText.trim().replace(/^#+/, '');
    if (clean && !joke.tags?.includes(clean)) {
      const currentTags = joke.tags || [];
      updateJoke(joke.id, { tags: [...currentTags, clean] });
      setQuickTagText('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = (joke.tags || []).filter(t => t !== tagToRemove);
    updateJoke(joke.id, { tags: updated });
  };

  return (
    <div className="group relative bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        {/* Top meta row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}>
              {joke.category}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusStyle.bg}`}>
              {statusStyle.label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              {joke.durationSec}с
            </span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= joke.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-neutral-100 group-hover:text-amber-300 transition-colors mb-2.5">
          {joke.title}
        </h3>

        {/* Premise */}
        <div className="mb-3 text-sm text-neutral-300 leading-relaxed bg-neutral-950/40 p-3 rounded-xl border border-neutral-800/50">
          <span className="text-xs uppercase font-semibold text-neutral-500 block mb-1">Сетап:</span>
          <p>{joke.premise}</p>
        </div>

        {/* Punchline */}
        <div className="mb-3 text-sm font-medium text-amber-200 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
          <div className="flex items-center gap-1 text-xs uppercase font-bold text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Панчлайн:</span>
          </div>
          <p className="leading-snug">{joke.punchline}</p>
        </div>

        {/* TAGS CLOUD ON CARD */}
        <div className="mb-3 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {joke.tags && joke.tags.map((tag, i) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <span
                  key={i}
                  className={`group/tag inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg border font-medium cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                      : 'bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border-neutral-700/80'
                  }`}
                  onClick={() => onTagClick && onTagClick(tag)}
                  title={`Фильтровать по тегу #${tag}`}
                >
                  <Hash className="w-2.5 h-2.5 opacity-60" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag);
                    }}
                    className="opacity-0 group-hover/tag:opacity-100 hover:text-red-400 transition ml-0.5"
                    title="Удалить тег"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}

            {/* Quick add tag button */}
            {!isAddingTag ? (
              <button
                type="button"
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 rounded-lg border border-dashed border-neutral-700 transition"
              >
                <Plus className="w-3 h-3" />
                <span>тег</span>
              </button>
            ) : (
              <form onSubmit={handleAddQuickTag} className="inline-flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="тег..."
                  value={quickTagText}
                  onChange={e => setQuickTagText(e.target.value)}
                  className="w-20 px-2 py-0.5 text-xs bg-neutral-950 border border-amber-500 rounded-lg text-neutral-200 focus:outline-none"
                  onBlur={() => {
                    if (!quickTagText.trim()) setIsAddingTag(false);
                  }}
                />
                <button
                  type="submit"
                  className="p-1 bg-amber-500 text-neutral-950 rounded-md hover:bg-amber-400 text-xs"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(false)}
                  className="p-1 text-neutral-500 hover:text-neutral-300 text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Delivery notes expandable */}
        {joke.notes && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition"
            >
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showDetails ? 'Скрыть подачу' : 'Заметки по подаче'}</span>
            </button>

            {showDetails && (
              <div className="mt-2 text-xs text-neutral-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                <span className="text-[11px] font-semibold text-amber-400 uppercase block mb-0.5">Подача:</span>
                {joke.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2 mt-2">
        {/* Quick status switch */}
        <select
          value={joke.status}
          onChange={e => handleStatusChange(e.target.value as JokeStatus)}
          className="text-xs bg-neutral-950 text-neutral-300 border border-neutral-800 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="draft">📝 Черновик</option>
          <option value="testing">🔍 Проверка</option>
          <option value="solid">💥 Разрыв</option>
          <option value="bombed">💀 Провал</option>
          <option value="archived">📦 Архив</option>
        </select>

        {/* Buttons */}
        <div className="flex items-center gap-1">
          {/* Add to Setlist Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSetlistDropdown(!showSetlistDropdown)}
              title="Добавить в сет-лист"
              className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {showSetlistDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl p-2 z-20 text-xs">
                <p className="font-semibold text-neutral-400 px-2 py-1 border-b border-neutral-800">
                  Добавить в сет-лист:
                </p>
                {setlists.length === 0 ? (
                  <p className="px-2 py-2 text-neutral-500">Нет созданных сет-листов</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto mt-1 space-y-1">
                    {setlists.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleAddDirectToSetlist(s.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 text-neutral-200 hover:text-amber-300 transition truncate"
                      >
                        {s.title} ({s.targetDurationMinutes}м)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleCopy}
            title="Скопировать для Telegram/заметок"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => startRiffFromJoke(joke)}
            title="Разогнать шутку с ИИ (Writers' Room)"
            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition group/riff"
          >
            <Flame className="w-4 h-4 text-amber-500/80 group-hover/riff:text-amber-400 transition" />
          </button>
          <button
            onClick={() => onEdit(joke)}
            title="Редактировать"
            className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded-lg transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(joke.id)}
            title="Удалить"
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
