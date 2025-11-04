import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile, LearningPath, LearningModule, LearningTask, ChatMessage } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { FlagIcon } from './icons/FlagIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import ChatBot from './ChatBot';
import { generateChatResponse } from '../services/aiService';
import TaskDetailModal from './TaskDetailModal';
import { FireIcon } from './icons/FireIcon';


interface DashboardProps {
  userProfile: UserProfile;
  initialLearningPath: LearningPath;
  onReset: () => void;
}

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-gray-700 rounded-full h-4">
    <div
      className="bg-gradient-to-r from-brand-primary to-brand-secondary h-4 rounded-full transition-all duration-500 text-center text-xs font-medium text-white leading-4"
      style={{ width: `${value}%` }}
    >
      {value.toFixed(0)}%
    </div>
  </div>
);

const UserProfileCard: React.FC<{ userProfile: UserProfile; currentXp: number; totalXp: number; streak: number; onReset: () => void; }> = ({ userProfile, currentXp, totalXp, streak, onReset }) => {
  const level = useMemo(() => Math.floor(currentXp / 500) + 1, [currentXp]);
  const xpForNextLevel = 500;
  const xpInCurrentLevel = currentXp % xpForNextLevel;
  const overallProgress = totalXp > 0 ? (currentXp / totalXp) * 100 : 0;

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">{userProfile.name}</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-brand-secondary font-semibold">Level {level}</p>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-orange-400" title={`${streak}-day learning streak!`}>
                <FireIcon className="w-5 h-5" />
                <span className="font-semibold">{streak} Day Streak</span>
              </div>
            )}
          </div>
        </div>
        <button onClick={onReset} className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded-md transition-colors">Reset Path</button>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1 text-sm text-gray-400">
          <span>XP Progress</span>
          <span>{currentXp} / {totalXp}</span>
        </div>
        <ProgressBar value={overallProgress} />
      </div>
      <div className="mt-4">
         <div className="flex justify-between items-center mb-1 text-sm text-gray-400">
          <span>Level {level} Progress</span>
          <span>{xpInCurrentLevel} / {xpForNextLevel} XP</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-brand-accent h-2.5 rounded-full" style={{ width: `${(xpInCurrentLevel / xpForNextLevel) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const TaskItem: React.FC<{ task: LearningTask; onToggle: () => void; onPriorityToggle: () => void; onSelect: () => void; }> = ({ task, onToggle, onPriorityToggle, onSelect }) => {
    return (
        <div className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${task.completed ? 'bg-green-500/10' : 'bg-gray-800'} ${task.priority ? 'ring-2 ring-red-500' : ''}`}>
            <button onClick={onToggle} className={`w-6 h-6 rounded-md flex-shrink-0 mt-1 flex items-center justify-center border-2 transition-colors ${task.completed ? 'bg-brand-accent border-brand-accent' : 'border-gray-500 hover:border-brand-primary'}`}>
                {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
            </button>
            <div className="flex-1">
                <h4 onClick={onSelect} className={`font-semibold transition-colors ${task.completed ? 'line-through text-gray-400' : 'text-white cursor-pointer hover:text-brand-primary'}`}>{task.title}</h4>
                <p className="text-sm text-gray-400 mt-1">{task.description}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-yellow-400 whitespace-nowrap">
                    {task.xp} XP
                </div>
                <button onClick={onPriorityToggle} className={`p-1 rounded-full transition-colors ${task.priority ? 'text-red-500' : 'text-gray-500 hover:text-red-400'}`} aria-label="Toggle priority">
                    <FlagIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const ModuleCard: React.FC<{ module: LearningModule; onTaskToggle: (taskId: string) => void; onPriorityToggle: (taskId: string) => void; onTaskSelect: (task: LearningTask) => void; }> = ({ module, onTaskToggle, onPriorityToggle, onTaskSelect }) => {
    const isModuleComplete = useMemo(() => module.tasks.every(t => t.completed), [module.tasks]);
    const completedTasks = useMemo(() => module.tasks.filter(t => t.completed).length, [module.tasks]);
    const progress = module.tasks.length > 0 ? (completedTasks / module.tasks.length) * 100 : 0;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-lg animate-slide-in" style={{ animationDelay: '200ms' }}>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                <div>
                    <h3 className="text-2xl font-bold text-white">{module.title}</h3>
                    <p className="text-gray-400 mt-1">{module.description}</p>
                </div>
                <div className={`flex items-center gap-2 p-2 px-3 rounded-full transition-colors ${isModuleComplete ? 'bg-yellow-400/20 text-yellow-300' : 'bg-gray-700 text-gray-400'}`}>
                    <TrophyIcon className="w-5 h-5"/>
                    <span className="font-semibold text-sm">{module.badgeName}</span>
                </div>
            </div>
            <div className="mb-4">
                <ProgressBar value={progress} />
            </div>
            <div className="space-y-3">
                {module.tasks.map(task => <TaskItem key={task.id} task={task} onToggle={() => onTaskToggle(task.id)} onPriorityToggle={() => onPriorityToggle(task.id)} onSelect={() => onTaskSelect(task)} />)}
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ userProfile, initialLearningPath, onReset }) => {
  const [learningPath, setLearningPath] = useState(initialLearningPath);
  const [selectedTask, setSelectedTask] = useState<LearningTask | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hi ${userProfile.name}! I'm your learning assistant. Ask me anything about your learning path or the topics you're studying.` }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  const STREAK_KEY = 'learnsphere_streak';
  const LAST_COMPLETION_KEY = 'learnsphere_last_completion';

  useEffect(() => {
    const savedStreak = localStorage.getItem(STREAK_KEY);
    const savedDateStr = localStorage.getItem(LAST_COMPLETION_KEY);
    
    if (savedStreak && savedDateStr) {
        const lastDate = new Date(savedDateStr);
        const today = new Date();

        const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastDateNormalized = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        
        const diffTime = todayNormalized.getTime() - lastDateNormalized.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
            localStorage.setItem(STREAK_KEY, '0');
            setStreak(0);
        } else {
            setStreak(parseInt(savedStreak, 10));
        }
    }
  }, []);

  const updateStreak = () => {
    const today = new Date();
    const lastCompletionDateStr = localStorage.getItem(LAST_COMPLETION_KEY);
    let lastCompletionDate = lastCompletionDateStr ? new Date(lastCompletionDateStr) : null;
    let currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || '0', 10);

    if (lastCompletionDate) {
        const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastDateNormalized = new Date(lastCompletionDate.getFullYear(), lastCompletionDate.getMonth(), lastCompletionDate.getDate());
        const diffTime = todayNormalized.getTime() - lastDateNormalized.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return; // Task already completed today, no change in streak.
        } else if (diffDays === 1) {
            currentStreak++; // Consecutive day.
        } else {
            currentStreak = 1; // Streak broken.
        }
    } else {
        currentStreak = 1; // First ever completion.
    }

    setStreak(currentStreak);
    localStorage.setItem(STREAK_KEY, currentStreak.toString());
    localStorage.setItem(LAST_COMPLETION_KEY, today.toISOString());
  };

  const handleTaskToggle = (moduleId: string, taskId: string) => {
    const module = learningPath.modules.find(mod => mod.id === moduleId);
    const task = module?.tasks.find(t => t.id === taskId);

    if (task && !task.completed) {
      updateStreak();
    }

    setLearningPath(prevPath => {
      const newModules = prevPath.modules.map(mod => {
        if (mod.id === moduleId) {
          return {
            ...mod,
            tasks: mod.tasks.map(task => 
              task.id === taskId ? { ...task, completed: !task.completed } : task
            ),
          };
        }
        return mod;
      });
      return { ...prevPath, modules: newModules };
    });
  };
  
  const handlePriorityToggle = (moduleId: string, taskId: string) => {
    setLearningPath(prevPath => {
        const newModules = prevPath.modules.map(mod => {
          if (mod.id === moduleId) {
            return {
              ...mod,
              tasks: mod.tasks.map(task => 
                task.id === taskId ? { ...task, priority: !task.priority } : task
              ),
            };
          }
          return mod;
        });
        return { ...prevPath, modules: newModules };
      });
  };

  const { currentXp, totalXp } = useMemo(() => {
    let current = 0;
    let total = 0;
    learningPath.modules.forEach(mod => {
      mod.tasks.forEach(task => {
        total += task.xp;
        if (task.completed) {
          current += task.xp;
        }
      });
    });
    return { currentXp: current, totalXp: total };
  }, [learningPath]);
  
  const handleReset = () => {
      localStorage.removeItem(STREAK_KEY);
      localStorage.removeItem(LAST_COMPLETION_KEY);
      onReset();
  }

  const handleSendMessage = async (message: string) => {
    const currentMessages = [...chatMessages, { role: 'user', text: message } as ChatMessage];
    setChatMessages(currentMessages);
    setIsChatLoading(true);

    try {
      const responseText = await generateChatResponse(message, chatMessages, userProfile.aiProvider);
      const newModelMessage: ChatMessage = { role: 'model', text: responseText };
      setChatMessages(prev => [...prev, newModelMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I ran into a problem. Please try again.' };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Your Learning Quest</h1>
        <p className="text-lg text-gray-400 mt-2">{userProfile.goal}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 lg:sticky top-8 self-start">
            <UserProfileCard userProfile={userProfile} currentXp={currentXp} totalXp={totalXp} streak={streak} onReset={handleReset} />
        </aside>

        <main className="lg:col-span-2 space-y-8">
            {learningPath.modules.map(module => (
                <ModuleCard 
                    key={module.id} 
                    module={module} 
                    onTaskToggle={(taskId) => handleTaskToggle(module.id, taskId)} 
                    onPriorityToggle={(taskId) => handlePriorityToggle(module.id, taskId)}
                    onTaskSelect={(task) => setSelectedTask(task)}
                />
            ))}
        </main>
      </div>
      
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsChatOpen(prev => !prev)}
          className="w-16 h-16 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
          aria-label="Toggle chat assistant"
        >
          <ChatBubbleIcon className="w-8 h-8" />
        </button>
      </div>

      <ChatBot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
      />

      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  );
};

export default Dashboard;
