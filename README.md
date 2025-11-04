# LearnSphere: Your AI-Powered Gamified Learning Management System (LMS)

LearnSphere is a modern, personalized Learning Management System that transforms education into an engaging adventure. It uses the power of the Google Gemini API to create dynamic, gamified learning paths tailored to your unique interests, competency level, and goals.

 <!-- Placeholder: Replace with an actual screenshot -->

---

## ✨ Core Features

*   **Personalized Onboarding Wizard:** A smooth, multi-step process to capture your name, interests (from a predefined list), self-assessed skill level, and ultimate learning goal.
*   **AI-Powered Career Guidance:** Before you even set a goal, our AI analyzes your interests to suggest potential areas of focus and relevant job roles, helping you sharpen your ambition.
*   **Dynamic Learning Path Generation:** The Gemini API crafts a structured curriculum with 5-7 modules. Each module contains actionable tasks, a unique badge to unlock, and experience points (XP) to earn.
*   **Interactive Dashboard:** A central hub to view your learning path, track your overall progress, and see your current level and XP.
*   **Gamification Mechanics:**
    *   **XP & Levels:** Earn Experience Points for every task you complete and watch yourself level up.
    *   **Badges:** Unlock cool, thematic badges for completing each module (e.g., 'React Ranger', 'Data Diviner').
*   **Task Management:** Easily mark tasks as complete and flag high-priority tasks to focus on what matters most.
*   **AI Learning Assistant:** A friendly, built-in chatbot powered by the Gemini API is always available to answer your questions about the topics you're studying.

---

## 🛠️ Technology Stack

*   **Frontend:** React, TypeScript, Tailwind CSS
*   **AI & Generative Content:** [Google Gemini API](https://ai.google.dev/)
    *   `gemini-2.5-pro` is used for the complex task of generating the structured learning path JSON.
    *   `gemini-2.5-flash` powers the fast, conversational AI assistant.
*   **Project Setup:** The application is designed to run in a web-based environment (like an online IDE or code playground) that serves `index.html` and uses an **importmap** to load dependencies from a CDN.

---

## 🚀 How It Works

1.  **Onboarding:** The user is greeted with a wizard to build their learner profile.
2.  **AI Guidance:** Based on selected interests, the Gemini API is called to provide career and skill suggestions.
3.  **Goal Setting:** The user sets their primary learning goal, choosing from AI-suggested templates or writing their own.
4.  **Path Generation:** The completed user profile is sent to the Gemini API with a detailed prompt and a required JSON schema. The API returns a complete, structured learning path.
5.  **Dashboard Rendering:** The application parses the AI's response and renders it on a beautiful, interactive dashboard.
6.  **Learning & Interaction:** The user progresses through their tasks, earning XP and badges. They can chat with the AI assistant at any time for help or clarification.

---

## 📂 Project Structure

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── icons/
│   │   ├── ChatBot.tsx
│   │   ├── Dashboard.tsx
│   │   └── OnboardingWizard.tsx
│   ├── services/
│   │   └── geminiService.ts  # All Gemini API logic
│   ├── App.tsx             # Main app component and state management
│   ├── constants.ts        # Static data (interests, goals)
│   ├── types.ts            # TypeScript interfaces
│   └── index.tsx           # React root entrypoint
├── .gitignore
├── index.html              # Main HTML file with importmap
├── metadata.json
├── package.json
└── README.md
```

---

## 🏃‍♀️ Getting Started

This project is configured to run in a specific development environment where an API key is securely managed.

1.  **API Key:** The application requires a Google Gemini API key to be available as an environment variable (`process.env.API_KEY`). All API calls in `geminiService.ts` rely on this key.
2.  **Installation:** No local `npm install` is needed, as dependencies like React and `@google/genai` are loaded directly from a CDN via the `importmap` in `index.html`.
3.  **Running the App:** Serve the `index.html` file using a local web server or a compatible online development environment. The application will start from there.
