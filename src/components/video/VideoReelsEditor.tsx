import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStandup } from '../../context/StandupContext';
import { ReelClip, VideoAspectRatio, SubtitleStyle } from '../../types';
import { formatSeconds } from '../../utils/formatters';
import { 
  Video, Sparkles, Scissors, Play, Pause, RotateCcw, Download, Copy, Check, 
  Upload, Smartphone, Square, Monitor, Wand2, Volume2, VolumeX, Eye, Tag, AlertCircle, Share2 
} from 'lucide-react';
import { SocialSyncModal } from '../social/SocialSyncModal';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

const SAMPLE_VIDEOS = [
  {
    id: 'sample-1',
    title: 'Сет в Standup Club #1 (5 минут)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    durationSec: 15,
    note: 'Тестовое комедийное видео'
  },
  {
    id: 'sample-2',
    title: 'Открытый микрофон (Блок про технологии)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    durationSec: 15,
    note: 'Короткий скетч для проверки рилсов'
  }
];

export const VideoReelsEditor: React.FC = () => {
  const { 
    jokes, recordings, celebrate, activeVideoUrl, activeVideoTitle,
    isPro, canCreateAiReel, incrementAiReelsCount, openProModal, aiReelsCount 
  } = useStandup();

  // Video states
  const [videoSource, setVideoSource] = useState<string>(() => activeVideoUrl || SAMPLE_VIDEOS[0].url);
  const [videoTitle, setVideoTitle] = useState<string>(() => activeVideoTitle || SAMPLE_VIDEOS[0].title);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (activeVideoUrl) {
      setVideoSource(activeVideoUrl);
      if (activeVideoTitle) {
        setVideoTitle(activeVideoTitle);
      }
      setCurrentTime(0);
      setStartTime(0);
    }
  }, [activeVideoUrl, activeVideoTitle]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [isMuted, setIsMuted] = useState(false);

  // Reel Trim Settings
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(15);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('9:16');
  const [subtitleStyle, setSubtitleStyle] = useState<SubtitleStyle>('karaoke');

  // Overlays
  const [hookHeadline, setHookHeadline] = useState('САМЫЙ СТРАШНЫЙ ЗВОНОК ПОСЛЕ 28 ЛЕТ 💀');
  const [watermark, setWatermark] = useState('@standup_comic');
  const [captionText, setCaptionText] = useState('Когда тебе звонит стоматолог в субботу утром 😭\n\n#стендап #юмор #комедия #рилс');

  // AI Reels Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReels, setGeneratedReels] = useState<ReelClip[]>([]);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isSocialSyncOpen, setIsSocialSyncOpen] = useState(false);

  // Sync video time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      // Loop within reel boundaries if active
      if (cur >= endTime) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 15;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(dur, 45));
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (currentTime >= endTime || currentTime < startTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Upload custom video
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSource(url);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      setIsPlaying(false);
    }
  };

  // AI Automatic Reels Slicing
  const handleGenerateAIReels = async () => {
    // Check basic limit (3 AI Reel creations max)
    const limitCheck = canCreateAiReel();
    if (!limitCheck.allowed) {
      openProModal(limitCheck.reason);
      return;
    }

    setIsGenerating(true);
    try {
      // Gather relevant comedy material from jokes and recordings
      const relevantJokes = jokes.slice(0, 6);
      const recentRec = recordings[0];
      const markers = recentRec?.markers || [];

      const response = await fetch('/api/ai/slice-reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle,
          durationSec: duration,
          jokes: relevantJokes,
          markers,
          customContext: 'Выступление в стендап клубе'
        })
      });

      if (!response.ok) {
        throw new Error('Не удалось получить нарезку от ИИ');
      }

      const data = await response.json();
      if (data.reels && Array.isArray(data.reels)) {
        // Adjust start/end times if video is shorter than sample data
        const adapted = data.reels.map((r: any, idx: number) => {
          let s = r.startTime;
          let e = r.endTime;
          if (duration < 60) {
            // scale to current video duration
            s = Math.max(0, Math.min(idx * 3, duration - 5));
            e = Math.min(duration, s + 10);
          }
          return {
            ...r,
            startTime: s,
            endTime: e,
            aspectRatio: '9:16',
            subtitleStyle: 'karaoke',
            watermarkText: watermark
          };
        });

        setGeneratedReels(adapted);
        if (adapted.length > 0) {
          applyReel(adapted[0]);
        }
        celebrate();
        incrementAiReelsCount();
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при нарезке через ИИ. Проверьте соединение.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyReel = (reel: ReelClip) => {
    setActiveReelId(reel.id);
    setStartTime(reel.startTime);
    setEndTime(reel.endTime);
    setHookHeadline(reel.hookHeadline);
    setCaptionText(reel.caption);
    setAspectRatio(reel.aspectRatio || '9:16');

    if (videoRef.current) {
      videoRef.current.currentTime = reel.startTime;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const handleExportReel = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
      celebrate();
      setTimeout(() => setExportSuccess(false), 3500);
    }, 1800);
  };

  const reelDuration = Math.max(1, Math.round(endTime - startTime));

  return (
    <div className="space-y-6">
      {/* Standup Viral Cyberpunk Reels Studio Banner */}
      <StandupSectionBanner
        tab="video"
        actions={
          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <button
              onClick={handleGenerateAIReels}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-pink-500/25 hover:scale-[1.02] active:scale-95 transition shrink-0 disabled:opacity-50"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'ИИ нарезает видео...' : '🤖 Нарезать Reels с ИИ'}</span>
            </button>

            {/* Tier counter badge */}
            {isPro ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Безлимитная нарезка рилсов</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  aiReelsCount >= 3 
                    ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  ИИ-нарезок: {aiReelsCount}/3
                </span>
                {aiReelsCount >= 3 && (
                  <button
                    onClick={() => openProModal('В базовой версии доступно 3 создания рилса от ИИ. Вы использовали 3 из 3. Перейдите на тариф за 250 ₽ на полгода для безлимитной нарезки!')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    Снять лимит
                  </button>
                )}
              </div>
            )}
          </div>
        }
      />

      {/* Main Workspace: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Canvas & Live Subtitle Overlays (approx 7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center">
          {/* Controls Bar above player */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-neutral-800 text-xs">
            {/* Aspect Ratio Switcher */}
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  aspectRatio === '9:16' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16 Reels</span>
              </button>
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  aspectRatio === '1:1' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Square className="w-3.5 h-3.5" />
                <span>1:1 Квадрат</span>
              </button>
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  aspectRatio === '16:9' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9 Оригинал</span>
              </button>
            </div>

            {/* Source select or upload */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold rounded-xl cursor-pointer transition">
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Загрузить MP4</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <select
                value={videoSource}
                onChange={e => {
                  setVideoSource(e.target.value);
                  const sample = SAMPLE_VIDEOS.find(s => s.url === e.target.value);
                  if (sample) setVideoTitle(sample.title);
                }}
                className="bg-neutral-950 text-neutral-300 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
              >
                {SAMPLE_VIDEOS.map(s => (
                  <option key={s.id} value={s.url}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Player Screen with Dynamic Overlays */}
          <div className="relative w-full flex items-center justify-center bg-black rounded-2xl overflow-hidden shadow-2xl border border-neutral-800/80 my-2">
            <div
              className={`relative transition-all duration-300 flex items-center justify-center overflow-hidden bg-neutral-950 ${
                aspectRatio === '9:16'
                  ? 'w-[290px] h-[515px]'
                  : aspectRatio === '1:1'
                  ? 'w-[360px] h-[360px]'
                  : 'w-full aspect-video'
              }`}
            >
              {/* HTML5 Video Element */}
              <video
                ref={videoRef}
                src={videoSource}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                muted={isMuted}
                playsInline
                className={`w-full h-full object-cover transition`}
              />

              {/* OVERLAY: Top Hook Headline */}
              {hookHeadline && (
                <div className="absolute top-6 left-3 right-3 z-20 pointer-events-none text-center">
                  <div className="inline-block bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-amber-500/50 shadow-2xl">
                    <span className="text-amber-300 font-black text-xs sm:text-sm tracking-tight uppercase leading-snug drop-shadow-md">
                      {hookHeadline}
                    </span>
                  </div>
                </div>
              )}

              {/* OVERLAY: Watermark */}
              {watermark && (
                <div className="absolute top-2 right-3 z-20 pointer-events-none">
                  <span className="text-[11px] font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {watermark}
                  </span>
                </div>
              )}

              {/* OVERLAY: Dynamic Subtitles Preview */}
              <div className="absolute bottom-10 left-3 right-3 z-20 pointer-events-none text-center">
                <div className="inline-block max-w-[90%] bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <p className="text-white font-extrabold text-xs sm:text-sm leading-snug tracking-wide">
                    {subtitleStyle === 'karaoke' && (
                      <span>
                        <span className="text-amber-400 bg-amber-500/20 px-1 rounded">"Здравствуйте,</span> вы у нас полгода не были!"
                      </span>
                    )}
                    {subtitleStyle === 'bold_yellow' && (
                      <span className="text-amber-300 uppercase">
                        «ОПЛАТИТЕ НАШ ОТПУСК НА БАЛИ»
                      </span>
                    )}
                    {subtitleStyle === 'headline_only' && (
                      <span className="text-neutral-200">
                        {hookHeadline}
                      </span>
                    )}
                    {subtitleStyle === 'minimal' && (
                      <span className="text-neutral-100 font-medium">
                        (смех и аплодисменты зала 💥)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Central Play/Pause overlay button */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/60 hover:bg-amber-500/90 text-white hover:text-black flex items-center justify-center transition opacity-0 hover:opacity-100 z-30"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
            </div>
          </div>

          {/* Timeline & Trimming Sliders */}
          <div className="w-full mt-4 space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>Текущее: {formatSeconds(currentTime)}</span>
              <span className="text-amber-400 font-bold">
                Отрезок Reels: {formatSeconds(startTime)} — {formatSeconds(endTime)} ({reelDuration} сек)
              </span>
              <span>Всего: {formatSeconds(duration)}</span>
            </div>

            {/* Trimming scrub bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-neutral-400 w-12">Старт:</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, endTime - 1)}
                  step={0.5}
                  value={startTime}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setStartTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-neutral-300 w-12 text-right">{formatSeconds(startTime)}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-neutral-400 w-12">Конец:</span>
                <input
                  type="range"
                  min={startTime + 1}
                  max={duration}
                  step={0.5}
                  value={endTime}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setEndTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono text-neutral-300 w-12 text-right">{formatSeconds(endTime)}</span>
              </div>
            </div>

            {/* Quick playback controls */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg transition"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime = startTime;
                  }}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition"
                  title="К началу отрезка"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                  reelDuration <= 45 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {reelDuration <= 45 ? '⚡ Идеальный хронометраж для Reels' : '⚠️ Длинный клип (>45с)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Generated Reels & Overlays Customizer (approx 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Reels List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Готовые AI Reels ({generatedReels.length})</span>
              </div>
              {generatedReels.length === 0 && (
                <span className="text-[11px] text-neutral-500">Нажмите "Нарезать Reels"</span>
              )}
            </div>

            {generatedReels.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {generatedReels.map(reel => {
                  const isSelected = activeReelId === reel.id;
                  return (
                    <div
                      key={reel.id}
                      onClick={() => applyReel(reel)}
                      className={`p-3 rounded-xl cursor-pointer border transition text-left ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/50'
                          : 'bg-neutral-950/60 border-neutral-800/80 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-neutral-200 truncate">
                          {reel.title}
                        </h4>
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] rounded font-bold">
                          {Math.round(reel.endTime - reel.startTime)}с • {reel.viralScore}% вирусность
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-300 font-semibold line-clamp-1">
                        "{reel.hookHeadline}"
                      </p>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                        Панч: {reel.punchlineQuote}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 bg-neutral-950/50 border border-dashed border-neutral-800 rounded-xl text-center space-y-2">
                <Wand2 className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs text-neutral-400">
                  Нажмите кнопку выше, и искусственный интеллект автоматически проанализирует ваше выступление и создаст вирусные отрезки.
                </p>
                <button
                  onClick={handleGenerateAIReels}
                  className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 text-xs font-semibold rounded-lg transition"
                >
                  Запустить AI нарезку
                </button>
              </div>
            )}
          </div>

          {/* Overlays Customization */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Настройка субтитров и хука
            </h3>

            {/* Hook Headline input */}
            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                Хук-заголовок (верхняя плашка на видео)
              </label>
              <input
                type="text"
                value={hookHeadline}
                onChange={e => setHookHeadline(e.target.value)}
                placeholder="например: САМЫЙ СТРАШНЫЙ ЗВОНОК ПОСЛЕ 28 ЛЕТ 💀"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-100 focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>

            {/* Watermark input */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Водяной знак / Ник
                </label>
                <input
                  type="text"
                  value={watermark}
                  onChange={e => setWatermark(e.target.value)}
                  placeholder="@standup_comic"
                  className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Стиль субтитров
                </label>
                <select
                  value={subtitleStyle}
                  onChange={e => setSubtitleStyle(e.target.value as SubtitleStyle)}
                  className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="karaoke">✨ Караоке (подсветка)</option>
                  <option value="bold_yellow">🟡 Жёлтый капс</option>
                  <option value="headline_only">📌 Только хук</option>
                  <option value="minimal">⚪ Минимализм</option>
                </select>
              </div>
            </div>

            {/* Ready Caption for Instagram / TikTok / Shorts */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-neutral-400">
                  Готовое описание для Reels / TikTok
                </label>
                <button
                  onClick={handleCopyCaption}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCaption ? 'Скопировано!' : 'Копировать'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={captionText}
                onChange={e => setCaptionText(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
              />
            </div>

            {/* Export & Social Sync buttons */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleExportReel}
                disabled={exporting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exporting ? 'Рендеринг Reels клипа...' : 'Экспорт готового Reels (9:16)'}</span>
              </button>

              <button
                onClick={() => setIsSocialSyncOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-sky-600 via-red-600 via-pink-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-98"
                title="Опубликовать в Telegram, YouTube, ВКонтакте и TikTok"
              >
                <Share2 className="w-4 h-4" />
                <span>📱 Синхронизировать с соцсетями (TG • YouTube • VK • TikTok)</span>
              </button>

              {exportSuccess && (
                <div className="mt-2 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
                  <Check className="w-4 h-4" />
                  <span>Клип готов! Параметры и таймкоды сохранены для публикации.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Social Sync Modal */}
      <SocialSyncModal
        isOpen={isSocialSyncOpen}
        onClose={() => setIsSocialSyncOpen(false)}
        mediaItem={{
          type: 'video',
          url: videoSource,
          title: `${videoTitle} (Reels)`,
          aspectRatio,
          durationSec: Math.round(endTime - startTime)
        }}
        jokeContext={{
          title: hookHeadline,
          premise: captionText,
          punchline: ''
        }}
      />
    </div>
  );
};
