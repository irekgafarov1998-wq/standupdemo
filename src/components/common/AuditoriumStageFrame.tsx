import React, { useState, useEffect } from 'react';
import { soundEffects } from '../../utils/soundEffects';
import { Sparkles, Sun, Moon, Flame, Users, Volume2, VolumeX, Eye } from 'lucide-react';

export type StageLightingPreset = 'warm' | 'cellar' | 'jazz' | 'solo';

interface AuditoriumStageFrameProps {
  children?: React.ReactNode;
}

export const AuditoriumStageFrame: React.FC<AuditoriumStageFrameProps> = () => {
  const [lightingPreset, setLightingPreset] = useState<StageLightingPreset>('warm');
  const [isAudienceVisible, setIsAudienceVisible] = useState<boolean>(true);
  const [crowdHype, setCrowdHype] = useState<number>(85);
  const [recentReaction, setRecentReaction] = useState<string | null>(null);

  // Lighting cones style depending on selected preset
  const getLightPresetStyles = () => {
    switch (lightingPreset) {
      case 'cellar':
        return {
          leftSpot: 'from-amber-500/25 via-red-600/10 to-transparent',
          centerSpot: 'from-amber-400/30 via-rose-700/15 to-transparent',
          rightSpot: 'from-rose-500/25 via-amber-600/10 to-transparent',
          footlights: 'rgba(239, 68, 68, 0.45)',
          ambientTint: 'rgba(40, 5, 10, 0.25)'
        };
      case 'jazz':
        return {
          leftSpot: 'from-cyan-400/25 via-indigo-600/15 to-transparent',
          centerSpot: 'from-fuchsia-400/25 via-purple-700/15 to-transparent',
          rightSpot: 'from-blue-400/25 via-purple-600/10 to-transparent',
          footlights: 'rgba(168, 85, 247, 0.4)',
          ambientTint: 'rgba(15, 5, 30, 0.3)'
        };
      case 'solo':
        return {
          leftSpot: 'from-transparent to-transparent',
          centerSpot: 'from-yellow-100/40 via-amber-300/20 to-transparent',
          rightSpot: 'from-transparent to-transparent',
          footlights: 'rgba(251, 191, 36, 0.5)',
          ambientTint: 'rgba(0, 0, 0, 0.5)'
        };
      case 'warm':
      default:
        return {
          leftSpot: 'from-amber-400/20 via-orange-500/10 to-transparent',
          centerSpot: 'from-yellow-300/30 via-amber-500/15 to-transparent',
          rightSpot: 'from-amber-400/20 via-orange-500/10 to-transparent',
          footlights: 'rgba(245, 158, 11, 0.45)',
          ambientTint: 'rgba(30, 10, 5, 0.15)'
        };
    }
  };

  const presetStyle = getLightPresetStyles();

  const handleAudienceLaugh = () => {
    soundEffects.playRimshot();
    setCrowdHype(prev => Math.min(100, prev + 5));
    setRecentReaction('😂 Ха-ха-ха!');
    setTimeout(() => setRecentReaction(null), 2500);
  };

  const handleAudienceApplause = () => {
    soundEffects.playApplause();
    setCrowdHype(prev => Math.min(100, prev + 8));
    setRecentReaction('👏 Овации в зале!');
    setTimeout(() => setRecentReaction(null), 2500);
  };

  const handleMicTap = () => {
    soundEffects.playMicTap();
    setRecentReaction('🎤 Раз-два, чек!');
    setTimeout(() => setRecentReaction(null), 2000);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. TOP OVERHEAD THEATRE STAGE RIG & LIGHTING TRUSS             */}
      {/* ============================================================== */}
      <div className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex flex-col items-center">
        {/* Steel Stage Lighting Truss (Стальная ферма с прожекторами) */}
        <div className="w-full h-2.5 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-700/80 shadow-[0_4px_16px_rgba(0,0,0,0.95)] flex items-center justify-between px-8">
          <div className="flex gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 animate-ping" />
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
          </div>
          <div className="flex gap-8 opacity-40">
            <div className="w-8 h-1 bg-neutral-600 rounded" />
            <div className="w-8 h-1 bg-neutral-600 rounded" />
            <div className="w-8 h-1 bg-neutral-600 rounded" />
          </div>
          <div className="flex gap-4">
            <span className="w-1 h-1 rounded-full bg-emerald-400/60" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse" />
          </div>
        </div>

        {/* 6 Stage Spotlights (PAR Cans) Mounted on the Truss */}
        <div className="w-full max-w-6xl mx-auto flex items-start justify-between px-6 -mt-0.5">
          {/* Spotlight 1 (Left Far Angle) */}
          <div className="flex flex-col items-center group">
            <div className="w-3.5 h-3.5 rounded-b-md bg-neutral-950 border border-neutral-700 shadow-lg" />
            <div 
              className={`w-28 h-72 bg-gradient-to-b ${presetStyle.leftSpot} blur-2xl transform -rotate-12 origin-top pointer-events-none opacity-80 transition-all duration-700`}
            />
          </div>

          {/* Spotlight 2 (Left Mid Angle) */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-b-md bg-neutral-950 border border-neutral-700 shadow-lg" />
            <div 
              className={`w-36 h-80 bg-gradient-to-b ${presetStyle.leftSpot} blur-2xl transform -rotate-6 origin-top pointer-events-none opacity-85 transition-all duration-700`} 
            />
          </div>

          {/* Spotlight 3 & 4 (Central Stage Beams - Focused on the Standup Mic) */}
          <div className="flex flex-col items-center">
            <div className="w-5 h-4 rounded-b-md bg-neutral-900 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
            <div 
              className={`w-64 sm:w-80 h-96 bg-gradient-to-b ${presetStyle.centerSpot} blur-2xl origin-top pointer-events-none opacity-90 transition-all duration-700`}
            />
          </div>

          {/* Spotlight 5 (Right Mid Angle) */}
          <div className="hidden sm:flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-b-md bg-neutral-950 border border-neutral-700 shadow-lg" />
            <div 
              className={`w-36 h-80 bg-gradient-to-b ${presetStyle.rightSpot} blur-2xl transform rotate-6 origin-top pointer-events-none opacity-85 transition-all duration-700`} 
            />
          </div>

          {/* Spotlight 6 (Right Far Angle) */}
          <div className="flex flex-col items-center group">
            <div className="w-3.5 h-3.5 rounded-b-md bg-neutral-950 border border-neutral-700 shadow-lg" />
            <div 
              className={`w-28 h-72 bg-gradient-to-b ${presetStyle.rightSpot} blur-2xl transform rotate-12 origin-top pointer-events-none opacity-80 transition-all duration-700`} 
            />
          </div>
        </div>
      </div>

      {/* Ambient Lighting Overlay according to preset */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-colors duration-700" 
        style={{ backgroundColor: presetStyle.ambientTint }}
      />

      {/* ============================================================== */}
      {/* 2. THE AUDIENCE IN THE HALL (ЗРИТЕЛИ В ЗАЛЕ КЛУБА)             */}
      {/* Silhouettes of tables, audience spectators, cocktails & lamps  */}
      {/* ============================================================== */}
      {isAudienceVisible && (
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-20 select-none overflow-hidden">
          {/* Recent Reaction Speech Bubble floating up from the audience */}
          {recentReaction && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-neutral-950/95 border border-amber-400 text-amber-300 font-extrabold text-sm shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_20px_rgba(245,158,11,0.5)] animate-bounce backdrop-blur-md">
              {recentReaction}
            </div>
          )}

          {/* Realistic Silhouette of Comedy Club Tables & Audience Spectators */}
          <div className="relative w-full h-24 sm:h-28 flex items-end justify-between px-2 sm:px-6">
            
            {/* Table 1 (Left Table with 2 Spectators & Candle) */}
            <div className="relative flex items-end opacity-90 -mb-1 transform scale-90 sm:scale-100 origin-bottom-left">
              {/* Audience Member 1 (Left Profile Silhouette) */}
              <svg className="w-14 h-20 text-[#090204] -mr-3" viewBox="0 0 50 70" fill="currentColor">
                <circle cx="25" cy="18" r="12" />
                <path d="M10 70 C10 42, 14 36, 25 36 C36 36, 40 42, 40 70 Z" />
              </svg>
              
              {/* Cabaret Table with Glowing Candle */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Flickering Table Candle Flame */}
                <div className="w-2.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_16px_#f59e0b,0_0_30px_#ea580c] animate-pulse" />
                {/* Candle Glass Holder */}
                <div className="w-4 h-5 rounded-sm bg-neutral-900 border border-amber-500/40 opacity-80" />
                {/* Table Top */}
                <div className="w-20 h-3 rounded-full bg-[#070102] border-t border-amber-500/20 shadow-md" />
                {/* Table Leg */}
                <div className="w-2 h-7 bg-[#050001]" />
              </div>

              {/* Audience Member 2 (Listening & Laughing silhouette) */}
              <svg className="w-16 h-22 text-[#080103] -ml-2" viewBox="0 0 50 70" fill="currentColor">
                <circle cx="28" cy="16" r="13" />
                <path d="M8 70 C8 40, 16 34, 28 34 C40 34, 48 40, 48 70 Z" />
              </svg>
            </div>

            {/* Center Area: Stage Wooden Edge with Microphone Silhouette */}
            <div className="relative flex flex-col items-center opacity-85">
              {/* Vintage Standup Mic on Stage */}
              <div className="flex flex-col items-center -mb-2">
                {/* Chrome Shure 55 Mic Head */}
                <div className="w-5 h-7 rounded-t-lg bg-gradient-to-b from-neutral-400 via-neutral-300 to-neutral-700 border border-neutral-200/40 shadow-[0_0_12px_rgba(255,255,255,0.4)] flex items-center justify-center">
                  <div className="w-3 h-5 bg-neutral-900 rounded-sm opacity-60" />
                </div>
                {/* Mount Swivel & Stand Pole */}
                <div className="w-1.5 h-14 bg-gradient-to-r from-neutral-500 via-neutral-300 to-neutral-600 shadow" />
                {/* Cast Iron Heavy Round Base */}
                <div className="w-14 h-3 rounded-t-full bg-neutral-900 border-t border-neutral-600" />
              </div>

              {/* Stage Apron Footlights Bar (Световая рампа сцены) */}
              <div className="flex items-center gap-4 sm:gap-6 px-4 py-1 rounded-t-xl bg-[#120204]/90 border-t border-amber-500/40 shadow-[0_-4px_25px_rgba(245,158,11,0.3)]">
                {[1, 2, 3, 4, 5].map(idx => (
                  <div key={idx} className="flex flex-col items-center">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse" 
                      style={{ 
                        backgroundColor: presetStyle.footlights,
                        boxShadow: `0 0 8px ${presetStyle.footlights}`
                      }} 
                    />
                    <div className="w-3 h-1.5 bg-neutral-900 rounded-t" />
                  </div>
                ))}
              </div>
            </div>

            {/* Table 2 (Right Table with Clapping Spectators & Cocktail) */}
            <div className="relative flex items-end opacity-90 -mb-1 transform scale-90 sm:scale-100 origin-bottom-right">
              {/* Audience Member 3 (Clapping Hands Silhouette) */}
              <svg className="w-16 h-22 text-[#080103] -mr-3" viewBox="0 0 50 70" fill="currentColor">
                <circle cx="24" cy="17" r="12" />
                <path d="M6 70 C6 42, 14 35, 24 35 C34 35, 42 42, 42 70 Z" />
                {/* Clapping Hand silhouette */}
                <path d="M38 42 Q44 32, 42 48 Z" fill="#0c0205" />
              </svg>

              {/* Cabaret Table 2 with Glowing Amber Candle */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Candle Flame */}
                <div className="w-2.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_18px_#f59e0b,0_0_25px_#d97706] animate-pulse" />
                <div className="w-4 h-5 rounded-sm bg-neutral-900 border border-amber-500/40 opacity-80" />
                <div className="w-20 h-3 rounded-full bg-[#070102] border-t border-amber-500/20 shadow-md" />
                <div className="w-2 h-7 bg-[#050001]" />
              </div>

              {/* Audience Member 4 (Smiling Side Profile) */}
              <svg className="w-14 h-20 text-[#090204] -ml-2" viewBox="0 0 50 70" fill="currentColor">
                <circle cx="22" cy="18" r="12" />
                <path d="M8 70 C8 42, 12 36, 22 36 C32 36, 38 42, 38 70 Z" />
              </svg>
            </div>
          </div>

          {/* Wooden Stage Floor Decking Planks at the very bottom */}
          <div className="w-full h-3 bg-gradient-to-r from-[#170502] via-[#2d0e06] to-[#170502] border-t-2 border-amber-500/40 shadow-[0_-2px_10px_rgba(245,158,11,0.2)] flex items-center justify-around">
            <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_60px)]" />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. FLOATING AUDIENCE & LIGHTING CONTROLS DOCK (INTERACTIVE)     */}
      {/* ============================================================== */}
      <aside 
        aria-label="Управление зрительным залом"
        className="fixed bottom-3 left-4 z-40 select-none flex items-center gap-2"
      >
        <div className="no-stage-click flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#140205]/95 border border-rose-900/50 shadow-2xl backdrop-blur-xl text-neutral-200">
          
          {/* Quick Crowd Reaction Triggers */}
          <button
            onClick={handleAudienceLaugh}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition active:scale-95"
            title="Вызвать смех в зрительном зале"
          >
            <span>🤣</span>
            <span className="hidden sm:inline text-[11px]">Смех зала</span>
          </button>

          <button
            onClick={handleAudienceApplause}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition active:scale-95"
            title="Запустить овации зала"
          >
            <span>👏</span>
            <span className="hidden sm:inline text-[11px]">Овации</span>
          </button>

          <button
            onClick={handleMicTap}
            className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs transition active:scale-95"
            title="Чекнуть микрофон: Раз, два!"
          >
            🎤
          </button>

          <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

          {/* Lighting Mode Cycler */}
          <button
            onClick={() => {
              const presets: StageLightingPreset[] = ['warm', 'cellar', 'jazz', 'solo'];
              const nextIndex = (presets.indexOf(lightingPreset) + 1) % presets.length;
              setLightingPreset(presets[nextIndex]);
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-[11px] font-semibold text-neutral-300 border border-neutral-700/60 transition"
            title={`Сменить свет софитов (сейчас: ${lightingPreset})`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize hidden md:inline">
              {lightingPreset === 'warm' && 'Теплый софит'}
              {lightingPreset === 'cellar' && 'Подвал-неон'}
              {lightingPreset === 'jazz' && 'Джаз-клуб'}
              {lightingPreset === 'solo' && 'Соло-спот'}
            </span>
          </button>

          {/* Toggle Audience View */}
          <button
            onClick={() => setIsAudienceVisible(!isAudienceVisible)}
            className={`p-1.5 rounded-xl text-xs transition ${
              isAudienceVisible ? 'text-amber-400 bg-amber-500/10' : 'text-neutral-500 hover:text-neutral-300'
            }`}
            title={isAudienceVisible ? 'Скрыть силуэты зрительного зала' : 'Показать зрительный зал'}
          >
            <Users className="w-3.5 h-3.5" />
          </button>

          {/* Crowd Heat Gauge */}
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 text-[11px] font-bold text-neutral-300">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-amber-400 font-mono">{crowdHype}%</span>
          </div>
        </div>
      </aside>
    </>
  );
};
