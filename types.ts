export enum CompetencyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export interface UserProfile {
  name: string;
  interests: string[];
  competency: CompetencyLevel;
  goal: string;
}

export interface LearningTask {
  id: string;
  title: string;
  description: string;
  xp: number;
  completed: boolean;
  priority: boolean;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  badgeName: string;
  tasks: LearningTask[];
}

export interface LearningPath {
  modules: LearningModule[];
}

export type AppState = 'onboarding' | 'loading' | 'dashboard' | 'error';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface FocusArea {
  title: string;
  description: string;
}

export interface PotentialRole {
  title: string;
  description: string;
}

export interface CareerGuidance {
  areasOfFocus: FocusArea[];
  potentialRoles: PotentialRole[];
}
