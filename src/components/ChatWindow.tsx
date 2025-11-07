import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import type { Message } from "../types";
import { api } from "../services/api";

interface ChatWindowProps {
  chatId: string | null;
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
  onNewChat: () => void;
}

export function ChatWindow({
  chatId,
  messages,
  onMessagesUpdate,
  onNewChat,
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      let currentChatId = chatId;
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userData.id || "guest";

      // 🔹 Create a new chat session if none exists
      if (!currentChatId) {
        const newChat = await api.createChat(userId, userMessage.slice(0, 50));
        currentChatId = newChat.id;

        // Save this as the active session for continuity
        localStorage.setItem("active_session_id", currentChatId);
        onNewChat();
      }

      // 🔹 Local user message (immediate UI update)
      const newUserMessage: Message = {
        id: Date.now().toString(),
        chat_id: currentChatId || "guest",
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };

      onMessagesUpdate([...messages, newUserMessage]);

      // 🔹 Determine active session (reuse across refreshes)
      let activeSessionId =
        currentChatId ||
        localStorage.getItem("active_session_id") ||
        undefined;

      // 🔹 Get bot reply from backend /chat
      const backendResponse = await api.sendMessage(userId, userMessage, {
        sessionId: activeSessionId,
        token: userData.token,
      });

      // If backend started a new chat session, persist it
      if (backendResponse.session_id) {
        activeSessionId = backendResponse.session_id;
        localStorage.setItem("active_session_id", activeSessionId);
      }

      // 🔹 Convert backend reply into Message object
      const newBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        chat_id: activeSessionId || "guest",
        role: "assistant",
        content: backendResponse.reply,
        created_at: new Date().toISOString(),
      };

      // 🔹 Update message list
      onMessagesUpdate([...messages, newUserMessage, newBotMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-4xl font-semibold text-gray-800 mb-2">
                  What's on your mind today?
                </h1>
                <p className="text-gray-500">
                  Start a conversation by typing a message below
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <ChatMessage key={message.id || index} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-4 mb-6">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                    <Loader2 size={18} className="text-white animate-spin" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none max-h-32 transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
