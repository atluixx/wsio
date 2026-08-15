"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, fetchCurrentUser } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt session restoration via secure HTTP cookie / session endpoint
    async function initAuth() {
      const activeUser = await fetchCurrentUser();
      if (activeUser && activeUser.id) {
        setUserState(activeUser);
      } else {
        // Fallback check from memory if available
        const stored = typeof window !== "undefined" ? sessionStorage.getItem("wsio_session_user") : null;
        if (stored) {
          try {
            setUserState(JSON.parse(stored));
          } catch {
            sessionStorage.removeItem("wsio_session_user");
          }
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("wsio_session_user", JSON.stringify(u));
      }
    } else {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("wsio_session_user");
      }
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
