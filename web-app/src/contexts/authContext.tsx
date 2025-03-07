"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/userService";
import { useRouter } from "next/navigation";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [userId, setUserId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem("userId") : null
  );

  const [loggedIn, setLoggedIn] = useState<boolean>(!!user);
  const [authLoading, setAuthLoading] = useState(true);

  const router = useRouter();

  const refreshUser = async () => {
    setAuthLoading(true);
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      const session = data.session;

      if (session?.user) {
        const currUser = await userService.getUser(session.user.sub);
        setUser(currUser);
        setUserId(currUser?.id || null);
        setLoggedIn(true);

        // Store user data in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(currUser));
          localStorage.setItem("userId", currUser?.id || "");
        }
      } else {
        setUser(null);
        setUserId(null);
        setLoggedIn(false);

        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("userId");
        }
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
    setAuthLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userId, loggedIn, refreshUser }}>
      {!authLoading && children}
    </AuthContext.Provider>
  );
};
