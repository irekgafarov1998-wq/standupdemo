import React, { useState, useEffect, useRef } from 'react';
import { Setlist, Joke, AudioMarker } from '../../types';
import { useStandup } from '../../context/StandupContext';
import { formatSeconds } from '../../utils/formatters';
import { 
  X, Play, Pause, RotateCcw, Check, CheckCircle2, 
  Mic, MicOff, AlertTriangle, List, Eye, Type 
} from 'lucide-react';

interface StageModeProps {
  setlist: Setlist;
  onExit: () => void;
}

export const StageMode: React.FC<StageModeProps> = ({ setlist, onExit }) => {
  const { jokes, addRecording, celebrate } = useStandup();

  // Active thesis pointer
  const [activeThesisIndex, setActiveThesisIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [fontSizeLarge, setFontSizeLarge] = useState(true);

  // Timer states
  const targetTotalSeconds = (setlist.targetDurationMinutes || 5) * 60;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true); // Auto-start on stage!
  const [isCountDown, setIsCountDown] = useState(true);

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [liveMarkers, setLiveMarkers] = useState<AudioMarker[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Timer ticker
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Audio Recording Setup
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Не удалось получить доступ к микрофону. Проверьте разрешения браузера.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAddLiveMarker = (type: 'kill' | 'smile' | 'bomb' | 'improv', label: string) => {
    const newMarker: AudioMarker = {
      id: 'mark-' + Date.now(),
      timestampSec: elapsedSeconds,
      type,
      label
    };
    setLiveMarkers(prev => [...prev, newMarker]);

    if (type === 'kill') {
      celebrate();
    }
  };

  // Keyboard navigation on stage: Space or ArrowDown = next thesis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNextThesis();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevThesis();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeThesisIndex, setlist.items.length]);

  const handleNextThesis = () => {
    if (activeThesisIndex < setlist.items.length - 1) {
      // Mark current as done
      const currentItem = setlist.items[activeThesisIndex];
      setCompletedItems(prev => ({ ...prev, [currentItem.id]: true }));
      setActiveThesisIndex(prev => prev + 1);
    }
  };

  const handlePrevThesis = () => {
    if (activeThesisIndex > 0) {
      setActiveThesisIndex(prev => prev - 1);
    }
  };

  const toggleItemDone = (itemId: string, index: number) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    setActiveThesisIndex(index);
  };

  // Remaining calculation
  const remainingSeconds = targetTotalSeconds - elapsedSeconds;
  const isOneMinuteWarning = remainingSeconds <= 60 && remainingSeconds > 0;
  const isOvertime = remainingSeconds <= 0;

  const currentItem = setlist.items[activeThesisIndex];
  const currentJoke = currentItem?.jokeId ? jokes.find(j => j.id === currentItem.jokeId) : null;

  const handleExitStage = async () => {
    if (isRecording) {
      stopAudioRecording();
    }

    if (elapsedSeconds > 10 || liveMarkers.length > 0) {
      const title = `${setlist.title} (${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })})`;
      const blob = recordedBlob || (audioChunksRef.current.length > 0 ? new Blob(audioChunksRef.current, { type: 'audio/webm' }) : undefined);

      await addRecording({
        title,
        date: new Date().toISOString().split('T')[0],
        durationSec: elapsedSeconds,
        markers: liveMarkers,
        setlistId: setlist.id,
        overallFeedback: `Выступление по тезисному сет-листу "${setlist.title}". Время на сцене: ${formatSeconds(elapsedSeconds)}.`
      }, blob);
    }

    onExit();
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black text-white flex flex-col justify-between select-none overflow-hidden ${
      isOvertime ? 'beacon-overtime border-4 border-red-600' : isOneMinuteWarning ? 'beacon-warning border-4 border-amber-500' : ''
    }`}>
      {/* Top Stage Bar: Stage Clock, Beacon & Controls */}
      <div className="p-3 sm:p-5 bg-neutral-950/95 border-b border-neutral-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Left: Close & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition"
            title="Закончить выступление"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black text-neutral-100 tracking-wide truncate max-w-[200px] sm:max-w-xs">
                {setlist.title}
              </h1>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                ТЕЗИСНЫЙ СЕТ
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Тезис {activeThesisIndex + 1} из {setlist.items.length}
            </p>
          </div>
        </div>

        {/* Center: Stage Clock / Beacon */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div 
              onClick={() => setIsCountDown(!isCountDown)}
              className={`text-3xl sm:text-5xl font-black font-mono tracking-wider cursor-pointer ${
                isOvertime
                  ? 'text-red-500 animate-pulse'
                  : isOneMinuteWarning
                  ? 'text-amber-400 font-black'
                  : 'text-neutral-100'
              }`}
              title="Нажмите для переключения: обратный отсчет / прямое время"
            >
              {isCountDown 
                ? (remainingSeconds < 0 ? `-${formatSeconds(Math.abs(remainingSeconds))}` : formatSeconds(remainingSeconds))
                : formatSeconds(elapsedSeconds)}
            </div>
            <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-widest">
              {isCountDown ? 'Осталось' : 'Прошло'} (лимит: {setlist.targetDurationMinutes}м)
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`p-2.5 rounded-xl font-bold transition shadow-lg ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-emerald-500 text-black hover:bg-emerald-400'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setElapsedSeconds(0);
              }}
              className="p-2 bg-neutral-900 text-neutral-400 rounded-xl hover:text-white"
              title="Сброс"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Audio REC & Font size toggle */}
        <div className="flex items-center gap-2">
          {/* Font toggle */}
          <button
            onClick={() => setFontSizeLarge(!fontSizeLarge)}
            className={`p-2 rounded-xl text-xs font-bold border transition ${
              fontSizeLarge ? 'bg-amber-500 text-neutral-950 border-amber-400' : 'bg-neutral-900 text-neutral-400 border-neutral-800'
            }`}
            title="Переключить размер шрифта тезисов"
          >
            <Type className="w-4 h-4" />
          </button>

          {/* Beacon Alerts */}
          {isOneMinuteWarning && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl animate-bounce">
              <AlertTriangle className="w-4 h-4" />
              <span>МАЯК: 1 МИН</span>
            </div>
          )}

          {isOvertime && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>ВРЕМЯ!</span>
            </div>
          )}

          {/* Audio recording */}
          {!isRecording ? (
            <button
              onClick={startAudioRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-bold rounded-xl transition"
            >
              <Mic className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">REC</span>
            </button>
          ) : (
            <button
              onClick={stopAudioRecording}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl animate-pulse transition"
            >
              <MicOff className="w-3.5 h-3.5" />
              <span>REC</span>
            </button>
          )}
        </div>
      </div>

      {/* STAGE MINDSET REMINDER (If comedian wrote stage notes) */}
      {setlist.stageNotes && (
        <div className="px-4 py-2 bg-neutral-950 border-b border-neutral-900 text-center shrink-0">
          <p className="text-xs text-amber-300/90 font-medium tracking-wide">
            💡 <span className="font-bold text-amber-400">Напоминание:</span> {setlist.stageNotes}
          </p>
        </div>
      )}

      {/* MAIN STAGE WORKSPACE: THESIS / OUTLINE LIST (NO WORDY TELEPROMPTER!) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 max-w-4xl mx-auto w-full space-y-3">
        {setlist.items.map((item, index) => {
          const joke = item.jokeId ? jokes.find(j => j.id === item.jokeId) : null;
          const isActive = index === activeThesisIndex;
          const isDone = !!completedItems[item.id];
          const title = item.customTitle || joke?.title || 'Без названия';
          const punchlineTrigger = joke?.punchline || item.customText || '';
          const duration = item.durationSec || joke?.durationSec || 45;

          return (
            <div
              key={item.id}
              onClick={() => toggleItemDone(item.id, index)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                isActive
                  ? 'bg-neutral-900 border-2 border-amber-400 shadow-xl shadow-amber-500/10'
                  : isDone
                  ? 'bg-neutral-950/40 border-neutral-900 opacity-40 hover:opacity-70'
                  : 'bg-neutral-950 border-neutral-800/80 hover:border-neutral-700'
              }`}
            >
              {/* Left: Number + Thesis + Punch Trigger */}
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                {/* Index / Check indicator */}
                <button
                  type="button"
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm shrink-0 transition ${
                    isDone
                      ? 'bg-emerald-500 text-black'
                      : isActive
                      ? 'bg-amber-400 text-black'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {isDone ? <Check className="w-5 h-5 stroke-[3]" /> : index + 1}
                </button>

                {/* Thesis Text */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-black tracking-tight leading-tight transition ${
                        fontSizeLarge ? 'text-xl sm:text-3xl' : 'text-lg sm:text-xl'
                      } ${
                        isActive
                          ? 'text-white'
                          : isDone
                          ? 'line-through text-neutral-500'
                          : 'text-neutral-300'
                      }`}
                    >
                      {title}
                    </h3>

                    {isActive && (
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider shrink-0">
                        СЕЙЧАС
                      </span>
                    )}
                  </div>

                  {/* Concise Punchline Cue / Trigger Hint */}
                  {punchlineTrigger && (
                    <p
                      className={`font-bold transition leading-snug ${
                        fontSizeLarge ? 'text-base sm:text-xl' : 'text-xs sm:text-sm'
                      } ${
                        isActive
                          ? 'text-amber-300'
                          : isDone
                          ? 'text-neutral-600 line-through'
                          : 'text-neutral-400'
                      }`}
                    >
                      👉 {punchlineTrigger}
                    </p>
                  )}

                  {/* Delivery Note if any */}
                  {isActive && (item.notes || joke?.notes) && (
                    <p className="text-xs text-sky-400 font-semibold pt-1">
                      🎙️ Подача: {item.notes || joke?.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Duration pill */}
              <span className="font-mono text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 shrink-0 font-bold">
                {duration}с
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Controls: Live Marking for Audio Analysis & Quick Thesis Step */}
      <div className="p-3 sm:p-5 bg-neutral-950/95 border-t border-neutral-900 space-y-3 shrink-0">
        {/* Live Reaction Pins for Audio Post-Mortem Analysis */}
        <div className="max-w-xl mx-auto flex items-center justify-center gap-2">
          <button
            onClick={() => handleAddLiveMarker('kill', `Разрыв: ${currentItem?.customTitle || currentJoke?.title}`)}
            className="flex-1 py-2.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
          >
            <span>💥</span>
            <span>РАЗРЫВ</span>
          </button>

          <button
            onClick={() => handleAddLiveMarker('smile', `Улыбка: ${currentItem?.customTitle || currentJoke?.title}`)}
            className="flex-1 py-2.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
          >
            <span>🙂</span>
            <span>УЛЫБКА</span>
          </button>

          <button
            onClick={() => handleAddLiveMarker('bomb', `Провал: ${currentItem?.customTitle || currentJoke?.title}`)}
            className="flex-1 py-2.5 px-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
          >
            <span>💀</span>
            <span>ПРОВАЛ</span>
          </button>

          <button
            onClick={() => handleAddLiveMarker('improv', `Импровизация: ${currentItem?.customTitle || currentJoke?.title}`)}
            className="flex-1 py-2.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition active:scale-95"
          >
            <span>💡</span>
            <span>ИМПРОВ</span>
          </button>
        </div>

        {/* Quick Thesis Advance Button */}
        <div className="flex items-center justify-between max-w-xl mx-auto gap-3">
          <button
            onClick={handlePrevThesis}
            disabled={activeThesisIndex === 0}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-30 text-neutral-300 font-bold text-xs rounded-xl transition"
          >
            Предыдущий тезис
          </button>

          <button
            onClick={handleNextThesis}
            disabled={activeThesisIndex === setlist.items.length - 1}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-amber-500/20"
          >
            Отметить и перейти дальше (Пробел) →
          </button>
        </div>
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4">
            <h3 className="text-lg font-bold text-white">Завершить сценический режим?</h3>
            <p className="text-sm text-neutral-400">
              {isRecording 
                ? 'Аудиозапись выступления будет сохранена в раздел "Диктофон & Анализ" вместе с таймкодами реакций.' 
                : 'Выступление завершится и вы вернетесь к управлению сет-листами.'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-xl text-sm"
              >
                Остаться на сцене
              </button>
              <button
                onClick={handleExitStage}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm"
              >
                Сойти со сцены и сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
