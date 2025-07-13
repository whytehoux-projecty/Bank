import React, { useState, useRef, useEffect, useCallback } from "react";
import Modal from "./Modal";
import { TypingIndicator } from "./LoadingSpinner";
import {
  SparklesIcon,
  PaperAirplaneIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChatBubbleBottomCenterTextIcon,
} from "../constants";
import { ChatMessage } from "../types";
import { callOllamaApi, OllamaMessage } from "../services/ollamaService";

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickActions] = useState([
    { id: "account", text: "Account Balance", icon: BanknotesIcon },
    { id: "transfer", text: "Transfer Funds", icon: PaperAirplaneIcon },
    { id: "creditcard", text: "Credit Cards", icon: CreditCardIcon },
    {
      id: "support",
      text: "Customer Support",
      icon: ChatBubbleBottomCenterTextIcon,
    },
  ]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Initial greeting message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: "ai-intro",
            text: "👋 Welcome to Aurum Vault! I'm Nova, your personal AI banking assistant powered by advanced local AI technology.\n\n💎 As your luxury banking concierge, I can assist you with:\n• Account information & balance inquiries\n• Fund transfers & payment processing\n• Premium credit card & loan applications\n• Investment portfolio management\n• Wealth management strategies\n• Security & fraud protection\n• Exclusive banking services\n• Personalized financial planning\n\nHow may I serve you today? Feel free to use the quick actions below or simply ask me anything about your Aurum Vault banking experience.",
            sender: "ai",
            timestamp: Date.now(),
          },
        ]);
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleQuickAction = (actionId: string) => {
    const actionTexts = {
      account: "What's my account balance?",
      transfer: "I want to transfer money between my accounts",
      creditcard: "Tell me about credit card options and applications",
      support: "I need help with customer support options",
    };
    setInput(actionTexts[actionId as keyof typeof actionTexts] || "");
  };

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === "" || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: input,
      sender: "user",
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Convert chat history to Ollama format
      const chatHistory: OllamaMessage[] = messages
        .filter((msg) => msg.id !== "ai-intro")
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text,
        }));

      const aiResponseText = await callOllamaApi(currentInput, chatHistory);

      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: aiResponseText,
        sender: "ai",
        timestamp: Date.now(),
      };
      setTimeout(() => setMessages((prev) => [...prev, newAiMessage]), 100);
    } catch (error) {
      console.error("AI Assistant Error:", error);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        text: "I apologize, but I'm experiencing connectivity issues at the moment. Please try again in a few moments, or contact our customer service team for immediate assistance.",
        sender: "ai",
        timestamp: Date.now(),
      };
      setTimeout(() => setMessages((prev) => [...prev, errorMessage]), 100);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] hover:from-[#8C1A1F] hover:to-[#751016] text-white p-5 rounded-full shadow-2xl transition-all duration-300 hover-lift z-[90] group anim-float"
        aria-label="Open Nova AI Assistant"
      >
        <SparklesIcon className="h-8 w-8 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full anim-pulse"></div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] opacity-20 animate-ping"></div>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nova AI Assistant"
        size="lg"
      >
        <div className="flex flex-col h-[75vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#A41E22] via-[#8C1A1F] to-[#751016] text-white rounded-t-lg -m-6 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="flex items-center space-x-3 relative z-10">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center anim-gentleBounce">
                <SparklesIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Nova AI Assistant</h3>
                <p className="text-sm opacity-90">
                  Your intelligent banking companion
                </p>
              </div>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full anim-pulse relative z-10"></div>
          </div>

          {/* Messages Container */}
          <div className="flex-grow overflow-y-auto mb-4 space-y-4 p-4 bg-gradient-to-b from-gray-50 to-white rounded-lg border">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } anim-fadeInUp`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[80%] ${
                    msg.sender === "user"
                      ? "flex-row-reverse space-x-reverse"
                      : ""
                  }`}
                >
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    <div
                      className={`text-xs mt-2 opacity-70 ${
                        msg.sender === "user"
                          ? "text-gray-200"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-semibold">
                        U
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick Actions - Show only when no messages from user yet */}
            {messages.length <= 1 && !isLoading && (
              <div className="mt-6 anim-fadeInUp">
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  Quick Actions:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#A41E22] hover:bg-red-50 transition-all duration-200 text-left text-sm group"
                      >
                        <IconComponent className="h-4 w-4 text-gray-500 group-hover:text-[#A41E22]" />
                        <span className="text-gray-700 group-hover:text-[#A41E22]">
                          {action.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start anim-fadeInUp">
                <div className="flex items-end space-x-2 max-w-[80%]">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] rounded-full flex items-center justify-center flex-shrink-0 anim-pulse">
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="flex items-center border-t border-gray-200 pt-4 bg-white rounded-lg p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask Nova anything about banking..."
              className="flex-grow p-3 bg-gray-50 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-[#A41E22] focus:border-[#A41E22] outline-none text-gray-800 placeholder-gray-500 transition-all duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ""}
              aria-label="Send message"
              className="bg-gradient-to-r from-[#A41E22] to-[#8C1A1F] text-white p-3 rounded-r-xl hover:from-[#8C1A1F] hover:to-[#751016] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover-lift"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIAssistant;
