import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStandup } from '../../context/StandupContext';
import { AudioRecording, AudioMarker, MarkerType } from '../../types';
import { formatSeconds, getMarkerConfig, getBombReasonLabel } from '../../utils/formatters';
import { getAudioBlob } from '../../services/storage';
import { 
  Mic, MicOff, Play, Pause, RotateCcw, Trash2, Plus, AlertTriangle, 
  Sparkles, Clock, Volume2, Download, Tag, Check, Filter, Edit3 
} from 'lucide-react';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

export const AudioAnalyzer: React.FC = () => {
  const { 
    recordings, selectedRecordingId, setSelectedRecordingId, addRecording, 
    updateRecording, deleteRecording, addMarkerToRecording, updateMarker, 
    deleteMarker, celebrate 
  } = useStandup();

  // Active selected recording
  const activeRecording = useMemo(() => {
    return recordings.find(r => r.id === selectedRecordingId) || recordings[0] || null;
  }, [recordings, selectedRecordingId]);

  // Audio Player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Live Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimerSec, setRecordTimerSec] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [liveMarkers, setLiveMarkers] = useState<AudioMarker[]>([]);
  const [newRecTitle, setNewRecTitle] = useState('');

  // Post-Mortem modal state
  const [editingMarker, setEditingMarker] = useState<AudioMarker | null>(null);
  const [markerFilter, setMarkerFilter] = useState<'all' | MarkerType>('all');

  // Load audio blob from IndexedDB when selected recording changes
  useEffect(() => {
    let active = true;
    if (activeRecording) {
      if (activeRecording.blobKey) {
        getAudioBlob(activeRecording.blobKey).then(blob => {
          if (active && blob) {
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          }
        });
      } else {
        setAudioUrl(null);
      }
    }
    return () => {
      active = false;
    };
  }, [activeRecording]);

  // Live recording ticker
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordTimerSec(prev => prev + 1);
      }, 1000);
    } else {
      setRecordTimerSec(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setLiveMarkers([]);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        const title = newRecTitle.trim() || `Запись выступления (${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })})`;
        
        await addRecording({
          title,
          date: new Date().toISOString().split('T')[0],
          durationSec: recordTimerSec,
          markers: liveMarkers,
          overallFeedback: 'Запись сохранена. Прослушайте и разберите моменты тишины и взрывного смеха.'
        }, blob);

        celebrate();
        setNewRecTitle('');
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert('Не удалось запустить запись с микрофона. Проверьте разрешения.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAddMarker = (type: MarkerType, defaultLabel: string) => {
    const timestampSec = isRecording ? recordTimerSec : Math.round(currentTime);

    if (isRecording) {
      const newM: AudioMarker = {
        id: 'mark-' + Date.now(),
        timestampSec,
        type,
        label: defaultLabel
      };
      setLiveMarkers(prev => [...prev, newM]);
    } else if (activeRecording) {
      addMarkerToRecording(activeRecording.id, {
        timestampSec,
        type,
        label: defaultLabel
      });
    }

    if (type === 'kill') {
      celebrate();
    }
  };

  const handleSeek = (timestampSec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timestampSec;
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      setCurrentTime(timestampSec);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `${activeRecording?.title || 'standup-recording'}.webm`;
      a.click();
    }
  };

  // Filtered markers
  const filteredMarkers = useMemo(() => {
    if (!activeRecording) return [];
    return activeRecording.markers.filter(m => {
      if (markerFilter === 'all') return true;
      return m.type === markerFilter;
    });
  }, [activeRecording, markerFilter]);

  // Failure / Bomb Analysis statistics
  const markerCounts = useMemo(() => {
    if (!activeRecording) return { kill: 0, smile: 0, bomb: 0, improv: 0 };
    return {
      kill: activeRecording.markers.filter(m => m.type === 'kill').length,
      smile: activeRecording.markers.filter(m => m.type === 'smile').length,
      bomb: activeRecording.markers.filter(m => m.type === 'bomb').length,
      improv: activeRecording.markers.filter(m => m.type === 'improv').length
    };
  }, [activeRecording]);

  return (
    <div className="space-y-6">
      {/* Standup FOH Mixing Console & Laugh-O-Meter Banner */}
      <StandupSectionBanner
        tab="recorder"
        actions={
          <div className="flex items-center gap-3">
            {isRecording ? (
              <div className="flex items-center gap-3 bg-neutral-950 p-2 rounded-2xl border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <div className="flex items-center gap-2 px-3 py-1 font-mono font-bold text-red-500 text-sm animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                  <span>REC {formatSeconds(recordTimerSec)}</span>
                </div>
                <button
                  onClick={handleStopRecording}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition"
                >
                  Остановить и сохранить
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Название сета..."
                  value={newRecTitle}
                  onChange={e => setNewRecTitle(e.target.value)}
                  className="w-40 sm:w-48 px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 transition active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>Запись</span>
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Live Reaction Pins during recording */}
      {isRecording && (
        <div className="bg-neutral-900 border border-red-500/30 rounded-2xl p-4 text-center space-y-3">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Отмечай реакцию зала прямо сейчас:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 max-w-xl mx-auto">
            <button
              onClick={() => handleAddMarker('kill', 'Разрыв зала 💥')}
              className="flex-1 py-3 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl font-bold text-xs transition active:scale-95"
            >
              💥 РАЗРЫВ
            </button>
            <button
              onClick={() => handleAddMarker('smile', 'Улыбка 🙂')}
              className="flex-1 py-3 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl font-bold text-xs transition active:scale-95"
            >
              🙂 УЛЫБКА
            </button>
            <button
              onClick={() => handleAddMarker('bomb', 'Тишина / Провал 💀')}
              className="flex-1 py-3 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 rounded-xl font-bold text-xs transition active:scale-95"
            >
              💀 ПРОВАЛ
            </button>
            <button
              onClick={() => handleAddMarker('improv', 'Импровизация / Разгон 💡')}
              className="flex-1 py-3 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 rounded-xl font-bold text-xs transition active:scale-95"
            >
              💡 ИМПРОВ
            </button>
          </div>
          <span className="text-[11px] text-neutral-500 block">
            Отмечено меток во время выступления: {liveMarkers.length}
          </span>
        </div>
      )}

      {/* Main Analysis Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recordings History List (approx 4 cols) */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Сохраненные сеты ({recordings.length})
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[500px] pr-1">
            {recordings.map(rec => {
              const isSelected = activeRecording?.id === rec.id;
              const bombs = rec.markers.filter(m => m.type === 'bomb').length;
              const kills = rec.markers.filter(m => m.type === 'kill').length;

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecordingId(rec.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition text-left ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/40'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-amber-300' : 'text-neutral-200'}`}>
                      {rec.title}
                    </h4>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                      {formatSeconds(rec.durationSec)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{new Date(rec.date).toLocaleDateString('ru-RU')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">💥 {kills}</span>
                      <span className="text-red-400 font-bold">💀 {bombs}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {recordings.length === 0 && (
              <p className="text-xs text-neutral-500 text-center py-6">
                Записей пока нет
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Audio Playback, Timeline, Marker Breakdown & Failure Post-Mortem (approx 8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeRecording ? (
            <>
              {/* Audio Player Card with Visual Waveform Simulation */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-neutral-100">{activeRecording.title}</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Дата: {new Date(activeRecording.date).toLocaleDateString('ru-RU')} • Хронометраж: {formatSeconds(activeRecording.durationSec)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {audioUrl && (
                      <button
                        onClick={handleDownloadAudio}
                        className="p-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-xl transition"
                        title="Скачать аудиофайл"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Удалить эту запись выступления?')) deleteRecording(activeRecording.id);
                      }}
                      className="p-2 text-neutral-500 hover:text-red-400 transition"
                      title="Удалить запись"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Hidden HTML audio element if blob available */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={() => {
                      if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                    }}
                    onEnded={() => setIsPlaying(false)}
                  />
                )}

                {/* Timeline & Waveform visualizer */}
                <div className="space-y-2 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
                    <span>{formatSeconds(Math.round(currentTime))}</span>
                    <span>{formatSeconds(activeRecording.durationSec)}</span>
                  </div>

                  {/* Interactive Waveform Bar with Marker Pins */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const ratio = (e.clientX - rect.left) / rect.width;
                      const targetSec = Math.round(ratio * activeRecording.durationSec);
                      handleSeek(targetSec);
                    }}
                    className="relative w-full h-12 bg-neutral-900 rounded-xl overflow-hidden cursor-pointer flex items-center px-1 border border-neutral-800/80"
                  >
                    {/* Simulated Waveform bars */}
                    <div className="absolute inset-0 flex items-center justify-between px-2 opacity-40">
                      {Array.from({ length: 48 }).map((_, i) => {
                        const height = 15 + Math.abs(Math.sin(i * 0.4)) * 30;
                        return (
                          <div
                            key={i}
                            className="w-1 bg-amber-400 rounded-full"
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>

                    {/* Progress Fill */}
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-amber-500/20 border-r-2 border-amber-400 pointer-events-none transition-all"
                      style={{
                        width: `${Math.min(100, (currentTime / (activeRecording.durationSec || 1)) * 100)}%`
                      }}
                    />

                    {/* Colored Pins for Markers on Timeline */}
                    {activeRecording.markers.map(m => {
                      const posPercent = Math.min(100, (m.timestampSec / (activeRecording.durationSec || 1)) * 100);
                      const conf = getMarkerConfig(m.type);
                      return (
                        <div
                          key={m.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeek(m.timestampSec);
                          }}
                          className={`absolute top-1 bottom-1 w-2 rounded-full ${conf.dot} hover:scale-125 transition-transform z-10 cursor-pointer shadow-md`}
                          style={{ left: `${posPercent}%` }}
                          title={`[${formatSeconds(m.timestampSec)}] ${m.label}`}
                        />
                      );
                    })}
                  </div>

                  {/* Playback Controls & Quick Stamp Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={togglePlayAudio}
                        className="p-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition shadow-md shadow-amber-500/20"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                      <button
                        onClick={() => handleSeek(0)}
                        className="p-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded-xl transition"
                        title="В начало"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Stamp at current playhead */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-neutral-500 mr-1">Поставить метку на {formatSeconds(Math.round(currentTime))}:</span>
                      <button
                        onClick={() => handleAddMarker('kill', 'Разрыв')}
                        className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold"
                      >
                        💥 Разрыв
                      </button>
                      <button
                        onClick={() => handleAddMarker('bomb', 'Тишина')}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-lg font-bold"
                      >
                        💀 Провал
                      </button>
                    </div>
                  </div>
                </div>

                {/* Score & Reaction Badges */}
                <div className="grid grid-cols-4 gap-2 text-center pt-1">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-amber-400">Разрывы</span>
                    <p className="text-lg font-black text-amber-300">{markerCounts.kill}</p>
                  </div>
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-emerald-400">Улыбки</span>
                    <p className="text-lg font-black text-emerald-300">{markerCounts.smile}</p>
                  </div>
                  <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-red-400">Провалы</span>
                    <p className="text-lg font-black text-red-300">{markerCounts.bomb}</p>
                  </div>
                  <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-cyan-400">Импровизации</span>
                    <p className="text-lg font-black text-cyan-300">{markerCounts.improv}</p>
                  </div>
                </div>
              </div>

              {/* POST-MORTEM & MARKERS BREAKDOWN LIST */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-neutral-100 uppercase tracking-wider">
                      Анализ моментов и разбор провалов
                    </h3>
                  </div>

                  {/* Filter markers */}
                  <div className="flex items-center gap-1">
                    {(['all', 'bomb', 'kill', 'smile', 'improv'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setMarkerFilter(f)}
                        className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                          markerFilter === f
                            ? 'bg-neutral-100 text-neutral-950'
                            : 'bg-neutral-950 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {f === 'all' ? 'Все' : f === 'bomb' ? '💀 Провалы' : f === 'kill' ? '💥 Разрывы' : f === 'smile' ? '🙂 Улыбки' : '💡 Импров'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Markers list */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {filteredMarkers.map(marker => {
                    const conf = getMarkerConfig(marker.type);
                    return (
                      <div
                        key={marker.id}
                        className={`p-3.5 rounded-xl border transition ${conf.bg} ${conf.border}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSeek(marker.timestampSec)}
                              className="px-2 py-0.5 bg-neutral-950 font-mono text-xs font-bold rounded-md hover:bg-neutral-800 text-neutral-200 transition"
                            >
                              ▶ {formatSeconds(marker.timestampSec)}
                            </button>
                            <span className="text-xs font-bold text-neutral-200">
                              {conf.emoji} {marker.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingMarker(marker)}
                              className="p-1 text-neutral-400 hover:text-amber-300"
                              title="Редактировать разбор"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMarker(activeRecording.id, marker.id)}
                              className="p-1 text-neutral-400 hover:text-red-400"
                              title="Удалить метку"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* If Bomb, show reason and fix notes */}
                        {marker.type === 'bomb' && (
                          <div className="mt-2 text-xs bg-neutral-950/70 p-2.5 rounded-lg border border-red-500/20 space-y-1">
                            <span className="text-[11px] font-bold text-red-400 uppercase block">
                              Причина провала: {getBombReasonLabel(marker.bombReason)}
                            </span>
                            {marker.notes && (
                              <p className="text-neutral-300 leading-relaxed">
                                💡 Как исправить: {marker.notes}
                              </p>
                            )}
                          </div>
                        )}

                        {marker.type !== 'bomb' && marker.notes && (
                          <p className="mt-1 text-xs text-neutral-300 bg-neutral-950/50 p-2 rounded-lg">
                            {marker.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {filteredMarkers.length === 0 && (
                    <p className="text-xs text-neutral-500 text-center py-6">
                      В этой категории меток нет
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-3">
              <p className="text-sm text-neutral-400">Выберите запись или начните новую через микрофон</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Marker / Post-Mortem modal */}
      {editingMarker && activeRecording && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full text-neutral-100 shadow-2xl">
            <h3 className="text-base font-bold text-amber-400 mb-3">
              Разбор момента на {formatSeconds(editingMarker.timestampSec)}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">Название / Описание момента</label>
                <input
                  type="text"
                  value={editingMarker.label}
                  onChange={e => setEditingMarker({ ...editingMarker, label: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100"
                />
              </div>

              {editingMarker.type === 'bomb' && (
                <div>
                  <label className="block text-xs font-semibold text-red-400 mb-1">Почему не зашло? (Причина провала)</label>
                  <select
                    value={editingMarker.bombReason || 'too_wordy'}
                    onChange={e => setEditingMarker({ ...editingMarker, bombReason: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200"
                  >
                    <option value="too_wordy">Затянут сетап (слишком много слов)</option>
                    <option value="bad_timing">Сбился тайминг / забыл текст</option>
                    <option value="wrong_crowd">Холодный зал / не та аудитория</option>
                    <option value="unclear_punch">Непонятный или слабый панчлайн</option>
                    <option value="weak_delivery">Неуверенная подача / мимика</option>
                    <option value="other">Другое</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-400 mb-1">
                  Заметки / Что изменить в шутке к следующему открытому микрофону
                </label>
                <textarea
                  rows={3}
                  value={editingMarker.notes || ''}
                  onChange={e => setEditingMarker({ ...editingMarker, notes: e.target.value })}
                  placeholder="Сократить сетап, усилить панч..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingMarker(null)}
                  className="px-3.5 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateMarker(activeRecording.id, editingMarker.id, editingMarker);
                    setEditingMarker(null);
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-xl"
                >
                  Сохранить разбор
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
