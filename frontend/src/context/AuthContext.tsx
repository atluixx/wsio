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
        if (typeof window !== "undefined") {
          localStorage.setItem("wsio_user", JSON.stringify(activeUser));
          sessionStorage.setItem("wsio_session_user", JSON.stringify(activeUser));
        }
      } else {
        // Fallback check from memory/storage if available
        const stored = typeof window !== "undefined"
          ? localStorage.getItem("wsio_user") || sessionStorage.getItem("wsio_session_user")
          : null;
        if (stored) {
          try {
            setUserState(JSON.parse(stored));
          } catch {
            if (typeof window !== "undefined") {
              localStorage.removeItem("wsio_user");
              sessionStorage.removeItem("wsio_session_user");
            }
          }
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) {
        localStorage.setItem("wsio_user", JSON.stringify(u));
        sessionStorage.setItem("wsio_session_user", JSON.stringify(u));
      } else {
        localStorage.removeItem("wsio_user");
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
