import React, { useState } from 'react';
import { useStandup } from '../../context/StandupContext';
import { 
  Sparkles, MessageSquare, RotateCcw, Zap, ChevronUp, 
  ChevronDown, AlertCircle, Check, Info, ShieldAlert 
} from 'lucide-react';
import { soundEffects } from '../../utils/soundEffects';

export const DemoTesterBanner: React.FC = () => {
  const { 
    isDemoMode, toggleDemoMode, jokes, notes, setlists, 
    aiReelsCount, resetToSampleData, openFeedbackModal, celebrate 
  } = useStandup();

  const [isCollapsed, setIsCollapsed] = useState(false);

  // If demo mode is not active, render a discreet small badge in corner to allow enabling demo test
  if (!isDemoMode) {
    return (
      <div className="fixed bottom-3 right-3 z-30">
        <button
          onClick={() => {
            toggleDemoMode();
            soundEffects.playStageClick();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-500/40 text-[11px] font-bold shadow-xl backdrop-blur-md transition hover:scale-105 active:scale-95"
          title="Включить урезанную версию для теста другими комиками"
        >
          <span>🧪</span>
          <span>Включить демо-тест</span>
        </button>
      </div>
    );
  }

  const handleResetDemo = () => {
    if (confirm('Сбросить данные к эталонным тестовым примерам для демонстрации?')) {
      resetToSampleData();
      celebrate();
      soundEffects.playApplause();
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#180306] via-[#24060b] to-[#180306] border-b-2 border-amber-500/60 shadow-[0_4px_25px_rgba(0,0,0,0.85)] text-white backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        
        {/* Left: Demo Mode Status & Info */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-[10px] font-black uppercase tracking-wider text-amber-300">
              <span>🧪 ТЕСТОВАЯ ВЕРСИЯ (DEMO)</span>
            </div>
            <span className="text-xs text-neutral-300 hidden sm:inline">
              Урезанный режим для демонстрации и тестирования
            </span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden p-1 text-neutral-400 hover:text-white"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Center / Stats: Limits Usage */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
            <div className="px-2 py-1 rounded-lg bg-black/60 border border-rose-950 flex items-center gap-1 text-neutral-300">
              <span>🎤 Шутки:</span>
              <span className={jokes.length >= 5 ? 'text-amber-400 font-bold' : 'text-neutral-100 font-bold'}>
                {jokes.length}/5
              </span>
            </div>

            <div className="px-2 py-1 rounded-lg bg-black/60 border border-rose-950 flex items-center gap-1 text-neutral-300">
              <span>✍️ Заметки:</span>
              <span className={notes.length >= 3 ? 'text-amber-400 font-bold' : 'text-neutral-100 font-bold'}>
                {notes.length}/3
              </span>
            </div>

            <div className="px-2 py-1 rounded-lg bg-black/60 border border-rose-950 flex items-center gap-1 text-neutral-300">
              <span>📋 Сет-листы:</span>
              <span className={setlists.length >= 2 ? 'text-amber-400 font-bold' : 'text-neutral-100 font-bold'}>
                {setlists.length}/2
              </span>
            </div>

            <div className="px-2 py-1 rounded-lg bg-black/60 border border-rose-950 flex items-center gap-1 text-neutral-300">
              <span>🎬 Reels:</span>
              <span className={aiReelsCount >= 2 ? 'text-amber-400 font-bold' : 'text-neutral-100 font-bold'}>
                {aiReelsCount}/2
              </span>
            </div>
          </div>
        )}

        {/* Right: Actions (Feedback & Toggle) */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openFeedbackModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-neutral-950 font-black text-xs uppercase tracking-wider shadow-md transition hover:scale-105 active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Оставить отзыв</span>
            </button>

            <button
              onClick={handleResetDemo}
              className="p-1.5 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/60 transition text-xs"
              title="Сбросить тестовые данные к эталону"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                toggleDemoMode();
                celebrate();
                soundEffects.playStageClick();
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition"
              title="Переключиться в полную версию (PRO)"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Полная версия</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
