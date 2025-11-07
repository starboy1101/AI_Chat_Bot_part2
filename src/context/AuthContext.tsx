import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthState } from "../types";
import { api } from "../services/api";

interface AuthContextType extends AuthState {
  login: (demoId: string, password: string) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isGuest: false,
  });

  // 🔄 Restore saved user and verify token on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return;

      try {
        const user = JSON.parse(savedUser);
        // Check if backend still considers this session valid
        if (user?.id && user?.token) {
          const valid = await api.verifyLogin(user.id, user.token);
          if (valid) {
            setAuthState({
              user,
              isAuthenticated: true,
              isGuest: false,
            });
            return;
          }
        }
        // Token invalid — logout
        localStorage.removeItem("user");
      } catch {
        localStorage.removeItem("user");
      }
    };

    restoreSession();
  }, []);

  // 🔐 Login through backend
  const login = async (demoId: string, password: string) => {
    try {
      const user = await api.login(demoId, password);
      // Expected: { id, name, token, ... }
      localStorage.setItem("user", JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isGuest: false,
      });
    } catch (error) {
      throw new Error("Invalid demo ID or password");
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("user");
    setAuthState({
      user: null,
      isAuthenticated: false,
      isGuest: false,
    });
  };

  // 👤 Continue as Guest
  const continueAsGuest = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isGuest: true,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
