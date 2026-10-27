import { Language } from './types';

export const translations = {
  ru: {
    app: {
      name: 'StandupLab',
      tagline: 'Студия стендап-комика',
      stageSubtitle: 'База шуток • Сет-листы • Камера & Reels • Соцсети'
    },
    nav: {
      jokes: 'База шуток',
      riffs: 'Разгоны',
      notes: 'Блокнот автора',
      setlists: 'Сет-лист',
      reels: 'Reels & Клипы',
      camera: 'Стендап-Камера',
      analytics: 'Аналитика',
      timer: 'Таймер сцены',
      reorderTabs: 'Порядок вкладок',
      reorderDesc: 'Меняйте порядок плиток перетаскиванием',
      socialSync: 'Синхронизация',
      language: 'Язык',
      settings: 'Настройки',
      proPlan: 'Подписка PRO',
      basicPlan: 'Базовый режим',
      upgradePro: 'Подписка 250 ₽/полгода'
    },
    subscription: {
      title: 'Тарифы StandupLab',
      activeTitle: 'Ваша подписка активна',
      unlimitedTitle: 'Снимите ограничения на шутки и рилсы',
      basicMode: 'Базовый режим',
      currentPlan: 'Текущий',
      freePrice: '0 ₽',
      basicLimit1: 'До 10 шуток в любой категории',
      basicLimit2: 'До 10 заметок в блокноте автора',
      basicLimit3: '3 создания рилса с помощью ИИ',
      proMode: 'Подписка на полгода',
      proPrice: '250 ₽',
      proPeriod: 'за 6 месяцев (полгода)',
      proFeature1: 'Безлимитные шутки во всех категориях',
      proFeature2: 'Безлимитный блокнот автора',
      proFeature3: 'Безлимитная нарезка рилсов от ИИ',
      proFeature4: 'Стендап-камера с кинофильтрами и суфлером',
      proFeature5: 'Синхронизация с Telegram, YouTube, VK, TikTok',
      proFeature6: 'Экспорт сет-листов и Яндекс Маршруты',
      activateBtn: 'Оформить за 250 ₽ на полгода',
      activating: 'Активация...',
      switchToBasic: 'Включить Базовый',
      activeUntil: 'Подписка действует до',
      badgeSuccess: 'Подписка успешно активирована на 6 месяцев!',
      aiReelsLimitReached: 'В базовой версии доступно только 3 создания рилса с помощью ИИ. Вы использовали 3 из 3. Перейдите на тариф без ограничений за 250 ₽ на полгода!'
    },
    camera: {
      title: 'Стендап-Камера & Студия Записи',
      desc: 'Запись репетиций и живых сетов с профессиональными фильтрами, телесуфлером шуток и мгновенной синхронизацией',
      recModeVideo: 'Видеозапись',
      recModePhoto: 'Фотокадр',
      startRec: 'Начать запись',
      stopRec: 'Остановить запись',
      takeSnap: 'Сделать снимок',
      teleprompter: 'Телесуфлер',
      showPrompter: 'Показать текст шуток',
      hidePrompter: 'Скрыть суфлер',
      speed: 'Скорость',
      textSize: 'Шрифт',
      filter: 'Фильтр',
      filters: {
        normal: 'Без фильтра',
        spotlight: 'Сценический софит',
        vintage: 'Винтаж 35мм',
        cyber: 'Кибернеон',
        noir: 'Нуар комедия',
        warm: 'Теплый закат',
        studio: 'Студийный чистый'
      },
      aspectRatio: 'Формат',
      timerSec: 'Таймер задержки',
      flipCam: 'Сменить камеру',
      galleryTitle: 'Галерея записей & дублей',
      emptyGallery: 'Сделайте первое фото или запишите видео сета',
      syncBtn: 'Синхронизировать',
      downloadBtn: 'Скачать',
      deleteBtn: 'Удалить'
    },
    reels: {
      title: 'AI Видеоредактор & Reels Нарезка',
      desc: 'Искусственный интеллект автоматически нарезает лучшие панчлайны и реакцию зала в вирусные вертикальные Reels (9:16)!',
      aiCutBtn: '🤖 Нарезать Reels с помощью ИИ',
      aiCutting: 'ИИ нарезает видео...',
      aiCounterBasic: 'ИИ-нарезок: {count}/3 (Базовый тариф)',
      aiCounterPro: 'Безлимитная нарезка ИИ',
      aiRemaining: 'Осталось {count} из 3 ИИ-нарезок в Базовом тарифе',
      upgradeBtn: 'Снять лимит за 250 ₽',
      subtitles: 'Стиль субтитров',
      subKaraoke: 'Караоке с подсветкой',
      subBoldYellow: 'Жирный желтый punch',
      subHeadline: 'Только заголовок',
      subMinimal: 'Минималистичный',
      watermark: 'Водяной знак',
      exportReel: 'Скачать готовый Reel (9:16)',
      exportSuccess: 'Reel успешно экспортирован!',
      socialSyncBtn: 'Синхронизация (TG • YT • VK • TT)'
    },
    social: {
      title: 'Синхронизация с соцсетями',
      subtitle: 'Публикация шуток, фото и Reels в Telegram, YouTube, ВКонтакте и TikTok',
      telegram: 'Telegram',
      youtube: 'YouTube',
      vk: 'ВКонтакте',
      tiktok: 'TikTok',
      multi: 'Массовая синхронизация',
      settings: 'Настройки аккаунтов',
      history: 'История публикаций',
      copyCaption: 'Скопировать текст',
      copied: 'Скопировано!',
      openStudio: 'Открыть студию',
      openTgWeb: 'Открыть Telegram Web',
      openYtStudio: 'Открыть YouTube Studio',
      openVkWall: 'Опубликовать в VK',
      openVkClips: 'Открыть VK Клипы',
      openTiktokUpload: 'Открыть TikTok Creator',
      postBot: 'Отправить через Telegram Bot',
      multiPublishBtn: 'Синхронизировать во все выбранные сети',
      channelName: 'Название канала / Никнейм',
      botToken: 'Токен бота',
      chatId: 'ID чата или @канал'
    },
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      close: 'Закрыть',
      delete: 'Удалить',
      edit: 'Редактировать',
      search: 'Поиск...',
      loading: 'Загрузка...',
      all: 'Все',
      success: 'Успешно'
    }
  },

  en: {
    app: {
      name: 'StandupLab',
      tagline: 'Comedian Studio & Stage Prompter',
      stageSubtitle: 'Jokes Database • Setlists • Camera & Reels • Social Sync'
    },
    nav: {
      jokes: 'Jokes Database',
      riffs: 'Riff Room',
      notes: 'Writer Notebook',
      setlists: 'Setlists',
      reels: 'Reels & Clips',
      camera: 'Standup Camera',
      analytics: 'Analytics',
      timer: 'Stage Timer',
      reorderTabs: 'Tab Order',
      reorderDesc: 'Drag and drop tiles to customize top menu order',
      socialSync: 'Social Sync',
      language: 'Language',
      settings: 'Settings',
      proPlan: 'PRO Subscription',
      basicPlan: 'Basic Mode',
      upgradePro: 'Subscribe 250 ₽ / 6 mo'
    },
    subscription: {
      title: 'StandupLab Plans',
      activeTitle: 'Your Subscription is Active',
      unlimitedTitle: 'Remove joke & reel limits',
      basicMode: 'Basic Mode',
      currentPlan: 'Current',
      freePrice: '$0 / 0 ₽',
      basicLimit1: 'Up to 10 jokes per category',
      basicLimit2: 'Up to 10 notes in author notebook',
      basicLimit3: '3 AI Reel creations',
      proMode: '6 Months Subscription',
      proPrice: '250 ₽',
      proPeriod: 'for 6 months (half year)',
      proFeature1: 'Unlimited jokes in all categories',
      proFeature2: 'Unlimited author notebook',
      proFeature3: 'Unlimited AI Reels cutting',
      proFeature4: 'Stage camera with cinema filters & prompter',
      proFeature5: 'Sync to Telegram, YouTube, VK, TikTok',
      proFeature6: 'PDF setlists & Gig maps routing',
      activateBtn: 'Get 6 Months for 250 ₽',
      activating: 'Activating...',
      switchToBasic: 'Switch to Basic',
      activeUntil: 'Active until',
      badgeSuccess: 'Subscription activated for 6 months! All limits lifted.',
      aiReelsLimitReached: 'Basic tier includes 3 AI Reel creations. You have used 3 of 3. Upgrade to Unlimited for 250 ₽ (6 months) to create unlimited viral clips!'
    },
    camera: {
      title: 'Standup Camera & Recording Studio',
      desc: 'Record comedy rehearsals and live sets with cinema filters, joke prompter, and instant social sync',
      recModeVideo: 'Video Record',
      recModePhoto: 'Photo Snap',
      startRec: 'Start Recording',
      stopRec: 'Stop Recording',
      takeSnap: 'Take Photo',
      teleprompter: 'Teleprompter',
      showPrompter: 'Show Joke Prompter',
      hidePrompter: 'Hide Prompter',
      speed: 'Scroll Speed',
      textSize: 'Font Size',
      filter: 'Filter',
      filters: {
        normal: 'No Filter',
        spotlight: 'Stage Spotlight',
        vintage: 'Vintage 35mm',
        cyber: 'Cyber Neon',
        noir: 'Noir Comedy',
        warm: 'Warm Sunset',
        studio: 'Studio Clean'
      },
      aspectRatio: 'Aspect Ratio',
      timerSec: 'Countdown',
      flipCam: 'Switch Camera',
      galleryTitle: 'Captured Media Gallery',
      emptyGallery: 'Take your first photo or record a comedy set video',
      syncBtn: 'Sync to Socials',
      downloadBtn: 'Download',
      deleteBtn: 'Delete'
    },
    reels: {
      title: 'AI Video Editor & Reels Slicer',
      desc: 'AI automatically extracts your best punchlines and crowd laugh reactions into viral vertical 9:16 Reels with dynamic subtitles!',
      aiCutBtn: '🤖 Cut Reels with AI',
      aiCutting: 'AI is slicing video...',
      aiCounterBasic: 'AI Cuts: {count}/3 (Basic Plan)',
      aiCounterPro: 'Unlimited AI Slicing',
      aiRemaining: '{count} of 3 AI reel creations remaining in Basic',
      upgradeBtn: 'Remove limit for 250 ₽',
      subtitles: 'Subtitle Style',
      subKaraoke: 'Karaoke Highlights',
      subBoldYellow: 'Bold Yellow Punch',
      subHeadline: 'Headline Only',
      subMinimal: 'Minimalist Clean',
      watermark: 'Watermark',
      exportReel: 'Download Finished Reel (9:16)',
      exportSuccess: 'Reel exported successfully!',
      socialSyncBtn: 'Social Sync (TG • YT • VK • TT)'
    },
    social: {
      title: 'Social Media Sync Hub',
      subtitle: 'One-click syndication to Telegram, YouTube, VKontakte, and TikTok',
      telegram: 'Telegram',
      youtube: 'YouTube',
      vk: 'VKontakte',
      tiktok: 'TikTok',
      multi: 'Multi-Network Sync',
      settings: 'Channel Settings',
      history: 'Publishing History',
      copyCaption: 'Copy Caption',
      copied: 'Copied!',
      openStudio: 'Open Creator Studio',
      openTgWeb: 'Open Telegram Web',
      openYtStudio: 'Open YouTube Studio',
      openVkWall: 'Post to VK Wall',
      openVkClips: 'Open VK Clips',
      openTiktokUpload: 'Open TikTok Upload',
      postBot: 'Direct Bot Dispatch',
      multiPublishBtn: 'Sync to all selected networks',
      channelName: 'Channel / Profile Name',
      botToken: 'Bot Token',
      chatId: 'Chat ID or @channel'
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search...',
      loading: 'Loading...',
      all: 'All',
      success: 'Success'
    }
  },

  zh: {
    app: {
      name: 'StandupLab',
      tagline: '单口喜剧演员创作录音棚',
      stageSubtitle: '段子库 • 演出节目单 • 摄像与短视频 • 社交媒体同步'
    },
    nav: {
      jokes: '喜剧段子库',
      riffs: '即兴脑暴',
      notes: '编剧笔记本',
      setlists: '演出节目单',
      reels: '短视频卷轴',
      camera: '录像相机',
      analytics: '专场分析',
      timer: '舞台计时器',
      reorderTabs: '导航排序',
      reorderDesc: '可拖拽调整顶部栏目顺序',
      socialSync: '社交同步',
      language: '语言 (Language)',
      settings: '设置',
      proPlan: 'PRO 会员',
      basicPlan: '基础模式',
      upgradePro: '半年会员 250 ₽'
    },
    subscription: {
      title: 'StandupLab 会员方案',
      activeTitle: '会员权益生效中',
      unlimitedTitle: '解锁段子库与AI短视频无限限制',
      basicMode: '基础免费模式',
      currentPlan: '当前方案',
      freePrice: '0 ₽',
      basicLimit1: '每个分类限 10 条段子',
      basicLimit2: '编剧笔记本限 10 篇',
      basicLimit3: '限 3 次 AI 短视频剪辑',
      proMode: '半年特惠订阅',
      proPrice: '250 ₽',
      proPeriod: '/ 6 个月（半年）',
      proFeature1: '所有分类无限添加段子',
      proFeature2: '编剧笔记本无限容量',
      proFeature3: '无限制 AI 自动剪辑 Reels / 短视频',
      proFeature4: '电影级滤镜相机与演出提词器',
      proFeature5: '一键同步至 Telegram, YouTube, VK, TikTok',
      proFeature6: 'PDF 演出单导出与巡演路线',
      activateBtn: '250 ₽ 开通半年会员',
      activating: '正在开通...',
      switchToBasic: '切换为基础模式',
      activeUntil: '会员有效期至',
      badgeSuccess: '已成功开通 6 个月会员！所有限制已解除。',
      aiReelsLimitReached: '基础版本仅支持 3 次 AI 视频剪辑，您已用完 3/3 次额度。开通半年会员（250 ₽）即可享受无限次 AI 爆笑切片！'
    },
    camera: {
      title: '脱口秀录制相机与演播室',
      desc: '专为喜剧演员打造：配备电影级舞台滤镜、悬浮提词器及多平台一键同步',
      recModeVideo: '录制视频',
      recModePhoto: '拍摄照片',
      startRec: '开始录制',
      stopRec: '停止录制',
      takeSnap: '拍照',
      teleprompter: '提词器',
      showPrompter: '显示段子提示',
      hidePrompter: '隐藏提词器',
      speed: '滚动速度',
      textSize: '文字大小',
      filter: '滤镜风格',
      filters: {
        normal: '原画质',
        spotlight: '舞台聚光灯',
        vintage: '复古 35mm',
        cyber: '赛博霓虹',
        noir: '黑色幽默',
        warm: '暖阳余晖',
        studio: '演播室纯净'
      },
      aspectRatio: '画面比例',
      timerSec: '倒计时',
      flipCam: '翻转镜头',
      galleryTitle: '录制作品画廊',
      emptyGallery: '快来录制你的第一段现场演出或排练吧',
      syncBtn: '同步到社交平台',
      downloadBtn: '下载媒体',
      deleteBtn: '删除'
    },
    reels: {
      title: 'AI 智能短视频剪辑与切片',
      desc: '利用人工智能自动识别爆笑高潮、观众笑声与 punchline，一键生成 9:16 爆款短视频！',
      aiCutBtn: '🤖 使用 AI 一键切片',
      aiCutting: 'AI 正在智能剪辑中...',
      aiCounterBasic: 'AI 生成额度: {count}/3 (基础版)',
      aiCounterPro: 'AI 无限次生成',
      aiRemaining: '基础版剩余 {count}/3 次 AI 切片',
      upgradeBtn: '250 ₽ 解锁无限',
      subtitles: '字幕样式',
      subKaraoke: '卡拉OK高亮',
      subBoldYellow: '醒目黄字 Punch',
      subHeadline: '仅顶部大标题',
      subMinimal: '极简白字',
      watermark: '水印署名',
      exportReel: '导出高清 9:16 短视频',
      exportSuccess: '短视频导出成功！',
      socialSyncBtn: '多平台同步 (TG • YT • VK • TT)'
    },
    social: {
      title: '全网多平台内容同步中心',
      subtitle: '一键将精彩段子、照片与短视频发布到 Telegram、YouTube、VKontakte 与 TikTok',
      telegram: 'Telegram',
      youtube: 'YouTube',
      vk: 'VKontakte',
      tiktok: 'TikTok',
      multi: '一键全网矩阵分发',
      settings: '社交账号设置',
      history: '发布历史记录',
      copyCaption: '复制配文',
      copied: '已复制！',
      openStudio: '打开创作者工作室',
      openTgWeb: '打开 Telegram 网页版',
      openYtStudio: '打开 YouTube Studio',
      openVkWall: '发布到 VK 动态',
      openVkClips: '打开 VK Clips',
      openTiktokUpload: '打开 TikTok 创作者平台',
      postBot: '通过 Bot 直接发送',
      multiPublishBtn: '同步到所有选中的社交网络',
      channelName: '频道 / 主页名称',
      botToken: 'Bot 密钥 (Token)',
      chatId: 'Chat ID 或 @频道名'
    },
    common: {
      save: '保存',
      cancel: '取消',
      close: '关闭',
      delete: '删除',
      edit: '编辑',
      search: '搜索...',
      loading: '加载中...',
      all: '全部',
      success: '操作成功'
    }
  },

  tr: {
    app: {
      name: 'StandupLab',
      tagline: 'Stand-up Komedyeni Stüdyosu',
      stageSubtitle: 'Şaka Veritabanı • Setlist • Kamera & Reels • Sosyal Senkronizasyon'
    },
    nav: {
      jokes: 'Şaka Veritabanı',
      riffs: 'Разгоны (Riff)',
      notes: 'Yazar Defteri',
      setlists: 'Setlistler',
      reels: 'Reels & Klipler',
      camera: 'Stand-up Kamerası',
      analytics: 'Analitik',
      timer: 'Sahne Zamanlayıcısı',
      reorderTabs: 'Sekme Sıralaması',
      reorderDesc: 'Üst menü sıralamasını sürükleyip bırakarak özelleştirin',
      socialSync: 'Sosyal Senkronizasyon',
      language: 'Dil',
      settings: 'Ayarlar',
      proPlan: 'PRO Abonelik',
      basicPlan: 'Temel Mod',
      upgradePro: '6 Aylık 250 ₽'
    },
    subscription: {
      title: 'StandupLab Paketleri',
      activeTitle: 'Aboneliğiniz Aktif',
      unlimitedTitle: 'Şaka ve video limitlerini kaldırın',
      basicMode: 'Temel Mod',
      currentPlan: 'Mevcut',
      freePrice: '0 ₽',
      basicLimit1: 'Kategori başına en fazla 10 şaka',
      basicLimit2: 'Yazar defterinde en fazla 10 not',
      basicLimit3: 'Yapay zeka ile 3 Reels üretimi',
      proMode: '6 Aylık Abonelik',
      proPrice: '250 ₽',
      proPeriod: '6 ay boyunca (yarım yıl)',
      proFeature1: 'Tüm kategorilerde sınırsız şaka',
      proFeature2: 'Sınırsız yazar defteri',
      proFeature3: 'Sınırsız Yapay Zeka Reels kesimi',
      proFeature4: 'Sinematik filtreli kamera & sahne prompteri',
      proFeature5: 'Telegram, YouTube, VK, TikTok ile anında senkronizasyon',
      proFeature6: 'PDF Setlist ve Turne Haritaları',
      activateBtn: '250 ₽ ile 6 Aylık Başlat',
      activating: 'Etkinleştiriliyor...',
      switchToBasic: 'Temel Moda Geç',
      activeUntil: 'Abonelik bitiş tarihi',
      badgeSuccess: '6 aylık abonelik başarıyla başlatıldı! Tüm limitler kaldırıldı.',
      aiReelsLimitReached: 'Temel sürümde sadece 3 yapay zeka reels kesimi mevcuttur. 3/3 hakkınızı kullandınız. 6 aylık 250 ₽ karşılığında sınırsız pakete geçin!'
    },
    camera: {
      title: 'Stand-up Kamerası & Kayıt Stüdyosu',
      desc: 'Sinematik filtreler, şaka prompteri ve tek tıkla sosyal medya senkronizasyonu ile provalarınızı kaydedin',
      recModeVideo: 'Video Kaydı',
      recModePhoto: 'Fotoğraf Çek',
      startRec: 'Kaydı Başlat',
      stopRec: 'Kaydı Durdur',
      takeSnap: 'Fotoğraf Al',
      teleprompter: 'Teleprompter',
      showPrompter: 'Şakaları Göster',
      hidePrompter: 'Prompteri Gizle',
      speed: 'Akış Hızı',
      textSize: 'Yazı Boyutu',
      filter: 'Filtre',
      filters: {
        normal: 'Filtresiz',
        spotlight: 'Sahne Spot Işığı',
        vintage: 'Vintage 35mm',
        cyber: 'Siber Neon',
        noir: 'Kara Komedi (Noir)',
        warm: 'Sıcak Gün Batımı',
        studio: 'Temiz Stüdyo'
      },
      aspectRatio: 'En-Boy Oranı',
      timerSec: 'Gecikme Sayacı',
      flipCam: 'Kamera Değiştir',
      galleryTitle: 'Kayıtlar & Çekimler Galerisi',
      emptyGallery: 'İlk fotoğrafınızı çekin veya sahne videonuzu kaydedin',
      syncBtn: 'Sosyal Medyaya Aktar',
      downloadBtn: 'İndir',
      deleteBtn: 'Sil'
    },
    reels: {
      title: 'Yapay Zeka Video Düzenleyici & Reels Kesici',
      desc: 'Yapay zeka en iyi esprilerinizi ve seyirci kahkahalarını tespit ederek otomatik 9:16 viral Reels formatına dönüştürür!',
      aiCutBtn: '🤖 Yapay Zeka ile Reels Kes',
      aiCutting: 'Yapay zeka kesiyor...',
      aiCounterBasic: 'YZ Üretimi: {count}/3 (Temel Paket)',
      aiCounterPro: 'Sınırsız YZ Kesimi',
      aiRemaining: 'Temel pakette kalan YZ Reels hakkı: {count}/3',
      upgradeBtn: '250 ₽ ile Sınırsız Yap',
      subtitles: 'Altyazı Stili',
      subKaraoke: 'Karaoke Vurgulu',
      subBoldYellow: 'Kalın Sarı Vurucu',
      subHeadline: 'Sadece Başlık',
      subMinimal: 'Minimal Sade',
      watermark: 'Filigran',
      exportReel: 'Hazır Reel İndir (9:16)',
      exportSuccess: 'Reel başarıyla dışa aktarıldı!',
      socialSyncBtn: 'Sosyal Senkronizasyon (TG • YT • VK • TT)'
    },
    social: {
      title: 'Sosyal Medya Senkronizasyon Merkezi',
      subtitle: 'Şakalarınızı, fotoğraflarınızı ve Reels videolarınızı Telegram, YouTube, VKontakte ve TikTok ile paylaşın',
      telegram: 'Telegram',
      youtube: 'YouTube',
      vk: 'VKontakte',
      tiktok: 'TikTok',
      multi: 'Toplu Senkronizasyon',
      settings: 'Hesap Ayarları',
      history: 'Yayın Geçmişi',
      copyCaption: 'Metni Kopyala',
      copied: 'Kopyalandı!',
      openStudio: 'Stüdyoyu Aç',
      openTgWeb: 'Telegram Web Aç',
      openYtStudio: 'YouTube Studio Aç',
      openVkWall: 'VK Duvarında Paylaş',
      openVkClips: 'VK Klipler Aç',
      openTiktokUpload: 'TikTok Yükleme Aç',
      postBot: 'Telegram Botu ile Gönder',
      multiPublishBtn: 'Seçili tüm ağlara senkronize et',
      channelName: 'Kanal / Kullanıcı Adı',
      botToken: 'Bot Token',
      chatId: 'Sohbet ID veya @kanal'
    },
    common: {
      save: 'Kaydet',
      cancel: 'İptal',
      close: 'Kapat',
      delete: 'Sil',
      edit: 'Düzenle',
      search: 'Ara...',
      loading: 'Yükleniyor...',
      all: 'Tümü',
      success: 'Başarılı'
    }
  }
} as const;

export type TranslationKey = keyof typeof translations['ru'];

/**
 * Automatically detects the user's regional language preference:
 * Checks localStorage first, then browser navigator.languages / navigator.language,
 * then timezone region hints.
 */
export function detectUserLocale(): Language {
  try {
    const saved = localStorage.getItem('standuplab_language');
    if (saved && (saved === 'ru' || saved === 'en' || saved === 'zh' || saved === 'tr')) {
      return saved as Language;
    }

    const browserLangs = navigator.languages || [navigator.language || ''];
    for (const l of browserLangs) {
      const lower = l.toLowerCase();
      if (lower.startsWith('zh')) return 'zh';
      if (lower.startsWith('tr')) return 'tr';
      if (lower.startsWith('ru') || lower.startsWith('be') || lower.startsWith('kk') || lower.startsWith('uk')) return 'ru';
      if (lower.startsWith('en')) return 'en';
    }

    // Fallback: examine timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    if (tz.includes('shanghai') || tz.includes('beijing') || tz.includes('china') || tz.includes('taipei') || tz.includes('hong_kong')) {
      return 'zh';
    }
    if (tz.includes('istanbul') || tz.includes('turkey')) {
      return 'tr';
    }
    if (tz.includes('moscow') || tz.includes('almaty') || tz.includes('minsk') || tz.includes('tashkent') || tz.includes('bishkek')) {
      return 'ru';
    }
  } catch (e) {
    console.warn('Locale detection fallback:', e);
  }

  return 'ru'; // Default base language
}
