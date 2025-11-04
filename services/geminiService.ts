
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { UserProfile, LearningPath, LearningModule, LearningTask, ChatMessage, CareerGuidance, CompetencyLevel } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for development. In a real environment, the key would be set.
  // We add this check to prevent runtime errors if the key is missing.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
  // In a real deployed app, you'd throw an error or handle this more gracefully.
  // For this self-contained example, we'll proceed, but API calls will fail.
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
let chat: Chat | null = null; // Store chat session


const learningPathSchema = {
  type: Type.OBJECT,
  properties: {
    modules: {
      type: Type.ARRAY,
      description: "An array of 5-7 learning modules.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Title of the module." },
          description: { type: Type.STRING, description: "A brief description of the module's content." },
          badgeName: { type: Type.STRING, description: "A cool, thematic name for the badge earned upon completion." },
          tasks: {
            type: Type.ARRAY,
            description: "An array of 3-5 actionable tasks for this module.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Title of the task." },
                description: { type: Type.STRING, description: "A brief description of what the task involves." },
                xp: { type: Type.INTEGER, description: "Experience points (10-100) awarded for completing the task." },
                youtubeReferences: {
                  type: Type.ARRAY,
                  description: "An array of 1-2 relevant YouTube video references for the task.",
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          title: { type: Type.STRING, description: "The title of the YouTube video." },
                          url: { type: Type.STRING, description: "A valid, direct URL to the YouTube video." }
                      },
                      required: ['title', 'url']
                  }
                }
              },
              required: ['title', 'description', 'xp'],
            },
          },
        },
        required: ['title', 'description', 'badgeName', 'tasks'],
      },
    },
  },
  required: ['modules'],
};


export const generateLearningPath = async (profile: UserProfile): Promise<LearningPath> => {
  const { interests, competency, goal } = profile;

  const prompt = `
    You are an expert instructional designer creating a personalized, gamified learning path.
    The user is a ${competency} interested in the following topics: ${interests.join(', ')}.
    Their primary learning goal is: "${goal}".

    Create a structured learning path with 5 to 7 modules. Each module must have a title, a short description, a unique and cool badge name for completion (e.g., 'React Ranger', 'Data Diviner'), and 3 to 5 specific, actionable tasks.
    Each task must have a title, a brief description, and an estimated 'xp' (experience points) value between 10 and 100 based on its difficulty.
    For each task, also provide a 'youtubeReferences' array containing 1 or 2 real, helpful YouTube video links (with a title and url) that are relevant to completing the task.
    The tasks should be practical and project-oriented where possible.
    The tone should be encouraging and motivating.
    
    The response must be a valid JSON object that adheres to the provided schema. Do not include any markdown formatting or any text outside of the JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: learningPathSchema,
      },
    });
    
    const jsonText = response.text.trim();
    // Although schema is used, a final parse is needed.
    const parsedResponse = JSON.parse(jsonText);

    // Basic validation to ensure the structure is what we expect.
    if (!parsedResponse.modules || !Array.isArray(parsedResponse.modules)) {
        throw new Error("Invalid response structure from AI: 'modules' array is missing.");
    }
    
    return parsedResponse as LearningPath;
  
  } catch (error) {
    console.error("Error generating content from Gemini API:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
};

const careerGuidanceSchema = {
    type: Type.OBJECT,
    properties: {
        areasOfFocus: {
            type: Type.ARRAY,
            description: "An array of 3-4 potential areas of focus.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The name of the focus area (e.g., 'Frontend Frameworks')." },
                    description: { type: Type.STRING, description: "A short, 1-2 sentence description of this area." },
                },
                required: ['title', 'description'],
            },
        },
        potentialRoles: {
            type: Type.ARRAY,
            description: "An array of 3-4 potential job roles.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The job title (e.g., 'Full-Stack Developer')." },
                    description: { type: Type.STRING, description: "A short, 1-2 sentence description of this role's responsibilities." },
                },
                required: ['title', 'description'],
            },
        },
    },
    required: ['areasOfFocus', 'potentialRoles'],
};

export const generateCareerGuidance = async (interests: string[], competency: CompetencyLevel): Promise<CareerGuidance> => {
    const prompt = `
      You are an expert career coach and curriculum designer for the tech industry.
      A user has expressed interest in the following topics: ${interests.join(', ')}.
      Their self-assessed competency level is: ${competency}.
  
      Based on this information, provide a list of 3-4 potential areas of focus to deepen their skills and a list of 3-4 potential job roles they could target.
      For each area of focus, provide a title and a short, encouraging description of what it entails.
      For each potential role, provide a title and a brief description of the primary responsibilities.
      Keep all descriptions concise and motivational (1-2 sentences max).
      
      The response must be a valid JSON object that adheres to the provided schema. Do not include any markdown formatting or any text outside of the JSON object.
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: careerGuidanceSchema,
        },
      });
      
      const jsonText = response.text.trim();
      const parsedResponse = JSON.parse(jsonText);
  
      if (!parsedResponse.areasOfFocus || !parsedResponse.potentialRoles) {
          throw new Error("Invalid response structure from AI: Missing required fields.");
      }
      
      return parsedResponse as CareerGuidance;
    
    } catch (error) {
      console.error("Error generating career guidance from Gemini API:", error);
      throw new Error("Failed to communicate with the AI service for career guidance.");
    }
  };


const getChatSession = () => {
    if (!chat) {
      chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a friendly and helpful learning assistant for the LearnSphere platform. You help users understand topics related to their learning path. Keep your answers concise and encouraging.',
        },
      });
    }
    return chat;
  }
  
export const generateChatResponse = async (message: string): Promise<string> => {
    try {
      const chatSession = getChatSession();
      const response = await chatSession.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error("Error generating chat response from Gemini API:", error);
      chat = null; // Reset chat on error
      throw new Error("Failed to get a response from the AI assistant.");
    }
};

export const resetChatSession = () => {
    chat = null;
}