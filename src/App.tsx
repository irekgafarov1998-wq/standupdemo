/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StandupProvider, useStandup } from './context/StandupContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { Navbar } from './components/Navbar';
import { JokeVault } from './components/jokes/JokeVault';
import { Notebook } from './components/notebook/Notebook';
import { SetlistManager } from './components/setlists/SetlistManager';
import { StageMode } from './components/setlists/StageMode';
import { VideoReelsEditor } from './components/video/VideoReelsEditor';
import { StandupCameraStudio } from './components/camera/StandupCameraStudio';
import { AudioAnalyzer } from './components/recorder/AudioAnalyzer';
import { GigCalendar } from './components/calendar/GigCalendar';
import { ComedyRiffRoom } from './components/riffs/ComedyRiffRoom';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { StageAtmosphere } from './components/common/StageAtmosphere';
import { AuditoriumStageFrame } from './components/common/AuditoriumStageFrame';
import { DemoTesterBanner } from './components/common/DemoTesterBanner';
import { DemoFeedbackModal } from './components/common/DemoFeedbackModal';

const MainContent: React.FC = () => {
  const { 
    activeTab, activeStageSetlist, exitStageMode, 
    isProModalOpen, closeProModal, proModalReason 
  } = useStandup();

  return (
    <div className="min-h-screen stage-curtains-bg text-neutral-100 flex flex-col font-sans relative pb-16 sm:pb-20">
      {/* Test / Demo Mode Header for external users */}
      <DemoTesterBanner />

      {/* Full Comedy Club Auditorium View: Stage Truss, PAR Spotlights, Audience Silhouettes & Footlights */}
      <AuditoriumStageFrame />

      {/* Interactive Stage Click Feedback & Spotlight Follower */}
      <StageAtmosphere />

      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'jokes' && <JokeVault />}
        {activeTab === 'riffs' && <ComedyRiffRoom />}
        {activeTab === 'notebook' && <Notebook />}
        {activeTab === 'setlists' && <SetlistManager />}
        {activeTab === 'camera' && <StandupCameraStudio />}
        {activeTab === 'video' && <VideoReelsEditor />}
        {activeTab === 'recorder' && <AudioAnalyzer />}
        {activeTab === 'calendar' && <GigCalendar />}
      </main>

      {/* Fullscreen Stage Mode */}
      {activeStageSetlist && (
        <StageMode
          setlist={activeStageSetlist}
          onExit={exitStageMode}
        />
      )}

      {/* Subscription Modal (250 RUB / 6 months) */}
      <SubscriptionModal
        isOpen={isProModalOpen}
        onClose={closeProModal}
        reason={proModalReason}
      />

      {/* Tester Feedback Modal */}
      <DemoFeedbackModal />

      {/* Footer */}
      <footer className="border-t border-rose-950/40 bg-[#130204]/80 backdrop-blur-md py-6 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            StandupLab — профессиональный органайзер для стендап-комиков
          </p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>🎤 База шуток</span>
            <span>•</span>
            <span>🤖 AI Reels</span>
            <span>•</span>
            <span>📍 Яндекс Карты</span>
            <span>•</span>
            <span>📄 Тезисный PDF</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <StandupProvider>
        <MainContent />
      </StandupProvider>
    </LanguageProvider>
  );
}
