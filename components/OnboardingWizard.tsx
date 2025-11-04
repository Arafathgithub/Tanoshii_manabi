import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, CompetencyLevel, CareerGuidance, AIProvider } from '../types';
import { INTERESTS_OPTIONS, COMPETENCY_LEVELS, GOAL_TEMPLATES } from '../constants';
import { generateCareerGuidance } from '../services/aiService';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { GoogleIcon } from './icons/GoogleIcon';
import { AzureIcon } from './icons/AzureIcon';


interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [competency, setCompetency] = useState<CompetencyLevel>(CompetencyLevel.BEGINNER);
  const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
  const [careerGuidance, setCareerGuidance] = useState<CareerGuidance | null>(null);
  const [isGuidanceLoading, setIsGuidanceLoading] = useState(false);
  const [guidanceError, setGuidanceError] = useState<string | null>(null);
  const [goal, setGoal] = useState('');
  const [goalSelectionMode, setGoalSelectionMode] = useState<'template' | 'custom'>('template');

  useEffect(() => {
    if (step === 4 && !careerGuidance && interests.length > 0) {
      const fetchGuidance = async () => {
        setIsGuidanceLoading(true);
        setGuidanceError(null);
        try {
          const guidance = await generateCareerGuidance({ name, interests, competency, goal, aiProvider });
          setCareerGuidance(guidance);
        } catch (error) {
          console.error("Failed to get career guidance:", error);
          setGuidanceError("Couldn't generate suggestions right now. You can still proceed to set a custom goal!");
        } finally {
          setIsGuidanceLoading(false);
        }
      };
      fetchGuidance();
    }
  }, [step, name, interests, competency, goal, aiProvider, careerGuidance]);

  const suggestedGoals = useMemo(() => {
    const goals = new Set<string>();
    interests.forEach(interest => {
      if (GOAL_TEMPLATES[interest]) {
        GOAL_TEMPLATES[interest].forEach(g => goals.add(g));
      }
    });
    // Add default goals and ensure they are unique
    GOAL_TEMPLATES['default'].forEach(g => goals.add(g));
    
    // If no interests were selected, just show default goals
    if (interests.length === 0) {
        return GOAL_TEMPLATES['default'];
    }

    return Array.from(goals);
  }, [interests]);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal.trim()) {
      onComplete({ name, interests, competency, goal, aiProvider });
    }
  };

  const isNextDisabled = (): boolean => {
    if (step === 1 && !name.trim()) return true;
    if (step === 2 && interests.length === 0) return true;
    if (step === 4 && isGuidanceLoading) return true;
    return false;
  };
  
  const ProgressBar = () => (
    <div className="w-full bg-gray-700 rounded-full h-2.5 mb-8">
      <div
        className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2.5 rounded-full transition-all duration-500"
        style={{ width: `${(step / 5) * 100}%` }}
      ></div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-2xl p-8 animate-fade-in">
        <ProgressBar />
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="animate-slide-in">
              <h2 className="text-3xl font-bold mb-2 text-white">Welcome to LearnSphere!</h2>
              <p className="text-gray-400 mb-6">Let's start by getting to know you. What should we call you?</p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
                autoFocus
              />
            </div>
          )}
          {step === 2 && (
            <div className="animate-slide-in">
              <h2 className="text-3xl font-bold mb-2 text-white">What are your interests?</h2>
              <p className="text-gray-400 mb-6">Select a few topics you're curious about. (Choose at least one)</p>
              <div className="flex flex-wrap gap-3">
                {INTERESTS_OPTIONS.map(interest => (
                  <button
                    type="button"
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                      interests.includes(interest)
                        ? 'bg-brand-primary text-white ring-2 ring-brand-secondary'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="animate-slide-in">
              <h2 className="text-3xl font-bold mb-2 text-white">Tailor Your Experience</h2>
              <p className="text-gray-400 mb-6">First, what's your current skill level in these topics?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {COMPETENCY_LEVELS.map(level => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => setCompetency(level)}
                    className={`p-6 rounded-lg text-center transition-all duration-200 ${
                      competency === level
                        ? 'bg-brand-primary text-white ring-2 ring-brand-secondary'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-lg font-semibold">{level}</span>
                  </button>
                ))}
              </div>
              <p className="text-gray-400 mt-10 mb-4">Next, choose the AI engine to power your learning path.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                      aiProvider === 'gemini'
                        ? 'bg-brand-primary text-white ring-2 ring-brand-secondary'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <GoogleIcon className="w-6 h-6" />
                    <span className="text-lg font-semibold">Google Gemini</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAiProvider('azure')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-lg transition-all duration-200 ${
                        aiProvider === 'azure'
                          ? 'bg-blue-600 text-white ring-2 ring-blue-500'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <AzureIcon className="w-6 h-6" />
                    <span className="text-lg font-semibold">Azure OpenAI</span>
                  </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="animate-slide-in">
              <h2 className="text-3xl font-bold mb-2 text-white">Let's Sharpen Your Focus</h2>
              <p className="text-gray-400 mb-6">Based on your interests in <span className="font-semibold text-brand-secondary">{interests.join(', ')}</span>, here are some AI-powered suggestions.</p>
              
              {isGuidanceLoading && (
                <div className="flex flex-col justify-center items-center h-64">
                    <div className="w-12 h-12 rounded-full animate-spin border-4 border-dashed border-brand-primary border-t-transparent"></div>
                    <p className="mt-4 text-gray-400">Generating ideas...</p>
                </div>
              )}

              {guidanceError && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
                      {guidanceError}
                  </div>
              )}

              {careerGuidance && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="flex items-center gap-3 text-xl font-semibold mb-4 text-white">
                      <LightBulbIcon className="w-7 h-7 text-yellow-400" />
                      Areas of Focus
                    </h3>
                    <div className="space-y-4">
                      {careerGuidance.areasOfFocus.map(area => (
                        <div key={area.title} className="bg-gray-700 p-4 rounded-lg shadow-md">
                          <h4 className="font-semibold text-gray-100">{area.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{area.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-3 text-xl font-semibold mb-4 text-white">
                      <BriefcaseIcon className="w-7 h-7 text-blue-400" />
                      Potential Roles
                    </h3>
                    <div className="space-y-4">
                      {careerGuidance.potentialRoles.map(role => (
                        <div key={role.title} className="bg-gray-700 p-4 rounded-lg shadow-md">
                          <h4 className="font-semibold text-gray-100">{role.title}</h4>
                          <p className="text-sm text-gray-400 mt-1">{role.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {step === 5 && (
             <div className="animate-slide-in">
              <h2 className="text-3xl font-bold mb-2 text-white">What's your main learning goal?</h2>
              <p className="text-gray-400 mb-6">Select a template or write your own. Be specific for the best results!</p>
              
              <div className="flex border-b border-gray-600 mb-4">
                <button 
                  type="button" 
                  onClick={() => setGoalSelectionMode('template')}
                  className={`px-4 py-2 font-semibold ${goalSelectionMode === 'template' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}
                >
                  Templates
                </button>
                <button 
                  type="button" 
                  onClick={() => setGoalSelectionMode('custom')}
                  className={`px-4 py-2 font-semibold ${goalSelectionMode === 'custom' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}
                >
                  Custom
                </button>
              </div>

              {goalSelectionMode === 'template' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2">
                  {suggestedGoals.map((g, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setGoal(g)}
                      className={`p-3 rounded-lg text-left text-sm transition-all duration-200 ${
                        goal === g
                          ? 'bg-brand-primary/20 text-white ring-2 ring-brand-primary'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder='e.g., "Build a full-stack e-commerce site" or "Understand neural networks."'
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg h-32 resize-none focus:ring-2 focus:ring-brand-primary focus:outline-none"
                  autoFocus
                />
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">
                Back
              </button>
            ) : <div />}
            {step < 5 ? (
              <button type="button" onClick={handleNext} disabled={isNextDisabled()} className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                Next
              </button>
            ) : (
              <button type="submit" disabled={!goal.trim()} className="px-6 py-2 bg-brand-accent text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:bg-gray-500 disabled:cursor-not-allowed">
                Generate My Path!
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingWizard;
