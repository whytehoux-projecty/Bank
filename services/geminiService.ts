
import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";

// Ensure API_KEY is accessed from process.env
// In a real Vite/Create-React-App setup, this would be import.meta.env.VITE_API_KEY or process.env.REACT_APP_API_KEY
// For this environment, we assume process.env.API_KEY is directly available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This warning is helpful for developers.
  // In a production build, you might handle this more gracefully or expect it to be set.
  console.warn("API_KEY for Gemini is not set. AI Assistant functionality will be limited or non-functional.");
}

// Initialize with a placeholder if API_KEY is missing to avoid constructor error,
// but functionality will be blocked in callGeminiApi if it's truly missing.
const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });
const model = 'gemini-2.5-flash-preview-04-17'; // General Text Tasks

// Changed history parameter type from Part[] to Content[]
export const callGeminiApi = async (prompt: string, history?: Content[]): Promise<string> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    return "AI features are currently unavailable. API key not configured.";
  }
  try {
    const currentMessage: Content = { role: 'user', parts: [{ text: prompt }] };
    
    // Construct the full list of contents for the API call
    // history is already Content[], currentMessage is a Content object.
    const updatedContents: Content[] = [];
    if (history) {
      updatedContents.push(...history);
    }
    updatedContents.push(currentMessage);
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: updatedContents, // Pass the correctly structured Content array
      config: {
        // systemInstruction: "You are Nova, a helpful AI assistant for NovaBank. Be friendly and concise.",
        // For a chatbot, default thinking (enabled) is usually fine.
        // If very low latency is paramount and quality can be slightly lower, 
        // you might consider `thinkingConfig: { thinkingBudget: 0 }` for 'gemini-2.5-flash-preview-04-17'
      }
    });

    // Directly access the text property as per Gemini API guidance.
    const text = response.text;
    
    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Basic error handling. More specific error messages can be returned based on error types.
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
             return "The provided API key is not valid. Please check your configuration.";
        }
        if (error.message.includes('fetch')) { // Generic network error
            return "There was an issue connecting to the AI service. Please check your internet connection and try again.";
        }
    }
    return "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};

// Example of how to get JSON (not used in current AI assistant but good for reference)
/*
export const getJsonFromGemini = async <T,>(prompt: string): Promise<T | null> => {
  if (!API_KEY || API_KEY === "MISSING_API_KEY") {
    console.error("API_KEY for Gemini is not set.");
    return null;
  }
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }], // This needs to be Content[]
      config: {
        responseMimeType: "application/json",
      }
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s; // Made 'json' in fence optional
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) { // match[1] is the content within fences
      jsonStr = match[1].trim();
    }
    
    return JSON.parse(jsonStr) as T;

  } catch (error) {
    console.error('Error calling Gemini API for JSON:', error);
    return null;
  }
};
*/
