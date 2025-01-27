"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/userService";
import { auth0 } from "@/lib/auth0";

interface AuthContextType {
  loggedIn: boolean;
  userId: string | null;
  user: User | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  initialSession?: any;
}> = ({ children, initialSession }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  const refreshUser = async () => {
    try {
      const session = await auth0.getSession();
      if (session?.user) {
        const currUser = await userService.getUser(session.user.sub);
        setUser(currUser);
        setUserId(currUser?.id || null);
        setLoggedIn(true);
      } else {
        setUser(null);
        setUserId(null);
        setLoggedIn(false);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  // 🔹 Sync session on mount (no polling)
  useEffect(() => {
    if (initialSession?.user) {
      userService.getUser(initialSession.user.sub).then((currUser) => {
        setUser(currUser);
        setUserId(currUser?.id || null);
        setLoggedIn(true);
      });
    }
  }, [initialSession]);

  // 🔹 Detect session changes using storage events (multi-tab support)
  useEffect(() => {
    const handleStorageChange = async (event: StorageEvent) => {
      if (event.key === "auth0-session") {
        await refreshUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, userId, loggedIn, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
