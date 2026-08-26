import React, { useState, useEffect } from 'react';
import { useHitStorage } from './hooks/useHitStorage';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { WorkoutRunner } from './components/workout/WorkoutRunner';
import { ProgramBuilder } from './components/builder/ProgramBuilder';
import { FloatingAIChat } from './components/ai/FloatingAIChat';
import { OverloadAndStats } from './components/stats/OverloadAndStats';
import { HistoryAndAnalytics } from './components/history/HistoryAndAnalytics';
import { ProfileAndRules } from './components/profile/ProfileAndRules';
import { OnboardingModal } from './components/OnboardingModal';
import { SignInPage } from './components/auth/SignInPage';

export function App() {
  const { user } = useAuth();
  const storage = useHitStorage(user ? { id: user.id, name: user.name } : null);
  const [activeTab, setActiveTab] = useState<TabType>('runner');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    const hasSeenOnboarding = localStorage.getItem('hit_seen_onboarding_v2');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem('hit_seen_onboarding_v2', 'true');
    }
  }, [user]);

  if (!user) {
    // AUTH_DISABLED for dev — bypass gate, remove this to re-enable
    // return <SignInPage />;
  }

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
      {(activeTab === 'runner' || activeTab === 'builder') && <FloatingAIChat storage={storage} />}
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
