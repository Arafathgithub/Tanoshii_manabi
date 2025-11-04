
import { GoogleGenAI, Type, Chat } from '@google/genai';
import { UserProfile, LearningPath, ChatMessage, CareerGuidance, AIProvider } from '../types';

// --- Environment Variable Checks ---
if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable for Google Gemini not set. Using a placeholder.");
}
if (!process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_KEY) {
    console.warn("AZURE_OPENAI_ENDPOINT or AZURE_OPENAI_KEY environment variables not set. Azure provider will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// --- Schema Definitions (Provider Agnostic) ---
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


// --- Azure OpenAI Helper ---
const convertSchemaForAzure = (schema: any): any => {
    const newSchema = { ...schema };
    if (newSchema.type) {
      newSchema.type = (newSchema.type as string).toLowerCase();
    }
    if (newSchema.properties) {
      newSchema.properties = Object.fromEntries(
        Object.entries(newSchema.properties).map(([key, value]) => [key, convertSchemaForAzure(value)])
      );
    }
    if (newSchema.items) {
      newSchema.items = convertSchemaForAzure(newSchema.items);
    }
    return newSchema;
};

const callAzureOpenAIWithTool = async (systemPrompt: string, userPrompt: string, schema: any, toolName: string) => {
    const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const azureApiKey = process.env.AZURE_OPENAI_KEY;
    // It's common to use a specific deployment name, but we'll use a placeholder.
    const deploymentName = 'gpt-4o'; 
    const apiVersion = '2024-02-15-preview';

    if (!azureEndpoint || !azureApiKey) {
        throw new Error("Azure OpenAI environment variables not configured.");
    }
  
    const url = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
  
    const body = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: toolName,
            description: `Generates the required structured data for ${toolName}.`,
            parameters: convertSchemaForAzure(schema),
          }
        }
      ],
      tool_choice: { type: 'function', function: { name: toolName } },
      temperature: 0.7,
    };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': azureApiKey,
      },
      body: JSON.stringify(body),
    });
  
    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Azure API Error:", errorBody);
        throw new Error(`Azure API request failed with status ${response.status}`);
    }
  
    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
    if (!toolCall || toolCall.type !== 'function') {
      throw new Error("Azure API did not return a valid function call.");
    }

    return JSON.parse(toolCall.function.arguments);
};


// --- Public Service Functions ---

export const generateLearningPath = async (profile: UserProfile): Promise<LearningPath> => {
  const { interests, competency, goal, aiProvider } = profile;

  const systemPrompt = `
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
  const userPrompt = `I am a ${competency} in ${interests.join(', ')} and my goal is to "${goal}". Please generate my learning path.`;

  try {
    let parsedResponse;
    if (aiProvider === 'azure') {
        parsedResponse = await callAzureOpenAIWithTool(systemPrompt, userPrompt, learningPathSchema, 'generate_learning_path');
    } else { // Default to Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: systemPrompt,
            config: {
            responseMimeType: 'application/json',
            responseSchema: learningPathSchema,
            },
        });
        parsedResponse = JSON.parse(response.text.trim());
    }
    
    if (!parsedResponse.modules || !Array.isArray(parsedResponse.modules)) {
        throw new Error("Invalid response structure from AI: 'modules' array is missing.");
    }
    return parsedResponse as LearningPath;
  
  } catch (error) {
    console.error(`Error generating content from ${aiProvider} API:`, error);
    throw new Error("Failed to communicate with the AI service.");
  }
};

export const generateCareerGuidance = async (profile: UserProfile): Promise<CareerGuidance> => {
    const { interests, competency, aiProvider } = profile;
    const systemPrompt = `
      You are an expert career coach and curriculum designer for the tech industry.
      A user has expressed interest in the following topics: ${interests.join(', ')}.
      Their self-assessed competency level is: ${competency}.
      Based on this information, provide a list of 3-4 potential areas of focus to deepen their skills and a list of 3-4 potential job roles they could target.
      For each area of focus, provide a title and a short, encouraging description of what it entails.
      For each potential role, provide a title and a brief description of the primary responsibilities.
      Keep all descriptions concise and motivational (1-2 sentences max).
      The response must be a valid JSON object that adheres to the provided schema. Do not include any markdown formatting or any text outside of the JSON object.
    `;
    const userPrompt = `My interests are ${interests.join(', ')} and my level is ${competency}. What career guidance can you offer?`;

    try {
        let parsedResponse;
        if (aiProvider === 'azure') {
            parsedResponse = await callAzureOpenAIWithTool(systemPrompt, userPrompt, careerGuidanceSchema, 'generate_career_guidance');
        } else {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: systemPrompt,
                config: {
                responseMimeType: 'application/json',
                responseSchema: careerGuidanceSchema,
                },
            });
            parsedResponse = JSON.parse(response.text.trim());
        }
        
        if (!parsedResponse.areasOfFocus || !parsedResponse.potentialRoles) {
            throw new Error("Invalid response structure from AI: Missing required fields.");
        }
        return parsedResponse as CareerGuidance;
      
    } catch (error) {
        console.error(`Error generating career guidance from ${aiProvider} API:`, error);
        throw new Error("Failed to communicate with the AI service for career guidance.");
    }
};

export const generateChatResponse = async (message: string, history: ChatMessage[], aiProvider: AIProvider): Promise<string> => {
    const systemInstruction = 'You are a friendly and helpful learning assistant for the LearnSphere platform. You help users understand topics related to their learning path. Keep your answers concise and encouraging.';
    
    try {
        if (aiProvider === 'azure') {
            const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const azureApiKey = process.env.AZURE_OPENAI_KEY;
            const deploymentName = 'gpt-4o';
            const apiVersion = '2024-02-15-preview';

            if (!azureEndpoint || !azureApiKey) {
                throw new Error("Azure OpenAI environment variables not configured.");
            }
          
            const url = `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
            
            const messages = [
                { role: 'system', content: systemInstruction },
                ...history.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.text })),
                { role: 'user', content: message },
            ];

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': azureApiKey },
                body: JSON.stringify({ messages, temperature: 0.7 }),
            });

            if (!response.ok) throw new Error("Azure chat API request failed.");

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";

        } else { // Default to Gemini
            const geminiHistory = history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const chat = ai.chats.create({
                model: 'gemini-2.5-flash',
                history: geminiHistory,
                config: { systemInstruction },
            });
            
            const response = await chat.sendMessage({ message });
            return response.text;
        }
    } catch (error) {
        console.error(`Error generating chat response from ${aiProvider} API:`, error);
        throw new Error("Failed to get a response from the AI assistant.");
    }
};
