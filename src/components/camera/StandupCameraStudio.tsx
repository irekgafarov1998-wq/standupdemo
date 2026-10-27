import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStandup } from '../../context/StandupContext';
import { 
  CameraFilterType, CameraAspectRatio, CapturedMediaItem 
} from '../../types';
import { formatSeconds } from '../../utils/formatters';
import { soundEffects } from '../../utils/soundEffects';
import { 
  Camera, Video, Disc, StopCircle, Play, Pause, RefreshCw, 
  Download, Sparkles, Scissors, Eye, EyeOff, Settings, Volume2, 
  VolumeX, Check, Trash2, Smartphone, Square, Monitor, Clock, 
  FlipHorizontal, Layers, ChevronRight, FileText, ArrowUpRight, Share2 
} from 'lucide-react';
import { SocialSyncModal } from '../social/SocialSyncModal';
import { StandupSectionBanner } from '../common/StandupSectionBanner';

interface FilterOption {
  id: CameraFilterType;
  label: string;
  emoji: string;
  desc: string;
  cssFilter: string;
  overlayClass?: string;
}

const CAMERA_FILTERS: FilterOption[] = [
  {
    id: 'spotlight',
    label: 'Софит Стендапа',
    emoji: '🎭',
    desc: 'Театральный луч, глубокие тени и виньетка',
    cssFilter: 'contrast(1.22) brightness(1.08) saturate(1.15)',
    overlayClass: 'bg-radial from-amber-400/10 via-transparent to-black/70'
  },
  {
    id: 'noir',
    label: 'Нуар Комедии',
    emoji: '🎬',
    desc: 'Глубокий черно-белый контраст как на спешлах',
    cssFilter: 'grayscale(100%) contrast(1.4) brightness(0.95)',
    overlayClass: 'bg-gradient-to-t from-black/40 via-transparent to-black/30'
  },
  {
    id: 'vhs',
    label: 'Ретро VHS 90-х',
    emoji: '📼',
    desc: 'Эпоха золотого стендапа: сканлайны и дата',
    cssFilter: 'sepia(0.25) contrast(1.2) saturate(1.4) hue-rotate(-10deg)',
    overlayClass: 'bg-indigo-900/15'
  },
  {
    id: 'velvet',
    label: 'Тёплый Бархат',
    emoji: '🍷',
    desc: 'Красный бархат, теплота ламп накаливания',
    cssFilter: 'sepia(0.35) saturate(1.6) contrast(1.12) brightness(1.02)',
    overlayClass: 'bg-rose-950/20'
  },
  {
    id: 'neon',
    label: 'Кибер Неон',
    emoji: '⚡',
    desc: 'Яркие фиолетово-бирюзовые тона для соцсетей',
    cssFilter: 'saturate(1.9) hue-rotate(185deg) contrast(1.25)',
    overlayClass: 'bg-gradient-to-tr from-fuchsia-900/20 to-cyan-900/20'
  },
  {
    id: 'golden_hour',
    label: 'Golden Hour',
    emoji: '🌅',
    desc: 'Мягкое золотое свечение и выравнивание тона',
    cssFilter: 'sepia(0.2) brightness(1.12) saturate(1.25) contrast(1.05)',
    overlayClass: 'bg-amber-500/10'
  },
  {
    id: 'cinematic',
    label: 'Кино 35mm',
    emoji: '🎞️',
    desc: 'Кинематографичный оттенок с мягким фокусом',
    cssFilter: 'contrast(1.18) saturate(0.92) brightness(0.98)',
    overlayClass: 'bg-teal-950/15'
  },
  {
    id: 'normal',
    label: 'Без фильтра',
    emoji: '⚪',
    desc: 'Естественный вид вашей веб-камеры',
    cssFilter: 'none'
  }
];

export const StandupCameraStudio: React.FC = () => {
  const { jokes, setlists, loadVideoIntoEditor, celebrate } = useStandup();

  // Helper to resolve title for setlist items
  const getSetlistItemTitle = (item?: { jokeId?: string; customTitle?: string }) => {
    if (!item) return '';
    if (item.customTitle) return item.customTitle;
    if (item.jokeId) {
      const found = jokes.find(j => j.id === item.jokeId);
      if (found) return found.title;
    }
    return 'Блок выступления';
  };

  const getSetlistItemText = (item?: { jokeId?: string; customText?: string; notes?: string }) => {
    if (!item) return '';
    if (item.customText) return item.customText;
    if (item.jokeId) {
      const found = jokes.find(j => j.id === item.jokeId);
      if (found) return found.punchline ? `${found.premise} — ${found.punchline}` : found.premise;
    }
    return item.notes || '';
  };

  // Media stream & elements
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Camera Settings
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<CameraFilterType>('spotlight');
  const [aspectRatio, setAspectRatio] = useState<CameraAspectRatio>('9:16');
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // Recording & Photo State
  const [mode, setMode] = useState<'video' | 'photo'>('video');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoFlash, setPhotoFlash] = useState<boolean>(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(true);

  // Prompter overlay
  const [showPrompter, setShowPrompter] = useState<boolean>(true);
  const [selectedSetlistId, setSelectedSetlistId] = useState<string>(setlists[0]?.id || '');
  const [prompterIndex, setPrompterIndex] = useState<number>(0);

  // Gallery of captured items
  const [gallery, setGallery] = useState<CapturedMediaItem[]>([]);
  const [previewMedia, setPreviewMedia] = useState<CapturedMediaItem | null>(null);

  // Social Media Sync states (TG, TikTok, VK)
  const [isSocialSyncOpen, setIsSocialSyncOpen] = useState<boolean>(false);
  const [syncTargetMedia, setSyncTargetMedia] = useState<CapturedMediaItem | null>(null);

  const timerIntervalRef = useRef<number | null>(null);

  const currentFilterConfig = CAMERA_FILTERS.find(f => f.id === activeFilter) || CAMERA_FILTERS[0];
  const activeSetlist = setlists.find(s => s.id === selectedSetlistId) || setlists[0];

  // Start Camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);

      // Setup audio level meter
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!mediaStreamRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch {
        // audio meter optional
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError('Доступ к камере заблокирован. Разрешите доступ к веб-камере в настройках браузера.');
      } else {
        setCameraError('Не удалось запустить камеру. Убедитесь, что камера подключена и не занята другим приложением.');
      }
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Handle Photo Capture with Flash & Watermark
  const takePhoto = () => {
    if (!videoRef.current) return;

    soundEffects.playStageClick();
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle mirror flip
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    // Apply active CSS filter to canvas
    if (currentFilterConfig.cssFilter && currentFilterConfig.cssFilter !== 'none') {
      ctx.filter = currentFilterConfig.cssFilter;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    // Reset transform for overlay watermark
    if (isMirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Apply standup stage watermark if enabled
    if (watermarkEnabled) {
      const now = new Date();
      const dateStr = now.toLocaleDateString('ru-RU') + ' ' + now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      
      // Bottom banner gradient
      const grad = ctx.createLinearGradient(0, canvas.height - 80, 0, canvas.height);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

      // Watermark text
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('🎤 StandupLab Studio', 30, canvas.height - 35);

      ctx.fillStyle = '#e5e7eb';
      ctx.font = '16px monospace';
      ctx.fillText(`[${currentFilterConfig.label}] • ${dateStr}`, 30, canvas.height - 15);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const newItem: CapturedMediaItem = {
          id: 'photo-' + Date.now(),
          type: 'photo',
          url,
          blob,
          createdAt: new Date().toISOString(),
          filter: activeFilter,
          aspectRatio,
          title: `Фото со стендап-камеры (${currentFilterConfig.label})`
        };
        setGallery(prev => [newItem, ...prev]);
        setPreviewMedia(newItem);
        celebrate();
      }
    }, 'image/jpeg', 0.95);
  };

  // Start Photo with optional 3-second countdown
  const handleTriggerPhoto = () => {
    let count = 3;
    setCountdown(count);
    soundEffects.playStageClick();
    const int = window.setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        soundEffects.playStageClick();
      } else {
        clearInterval(int);
        setCountdown(null);
        takePhoto();
      }
    }, 1000);
  };

  // Start Video Recording
  const startRecording = () => {
    if (!mediaStreamRef.current) return;

    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
          ? 'video/webm'
          : 'video/mp4';

      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(fullBlob);
        const newItem: CapturedMediaItem = {
          id: 'video-' + Date.now(),
          type: 'video',
          url: videoUrl,
          blob: fullBlob,
          createdAt: new Date().toISOString(),
          durationSec: recordingSeconds,
          filter: activeFilter,
          aspectRatio,
          title: `Стендап-дубль (${formatSeconds(recordingSeconds)})`
        };
        setGallery(prev => [newItem, ...prev]);
        setPreviewMedia(newItem);
        celebrate();
      };

      recorder.start(500); // 500ms chunks
      setIsRecording(true);
      setRecordingSeconds(0);
      soundEffects.playRimshot();

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('Failed to start MediaRecorder:', e);
      alert('Ошибка запуска записи видео в вашем браузере');
    }
  };

  // Stop Video Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      soundEffects.playApplause();
    }
  };

  const handleDownload = (item: CapturedMediaItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = item.type === 'photo' 
      ? `standuplab-photo-${Date.now()}.jpg` 
      : `standuplab-take-${Date.now()}.webm`;
    a.click();
  };

  const handleSendToReelsEditor = (item: CapturedMediaItem) => {
    if (item.type !== 'video') return;
    loadVideoIntoEditor(item.url, item.title);
    soundEffects.playRimshot();
  };

  const handleDeleteMedia = (id: string) => {
    setGallery(prev => prev.filter(item => item.id !== id));
    if (previewMedia?.id === id) {
      setPreviewMedia(null);
    }
  };

  // Aspect ratio wrapper styles
  const getAspectRatioClasses = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[360px] sm:max-w-[400px]';
      case '1:1':
        return 'aspect-square max-w-[480px]';
      case '16:9':
        return 'aspect-video w-full max-w-4xl';
      default:
        return 'aspect-[9/16] max-w-[380px]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Standup Production TV Studio & Tally Light Banner */}
      <StandupSectionBanner
        tab="camera"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Tabs */}
            <div className="bg-black/80 p-1 rounded-2xl border border-red-950/80 flex items-center gap-1">
              <button
                onClick={() => setMode('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  mode === 'video'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Видео (Reels)</span>
              </button>
              <button
                onClick={() => setMode('photo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  mode === 'photo'
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Фото (Афиши)</span>
              </button>
            </div>

            {/* Aspect Ratio selector */}
            <div className="bg-black/80 p-1 rounded-2xl border border-red-950/80 flex items-center gap-1">
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  aspectRatio === '9:16' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-white'
                }`}
                title="Вертикальный 9:16 (Reels, Shorts, TikTok)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>9:16</span>
              </button>
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  aspectRatio === '16:9' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-neutral-400 hover:text-white'
                }`}
                title="Горизонтальный 16:9 (YouTube, ТВ)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>16:9</span>
              </button>
            </div>

            {/* Social Sync Button */}
            <button
              onClick={() => {
                setSyncTargetMedia(null);
                setIsSocialSyncOpen(true);
                soundEffects.playStageClick();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-white transition active:scale-95"
              title="Синхронизация с Telegram, YouTube, TikTok и ВКонтакте"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">📱 Соцсети</span>
            </button>
          </div>
        }
      />

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left/Center: Camera Viewport with Overlays */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className={`relative w-full rounded-3xl overflow-hidden shadow-2xl border border-rose-950/60 bg-black flex items-center justify-center ${getAspectRatioClasses()}`}>
            
            {/* Live WebCam Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transition-all duration-300"
              style={{
                transform: isMirrored ? 'scaleX(-1)' : 'none',
                filter: currentFilterConfig.cssFilter
              }}
            />

            {/* Filter Color Tone Atmosphere Overlay */}
            {currentFilterConfig.overlayClass && (
              <div className={`pointer-events-none absolute inset-0 ${currentFilterConfig.overlayClass} transition-opacity duration-300`} />
            )}

            {/* Retro VHS Scanlines Overlay if VHS filter is active */}
            {activeFilter === 'vhs' && (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-70" />
            )}

            {/* Flash Effect on photo snapshot */}
            {photoFlash && (
              <div className="pointer-events-none absolute inset-0 bg-white opacity-95 transition-opacity duration-150 z-30" />
            )}

            {/* Countdown Overlay (3, 2, 1) */}
            {countdown !== null && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-sm">
                <span className="text-8xl font-black text-amber-400 animate-ping drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
                  {countdown}
                </span>
              </div>
            )}

            {/* Top HUD: Recording Status & Active Filter Badge */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
              {/* Recording indicator */}
              {isRecording ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 text-white font-mono text-xs font-black shadow-lg animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  <span>REC {formatSeconds(recordingSeconds)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-bold text-neutral-300">
                  <span>{currentFilterConfig.emoji}</span>
                  <span>{currentFilterConfig.label}</span>
                </div>
              )}

              {/* Audio Mic VU Meter */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-neutral-300">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <div className="w-12 h-2 bg-neutral-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Comedian Teleprompter / Cheat Sheet Overlay */}
            {showPrompter && activeSetlist && activeSetlist.items.length > 0 && (
              <div className="absolute bottom-20 left-4 right-4 z-20 pointer-events-auto">
                <div className="p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/40 text-neutral-100 shadow-2xl">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Суфлер • {activeSetlist.title} ({prompterIndex + 1}/{activeSetlist.items.length})</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPrompterIndex(prev => Math.max(0, prev - 1))}
                        disabled={prompterIndex === 0}
                        className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30"
                      >
                        Пред
                      </button>
                      <button
                        onClick={() => setPrompterIndex(prev => Math.min(activeSetlist.items.length - 1, prev + 1))}
                        disabled={prompterIndex === activeSetlist.items.length - 1}
                        className="px-2 py-0.5 text-[10px] rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30"
                      >
                        След
                      </button>
                    </div>
                  </div>
                  
                  {/* Current Joke Cue */}
                  <div className="text-xs font-bold text-white leading-tight">
                    {getSetlistItemTitle(activeSetlist.items[prompterIndex])}
                  </div>
                  {getSetlistItemText(activeSetlist.items[prompterIndex]) && (
                    <div className="text-[11px] text-amber-300/90 mt-1 line-clamp-2">
                      💡 {getSetlistItemText(activeSetlist.items[prompterIndex])}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Controls Bar on Camera */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
              {/* Left tools: Prompter toggle & Mirror */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowPrompter(!showPrompter)}
                  className={`p-2 rounded-xl backdrop-blur-md border transition ${
                    showPrompter 
                      ? 'bg-amber-500 text-neutral-950 border-amber-400' 
                      : 'bg-black/60 text-white border-white/10 hover:bg-neutral-800'
                  }`}
                  title={showPrompter ? 'Скрыть суфлер' : 'Показать тезисы шуток поверх камеры'}
                >
                  <FileText className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsMirrored(!isMirrored)}
                  className={`p-2 rounded-xl backdrop-blur-md border transition ${
                    isMirrored 
                      ? 'bg-black/70 text-amber-300 border-amber-500/40' 
                      : 'bg-black/60 text-neutral-400 border-white/10'
                  }`}
                  title="Отразить зеркально"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Main Trigger Button: Photo or Video Record */}
              <div>
                {mode === 'photo' ? (
                  <button
                    onClick={handleTriggerPhoto}
                    disabled={!isCameraActive || countdown !== null}
                    className="w-16 h-16 rounded-full bg-white hover:bg-amber-300 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.7)] transition active:scale-95 disabled:opacity-50"
                    title="Сделать фото (с таймером 3 сек)"
                  >
                    <div className="w-13 h-13 rounded-full border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-neutral-900" />
                    </div>
                  </button>
                ) : (
                  <div>
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        disabled={!isCameraActive}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 p-1 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.8)] transition active:scale-95 disabled:opacity-50"
                        title="Начать запись стендап-дубля"
                      >
                        <div className="w-13 h-13 rounded-full border-2 border-white bg-red-600 flex items-center justify-center">
                          <Disc className="w-6 h-6 text-white animate-spin" style={{ animationDuration: '4s' }} />
                        </div>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="w-16 h-16 rounded-full bg-red-600 p-1 flex items-center justify-center shadow-[0_0_35px_rgba(239,68,68,1)] animate-pulse active:scale-95"
                        title="Остановить запись дубля"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                          <StopCircle className="w-6 h-6 text-red-600" />
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Right tools: Watermark & Switch Camera */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                  className={`px-2.5 py-1.5 rounded-xl backdrop-blur-md border text-[10px] font-bold transition ${
                    watermarkEnabled 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-black/60 text-neutral-400 border-white/10'
                  }`}
                  title="Водяной знак StandupLab на фото"
                >
                  Штамп
                </button>

                <button
                  onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                  className="p-2 rounded-xl bg-black/60 hover:bg-neutral-800 text-white border border-white/10 backdrop-blur-md transition"
                  title="Переключить камеру (селфи / задняя)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Message if Camera Blocked */}
            {cameraError && (
              <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center z-30">
                <Camera className="w-12 h-12 text-rose-500 mb-3 animate-bounce" />
                <h3 className="text-base font-bold text-white mb-2">Камера не подключена</h3>
                <p className="text-xs text-neutral-400 max-w-sm mb-4 leading-relaxed">
                  {cameraError}
                </p>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition"
                >
                  Попробовать снова
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Popular Filters & Teleprompter Selector */}
        <div className="space-y-4">
          {/* Popular Filters Carousel/List */}
          <div className="theater-panel rounded-3xl p-4 border border-rose-950/60">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-black tracking-wider text-white uppercase">
                Популярные фильтры сцены
              </h2>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {CAMERA_FILTERS.map((f) => {
                const isSelected = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilter(f.id);
                      soundEffects.playStageClick();
                    }}
                    className={`w-full text-left p-2.5 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                        : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-300 hover:border-rose-900/40 hover:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{f.emoji}</span>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{f.label}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-amber-400" />
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-400 line-clamp-1">
                          {f.desc}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Setlist Selector for Prompter */}
          {setlists.length > 0 && (
            <div className="theater-panel rounded-3xl p-4 border border-rose-950/60 text-xs">
              <label htmlFor="setlist-select" className="text-neutral-400 font-bold mb-2 flex items-center justify-between">
                <span>Сет-лист для суфлера:</span>
                <span className="text-amber-400">{setlists.length} доступно</span>
              </label>
              <select
                id="setlist-select"
                value={selectedSetlistId}
                onChange={(e) => {
                  setSelectedSetlistId(e.target.value);
                  setPrompterIndex(0);
                }}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-medium focus:border-amber-500 outline-none"
              >
                {setlists.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.items.length} шуток)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Gallery of Captured Takes & Photos */}
      <div className="theater-panel rounded-3xl p-6 border border-rose-950/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">
              Галерея дублей и снимков ({gallery.length})
            </h3>
          </div>
          {gallery.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Очистить всю галерею дублей?')) {
                  setGallery([]);
                }
              }}
              className="text-xs text-neutral-400 hover:text-rose-400 transition"
            >
              Очистить историю
            </button>
          )}
        </div>

        {gallery.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            📸 Здесь появятся ваши записанные дубли и фото для стендап-афиш
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {gallery.map(item => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 transition cursor-pointer shadow-md"
                onClick={() => setPreviewMedia(item)}
              >
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full aspect-[9/16] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full aspect-[9/16] bg-neutral-950 flex flex-col items-center justify-center p-2 relative">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-8 h-8 text-amber-400 fill-current opacity-90 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                )}

                {/* Badge top-left */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white backdrop-blur-sm">
                  {item.type === 'photo' ? '📷 Фото' : `🎬 ${formatSeconds(item.durationSec || 0)}`}
                </div>

                {/* Action buttons on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-1.5">
                  {item.type === 'video' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendToReelsEditor(item);
                      }}
                      className="w-full py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition"
                      title="Открыть в AI Reels Редакторе"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>В AI Reels</span>
                    </button>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSyncTargetMedia(item);
                        setIsSocialSyncOpen(true);
                        soundEffects.playStageClick();
                      }}
                      className="flex-1 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition"
                      title="Опубликовать в Telegram, TikTok, VK"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>В соцсети</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                      className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition"
                      title="Скачать файл"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal for Captured Item */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="theater-panel rounded-3xl max-w-xl w-full p-6 text-neutral-100 shadow-2xl border border-rose-900/60">
            <div className="flex items-center justify-between pb-3 border-b border-rose-950/60 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-white">{previewMedia.title}</h3>
                <p className="text-xs text-neutral-400">
                  {new Date(previewMedia.createdAt).toLocaleString('ru-RU')} • Фильтр: {previewMedia.filter}
                </p>
              </div>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Media Player / Image */}
            <div className="rounded-2xl overflow-hidden bg-black max-h-[460px] flex items-center justify-center mb-5">
              {previewMedia.type === 'photo' ? (
                <img
                  src={previewMedia.url}
                  alt="Снимок"
                  className="max-h-[460px] w-auto object-contain"
                />
              ) : (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[460px] w-full"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-rose-950/60">
              <button
                onClick={() => handleDeleteMedia(previewMedia.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Удалить дубль</span>
              </button>

              <div className="flex items-center gap-2">
                {previewMedia.type === 'video' && (
                  <button
                    onClick={() => {
                      handleSendToReelsEditor(previewMedia);
                      setPreviewMedia(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition"
                  >
                    <Scissors className="w-4 h-4" />
                    <span>Сделать Reels из этого видео</span>
                  </button>
                )}

                {/* Social Sync Button */}
                <button
                  onClick={() => {
                    setSyncTargetMedia(previewMedia);
                    setIsSocialSyncOpen(true);
                    soundEffects.playStageClick();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 via-red-500 via-pink-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg transition active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>🚀 В соцсети (TG • YT • VK • TT)</span>
                </button>

                <button
                  onClick={() => handleDownload(previewMedia)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать файл</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Sync Modal (Telegram, TikTok, VK) */}
      <SocialSyncModal
        isOpen={isSocialSyncOpen}
        onClose={() => setIsSocialSyncOpen(false)}
        mediaItem={syncTargetMedia ? {
          type: syncTargetMedia.type,
          url: syncTargetMedia.url,
          blob: syncTargetMedia.blob,
          title: syncTargetMedia.title,
          aspectRatio: syncTargetMedia.aspectRatio,
          filter: syncTargetMedia.filter,
          durationSec: syncTargetMedia.durationSec
        } : (previewMedia ? {
          type: previewMedia.type,
          url: previewMedia.url,
          blob: previewMedia.blob,
          title: previewMedia.title,
          aspectRatio: previewMedia.aspectRatio,
          filter: previewMedia.filter,
          durationSec: previewMedia.durationSec
        } : undefined)}
        jokeContext={activeSetlist && activeSetlist.items[prompterIndex] ? {
          title: getSetlistItemTitle(activeSetlist.items[prompterIndex]),
          premise: getSetlistItemText(activeSetlist.items[prompterIndex]),
          punchline: ''
        } : undefined}
      />
    </div>
  );
};
