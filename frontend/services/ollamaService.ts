/**
 * Ollama AI Service for Aurum Vault Banking Assistant
 *
 * This service handles communication with the Ollama local LLM API
 * for AI-powered banking assistance and customer support.
 */

export interface OllamaMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export interface OllamaError {
  error: string;
  message?: string;
}

// Ollama configuration
const OLLAMA_CONFIG = {
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama3.2:latest",
  timeout: 30000, // 30 seconds
};

// Banking-specific system prompt for Aurum Vault
const AURUM_VAULT_SYSTEM_PROMPT = `You are Nova, the AI banking assistant for Aurum Vault, a luxury private banking institution. You are knowledgeable, professional, and provide sophisticated financial guidance.

CORE IDENTITY:
- You work for Aurum Vault, the pinnacle of luxury banking
- You provide exceptional, personalized service to high-net-worth clients
- You maintain discretion and confidentiality at all times
- You speak with sophistication while being approachable

CAPABILITIES:
- Account information and balance inquiries
- Fund transfers and payment processing
- Credit card and loan applications
- Investment portfolio management
- Wealth management strategies
- Financial planning and advice
- Security and fraud protection guidance
- Luxury banking services and concierge support

IMPORTANT GUIDELINES:
- Always maintain client privacy and confidentiality
- Provide accurate information about banking services
- For actual transactions, always direct users to secure banking portals
- Be helpful but emphasize security for sensitive operations
- Reflect Aurum Vault's luxury brand in your communication style
- If you're unsure about something, offer to connect the client with a human advisor

Remember: You're representing a premium banking institution, so maintain professionalism while being genuinely helpful.`;

/**
 * Call Ollama API for chat completion
 */
export async function callOllamaApi(
  userMessage: string,
  chatHistory: OllamaMessage[] = []
): Promise<string> {
  try {
    // Prepare messages with system prompt and chat history
    const messages: OllamaMessage[] = [
      { role: "system", content: AURUM_VAULT_SYSTEM_PROMPT },
      ...chatHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: userMessage },
    ];

    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_CONFIG.model,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1000,
        },
      }),
      signal: AbortSignal.timeout(OLLAMA_CONFIG.timeout),
    });

    if (!response.ok) {
      const errorData: OllamaError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new Error(
        errorData.message ||
          errorData.error ||
          "Failed to get response from Ollama"
      );
    }

    const data: OllamaResponse = await response.json();

    if (!data.message?.content) {
      throw new Error("Invalid response format from Ollama API");
    }

    return data.message.content;
  } catch (error) {
    console.error("Ollama API Error:", error);

    // Handle specific error types
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return "I'm sorry, but I'm unable to connect to the AI service right now. This might be because Ollama is not running locally. Please ensure Ollama is installed and running on your machine, or contact your system administrator for assistance.";
    }

    if (error instanceof Error && error.name === "AbortError") {
      return "I apologize, but my response is taking longer than expected. Please try asking your question again, or contact our customer service team for immediate assistance.";
    }

    if (error instanceof Error) {
      return `I'm experiencing a technical issue right now: ${error.message}. Please try again in a moment, or contact our support team if the problem persists.`;
    }

    return "I'm sorry, but I'm experiencing technical difficulties at the moment. Please contact our customer service team, and they'll be happy to assist you personally.";
  }
}

/**
 * Check if Ollama service is available
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout for health check
    });

    return response.ok;
  } catch (error) {
    console.warn("Ollama health check failed:", error);
    return false;
  }
}

/**
 * Get available models from Ollama
 */
export async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/tags`);

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  } catch (error) {
    console.error("Error fetching Ollama models:", error);
    return [];
  }
}

/**
 * Pull a model if it doesn't exist
 */
export async function pullOllamaModel(modelName: string): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/pull`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: modelName,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error pulling Ollama model:", error);
    return false;
  }
}

const ollamaService = {
  callOllamaApi,
  checkOllamaHealth,
  getOllamaModels,
  pullOllamaModel,
  config: OLLAMA_CONFIG,
};

export default ollamaService;
