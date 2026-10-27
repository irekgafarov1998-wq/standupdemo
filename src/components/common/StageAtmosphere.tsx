import React, { useEffect, useState, useRef } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
  phrase: string;
  icon: string;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

const COMEDY_PUNCHES = [
  { phrase: '💥 Панчлайн!', icon: '💥', color: 'text-amber-300' },
  { phrase: '🎤 Сетап зашел!', icon: '🎤', color: 'text-rose-300' },
  { phrase: '👏 Овация в зале!', icon: '👏', color: 'text-yellow-400' },
  { phrase: '🥁 Ба-дум-тсс!', icon: '🥁', color: 'text-amber-400' },
  { phrase: '🔥 Разрыв зала!', icon: '🔥', color: 'text-orange-400' },
  { phrase: '✨ Четкая добивка!', icon: '✨', color: 'text-yellow-300' },
  { phrase: '🎙️ На микрофоне!', icon: '🎙️', color: 'text-rose-400' },
  { phrase: '⚡ Импровиз!', icon: '⚡', color: 'text-sky-300' },
  { phrase: '🎯 В яблочко!', icon: '🎯', color: 'text-emerald-300' },
  { phrase: '🔥 Разгон мысли!', icon: '💡', color: 'text-amber-300' },
  { phrase: '📝 Записано в бит!', icon: '📝', color: 'text-purple-300' },
  { phrase: '🎭 Чистый стендап!', icon: '🎭', color: 'text-rose-300' }
];

export const StageAtmosphere: React.FC = () => {
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.isMuted());
  const [crowdHype, setCrowdHype] = useState<number>(75);
  const [punchCount, setPunchCount] = useState<number>(12);
  const [showSoundboard, setShowSoundboard] = useState<boolean>(false);

  const nextId = useRef(0);

  // Toggle sound
  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const handlePlayRimshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playRimshot();
    setCrowdHype(prev => Math.min(100, prev + 5));
  };

  const handlePlayMicTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playMicTap();
  };

  const handlePlayApplause = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playApplause();
    setCrowdHype(prev => Math.min(100, prev + 10));
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Skip text typing fields so user can type freely without distracting popups
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable ||
        target.closest('.no-stage-click')
      ) {
        return;
      }

      // Generate comic punch cue
      const punch = COMEDY_PUNCHES[Math.floor(Math.random() * COMEDY_PUNCHES.length)];
      const id = nextId.current++;

      const newRipple: ClickRipple = {
        id,
        x: e.clientX,
        y: e.clientY,
        phrase: punch.phrase,
        icon: punch.icon,
        color: punch.color
      };

      // Audio on action clicks removed as requested

      // Generate 5 golden sparks radiating outwards
      const sparkColors = ['#f59e0b', '#fbbf24', '#f43f5e', '#ffffff'];
      const newParticles: Particle[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 + (Math.random() - 0.5) * 0.5;
        const speed = 25 + Math.random() * 30;
        newParticles.push({
          id: nextId.current++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 3 + Math.random() * 3,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)]
        });
      }

      setRipples(prev => [...prev.slice(-3), newRipple]);
      setParticles(prev => [...prev.slice(-10), ...newParticles]);
      setPunchCount(prev => prev + 1);
      setCrowdHype(prev => Math.min(100, prev + 1));

      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 950);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
      }, 700);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <>
      {/* ============================================================== */}
      {/* PROFESSIONAL THEATRE STAGE ARCHITECTURE & DECOR                */}
      {/* ============================================================== */}
      
      {/* 1. Top Theatrical Stage Valance / Pelmet (Ламбрекен театра с золотой окантовкой) */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 h-3 flex items-center justify-between overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.9)]">
        <div className="w-full h-full bg-gradient-to-r from-[#3b040a] via-[#991122] to-[#3b040a] border-b-2 border-amber-400/80 shadow-[0_2px_10px_rgba(251,191,36,0.5)] opacity-90" />
      </div>

      {/* 2. Vintage Retro Microphone Standup Silhouette Watermark in Stage Center */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-[0.035] select-none overflow-hidden">
        <svg 
          viewBox="0 0 24 24" 
          className="w-[580px] h-[580px] text-amber-200"
          fill="currentColor"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm5 10a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-2.08A7 7 0 0 0 19 12h-2z"/>
        </svg>
      </div>

      {/* 3. Subtle Atmospheric Stage Dust Motes floating in spotlight */}
      <div className="pointer-events-none fixed inset-0 z-1 overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-300 blur-[0.5px] animate-pulse" />
        <div className="absolute top-1/3 left-1/2 w-2 h-2 rounded-full bg-amber-200/60 blur-[1px] animate-ping" />
        <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-rose-300 blur-[0.5px] animate-pulse" />
        <div className="absolute top-2/3 left-1/4 w-2 h-2 rounded-full bg-amber-100/50 blur-[1px]" />
      </div>

      {/* ============================================================== */}
      {/* INTERACTIVE CLICK FEEDBACK: SPOTLIGHT, PUNCH CUES & SPARKS     */}
      {/* ============================================================== */}
      <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
        {/* Click Spotlight Halo */}
        {ripples.map(r => (
          <div
            key={r.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
            style={{ left: r.x, top: r.y }}
          >
            {/* Theatrical Spotlight ring expanding */}
            <div className="w-32 h-32 rounded-full bg-radial from-amber-300/30 via-rose-500/20 to-transparent animate-ping" />

            {/* Comedian Punch Bubble with 3D stage styling */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 flex items-center gap-1.5 px-3 py-1 bg-[#1c0205]/95 backdrop-blur-md border border-amber-400/80 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.9),0_0_12px_rgba(245,158,11,0.5)] animate-bounce whitespace-nowrap">
              <span className="text-sm">{r.icon}</span>
              <span className={`text-xs font-black tracking-wide ${r.color} drop-shadow-[0_1px_4px_rgba(0,0,0,1)]`}>
                {r.phrase}
              </span>
            </div>
          </div>
        ))}

        {/* Micro Stage Sparks */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none transition-all duration-700 ease-out"
            style={{
              left: p.x + p.vx,
              top: p.y + p.vy,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
              opacity: 0.9
            }}
          />
        ))}
      </div>

      {/* ============================================================== */}
      {/* STANDUP STAGE SOUNDBOARD & CROWD HYPE FLOATING WIDGET           */}
      {/* ============================================================== */}
      <aside 
        aria-label="Стендап атмосфера"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 select-none"
      >
        {/* Soundboard expandable panel */}
        {showSoundboard && (
          <div className="no-stage-click flex items-center gap-2 p-2 rounded-2xl bg-[#1a0205]/95 border border-rose-900/60 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Quick soundboard action buttons */}
            <button
              onClick={handlePlayRimshot}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition active:scale-95"
              title="Сыграть комедийную отбивку 'Ба-дум-тсс!'"
            >
              <span>🥁</span>
              <span>Ба-дум-тсс!</span>
            </button>

            <button
              onClick={handlePlayMicTap}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition active:scale-95"
              title="Проверить микрофон: 'Раз, два!'"
            >
              <span>🎤</span>
              <span>Чек микро</span>
            </button>

            <button
              onClick={handlePlayApplause}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/40 text-xs font-bold transition active:scale-95"
              title="Запустить овации зала"
            >
              <span>👏</span>
              <span>Овации</span>
            </button>

            <div className="h-5 w-[1px] bg-rose-950/60 mx-1" />

            {/* Crowd Warmth / Stage Heat Gauge */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-xl text-[11px] font-bold text-neutral-300">
              <span className="text-orange-400">🔥</span>
              <span>Зал:</span>
              <span className="text-amber-400 font-mono">{crowdHype}%</span>
            </div>
          </div>
        )}

        {/* Master Sound & Stage Feedback Toggle Button */}
        <div className="no-stage-click flex items-center bg-[#180205]/95 p-1 rounded-2xl border border-rose-900/60 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => setShowSoundboard(!showSoundboard)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
              showSoundboard 
                ? 'bg-rose-900/60 text-white border border-rose-700/50' 
                : 'text-amber-300 hover:bg-rose-950/50'
            }`}
            title="Открыть стендап-саундборд (отбивки, чек микро, овации)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="hidden sm:inline font-mono text-[11px] font-extrabold">Сцена</span>
          </button>

          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl text-xs font-bold transition ${
              isMuted
                ? 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/40'
                : 'text-amber-400 hover:bg-amber-500/20'
            }`}
            title={isMuted ? 'Включить сценические звуки' : 'Отключить звук (беззвучный режим)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
};
