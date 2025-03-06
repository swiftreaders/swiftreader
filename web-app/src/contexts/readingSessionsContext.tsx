import React, { createContext, useContext, useState, useEffect } from "react";

// import backend functions to perform CRUD operations on the texts
import { sessionService } from "@/services/sessionService";

import { Text, Category, Difficulty, Genre } from "@/types/text";
import { Session } from "@/types/sessions";
import { useAuth } from "./authContext";

interface ReadingSessionsContextType {
  recentSessions: Session[];
  text: Text | null;
  setText: React.Dispatch<React.SetStateAction<Text | null>>;
  getText: (
    categoryOrGenre: Category | Genre | null,
    difficulty: Difficulty | null,
    isFiction: boolean,
    length: number | null,
    onUpdate: (loading: boolean) => void
  ) => void;
}

const ReadingSessionContext = createContext<
  ReadingSessionsContextType | undefined
>(undefined);

export const useReadingContext = () => {
  const context = useContext(ReadingSessionContext);
  if (!context) {
    throw new Error(
      "useReadingContext must be used within a ReadingSessionProvider"
    );
  }
  return context;
};

export const ReadingSessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [text, setText] = useState<Text | null>(null);

  useEffect(() => {
    console.log(user);
    const unsubscribe = sessionService.getRecentSessions(setRecentSessions, user ? user.id : "");
    return () => unsubscribe();
  }, [user]);

  const getText = async (
    categoryOrGenre: Category | Genre | null,
    difficulty: Difficulty | null,
    isFiction: boolean,
    length: number | null,
    onUpdate: (loading: boolean) => void
  ) => {
    // Dynamically build constraints based on non-null arguments
    const constraints: { [key: string]: any } = {};

    if (difficulty != null) constraints.difficulty = difficulty;
    if (isFiction != null) constraints.isFiction = isFiction;
    if (length != null) constraints.wordLength = length;

    if (isFiction) {
      if (categoryOrGenre != null) constraints.genre = categoryOrGenre as Genre;
    } else {
      if (categoryOrGenre != null)
        constraints.category = categoryOrGenre as Category;
    }

    const text = await sessionService.getText(constraints);
    setText(text);
    onUpdate(false);
  };

  return (
    <ReadingSessionContext.Provider value={{ recentSessions, text, setText, getText }}>
      {children}
    </ReadingSessionContext.Provider>
  );
};
