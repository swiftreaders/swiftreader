import React, { createContext, useContext, useState, useEffect } from "react";

// import backend functions to perform CRUD operations on the texts
import { textService } from "@/services/textservice";

import { Text, Category, Difficulty } from "@/types/text";
import { User } from "@/types/user";
import { userService } from "@/services/userservice";
import { Session } from "@/types/sessions"

interface ReadingSessionsContextType {
    recentSessions: Session[];
    text: Text | undefined;
    getText: (category: Category, difficulty: Difficulty, isFiction: boolean, length: string) => Promise<Text | undefined>;
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
}

export const ReadingSessionProvider: React.FC<{
    children: React.ReactNode;
  }> = ({ children }) => { 
    
    const [recentSessions, setRecentSessions] = useState<Session[]>([]);
    const [text, setText] = useState<Text | undefined>(undefined);

  // Stub for reading sessions - TODO: Replace this with Firebase call later
  useEffect(() => {
    const sessions = [
      new Session(
        "1", // id
        "text1", // textId
        "user1", // userId
        "The Art of War", // title
        "2025-01-12", // date
        "10 min" // duration
      ),
      new Session(
        "2", // id
        "text2", // textId
        "user2", // userId
        "A Brief History of Time", // title
        "2025-01-10", // date
        "15 min" // duration
      ),
    ];

    setRecentSessions(sessions);
  }, []);
    
    const getText = async (
        category: Category, 
        difficulty: Difficulty, 
        isFiction: boolean, 
        length: string): Promise<Text | undefined> => { return undefined };

    return (
        <ReadingSessionContext.Provider
            value = {{ recentSessions, text, getText }}
        >
            {children}  
        </ReadingSessionContext.Provider>
    )

}