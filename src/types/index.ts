// Represents an authenticated or demo user
export interface User {
  id: string;       // user_id used during login
  token: string;    // backend-issued UUID token
}

// Represents a chat session (one full conversation)
export interface Chat {
  id: string;
  user_id: string;      // ✅ renamed from demo_user_id → matches backend
  title: string;
  created_at: string;
  updated_at: string;
}

// Represents a single chat message
export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Represents the logged-in or guest state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

// ✅ Represents backend /chat endpoint response
export interface ChatResponse {
  reply: string;
  in_flow: boolean;
  session_id?: string;  // ✅ added (backend may return this)
  node_id?: string;
  options?: { label: string; next: string }[];
  context?: Record<string, any>;
}
