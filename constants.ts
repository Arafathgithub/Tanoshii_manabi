import { CompetencyLevel } from './types';

export const INTERESTS_OPTIONS: string[] = [
  'Web Development',
  'Data Science & ML',
  'UI/UX Design',
  'Mobile App Development',
  'Cybersecurity',
  'Cloud Computing',
  'Game Development',
  'Project Management',
];

export const COMPETENCY_LEVELS: CompetencyLevel[] = [
  CompetencyLevel.BEGINNER,
  CompetencyLevel.INTERMEDIATE,
  CompetencyLevel.ADVANCED,
];

export const GOAL_TEMPLATES: { [key: string]: string[] } = {
  'Web Development': [
    'Build a full-stack e-commerce application from scratch.',
    'Create an interactive personal portfolio with modern animations.',
    'Master responsive web design using advanced CSS techniques.',
    'Develop a real-time chat application with WebSockets.',
  ],
  'Data Science & ML': [
    'Construct and train a neural network for image recognition.',
    'Analyze a large public dataset to uncover hidden insights.',
    'Build a movie recommendation engine using collaborative filtering.',
    'Create a predictive model for financial market trends.',
  ],
  'UI/UX Design': [
    'Design and prototype a mobile banking application for iOS.',
    'Create a comprehensive design system for a web application.',
    'Conduct user research and usability testing for a new feature.',
    'Master advanced animation and micro-interaction design.',
  ],
  'Mobile App Development': [
      'Build a social media app for iOS and Android using React Native.',
      'Develop a fitness tracking app that uses device sensors.',
      'Create a mobile game with a simple physics engine.',
      'Publish an app on the Google Play Store and Apple App Store.',
  ],
  'Cybersecurity': [
      'Learn ethical hacking techniques and perform penetration testing.',
      'Set up a secure home network and understand threat detection.',
      'Master cryptography and secure data transmission principles.',
      'Achieve a recognized cybersecurity certification (e.g., CompTIA Security+).',
  ],
  'Cloud Computing': [
      'Deploy a scalable web application on AWS or Google Cloud.',
      'Master containerization with Docker and orchestration with Kubernetes.',
      'Become a certified cloud architect on a major platform.',
      'Implement a serverless architecture for a data processing pipeline.',
  ],
  'Game Development': [
      'Create a 2D platformer game using the Unity engine.',
      'Develop a 3D exploration game with basic AI for enemies.',
      'Learn game physics and create a custom physics simulation.',
      'Design and implement the core mechanics for a puzzle game.',
  ],
  'Project Management': [
      'Master Agile and Scrum methodologies for software projects.',
      'Learn to use project management tools like Jira or Trello effectively.',
      'Lead a mock project from conception to completion.',
      'Get certified as a Project Management Professional (PMP).',
  ],
  'default': [
    'Land a new job in my field of interest.',
    'Build a significant project to add to my portfolio.',
    'Prepare for and pass a technical certification exam.',
    'Gain a deep understanding of a new technology stack.',
  ]
};
