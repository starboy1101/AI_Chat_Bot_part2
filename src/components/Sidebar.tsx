import { useState, useEffect } from "react";
import { MessageSquarePlus, Search, Menu, X, MoreVertical, Trash2 } from "lucide-react";
import { ProfileSection } from "./ProfileSection";
import { useAuth } from "../context/AuthContext";
import type { Chat } from "../types";
import { api } from "../services/api";

interface SidebarProps {
  onChatSelect: (chatId: string | null) => void; // 👈 updated
  onNewChat: () => void;
  selectedChatId: string | null;
  refreshTrigger: number;
}

export function Sidebar({
  onChatSelect,
  onNewChat,
  selectedChatId,
  refreshTrigger,
}: SidebarProps) {
  const { user, isAuthenticated } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null); // track 3-dot menu

  useEffect(() => {
    if (user) loadChats();
  }, [user, refreshTrigger]);

  const loadChats = async () => {
    if (!user) return;
    try {
      const fetchedChats = await api.getChats(user.id);
      setChats(fetchedChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const handleNewChat = () => {
    onNewChat();
    setIsOpen(false);
  };

  const handleChatSelect = (chatId: string) => {
    onChatSelect(chatId);
    setIsOpen(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (confirm("Are you sure you want to delete this chat?")) {
      try {
        await api.deleteChat(chatId);
        await loadChats();
        if (selectedChatId === chatId) onChatSelect(null);
      } catch (error) {
        console.error("Failed to delete chat:", error);
      }
    }
    setMenuOpenId(null);
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar container */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top section (New Chat button) */}
        <div className="p-4 border-b border-gray-200 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <MessageSquarePlus size={20} />
            New Chat
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {searchQuery ? "No chats found" : "No chat history yet"}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                    selectedChatId === chat.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <button
                    onClick={() => handleChatSelect(chat.id)}
                    className="flex-1 text-left"
                  >
                    <p className="font-medium truncate text-sm">{chat.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(chat.updated_at).toLocaleDateString()}
                    </p>
                  </button>

                  {/* 3-dot menu icon (visible on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() =>
                        setMenuOpenId(menuOpenId === chat.id ? null : chat.id)
                      }
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {/* Dropdown menu */}
                    {menuOpenId === chat.id && (
                      <div className="absolute right-2 top-10 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                        <button
                          onClick={() => handleDeleteChat(chat.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Section */}
        <ProfileSection />
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}
    </>
  );
}
