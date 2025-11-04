
import React, { useState, useCallback } from 'react';
import { UserProfile, LearningPath, AppState } from './types';
import { generateLearningPath } from './services/geminiService';
import OnboardingWizard from './components/OnboardingWizard';
import Dashboard from './components/Dashboard';
import { RocketIcon } from './components/icons/RocketIcon';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOnboardingComplete = useCallback(async (profile: UserProfile) => {
    setUserProfile(profile);
    setAppState('loading');
    setError(null);
    try {
      const path = await generateLearningPath(profile);
      // Add unique IDs to tasks and modules for key prop and state management
      const pathWithIds = {
        ...path,
        modules: path.modules.map((mod, modIndex) => ({
          ...mod,
          id: `mod-${modIndex}-${Date.now()}`,
          tasks: mod.tasks.map((task, taskIndex) => ({
            ...task,
            id: `task-${modIndex}-${taskIndex}-${Date.now()}`,
            completed: false,
            priority: false,
          }))
        }))
      };
      setLearningPath(pathWithIds);
      setAppState('dashboard');
    } catch (err) {
      console.error('Failed to generate learning path:', err);
      setError('Failed to generate your personalized learning path. The AI might be busy. Please try again later.');
      setAppState('error');
    }
  }, []);

  const resetApp = () => {
    setAppState('onboarding');
    setUserProfile(null);
    setLearningPath(null);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'onboarding':
        return <OnboardingWizard onComplete={handleOnboardingComplete} />;
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
            <RocketIcon className="w-20 h-20 text-brand-secondary animate-pulse" />
            <h2 className="mt-6 text-2xl font-bold text-gray-200">Crafting Your Learning Universe...</h2>
            <p className="mt-2 text-gray-400">Our AI is designing a personalized path just for you!</p>
          </div>
        );
      case 'dashboard':
        if (userProfile && learningPath) {
          return <Dashboard userProfile={userProfile} initialLearningPath={learningPath} onReset={resetApp} />;
        }
        return null;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-red-400">Oops! Something went wrong.</h2>
            <p className="mt-2 text-gray-400 max-w-md">{error}</p>
            <button
              onClick={resetApp}
              className="mt-6 px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Start Over
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 lg:p-8">
      {renderContent()}
    </div>
  );
};

export default App;