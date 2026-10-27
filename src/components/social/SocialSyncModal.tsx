import React, { useState, useEffect } from 'react';
import { 
  SocialSyncService, SocialAccountsConfig, SyncHistoryItem 
} from '../../services/socialSync';
import { soundEffects } from '../../utils/soundEffects';
import { 
  Send, Share2, Copy, Check, Download, ExternalLink, Settings, 
  History, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Smartphone, 
  Film, Image as ImageIcon, Flame, Hash, ShieldCheck
} from 'lucide-react';

interface SocialSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItem?: {
    type: 'photo' | 'video';
    url: string;
    blob?: Blob;
    title: string;
    aspectRatio?: string;
    filter?: string;
    durationSec?: number;
  };
  jokeContext?: {
    title: string;
    premise?: string;
    punchline?: string;
  };
}

// Brand SVG Icons for Telegram, TikTok, and VKontakte
export const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.77 1.52V6.82a4.85 4.85 0 0 1-1-.13z" />
  </svg>
);

export const VKIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.07 2H8.93C4.19 2 2 4.19 2 8.93v6.14C2 19.81 4.19 22 8.93 22h6.14c4.74 0 6.93-2.19 6.93-6.93V8.93C22 4.19 19.81 2 15.07 2zm3.38 13.97h-1.63c-.62 0-.81-.49-1.92-1.6-.97-.94-1.4-1.06-1.64-1.06-.34 0-.44.1-.44.57v1.44c0 .39-.12.65-1.17.65-1.74 0-3.66-1.06-5.02-3.03-2.05-2.88-2.61-5.06-2.61-5.5 0-.25.1-.48.57-.48h1.63c.42 0 .58.19.74.63.81 2.36 2.17 4.43 2.73 4.43.21 0 .31-.1.31-.63V9.69c-.06-1.12-.66-1.22-.66-1.62 0-.2.16-.39.42-.39h2.56c.35 0 .48.19.48.6v3.28c0 .35.15.48.26.48.21 0 .39-.13.78-.52 1.22-1.37 2.08-3.48 2.08-3.48.11-.25.32-.42.74-.42h1.63c.49 0 .6.25.49.6-.2 1-2.28 3.91-2.38 4.07-.21.33-.29.48 0 .86.21.28.91.89 1.38 1.44.86 1.01 1.53 1.86 1.7 2.45.18.59-.1.88-.69.88z" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const SocialSyncModal: React.FC<SocialSyncModalProps> = ({
  isOpen,
  onClose,
  mediaItem,
  jokeContext
}) => {
  const [activeTab, setActiveTab] = useState<'telegram' | 'youtube' | 'tiktok' | 'vk' | 'multi' | 'settings' | 'history'>('telegram');
  const [config, setConfig] = useState<SocialAccountsConfig>(() => SocialSyncService.getConfig());
  const [history, setHistory] = useState<SyncHistoryItem[]>(() => SocialSyncService.getHistory());

  // Editable captions
  const [tgCaption, setTgCaption] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [ytCaption, setYtCaption] = useState('');
  const [vkCaption, setVkCaption] = useState('');
  const [tiktokCaption, setTiktokCaption] = useState('');

  // YouTube options
  const [ytIsShorts, setYtIsShorts] = useState(true);

  // Multi-sharing checklist
  const [multiNetworks, setMultiNetworks] = useState<{ telegram: boolean; youtube: boolean; vk: boolean; tiktok: boolean }>({
    telegram: true,
    youtube: true,
    vk: true,
    tiktok: true
  });

  // Status flags
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPostingApi, setIsPostingApi] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load captions when modal opens or joke context changes
  useEffect(() => {
    if (isOpen) {
      const title = mediaItem?.title || jokeContext?.title || 'Свежий стендап-бит';
      const premise = jokeContext?.premise;
      const punchline = jokeContext?.punchline;

      setTgCaption(SocialSyncService.formatCaption('telegram', title, premise, punchline));
      setYtTitle(`${title.toUpperCase()} 🔥 Стендап`);
      setYtCaption(SocialSyncService.formatCaption('youtube', title, premise, punchline));
      setVkCaption(SocialSyncService.formatCaption('vk', title, premise, punchline));
      setTiktokCaption(SocialSyncService.formatCaption('tiktok', title, premise, punchline));
      setConfig(SocialSyncService.getConfig());
      setHistory(SocialSyncService.getHistory());
      setApiFeedback(null);
    }
  }, [isOpen, mediaItem, jokeContext]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    soundEffects.playStageClick();
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveConfig = () => {
    SocialSyncService.saveConfig(config);
    soundEffects.playStageClick();
    setApiFeedback({ type: 'success', message: 'Настройки аккаунтов сохранены в памяти StandupLab!' });
  };

  // Telegram Post
  const handlePostTelegram = async () => {
    setIsPostingApi(true);
    setApiFeedback(null);
    try {
      const res = await SocialSyncService.postToTelegramBot(
        tgCaption, 
        mediaItem?.blob, 
        mediaItem?.type
      );
      if (res.success) {
        soundEffects.playApplause();
        setApiFeedback({ type: 'success', message: res.message });
      } else {
        setApiFeedback({ type: 'error', message: res.message });
      }
      setHistory(SocialSyncService.getHistory());
    } finally {
      setIsPostingApi(false);
    }
  };

  // YouTube Post
  const handlePostYouTube = (isShorts: boolean = true) => {
    // 1. Download file so comedian can upload to YouTube Studio
    if (mediaItem) {
      const a = document.createElement('a');
      a.href = mediaItem.url;
      a.download = `standuplab-youtube-${isShorts ? 'shorts' : 'video'}-${Date.now()}.${mediaItem.type === 'photo' ? 'jpg' : 'webm'}`;
      a.click();
    }
    // 2. Copy combined metadata (Title + Description) to clipboard
    const fullText = `${ytTitle}\n\n${ytCaption}`;
    navigator.clipboard.writeText(fullText);
    soundEffects.playApplause();

    // 3. Open YouTube Studio
    SocialSyncService.shareToYouTube(ytTitle, ytCaption, mediaItem?.url, isShorts);
    setHistory(SocialSyncService.getHistory());
    setApiFeedback({
      type: 'success',
      message: 'Файл скачан, название и описание скопированы в буфер обмена. Открыта студия YouTube!'
    });
  };

  // VK Post
  const handlePostVK = (isClip: boolean = false) => {
    SocialSyncService.shareToVK(
      mediaItem?.title || 'Стендап-выступление',
      vkCaption,
      mediaItem?.url,
      isClip
    );
    soundEffects.playStageClick();
    setHistory(SocialSyncService.getHistory());
  };

  // TikTok Post
  const handlePostTikTok = () => {
    // Also trigger file download so user has clip ready for TikTok
    if (mediaItem) {
      const a = document.createElement('a');
      a.href = mediaItem.url;
      a.download = `standuplab-tiktok-${Date.now()}.${mediaItem.type === 'photo' ? 'jpg' : 'webm'}`;
      a.click();
    }
    navigator.clipboard.writeText(tiktokCaption);
    SocialSyncService.shareToTikTok(mediaItem?.blob, tiktokCaption);
    soundEffects.playRimshot();
    setHistory(SocialSyncService.getHistory());
  };

  // Multi-posting to selected platforms (Telegram, YouTube, TikTok, VK)
  const handleMultiPost = () => {
    soundEffects.playApplause();
    // 1. Download file
    if (mediaItem) {
      const a = document.createElement('a');
      a.href = mediaItem.url;
      a.download = `standup-multipost-${Date.now()}.${mediaItem.type === 'photo' ? 'jpg' : 'webm'}`;
      a.click();
    }

    const selectedList: string[] = [];

    // 2. Open TG Share if enabled
    if (multiNetworks.telegram) {
      SocialSyncService.shareToTelegram(tgCaption, mediaItem?.url);
      selectedList.push('Telegram');
    }

    // 3. Open YouTube if enabled
    if (multiNetworks.youtube) {
      setTimeout(() => {
        SocialSyncService.shareToYouTube(ytTitle, ytCaption, mediaItem?.url, true);
      }, 300);
      selectedList.push('YouTube');
    }

    // 4. Open VK Share after short delay if enabled
    if (multiNetworks.vk) {
      setTimeout(() => {
        SocialSyncService.shareToVK(mediaItem?.title || 'Стендап-бит', vkCaption, mediaItem?.url, false);
      }, 600);
      selectedList.push('ВКонтакте');
    }

    // 5. Open TikTok if enabled
    if (multiNetworks.tiktok) {
      setTimeout(() => {
        SocialSyncService.shareToTikTok(mediaItem?.blob, tiktokCaption);
      }, 900);
      selectedList.push('TikTok');
    }

    SocialSyncService.addHistoryItem({
      network: 'all',
      mediaType: mediaItem?.type || 'text',
      title: `Мультипостинг (${selectedList.join(' + ')})`,
      status: 'published',
      details: `Материалы отправлены в: ${selectedList.join(', ')}`
    });
    setHistory(SocialSyncService.getHistory());
    setApiFeedback({ 
      type: 'success', 
      message: `Мультипостинг запущен: медиа скачано, открыты окна публикации (${selectedList.join(', ')})!` 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="theater-panel rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col text-neutral-100 shadow-2xl border border-rose-900/60 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-950/60 flex items-center justify-between bg-gradient-to-r from-rose-950/40 via-neutral-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white tracking-tight">
                  Синхронизация с соцсетями
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  TG • YOUTUBE • TIKTOK • VK
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Публикация стендап-рилсов, афиш и шуток в Telegram, YouTube, TikTok и ВКонтакте
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Media Preview Banner if media provided */}
        {mediaItem && (
          <div className="bg-neutral-950/90 px-4 py-2 border-b border-rose-950/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-neutral-300 truncate">
              {mediaItem.type === 'video' ? <Film className="w-4 h-4 text-rose-400 shrink-0" /> : <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />}
              <span className="font-semibold truncate">{mediaItem.title}</span>
              {mediaItem.durationSec !== undefined && mediaItem.durationSec > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                  {mediaItem.durationSec}s
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400 shrink-0">
              <span>{mediaItem.aspectRatio || '9:16'}</span>
              <span>•</span>
              <span className="text-amber-400">{mediaItem.filter || 'Софит'}</span>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-rose-950/60 bg-black/40 px-2 sm:px-4 overflow-x-auto gap-1 py-1.5">
          <button
            onClick={() => { setActiveTab('telegram'); soundEffects.playStageClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'telegram'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <TelegramIcon className="w-4 h-4" />
            <span>Telegram</span>
          </button>

          <button
            onClick={() => { setActiveTab('youtube'); soundEffects.playStageClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'youtube'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <YouTubeIcon className="w-4 h-4 text-red-500" />
            <span>YouTube Shorts</span>
          </button>

          <button
            onClick={() => { setActiveTab('tiktok'); soundEffects.playStageClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'tiktok'
                ? 'bg-neutral-900 text-pink-400 border border-pink-500/50 shadow-md shadow-pink-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <TikTokIcon className="w-4 h-4 text-pink-400" />
            <span>TikTok</span>
          </button>

          <button
            onClick={() => { setActiveTab('vk'); soundEffects.playStageClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'vk'
                ? 'bg-[#2787F5] text-white shadow-md shadow-blue-500/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <VKIcon className="w-4 h-4" />
            <span>ВКонтакте</span>
          </button>

          <button
            onClick={() => { setActiveTab('multi'); soundEffects.playStageClick(); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'multi'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 shadow-md'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Мультипостинг</span>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => { setActiveTab('settings'); soundEffects.playStageClick(); }}
              className={`p-2 rounded-xl text-xs transition ${
                activeTab === 'settings'
                  ? 'bg-neutral-800 text-amber-300'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              title="Настройки аккаунтов"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setActiveTab('history'); soundEffects.playStageClick(); }}
              className={`p-2 rounded-xl text-xs transition ${
                activeTab === 'history'
                  ? 'bg-neutral-800 text-amber-300'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
              title="История публикаций"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {apiFeedback && (
          <div className={`mx-4 mt-3 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
            apiFeedback.type === 'success' 
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' 
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
          }`}>
            {apiFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{apiFeedback.message}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TAB 1: TELEGRAM */}
          {activeTab === 'telegram' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TelegramIcon className="w-5 h-5 text-sky-400" />
                  <span className="font-bold text-sm text-white">Канал & Чат Telegram</span>
                </div>
                <span className="text-xs text-sky-300 font-mono bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/40">
                  {config.telegram.channelUsername || '@standup_channel'}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-neutral-400 font-semibold">
                    Текст поста (с поддержкой спойлера для панчлайна):
                  </label>
                  <button
                    onClick={() => handleCopy(tgCaption, 'tg')}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'tg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'tg' ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={tgCaption}
                  onChange={e => setTgCaption(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => SocialSyncService.shareToTelegram(tgCaption, mediaItem?.url)}
                  className="py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-sky-600/20 active:scale-98"
                >
                  <TelegramIcon className="w-4 h-4" />
                  <span>Открыть в Telegram Share</span>
                </button>

                <button
                  onClick={handlePostTelegram}
                  disabled={isPostingApi}
                  className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-sky-500/40 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
                  title="Отправить напрямую в канал через Telegram Bot API"
                >
                  {isPostingApi ? <RefreshCw className="w-4 h-4 animate-spin text-sky-400" /> : <Send className="w-4 h-4 text-sky-400" />}
                  <span>Прямая отправка в бот/канал</span>
                </button>
              </div>

              {/* Bot API notice */}
              <div className="p-3 bg-sky-950/20 border border-sky-900/30 rounded-2xl text-[11px] text-neutral-400 leading-relaxed">
                💡 <b className="text-sky-300">Прямой постинг:</b> В разделе ⚙️ «Настройки» можно указать токен вашего Telegram-бота, чтобы публиковать рилсы и фото прямо в ваш стендап-канал в один клик.
              </div>
            </div>
          )}

          {/* TAB: YOUTUBE */}
          {activeTab === 'youtube' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-600 flex items-center justify-center text-white">
                    <YouTubeIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white">YouTube Shorts & Видео</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">
                      {config.youtube.channelName || 'YouTube Channel'}
                    </span>
                  </div>
                </div>

                {/* Shorts vs Video toggle */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 text-xs">
                  <button
                    onClick={() => setYtIsShorts(true)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                      ytIsShorts ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Shorts (9:16)
                  </button>
                  <button
                    onClick={() => setYtIsShorts(false)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition text-[11px] ${
                      !ytIsShorts ? 'bg-red-600 text-white shadow' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Видео (16:9)
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-neutral-400 font-semibold">
                    Заголовок ролика для YouTube ({ytTitle.length}/100 символов):
                  </label>
                  <button
                    onClick={() => handleCopy(ytTitle, 'yt_title')}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'yt_title' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'yt_title' ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  value={ytTitle}
                  onChange={e => setYtTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 font-semibold focus:outline-none focus:border-red-500"
                  placeholder="Цепляющий заголовок для Shorts..."
                />
              </div>

              {/* Description & Tags */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-neutral-400 font-semibold">
                    Описание ролика, таймкоды и хэштеги (#Shorts):
                  </label>
                  <button
                    onClick={() => handleCopy(ytCaption, 'yt_caption')}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'yt_caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'yt_caption' ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={ytCaption}
                  onChange={e => setYtCaption(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-red-500 leading-relaxed font-sans"
                />
              </div>

              {/* Quick Tags Suggestions */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-red-400" />
                  <span>Рекомендуемые теги для YouTube:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['#Shorts', '#стендап', '#юмор', '#комедия', '#прикол', '#шутки', '#стендапклуб', '#standup'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!ytCaption.includes(tag)) {
                          setYtCaption(prev => `${prev} ${tag}`);
                          soundEffects.playStageClick();
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 transition"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handlePostYouTube(ytIsShorts)}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/20 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать & В YouTube Studio</span>
                </button>

                <button
                  onClick={() => {
                    handleCopy(`${ytTitle}\n\n${ytCaption}`, 'yt_all');
                    SocialSyncService.shareToYouTube(ytTitle, ytCaption, mediaItem?.url, ytIsShorts);
                  }}
                  className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <ExternalLink className="w-4 h-4 text-red-400" />
                  <span>Перейти в YouTube Creator</span>
                </button>
              </div>

              {/* Shorts notice */}
              <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-2xl text-[11px] text-neutral-400 leading-relaxed">
                🔴 <b className="text-red-300">YouTube Shorts:</b> Вертикальные видео до 60 секунд с хэштегом <span className="text-white font-mono">#Shorts</span> автоматически попадают в ленту рекомендаций YouTube Shorts и привлекают подписчиков на ваш канал.
              </div>
            </div>
          )}

          {/* TAB 3: TIKTOK */}
          {activeTab === 'tiktok' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TikTokIcon className="w-5 h-5 text-pink-400" />
                  <span className="font-bold text-sm text-white">TikTok Редактор & Reels</span>
                </div>
                <span className="text-xs text-pink-400 font-mono bg-neutral-900 px-2.5 py-1 rounded-lg border border-pink-500/30">
                  Формат 9:16 (Вертикальный)
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-neutral-400 font-semibold">
                    Заголовок, хук и вирусные хэштеги для TikTok:
                  </label>
                  <button
                    onClick={() => handleCopy(tiktokCaption, 'tiktok')}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'tiktok' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'tiktok' ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={tiktokCaption}
                  onChange={e => setTiktokCaption(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                />
              </div>

              {/* Quick Tags Suggestions */}
              <div>
                <label className="text-[11px] font-semibold text-neutral-400 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-pink-400" />
                  <span>Популярные стендап-теги в трендах:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['#стендап', '#юмор', '#комедия', '#прикол', '#рек', '#fyp', '#открытыймикрофон', '#шутка', '#рилс'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (!tiktokCaption.includes(tag)) {
                          setTiktokCaption(prev => `${prev} ${tag}`);
                          soundEffects.playStageClick();
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 transition"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handlePostTikTok}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-pink-600/20 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Скачать клип & в TikTok Creator</span>
                </button>

                <button
                  onClick={() => {
                    window.open('https://www.tiktok.com/creator-center/upload', '_blank');
                    soundEffects.playStageClick();
                  }}
                  className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <ExternalLink className="w-4 h-4 text-pink-400" />
                  <span>Открыть TikTok Web Studio</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: VKONTAKTE */}
          {activeTab === 'vk' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VKIcon className="w-5 h-5 text-[#2787F5]" />
                  <span className="font-bold text-sm text-white">ВКонтакте: Стена & VK Клипы</span>
                </div>
                <span className="text-xs text-[#2787F5] font-mono bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-800/40">
                  VK Clips & Wall
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-neutral-400 font-semibold">
                    Текст записи для сообщества или личной стены:
                  </label>
                  <button
                    onClick={() => handleCopy(vkCaption, 'vk')}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedKey === 'vk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'vk' ? 'Скопировано!' : 'Копировать'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={vkCaption}
                  onChange={e => setVkCaption(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-200 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handlePostVK(false)}
                  className="py-3 px-4 rounded-xl bg-[#2787F5] hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/20 active:scale-98"
                >
                  <VKIcon className="w-4 h-4" />
                  <span>Опубликовать на стену VK</span>
                </button>

                <button
                  onClick={() => handlePostVK(true)}
                  className="py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <Film className="w-4 h-4 text-blue-400" />
                  <span>Загрузить в VK Клипы</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: MULTI-POSTING */}
          {activeTab === 'multi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-500/15 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">
                    Мультипостинг во все 4 соцсети в один клик
                  </h4>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                  StandupLab скачает ваш финальный медиафайл (Reels 9:16 / Фото афиши), подготовит оптимизированные тексты со стендап-хэштегами и откроет публикацию в выбранных соцсетях:
                </p>

                {/* Network Selection Checkboxes */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs ${
                    multiNetworks.telegram ? 'bg-sky-500/15 border-sky-500/50 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={multiNetworks.telegram}
                      onChange={e => setMultiNetworks(prev => ({ ...prev, telegram: e.target.checked }))}
                      className="accent-sky-500 rounded"
                    />
                    <TelegramIcon className="w-4 h-4 text-sky-400" />
                    <span className="font-bold">Telegram</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs ${
                    multiNetworks.youtube ? 'bg-red-500/15 border-red-500/50 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={multiNetworks.youtube}
                      onChange={e => setMultiNetworks(prev => ({ ...prev, youtube: e.target.checked }))}
                      className="accent-red-500 rounded"
                    />
                    <YouTubeIcon className="w-4 h-4 text-red-500" />
                    <span className="font-bold">YouTube Shorts</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs ${
                    multiNetworks.vk ? 'bg-blue-500/15 border-blue-500/50 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={multiNetworks.vk}
                      onChange={e => setMultiNetworks(prev => ({ ...prev, vk: e.target.checked }))}
                      className="accent-blue-500 rounded"
                    />
                    <VKIcon className="w-4 h-4 text-[#2787F5]" />
                    <span className="font-bold">ВКонтакте</span>
                  </label>

                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition text-xs ${
                    multiNetworks.tiktok ? 'bg-pink-500/15 border-pink-500/50 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={multiNetworks.tiktok}
                      onChange={e => setMultiNetworks(prev => ({ ...prev, tiktok: e.target.checked }))}
                      className="accent-pink-500 rounded"
                    />
                    <TikTokIcon className="w-4 h-4 text-pink-400" />
                    <span className="font-bold">TikTok</span>
                  </label>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-300 mb-4 bg-black/40 p-3 rounded-xl border border-neutral-800/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Авто-генерация заголовков, тегов #Shorts #стендап и спойлеров</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Скачивание ролика в оригинальном HD-качестве</span>
                  </div>
                </div>

                <button
                  onClick={handleMultiPost}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-rose-400 text-neutral-950 font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-98"
                >
                  <Flame className="w-5 h-5 text-neutral-950" />
                  <span>Опубликовать везде (TG • YouTube • VK • TikTok)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-950/60">
                <Settings className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-white">Настройка аккаунтов комика</h4>
              </div>

              {/* Telegram settings */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <TelegramIcon className="w-4 h-4 text-sky-400" />
                  <span className="font-bold text-xs text-white">Telegram Канал / Чат</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Юзернейм канала (@channel):
                    </label>
                    <input
                      type="text"
                      value={config.telegram.channelUsername}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        telegram: { ...prev.telegram, channelUsername: e.target.value }
                      }))}
                      placeholder="@standup_channel"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Chat ID для Bot API (число или @channel):
                    </label>
                    <input
                      type="text"
                      value={config.telegram.chatId || ''}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        telegram: { ...prev.telegram, chatId: e.target.value }
                      }))}
                      placeholder="@my_channel или -1001234567"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">
                    Telegram Bot Token (необязательно, для авто-постинга без подтверждения):
                  </label>
                  <input
                    type="password"
                    value={config.telegram.botToken || ''}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      telegram: { ...prev.telegram, botToken: e.target.value }
                    }))}
                    placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              {/* YouTube settings */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <YouTubeIcon className="w-4 h-4 text-red-500" />
                  <span className="font-bold text-xs text-white">YouTube Канал & Shorts</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Название канала:
                    </label>
                    <input
                      type="text"
                      value={config.youtube.channelName}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        youtube: { ...prev.youtube, channelName: e.target.value }
                      }))}
                      placeholder="Standup Comedy Almaty"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Ссылка на канал / хэндл:
                    </label>
                    <input
                      type="text"
                      value={config.youtube.channelUrl || ''}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        youtube: { ...prev.youtube, channelUrl: e.target.value }
                      }))}
                      placeholder="https://youtube.com/@standup"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* VK settings */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <VKIcon className="w-4 h-4 text-[#2787F5]" />
                  <span className="font-bold text-xs text-white">ВКонтакте (Группа / Страница)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      ID сообщества или клуба:
                    </label>
                    <input
                      type="text"
                      value={config.vk.groupId || ''}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        vk: { ...prev.vk, groupId: e.target.value }
                      }))}
                      placeholder="public12345678"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">
                      Ссылка на профиль / паблик:
                    </label>
                    <input
                      type="text"
                      value={config.vk.profileUrl}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        vk: { ...prev.vk, profileUrl: e.target.value }
                      }))}
                      placeholder="https://vk.com/my_standup"
                      className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* TikTok settings */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center gap-2">
                  <TikTokIcon className="w-4 h-4 text-pink-400" />
                  <span className="font-bold text-xs text-white">TikTok Аккаунт</span>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-400 block mb-1">
                    Никнейм в TikTok:
                  </label>
                  <input
                    type="text"
                    value={config.tiktok.username}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      tiktok: { ...prev.tiktok, username: e.target.value }
                    }))}
                    placeholder="@comic_standup"
                    className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveConfig}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition"
              >
                Сохранить настройки соцсетей
              </button>
            </div>
          )}

          {/* TAB 6: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-950/60">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">История синхронизаций</h4>
                </div>
                <span className="text-xs text-neutral-400">{history.length} записей</span>
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  Здесь сохраняется журнал ваших публикаций в соцсети
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        {item.network === 'telegram' && <TelegramIcon className="w-4 h-4 text-sky-400 shrink-0" />}
                        {item.network === 'youtube' && <YouTubeIcon className="w-4 h-4 text-red-500 shrink-0" />}
                        {item.network === 'tiktok' && <TikTokIcon className="w-4 h-4 text-pink-400 shrink-0" />}
                        {item.network === 'vk' && <VKIcon className="w-4 h-4 text-blue-400 shrink-0" />}
                        {item.network === 'all' && <Flame className="w-4 h-4 text-amber-400 shrink-0" />}

                        <div>
                          <div className="font-bold text-white">{item.title}</div>
                          {item.details && (
                            <div className="text-[10px] text-neutral-400">{item.details}</div>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
