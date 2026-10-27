/**
 * Service for syncing standup jokes, photos, and video reels 
 * with Telegram, YouTube (Shorts & Videos), TikTok, and VKontakte (ВКонтакте).
 */

export interface SocialAccountsConfig {
  telegram: {
    enabled: boolean;
    channelUsername: string; // e.g. "@standup_almaty" or "https://t.me/..."
    botToken?: string;
    chatId?: string; // numeric or @channel_name
  };
  youtube: {
    enabled: boolean;
    channelName: string; // e.g. "Standup Almaty Official"
    channelUrl?: string; // e.g. "https://youtube.com/@standup"
    publishTarget: 'shorts' | 'video'; // Shorts (9:16) or standard Video
    defaultTags: string[];
  };
  vk: {
    enabled: boolean;
    groupId?: string; // e.g. "public123456" or "club123456"
    accessToken?: string;
    profileUrl: string; // e.g. "https://vk.com/comedian"
  };
  tiktok: {
    enabled: boolean;
    username: string; // e.g. "@standup_comedian"
    preferredTags: string[];
  };
}

export interface SyncHistoryItem {
  id: string;
  network: 'telegram' | 'youtube' | 'tiktok' | 'vk' | 'all';
  mediaType: 'photo' | 'video' | 'text';
  title: string;
  timestamp: string;
  status: 'published' | 'intent_opened' | 'copied' | 'ready';
  details?: string;
}

const DEFAULT_CONFIG: SocialAccountsConfig = {
  telegram: {
    enabled: true,
    channelUsername: '@standup_channel',
    botToken: '',
    chatId: ''
  },
  youtube: {
    enabled: true,
    channelName: 'Standup Comedy Channel',
    channelUrl: 'https://youtube.com',
    publishTarget: 'shorts',
    defaultTags: ['#Shorts', '#стендап', '#юмор', '#комедия', '#шутки', '#standup', '#стендапклуб']
  },
  vk: {
    enabled: true,
    groupId: '',
    accessToken: '',
    profileUrl: 'https://vk.com'
  },
  tiktok: {
    enabled: true,
    username: '@standup_comic',
    preferredTags: ['#стендап', '#юмор', '#комедия', '#прикол', '#рек', '#fyp', '#рилс']
  }
};

const STORAGE_KEY_CONFIG = 'standuplab_social_config';
const STORAGE_KEY_HISTORY = 'standuplab_social_history';

export class SocialSyncService {
  static getConfig(): SocialAccountsConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse social config:', e);
    }
    return DEFAULT_CONFIG;
  }

  static saveConfig(config: SocialAccountsConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save social config:', e);
    }
  }

  static getHistory(): SyncHistoryItem[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse social history:', e);
    }
    return [];
  }

  static addHistoryItem(item: Omit<SyncHistoryItem, 'id' | 'timestamp'>): void {
    try {
      const current = this.getHistory();
      const newItem: SyncHistoryItem = {
        ...item,
        id: 'sync-' + Date.now(),
        timestamp: new Date().toISOString()
      };
      const updated = [newItem, ...current.slice(0, 49)];
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update social history:', e);
    }
  }

  /**
   * Generates tailored social text with standup hashtags and formatting
   */
  static formatCaption(
    network: 'telegram' | 'tiktok' | 'vk' | 'youtube', 
    title: string, 
    premise?: string, 
    punchline?: string
  ): string {
    const config = this.getConfig();

    switch (network) {
      case 'telegram': {
        let text = `🎤 <b>${title}</b>\n\n`;
        if (premise) {
          text += `${premise}\n\n`;
        }
        if (punchline) {
          text += `💥 <tg-spoiler>${punchline}</tg-spoiler>\n\n`;
        }
        text += `<i>Записано на открытом микрофоне StandupLab</i> 🎙️\n\n`;
        text += `#стендап #юмор #комедия #открытыймикрофон #шутка`;
        if (config.telegram.channelUsername) {
          text += `\n\n👉 Подпишись на канал: ${config.telegram.channelUsername}`;
        }
        return text;
      }

      case 'youtube': {
        const defaultTags = (config.youtube.defaultTags && config.youtube.defaultTags.length > 0)
          ? config.youtube.defaultTags.join(' ')
          : '#Shorts #стендап #юмор #комедия #шутки #смех #стендапклуб';

        let text = `🔥 ${title.toUpperCase()} — Стендап комедия\n\n`;
        if (premise) {
          text += `${premise}\n\n`;
        }
        if (punchline) {
          text += `👉 ${punchline}\n\n`;
        }
        text += `Ставьте лайк и подписывайтесь на канал за новыми стендап-битами и шутками! Как вам панчлайн? Пишите в комментариях 👇\n\n`;
        text += `${defaultTags}`;
        if (config.youtube.channelName) {
          text += `\n\nКанал: ${config.youtube.channelName}`;
        }
        return text;
      }

      case 'vk': {
        let text = `🎭 ${title}\n\n`;
        if (premise) {
          text += `${premise}\n\n`;
        }
        if (punchline) {
          text += `👉 ${punchline}\n\n`;
        }
        text += `Смотрите свежие стендап-дубли и клипы! Как вам шутка? Пишите в комменты 👇\n\n`;
        text += `#стендап #юмор #шутка #комедия #вклипы #стендапклуб #vkclips`;
        return text;
      }

      case 'tiktok': {
        const tags = (config.tiktok.preferredTags && config.tiktok.preferredTags.length > 0)
          ? config.tiktok.preferredTags.join(' ')
          : '#стендап #юмор #комедия #fyp #рек #шутка #рилс';
        
        let hook = title.toUpperCase();
        if (premise && premise.length < 50) {
          hook = `${hook} — ${premise}`;
        }
        return `${hook} 💀😂 Жми лайк, если жиза!\n.\n.\n${tags}`;
      }
    }
  }

  /**
   * Open Telegram share dialog
   */
  static shareToTelegram(text: string, mediaUrl?: string): void {
    const shareUrl = mediaUrl || window.location.href;
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    this.addHistoryItem({
      network: 'telegram',
      mediaType: mediaUrl ? 'video' : 'text',
      title: 'Экспорт в Telegram',
      status: 'intent_opened',
      details: 'Открыт диалог публикации в Telegram'
    });
  }

  /**
   * Direct Telegram Bot API posting (if token and chatId are provided)
   */
  static async postToTelegramBot(text: string, mediaBlob?: Blob, mediaType?: 'photo' | 'video'): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    if (!config.telegram.botToken || !config.telegram.chatId) {
      // Fallback to web share dialog
      this.shareToTelegram(text);
      return { success: true, message: 'Открыт Telegram Web Share (настройте Bot Token для прямой отправки в канал без подтверждения)' };
    }

    try {
      const botToken = config.telegram.botToken.trim();
      const chatId = config.telegram.chatId.trim();

      if (mediaBlob && mediaType) {
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('caption', text);
        formData.append('parse_mode', 'HTML');
        
        const endpoint = mediaType === 'photo' ? 'sendPhoto' : 'sendVideo';
        formData.append(mediaType, mediaBlob, mediaType === 'photo' ? 'standup_photo.jpg' : 'standup_reel.mp4');

        const res = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (data.ok) {
          this.addHistoryItem({
            network: 'telegram',
            mediaType,
            title: 'Прямая публикация в Telegram-канал',
            status: 'published',
            details: `Канал: ${chatId}`
          });
          return { success: true, message: `Успешно опубликовано в Telegram канал (${chatId})!` };
        } else {
          throw new Error(data.description || 'Ошибка Telegram API');
        }
      } else {
        // Send pure text
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML'
          })
        });

        const data = await res.json();
        if (data.ok) {
          this.addHistoryItem({
            network: 'telegram',
            mediaType: 'text',
            title: 'Публикация текста в Telegram',
            status: 'published',
            details: `Канал: ${chatId}`
          });
          return { success: true, message: `Сообщение отправлено в Telegram (${chatId})!` };
        } else {
          throw new Error(data.description || 'Ошибка отправки');
        }
      }
    } catch (err: unknown) {
      console.warn('Direct Telegram API failed, falling back to share link:', err);
      this.shareToTelegram(text);
      const msg = err instanceof Error ? err.message : String(err);
      return { 
        success: false, 
        message: `API ошибка: ${msg}. Открываем стандартный диалог Telegram.` 
      };
    }
  }

  /**
   * Open VKontakte share dialog / VK Clips
   */
  static shareToVK(title: string, text: string, mediaUrl?: string, isClip: boolean = false): void {
    if (isClip) {
      // Direct link to VK Clips Creator Studio
      window.open('https://vk.com/clips', '_blank', 'noopener,noreferrer');
      this.addHistoryItem({
        network: 'vk',
        mediaType: 'video',
        title: 'Переход в VK Клипы',
        status: 'intent_opened',
        details: 'Открыта студия VK Клипов'
      });
      return;
    }

    const shareUrl = mediaUrl || window.location.href;
    const url = `https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&comment=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    this.addHistoryItem({
      network: 'vk',
      mediaType: mediaUrl ? 'video' : 'text',
      title: 'Публикация на стену VK',
      status: 'intent_opened',
      details: 'Открыто окно записи ВКонтакте'
    });
  }

  /**
   * Open TikTok Creator Studio / Web Share
   */
  static shareToTikTok(mediaFile?: File | Blob, caption?: string): void {
    // If Web Share API supports file sharing directly to TikTok app
    if (navigator.share && mediaFile) {
      try {
        const file = mediaFile instanceof File 
          ? mediaFile 
          : new File([mediaFile], 'standup-reel.webm', { type: mediaFile.type || 'video/webm' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            title: 'Standup Reel',
            text: caption || '#стендап #юмор #рек'
          }).catch(() => {
            // User cancelled or fallback
            window.open('https://www.tiktok.com/creator-center/upload', '_blank', 'noopener,noreferrer');
          });

          this.addHistoryItem({
            network: 'tiktok',
            mediaType: 'video',
            title: 'Экспорт в TikTok через Web Share',
            status: 'published',
            details: 'Файл передан в системное меню для TikTok'
          });
          return;
        }
      } catch (e) {
        console.warn('Web Share API failed, fallback to web upload:', e);
      }
    }

    // Direct link to TikTok Creator Center Upload
    window.open('https://www.tiktok.com/creator-center/upload', '_blank', 'noopener,noreferrer');
    this.addHistoryItem({
      network: 'tiktok',
      mediaType: 'video',
      title: 'Переход в Студию загрузки TikTok',
      status: 'intent_opened',
      details: 'Открыт веб-загрузчик TikTok Creator'
    });
  }

  /**
   * Open YouTube Studio Upload dialog or YouTube app
   */
  static shareToYouTube(title: string, description: string, mediaUrl?: string, isShorts: boolean = true): void {
    // Open YouTube Studio upload creator interface
    const studioUrl = 'https://studio.youtube.com/channel/UC/videos/upload?d=bu';
    window.open(studioUrl, '_blank', 'noopener,noreferrer');

    this.addHistoryItem({
      network: 'youtube',
      mediaType: 'video',
      title: isShorts ? 'Экспорт в YouTube Shorts' : 'Экспорт в YouTube Видео',
      status: 'intent_opened',
      details: `Открыта творческая студия YouTube Studio (${isShorts ? '9:16 Shorts' : 'Видео'}). Метаданные скопированы.`
    });
  }
}
