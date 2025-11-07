import type { User, Chat, Message, ChatResponse } from "../types";

const BASE_URL = "http://127.0.0.1:8000";

export const api = {
  // ✅ LOGIN
  async login(demoId: string, password: string): Promise<User> {
    const resp = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: demoId, password }),
    });

    if (!resp.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await resp.json();
    if (!data?.success || !data?.token) {
      throw new Error("Invalid response from server");
    }

    return {
      id: demoId,
      token: data.token,
    };
  },

  // ✅ VERIFY LOGIN
  async verifyLogin(userId: string, token: string): Promise<boolean> {
    const resp = await fetch(`${BASE_URL}/verify_login/${userId}/${token}`);
    if (!resp.ok) return false;
    const data = await resp.json();
    return Boolean(data?.authenticated);
  },

  // ✅ SEND MESSAGE (Fixes your TypeScript issue)
  async sendMessage(
    userId: string | null,
    message: string,
    opts?: { sessionId?: string; token?: string }
  ): Promise<ChatResponse> {
    const body: Record<string, any> = {
      user_id: userId || "guest",
      message,
      session_id: opts?.sessionId ?? null, // ✅ Fix: always defined (avoids TS2345)
    };

    if (opts?.token) body.token = opts.token;

    const resp = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      throw new Error("Failed to send chat message");
    }

    return await resp.json(); // ✅ returns { reply, in_flow, session_id? }
  },

  // ✅ GET ALL CHATS
  async getChats(userId: string): Promise<Chat[]> {
    const resp = await fetch(`${BASE_URL}/get_chats/${userId}`);
    if (!resp.ok) {
      throw new Error("Failed to fetch chats");
    }
    return await resp.json();
  },

  // ✅ DELETE CHAT
  async deleteChat(chatId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/delete_chat/${chatId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete chat");
  },

  // ✅ GET SINGLE CHAT MESSAGES
  async getChat(chatId: string): Promise<Message[]> {
    const resp = await fetch(`${BASE_URL}/get_chat/${chatId}`);
    if (!resp.ok) {
      throw new Error("Failed to fetch messages");
    }
    return await resp.json();
  },

  // ✅ CREATE NEW CHAT
  async createChat(userId: string, title: string): Promise<Chat> {
    const resp = await fetch(`${BASE_URL}/create_chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title }),
    });

    if (!resp.ok) {
      throw new Error("Failed to create chat");
    }

    return await resp.json();
  },

  // ✅ Dummy local bot reply (for testing if backend down)
  async generateResponse(userMessage: string): Promise<string> {
    const responses = [
      "That's an interesting point!",
      "Good question. Here's my take.",
      "I see where you're coming from.",
      "Let's explore that a bit more.",
    ];
    await new Promise((r) => setTimeout(r, 800));
    return `${responses[Math.floor(Math.random() * responses.length)]} (Echo: ${userMessage})`;
  },
};
