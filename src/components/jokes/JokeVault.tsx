import React, { useState, useMemo } from 'react';
import { useStandup } from '../../context/StandupContext';
import { Joke, JokeCategory, JokeStatus } from '../../types';
import { JokeCard } from './JokeCard';
import { JokeEditorModal } from './JokeEditorModal';
import { 
  Search, Plus, Filter, Flame, Clock, Award, SlidersHorizontal, 
  Sparkles, Hash, X, Tag as TagIcon, ChevronDown, ChevronUp, Check 
} from 'lucide-react';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

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

export const JokeVault: React.FC = () => {
  const { jokes, addJoke, updateJoke, deleteJoke, celebrate, setActiveTab } = useStandup();
  
  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMatchMode, setTagMatchMode] = useState<'AND' | 'OR'>('OR'); // 'AND' = joke must have all tags, 'OR' = joke has any of the tags
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Sort state
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'duration' | 'title'>('rating');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJoke, setEditingJoke] = useState<Joke | null>(null);

  // Compute all unique tags across jokes with frequency
  const allTagsWithCount = useMemo(() => {
    const counts: Record<string, number> = {};
    jokes.forEach(j => {
      j.tags?.forEach(tag => {
        const clean = tag.trim();
        if (clean) {
          counts[clean] = (counts[clean] || 0) + 1;
        }
      });
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [jokes]);

  // Tags filtered by the tag search field
  const filteredTagCloud = useMemo(() => {
    if (!tagSearchQuery.trim()) return allTagsWithCount;
    const q = tagSearchQuery.toLowerCase();
    return allTagsWithCount.filter(t => t.tag.toLowerCase().includes(q));
  }, [allTagsWithCount, tagSearchQuery]);

  // Toggle tag selection
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleRemoveSingleTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };

  const handleClearSelectedTags = () => {
    setSelectedTags([]);
  };

  // Filtered and sorted jokes
  const filteredJokes = useMemo(() => {
    return jokes
      .filter(joke => {
        // Keyword Search across title, premise, punchline, notes, and tags
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().replace(/^#/, '');
          const matchTitle = joke.title.toLowerCase().includes(q);
          const matchPremise = joke.premise.toLowerCase().includes(q);
          const matchPunchline = joke.punchline.toLowerCase().includes(q);
          const matchNotes = joke.notes?.toLowerCase().includes(q);
          const matchTags = joke.tags?.some(t => t.toLowerCase().includes(q));
          if (!matchTitle && !matchPremise && !matchPunchline && !matchNotes && !matchTags) {
            return false;
          }
        }

        // Status
        if (selectedStatus !== 'all' && joke.status !== selectedStatus) {
          return false;
        }

        // Category
        if (selectedCategory !== 'all' && joke.category !== selectedCategory) {
          return false;
        }

        // Tag Filter with AND / OR matching
        if (selectedTags.length > 0) {
          const jokeTags = (joke.tags || []).map(t => t.toLowerCase());
          if (tagMatchMode === 'AND') {
            const hasAll = selectedTags.every(s => jokeTags.includes(s.toLowerCase()));
            if (!hasAll) return false;
          } else {
            // OR mode
            const hasAny = selectedTags.some(s => jokeTags.includes(s.toLowerCase()));
            if (!hasAny) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'duration') return (b.durationSec || 0) - (a.durationSec || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title, 'ru');
        // newest
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [jokes, searchQuery, selectedStatus, selectedCategory, selectedTags, tagMatchMode, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const solidCount = jokes.filter(j => j.status === 'solid').length;
    const testingCount = jokes.filter(j => j.status === 'testing').length;
    const bombedCount = jokes.filter(j => j.status === 'bombed').length;
    const totalSec = jokes.reduce((acc, j) => acc + (j.durationSec || 0), 0);
    const avgRating = jokes.length
      ? (jokes.reduce((acc, j) => acc + (j.rating || 0), 0) / jokes.length).toFixed(1)
      : '0.0';

    return { solidCount, testingCount, bombedCount, totalSec, avgRating };
  }, [jokes]);

  const handleOpenAddModal = () => {
    setEditingJoke(null);
    setIsModalOpen(true);
  };

  const handleEditJoke = (joke: Joke) => {
    setEditingJoke(joke);
    setIsModalOpen(true);
  };

  const handleSaveJoke = (jokeData: Omit<Joke, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingJoke) {
      updateJoke(editingJoke.id, jokeData);
      if (jokeData.status === 'solid' && editingJoke.status !== 'solid') {
        celebrate();
      }
    } else {
      const created = addJoke(jokeData);
      if (created.status === 'solid') {
        celebrate();
      }
    }
  };

  const visibleTags = showAllTags ? filteredTagCloud : filteredTagCloud.slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Standup Comedy Cellar Red Brick & Neon Banner */}
      <StandupSectionBanner 
        tab="jokes"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('riffs')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 border border-amber-500/30 text-amber-300 text-xs font-bold transition shadow"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Разгоны с ИИ</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 text-xs font-black transition shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Новый бит</span>
            </button>
          </div>
        }
      />

      {/* Comedy Cellar Stat Counters with Neon Accents */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#140204]/90 border border-red-950/80 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Всего битов</span>
            <p className="text-2xl font-black text-amber-100 mt-1">{jokes.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-900/40 flex items-center justify-center text-lg shadow-inner">
            🎙️
          </div>
        </div>

        <div className="bg-[#140204]/90 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(245,158,11,0.15)]">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">Хиты / Разрыв</span>
            <p className="text-2xl font-black text-amber-300 mt-1">{stats.solidCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg border border-amber-500/30">
            💥
          </div>
        </div>

        <div className="bg-[#140204]/90 border border-sky-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-sky-400">На проверке</span>
            <p className="text-2xl font-black text-sky-300 mt-1">{stats.testingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center text-lg border border-sky-500/30">
            🔍
          </div>
        </div>

        <div className="bg-[#140204]/90 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-red-400">Провалы (доработка)</span>
            <p className="text-2xl font-black text-red-300 mt-1">{stats.bombedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-lg border border-red-500/30">
            💀
          </div>
        </div>
      </div>

      {/* Control bar: Search + Tag Filter Cloud */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl space-y-4">
        {/* Main Search Input & New Joke Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Поиск по сетапу, панчлайну, ключевым словам или тегам (например: #коты, стоматолог)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition text-neutral-100 placeholder-neutral-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-neutral-500 hover:text-white"
                title="Очистить поиск"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('riffs')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-bold text-sm rounded-xl transition shadow-sm"
              title="Перейти в комнату разгонов с ИИ-соавтором"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Разгоны с ИИ</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Новая шутка</span>
            </button>
          </div>
        </div>

        {/* TAG SYSTEM SECTION */}
        {allTagsWithCount.length > 0 && (
          <div className="p-3.5 bg-neutral-950/80 border border-neutral-800/90 rounded-xl space-y-3">
            {/* Tag bar header */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-neutral-200">
                <TagIcon className="w-4 h-4 text-amber-400" />
                <span>Фильтрация по тегам</span>
                <span className="text-[11px] text-neutral-500 font-normal">
                  (всего {allTagsWithCount.length} уникальных тегов)
                </span>
              </div>

              {/* Tag Match Mode (AND / OR) & Clear */}
              <div className="flex items-center gap-3">
                {selectedTags.length > 1 && (
                  <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-[11px]">
                    <span className="text-neutral-500 px-1.5 font-medium">Режим:</span>
                    <button
                      onClick={() => setTagMatchMode('OR')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition ${
                        tagMatchMode === 'OR'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      title="Шутка содержит хотя бы один из выбранных тегов"
                    >
                      ИЛИ (любой)
                    </button>
                    <button
                      onClick={() => setTagMatchMode('AND')}
                      className={`px-2 py-0.5 rounded-md font-semibold transition ${
                        tagMatchMode === 'AND'
                          ? 'bg-amber-500 text-neutral-950 font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                      title="Шутка содержит ВСЕ выбранные теги одновременно"
                    >
                      И (все вместе)
                    </button>
                  </div>
                )}

                {selectedTags.length > 0 && (
                  <button
                    onClick={handleClearSelectedTags}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium transition flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Сбросить теги ({selectedTags.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Selected Tags Pills */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mr-1">
                  Активные теги ({filteredJokes.length} шуток найдено):
                </span>
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-neutral-950 font-bold text-xs rounded-md shadow-sm"
                  >
                    <Hash className="w-3 h-3 opacity-75" />
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveSingleTag(tag)}
                      className="hover:text-red-950 transition ml-0.5"
                      title="Убрать тег из фильтра"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Cloud with counts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {visibleTags.map(({ tag, count }) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleToggleTag(tag)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold shadow-md shadow-amber-500/20 scale-105'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-amber-300 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <Hash className="w-3 h-3 opacity-60" />
                    <span>{tag}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-neutral-950 text-amber-300' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Show more/less toggle */}
              {allTagsWithCount.length > 12 && (
                <button
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="px-2.5 py-1 text-xs text-neutral-400 hover:text-amber-400 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center gap-1 transition"
                >
                  <span>{showAllTags ? 'Свернуть' : `Ещё ${allTagsWithCount.length - 12} тегов...`}</span>
                  {showAllTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filters and sorting */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
          {/* Status pill filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Все шутки' },
              { id: 'solid', label: '💥 Разрыв' },
              { id: 'testing', label: '🔍 Проверка' },
              { id: 'draft', label: '📝 Черновики' },
              { id: 'bombed', label: '💀 Провалы' },
              { id: 'archived', label: '📦 Архив' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  selectedStatus === tab.id
                    ? 'bg-amber-500 text-neutral-950 font-bold'
                    : 'bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Category select */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Все темы</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort select */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-neutral-300 focus:outline-none focus:border-amber-500"
            >
              <option value="rating">По реакции зала ⭐</option>
              <option value="newest">Сначала новые ⏱️</option>
              <option value="duration">По хронометражу ⌛</option>
              <option value="title">По названию А-Я</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of jokes */}
      {filteredJokes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJokes.map(joke => (
            <JokeCard
              key={joke.id}
              joke={joke}
              onEdit={handleEditJoke}
              onDelete={deleteJoke}
              onTagClick={handleToggleTag}
              selectedTags={selectedTags}
            />
          ))}
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto text-xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-neutral-200">Шутки не найдены</h3>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            {searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedTags.length > 0
              ? 'Попробуй сбросить поисковый запрос, выбранные теги или фильтры категорий'
              : 'В базе пока нет шуток. Добавь свою первую шутку или напиши её в блокноте!'}
          </p>
          {(searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedTags.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedCategory('all');
                setSelectedTags([]);
              }}
              className="px-4 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 rounded-xl transition"
            >
              Сбросить все фильтры и теги
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <JokeEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveJoke}
        initialData={editingJoke}
        existingTags={allTagsWithCount.map(t => t.tag)}
      />
    </div>
  );
};
