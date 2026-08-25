import React, { useState, useEffect } from 'react';
import { useHitStorage } from './hooks/useHitStorage';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { WorkoutRunner } from './components/workout/WorkoutRunner';
import { ProgramBuilder } from './components/builder/ProgramBuilder';
import { OverloadAndStats } from './components/stats/OverloadAndStats';
import { HistoryAndAnalytics } from './components/history/HistoryAndAnalytics';
import { ProfileAndRules } from './components/profile/ProfileAndRules';
import { OnboardingModal } from './components/OnboardingModal';

export function App() {
  const storage = useHitStorage();
  const [activeTab, setActiveTab] = useState<TabType>('runner');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hit_seen_onboarding_v2');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem('hit_seen_onboarding_v2', 'true');
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Header
        unitPreference={storage.unitPreference}
        setUnitPreference={storage.setUnitPreference}
        editModeLocked={storage.editModeLocked}
        toggleEditModeLock={storage.toggleEditModeLock}
        soundEnabled={storage.soundEnabled}
        toggleSound={storage.toggleSound}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenRules={() => setShowOnboarding(true)}
        profiles={storage.profiles}
        activeProfileId={storage.activeProfileId}
        switchProfile={storage.switchProfile}
      />
      <main className="flex-1">
        {activeTab === 'runner' && <WorkoutRunner storage={storage} />}
        {activeTab === 'builder' && <ProgramBuilder storage={storage} />}
        {activeTab === 'stats' && <OverloadAndStats storage={storage} />}
        {activeTab === 'history' && <HistoryAndAnalytics storage={storage} />}
        {activeTab === 'profile' && <ProfileAndRules storage={storage} />}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      {showOnboarding && (
        <OnboardingModal
          userProfile={storage.userProfile}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
export default App;
