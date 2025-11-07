import { useState, useEffect } from 'react';
import { LoginModal } from './components/LoginModal';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { useAuth } from './context/AuthContext';
import type { Message } from './types';
import { api } from './services/api';

function App() {
  const { isAuthenticated, isGuest } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (isAuthenticated || isGuest) {
      setShowLoginModal(false);
    }
  }, [isAuthenticated, isGuest]);

  useEffect(() => {
    if (selectedChatId) {
      loadChatMessages(selectedChatId);
    }
  }, [selectedChatId]);

  const loadChatMessages = async (chatId: string) => {
    try {
      const chatMessages = await api.getChat(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setMessages([]);
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleNewChat = () => {
    setSelectedChatId(null);
    setMessages([]);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleMessagesUpdate = (newMessages: Message[]) => {
    setMessages(newMessages);
    if (isAuthenticated) {
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <Sidebar
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
        selectedChatId={selectedChatId}
        refreshTrigger={refreshTrigger}
      />

      <ChatWindow
        chatId={selectedChatId}
        messages={messages}
        onMessagesUpdate={handleMessagesUpdate}
        onNewChat={handleNewChat}
      />
    </div>
  );
}

export default App;
