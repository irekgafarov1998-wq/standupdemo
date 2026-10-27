import React, { useState } from 'react';
import { useStandup, ActiveTab, DEFAULT_TAB_ORDER } from '../context/StandupContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '../i18n/types';
import { 
  Mic, BookOpen, ListOrdered, Video, Activity, Calendar, Camera, Flame,
  Download, Upload, RotateCcw, Play, ArrowLeftRight, 
  GripVertical, ChevronLeft, ChevronRight, Check, X, SlidersHorizontal, Share2, Globe 
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { soundEffects } from '../utils/soundEffects';
import { SocialSyncModal } from './social/SocialSyncModal';
import { StandupAppIcon } from './common/StandupAppIcon';

interface NavItemMeta {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export const Navbar: React.FC = () => {
  const { 
    activeTab, setActiveTab, tabOrder, setTabOrder, moveTab, resetTabOrder,
    jokes, setlists, startStageMode, resetToSampleData, celebrate, 
    isPro, openProModal, isDemoMode, toggleDemoMode, openFeedbackModal 
  } = useStandup();

  const { language, setLanguage, currentLanguageInfo, t } = useLanguage();

  const [showSettings, setShowSettings] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Drag and drop state
  const [draggedTab, setDraggedTab] = useState<ActiveTab | null>(null);
  const [dragOverTab, setDragOverTab] = useState<ActiveTab | null>(null);

  // Map tab definitions with i18n
  const tabRegistry: Record<ActiveTab, NavItemMeta> = {
    jokes: { id: 'jokes', label: t('nav.jokes'), icon: <Mic className="w-4 h-4" />, badge: jokes.length },
    riffs: { id: 'riffs', label: t('nav.riffs'), icon: <Flame className="w-4 h-4 text-amber-400" />, badge: 'AI' },
    notebook: { id: 'notebook', label: t('nav.notes'), icon: <BookOpen className="w-4 h-4" /> },
    setlists: { id: 'setlists', label: t('nav.setlists'), icon: <ListOrdered className="w-4 h-4" />, badge: setlists.length },
    camera: { id: 'camera', label: t('nav.camera'), icon: <Camera className="w-4 h-4" />, badge: 'REC' },
    video: { id: 'video', label: t('nav.reels'), icon: <Video className="w-4 h-4" />, badge: 'AI' },
    recorder: { id: 'recorder', label: t('nav.analytics'), icon: <Activity className="w-4 h-4" /> },
    calendar: { id: 'calendar', label: t('nav.timer'), icon: <Calendar className="w-4 h-4" /> },
  };

  // Reorder items according to current tabOrder
  const orderedNavItems: NavItemMeta[] = tabOrder
    .map(id => tabRegistry[id])
    .filter(Boolean);

  const handleExportBackup = () => {
    const data = StorageService.exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standuplab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setShowSettings(false);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          StorageService.importBackup(json);
          window.location.reload();
        } catch {
          alert('Ошибка чтения файла резервной копии');
        }
      };
      reader.readAsText(file);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: ActiveTab) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTab(id);
  };

  const handleDragOver = (e: React.DragEvent, id: ActiveTab) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTab !== id) {
      setDragOverTab(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: ActiveTab) => {
    e.preventDefault();
    const sourceId = (e.dataTransfer.getData('text/plain') as ActiveTab) || draggedTab;
    if (sourceId && sourceId !== targetId) {
      const newOrder = [...tabOrder];
      const sourceIndex = newOrder.indexOf(sourceId);
      const targetIndex = newOrder.indexOf(targetId);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, sourceId);
        setTabOrder(newOrder);
        soundEffects.playStageClick();
      }
    }
    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleMoveTabLeft = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index > 0) {
      moveTab(index, index - 1);
      soundEffects.playStageClick();
    }
  };

  const handleMoveTabRight = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (index < tabOrder.length - 1) {
      moveTab(index, index + 1);
      soundEffects.playStageClick();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#140103]/95 backdrop-blur-md border-b border-rose-950/40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <StandupAppIcon size={38} className="cursor-pointer" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">Standup</span>
                <span className="font-extrabold text-base tracking-tight text-amber-400">Lab</span>
                {!isPro && (
                  <button
                    onClick={() => openProModal()}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/40 transition ml-1"
                    title="Базовый режим (до 10 шуток в категории). Оформить подписку за 250 ₽"
                  >
                    Базовый
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Center Nav tabs with Drag-and-Drop and Reordering */}
          <nav 
            className="hidden lg:flex items-center gap-1 bg-black/60 p-1.5 rounded-2xl border border-rose-950/60 shadow-inner max-w-full overflow-x-auto"
            aria-label="Навигация и разделы стендап-приложения"
          >
            {orderedNavItems.map((item, index) => {
              const isActive = activeTab === item.id;
              const isBeingDragged = draggedTab === item.id;
              const isOver = dragOverTab === item.id && draggedTab !== item.id;

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`relative group flex items-center rounded-xl transition select-none cursor-grab active:cursor-grabbing ${
                    isBeingDragged 
                      ? 'opacity-40 scale-95 ring-2 ring-amber-400 ring-dashed' 
                      : ''
                  } ${
                    isOver 
                      ? 'border-2 border-amber-400 bg-amber-500/20' 
                      : ''
                  }`}
                  title="Перетащите мышью, чтобы поменять вкладки местами"
                >
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md shadow-amber-500/25 ring-1 ring-amber-300'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {/* Drag Handle Grip Icon on hover or reorder mode */}
                    <span 
                      className="opacity-40 group-hover:opacity-100 transition-opacity text-amber-400/80 -ml-1 cursor-grab"
                      title="Перетащите для изменения порядка"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                    </span>

                    <span>{item.icon}</span>
                    <span className="whitespace-nowrap">{item.label}</span>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          isActive ? 'bg-neutral-950 text-amber-300' : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Inline Quick Swap arrows (visible in reorder mode or on hover) */}
                  {isReorderMode && (
                    <div className="flex items-center gap-0.5 ml-1 bg-black/80 px-1 py-0.5 rounded-lg border border-amber-500/30">
                      <button
                        disabled={index === 0}
                        onClick={(e) => handleMoveTabLeft(e, index)}
                        className={`p-0.5 rounded hover:bg-neutral-800 transition ${
                          index === 0 ? 'text-neutral-600 cursor-not-allowed' : 'text-amber-400 hover:text-amber-300'
                        }`}
                        title="Сдвинуть влево"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={index === orderedNavItems.length - 1}
                        onClick={(e) => handleMoveTabRight(e, index)}
                        className={`p-0.5 rounded hover:bg-neutral-800 transition ${
                          index === orderedNavItems.length - 1 ? 'text-neutral-600 cursor-not-allowed' : 'text-amber-400 hover:text-amber-300'
                        }`}
                        title="Сдвинуть вправо"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick Reorder Mode Toggle button */}
            <button
              onClick={() => setIsReorderMode(!isReorderMode)}
              className={`p-1.5 rounded-xl text-xs font-bold transition ml-1 ${
                isReorderMode 
                  ? 'bg-amber-500 text-black shadow-md' 
                  : 'text-neutral-400 hover:text-amber-300 hover:bg-white/5'
              }`}
              title={isReorderMode ? 'Завершить настройку порядка' : 'Включить стрелки перемещения вкладок'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Social Sync Hub Button */}
            <button
              onClick={() => setShowSocialModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500/15 via-red-500/15 via-pink-500/15 to-blue-500/15 hover:from-sky-500/25 hover:to-blue-500/25 text-neutral-200 border border-sky-400/30 rounded-xl text-xs font-bold transition shadow-sm"
              title="Синхронизация с Telegram, YouTube, TikTok и ВКонтакте"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden xl:inline">📱 TG • YT • VK • TT</span>
            </button>

            {/* Quick Order Customizer Button */}
            <button
              onClick={() => setShowOrderModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1f0206] hover:bg-[#2d0309] text-amber-300 border border-rose-900/60 rounded-xl text-xs font-bold transition"
              title="Настроить порядок и расположение плиток"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Порядок плиток</span>
            </button>

            {/* Quick Stage mode button */}
            {setlists.length > 0 && (
              <button
                onClick={() => startStageMode(setlists[0])}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl shadow-sm transition active:scale-95"
                title="Запустить сценический таймер"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>На сцену!</span>
              </button>
            )}

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1b0307] hover:bg-[#2c050b] text-neutral-200 border border-rose-950/80 rounded-xl text-xs font-bold transition shadow-sm"
                title="Перевод приложения (Русский, English, 简体中文, Türkçe)"
              >
                <span className="text-sm leading-none">{currentLanguageInfo.flag}</span>
                <span className="font-mono text-[11px] uppercase tracking-wider">{language}</span>
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-[#160205] border border-rose-900/60 rounded-2xl shadow-2xl p-1.5 z-50 text-xs space-y-1 backdrop-blur-xl">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-rose-950/60">
                    {t('nav.language')} (Регион)
                  </div>
                  {(Object.keys(SUPPORTED_LANGUAGES) as Language[]).map(langKey => {
                    const info = SUPPORTED_LANGUAGES[langKey];
                    const isCurrent = language === langKey;
                    return (
                      <button
                        key={langKey}
                        onClick={() => {
                          setLanguage(langKey);
                          setShowLangMenu(false);
                          soundEffects.playStageClick();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                          isCurrent 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'hover:bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{info.flag}</span>
                          <div className="text-left leading-tight">
                            <div>{info.nativeName}</div>
                            <div className="text-[9px] text-neutral-500">{info.region}</div>
                          </div>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-neutral-800 transition text-xs font-bold"
                title="Резервное копирование и настройки"
              >
                ⚙️
              </button>

              {showSettings && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1a0205] border border-rose-900/60 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl">
                  {/* Demo / Tester Mode Switch for External Users */}
                  <button
                    onClick={() => {
                      toggleDemoMode();
                      setShowSettings(false);
                      celebrate();
                      soundEffects.playStageClick();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition ${
                      isDemoMode 
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40' 
                        : 'bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>🧪</span>
                      <span className="font-bold">{isDemoMode ? 'Тест-режим (ВКЛЮЧЕН)' : 'Включить демо-тест'}</span>
                    </div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/60 font-mono text-amber-300">
                      {isDemoMode ? 'DEMO' : 'FULL'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      openFeedbackModal();
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-rose-300 rounded-xl transition font-medium"
                  >
                    <span>💬</span>
                    <span>Отзыв тестера / Сообщить о баге</span>
                  </button>

                  <div className="border-t border-rose-950/60 my-1" />

                  <button
                    onClick={() => {
                      openProModal();
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold rounded-xl transition"
                  >
                    <span>💳</span>
                    <span>{isPro ? 'Управление подпиской (активна)' : 'Подписка за 250 ₽ / полгода'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowOrderModal(true);
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-neutral-200 rounded-xl transition"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Поменять плитки местами</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowSocialModal(true);
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-sky-300 rounded-xl transition"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Синхронизация (TG, YouTube, TikTok, VK)</span>
                  </button>

                  <div className="border-t border-rose-950/60 my-1" />

                  <button
                    onClick={handleExportBackup}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-neutral-200 rounded-xl transition"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Скачать бэкап (JSON)</span>
                  </button>

                  <label className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-neutral-200 rounded-xl transition cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Восстановить из файла</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>

                  <a
                    href="/app-icon.svg"
                    download="standuplab-icon.svg"
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-amber-300 rounded-xl transition"
                    title="Скачать мультяшную иконку стендап-микрофона"
                  >
                    <StandupAppIcon size={16} showGlow={false} />
                    <span>Иконка StandupLab (SVG)</span>
                  </a>

                  <div className="border-t border-rose-950/60 my-1" />

                  <button
                    onClick={() => {
                      if (confirm('Сбросить порядок вкладок к стандартному?')) {
                        resetTabOrder();
                        setShowSettings(false);
                        soundEffects.playStageClick();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-neutral-300 rounded-xl transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Сбросить порядок вкладок</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Восстановить примеры шуток и сетов по умолчанию?')) {
                        resetToSampleData();
                        setShowSettings(false);
                        celebrate();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-red-500/10 text-red-400 rounded-xl transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Сбросить к демо-данным</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Nav Scroll Bar */}
        <div className="lg:hidden flex items-center overflow-x-auto px-4 py-2 gap-1.5 border-t border-rose-950/60 bg-[#100103]/90">
          <button
            onClick={() => setShowOrderModal(true)}
            className="p-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 text-xs flex items-center gap-1"
            title="Поменять порядок плиток"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowSocialModal(true)}
            className="p-1.5 rounded-xl bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0 text-xs flex items-center gap-1"
            title="Синхронизация с соцсетями (TG, YouTube, TikTok, VK)"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="px-2 py-1 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-800 shrink-0 text-xs flex items-center gap-1"
            title="Язык / Language"
          >
            <span>{currentLanguageInfo.flag}</span>
            <span className="font-mono text-[10px] uppercase">{language}</span>
          </button>

          {orderedNavItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shrink-0 ${
                  isActive 
                    ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20' 
                    : 'bg-black/60 text-neutral-400 border border-neutral-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1 rounded-full ${isActive ? 'bg-black/30 text-neutral-900' : 'bg-neutral-800 text-neutral-400'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ============================================================== */}
      {/* MODAL: CUSTOMIZE TAB ORDER (ПОМЕНЯТЬ ПЛИТКИ МЕСТАМИ)           */}
      {/* ============================================================== */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="theater-panel rounded-3xl max-w-md w-full p-6 text-neutral-100 shadow-2xl border border-amber-500/30">
            <div className="flex items-center justify-between pb-4 border-b border-rose-950/60 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Порядок плиток навигации</h3>
                  <p className="text-xs text-neutral-400">Меняйте разделы местами под свой рабочий процесс</p>
                </div>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 mb-3">
              💡 Перетаскивайте мышью или используйте кнопки со стрелками <span className="text-amber-300 font-bold">↑ ↓</span> для перемещения:
            </p>

            {/* List of tabs */}
            <div className="space-y-2 mb-5">
              {orderedNavItems.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === orderedNavItems.length - 1;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-mono font-bold text-amber-400/80">
                        {index + 1}.
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-2">
                          <span>{item.label}</span>
                          {activeTab === item.id && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-md font-mono">
                              Активна
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Move Up / Down Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        disabled={isFirst}
                        onClick={() => {
                          moveTab(index, index - 1);
                          soundEffects.playStageClick();
                        }}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition ${
                          isFirst
                            ? 'text-neutral-600 border-neutral-800 cursor-not-allowed'
                            : 'text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                        }`}
                        title="Поднять выше"
                      >
                        ▲
                      </button>
                      <button
                        disabled={isLast}
                        onClick={() => {
                          moveTab(index, index + 1);
                          soundEffects.playStageClick();
                        }}
                        className={`p-1.5 rounded-xl border text-xs font-bold transition ${
                          isLast
                            ? 'text-neutral-600 border-neutral-800 cursor-not-allowed'
                            : 'text-amber-400 hover:bg-amber-500/20 border-amber-500/30'
                        }`}
                        title="Опустить ниже"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-rose-950/60">
              <button
                onClick={() => {
                  resetTabOrder();
                  soundEffects.playStageClick();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>По умолчанию</span>
              </button>

              <button
                onClick={() => {
                  setShowOrderModal(false);
                  celebrate();
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 transition shadow-lg shadow-amber-500/20"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Сохранить порядок</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Social Sync Modal */}
      <SocialSyncModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />
    </>
  );
};
