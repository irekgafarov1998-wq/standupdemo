import React from 'react';
import { ActiveTab } from '../../context/StandupContext';
import { 
  Mic, Flame, BookOpen, ListOrdered, Camera, Video, 
  Activity, Calendar, Sparkles, Radio, Film, Volume2, 
  FileText, Award, Clock, Hash, Zap
} from 'lucide-react';

interface StandupSectionBannerProps {
  tab: ActiveTab;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const StandupSectionBanner: React.FC<StandupSectionBannerProps> = ({
  tab,
  title,
  subtitle,
  actions
}) => {
  switch (tab) {
    // -------------------------------------------------------------
    // 1. JOKES: COMEDY CELLAR RED BRICK WALL & VINTAGE NEON SIGN
    // -------------------------------------------------------------
    case 'jokes':
      return (
        <div className="standup-brick-wall rounded-3xl p-6 sm:p-7 border-2 border-red-950/80 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.08)] relative overflow-hidden mb-6">
          {/* Subtle neon glow reflections in top corners */}
          <div className="absolute top-0 right-10 w-64 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-48 h-24 bg-rose-600/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              {/* Standup Comedy Club Vintage Neon Badge */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b0306] border border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-300 neon-glow-amber">
                    COMEDY CELLAR · СТЕНДАП КЛУБ
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-950/60 border border-red-800/40 text-[11px] font-mono text-rose-300">
                  <Mic className="w-3.5 h-3.5 text-rose-400" />
                  <span>КРАСНЫЙ КИРПИЧ & НЕОН</span>
                </div>
              </div>

              {/* Header Title with Neon Tube Typography */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-100 tracking-tight flex items-center gap-3">
                <span>{title || 'База шуток и комедийных битов'}</span>
                <span className="text-xl sm:text-2xl drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">🎙️</span>
              </h1>
              <p className="text-sm text-neutral-300/90 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Каталог авторских шуток: сетапы, панчлайны, добивки, тайминги и рейтинги успешности на живой публике.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // 2. RIFFS: BACKSTAGE GREEN ROOM & LATE-NIGHT WRITERS LOUNGE
    // -------------------------------------------------------------
    case 'riffs':
      return (
        <div className="standup-green-room rounded-3xl p-6 sm:p-7 border-2 border-emerald-950/80 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(52,211,153,0.15)] relative overflow-hidden mb-6">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#021f14] border border-emerald-400/70 shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-300 neon-glow-emerald">
                    BACKSTAGE GREEN ROOM · АВТОРСКИЙ СБОР
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono text-emerald-300">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>НОЧНЫЕ РАЗГОНЫ & ИИ-СОАВТОР</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{title || 'Комната Комедийных Разгонов'}</span>
                <span className="text-xl sm:text-2xl">☕💡</span>
              </h1>
              <p className="text-sm text-neutral-300/90 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Гримерка комиков: разгоняйте идеи в реальном времени с ИИ-персонами, эскалируйте абсурд и перекидывайте добивки в базу.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // 3. NOTEBOOK: COMEDIAN'S MOLESKINE & YELLOW LEGAL PAD NOTEBOOK
    // -------------------------------------------------------------
    case 'notebook':
      return (
        <div className="standup-legal-pad rounded-3xl p-6 sm:p-7 border-2 border-amber-900/60 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(245,158,11,0.1)] relative overflow-hidden mb-6">
          <div className="absolute top-2 right-4 flex items-center gap-2 opacity-50 font-mono text-[11px] text-amber-400">
            <span>MOLESKINE BIT-BOOK · RULING: 7mm</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10 pl-6 sm:pl-8">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#251e10] border border-amber-500/70 shadow-[0_2px_10px_rgba(245,158,11,0.25)]">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                    ЧЕРНОВИК КОМИКА · LEGAL PAD
                  </span>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">
                  ПРАВИЛО ТРЁХ · СЕТАП · КОНТРАСТ
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-100 font-serif tracking-tight flex items-center gap-3">
                <span>{title || 'Блокнот автора & Стендап-формулы'}</span>
                <span className="text-xl sm:text-2xl">🖋️📜</span>
              </h1>
              <p className="text-sm text-amber-200/80 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Классический карманный блокнот: быстрые заметки, проверка комедийных приемов и генератор тем для новых битов.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // 4. SETLISTS: STAGE FLOOR GAFFER TAPE & CUE PROMPTER
    // -------------------------------------------------------------
    case 'setlists':
      return (
        <div className="standup-gaffer-tape rounded-3xl p-6 sm:p-7 border-2 border-neutral-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.1)] relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1a1c24] border-x-4 border-amber-400 gaffer-tape-strip">
                  <ListOrdered className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono font-black uppercase tracking-widest text-neutral-100">
                    STAGE FLOOR GAFFER TAPE · СЕТ-ЛИСТЫ
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-black/60 border border-neutral-700 text-[11px] font-mono text-emerald-400">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>STAGE TIMER READY</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-3">
                <span>{title || 'Конструктор сет-листов на сцену'}</span>
                <span className="text-xl sm:text-2xl">📋⏱️</span>
              </h1>
              <p className="text-sm text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Сформируйте идеальный тайминг выступления: открывашка, середина, кульминация и режим сценического суфлера.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // 5. CAMERA: PRODUCTION TV BROADCAST HUD & 4K TALLY LIGHT
    // -------------------------------------------------------------
    case 'camera':
      return (
        <div className="standup-tv-studio rounded-3xl p-6 sm:p-7 border-2 border-red-900/60 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.08)] relative overflow-hidden mb-6">
          {/* Viewfinder corner brackets decorative */}
          <div className="absolute top-3 left-4 w-4 h-4 border-t-2 border-l-2 border-red-500/70" />
          <div className="absolute top-3 right-4 w-4 h-4 border-t-2 border-r-2 border-red-500/70" />
          <div className="absolute bottom-3 left-4 w-4 h-4 border-b-2 border-l-2 border-red-500/70" />
          <div className="absolute bottom-3 right-4 w-4 h-4 border-b-2 border-r-2 border-red-500/70" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.5)]">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-red-200">
                    LIVE TALLY · 4K COMEDY SPECIAL
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-black/60 border border-neutral-700 text-[11px] font-mono text-neutral-300">
                  ISO 800 · 24FPS · 16:9 / 9:16 HUD
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{title || 'Студия съемки со сценическим суфлером'}</span>
                <span className="text-xl sm:text-2xl">🎬🎥</span>
              </h1>
              <p className="text-sm text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Записывайте видео своих выступлений прямо на устройство со сценическими фильтрами («Софит», «Нуар», «VHS 90-х») и плавающим суфлером.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // 6. VIDEO: VIRAL REELS & TIKTOK PUNCHLINE STUDIO
    // -------------------------------------------------------------
    case 'video':
      return (
        <div className="standup-reels-studio rounded-3xl p-6 sm:p-7 border-2 border-pink-900/60 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(236,72,153,0.15)] relative overflow-hidden mb-6">
          <div className="absolute top-0 right-10 w-64 h-32 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1b0324] border border-pink-500/70 shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-pink-300">
                    VIRAL REELS & SHORTS · PUNCHLINE CUTTER
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-[11px] font-mono text-cyan-300">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>KINETIC SUBTITLES · 9:16</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{title || 'Редактор Reels, Shorts и клипов'}</span>
                <span className="text-xl sm:text-2xl">🔥📱</span>
              </h1>
              <p className="text-sm text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Нарезайте сочные моменты и панчлайны из полных сетов: вертикальный кроп, яркие караоке-субтитры и мгновенный экспорт.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // 7. RECORDER: FOH SOUND MIXING DESK & LAUGH-O-METER
    // -------------------------------------------------------------
    case 'recorder':
      return (
        <div className="standup-sound-console rounded-3xl p-6 sm:p-7 border-2 border-neutral-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.08)] relative overflow-hidden mb-6">
          {/* Rack screws visual accents */}
          <div className="absolute top-3 left-3 w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-500 shadow flex items-center justify-center text-[7px] text-neutral-900 font-mono">
            +
          </div>
          <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-neutral-700 border border-neutral-500 shadow flex items-center justify-center text-[7px] text-neutral-900 font-mono">
            +
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#161920] border border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-amber-300">
                    FOH SOUND CONSOLE · LAUGH-O-METER
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-black/60 border border-neutral-700 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>DECIBEL PEAK MONITOR</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-3">
                <span>{title || 'Звуковой пульт: Диктофон & Анализ смеха'}</span>
                <span className="text-xl sm:text-2xl">🎚️🎙️</span>
              </h1>
              <p className="text-sm text-neutral-300 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Записывайте живые выступления из зала, расставляйте метки удач и провалов в реальном времени и анализируйте смех публики.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    // -------------------------------------------------------------
    // 8. CALENDAR: BROADWAY MARQUEE LIGHTBOX & GIG BILLBOARD
    // -------------------------------------------------------------
    case 'calendar':
      return (
        <div className="standup-marquee-billboard rounded-3xl p-6 sm:p-7 border-2 border-amber-600/70 shadow-[0_15px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(251,191,36,0.2)] relative overflow-hidden mb-6">
          {/* Top Marquee Chaser Bulbs Row */}
          <div className="absolute top-1.5 left-4 right-4 flex items-center justify-between pointer-events-none opacity-80">
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full bg-amber-300 ${i % 2 === 0 ? 'marquee-bulb-odd' : 'marquee-bulb-even'}`} 
              />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10 pt-2">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#261304] border border-amber-400/80 shadow-[0_0_16px_rgba(245,158,11,0.5)]">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-200 neon-glow-amber">
                    LIVE MARQUEE BILLBOARD · ТУР И АФИША
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/40 text-[11px] font-mono text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>ON TOUR & OPEN MICS</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-100 tracking-tight flex items-center gap-3">
                <span>{title || 'Афиша выступлений, открытых микрофонов и гастролей'}</span>
                <span className="text-xl sm:text-2xl">🎫🏙️</span>
              </h1>
              <p className="text-sm text-neutral-300/90 mt-1.5 max-w-2xl leading-relaxed">
                {subtitle || 'Расписание концертов: города, площадки с картой, привязка сет-листов, расчет дороги и трекер гонораров.'}
              </p>
            </div>

            {actions && (
              <div className="flex items-center gap-3 shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
};
