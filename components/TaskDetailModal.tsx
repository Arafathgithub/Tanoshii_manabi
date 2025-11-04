import React, { useState, useEffect } from 'react';
import { LearningTask } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';
import { CheckIcon } from './icons/CheckIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { CalendarPlusIcon } from './icons/CalendarPlusIcon';

interface TaskDetailModalProps {
  task: LearningTask | null;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
  const [requestStatus, setRequestStatus] = useState<'idle' | 'requested'>('idle');

  // Reset state when the task changes so each task gets its own request button state
  useEffect(() => {
    if (task) {
      setRequestStatus('idle');
    }
  }, [task]);
  
  if (!task) return null;

  const handleRequestSession = () => {
    // In a real app, this would trigger an API call.
    // Here, we'll just update the UI state.
    setRequestStatus('requested');
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-8 border border-gray-700 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{task.title}</h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-yellow-400 font-bold">{task.xp} XP</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  task.completed 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-gray-600 text-gray-300'
              }`}>
                {task.completed && <CheckIcon className="w-4 h-4 mr-1.5" />}
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close task details"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mt-6 border-t border-gray-700 pt-6">
          <p className="text-gray-300 whitespace-pre-wrap">{task.description}</p>
        </div>

        {task.youtubeReferences && task.youtubeReferences.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Suggested Videos</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {task.youtubeReferences.map((ref, index) => (
                <a
                  key={index}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-md transition-colors text-sm"
                >
                  <YouTubeIcon className="w-5 h-5 text-red-500" />
                  <span>{ref.title}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Need More Help?</h3>
            {requestStatus === 'idle' ? (
                <button
                    onClick={handleRequestSession}
                    className="w-full flex items-center justify-center gap-3 bg-brand-secondary hover:opacity-90 text-white font-semibold px-4 py-3 rounded-lg transition-opacity"
                >
                    <CalendarPlusIcon className="w-6 h-6" />
                    <span>Request Instructor-Led Session</span>
                </button>
            ) : (
                <div
                    className="w-full flex items-center justify-center gap-3 bg-green-500/20 text-green-300 font-semibold px-4 py-3 rounded-lg"
                >
                    <CheckIcon className="w-6 h-6" />
                    <span>Request Sent! We'll be in touch soon.</span>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default TaskDetailModal;