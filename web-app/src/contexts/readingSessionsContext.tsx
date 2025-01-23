import React, { createContext, useContext, useState, useEffect } from "react";

// import backend functions to perform CRUD operations on the texts
import { textService } from "@/services/textservice";

import { Text, Category, Difficulty } from "@/types/text";
import { User } from "@/types/user";
import { userService } from "@/services/userservice";
import { SavedSession } from "@/types/sessions"

interface ReadingSessionsContextType {
    recentSessions: SavedSession[];
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
    
    const [recentSessions, setRecentSessions] = useState<SavedSession[]>([]);
    const [text, setText] = useState<Text | undefined>(undefined);

  // Stub for reading sessions - TODO: Replace this with Firebase call later
  useEffect(() => {
    const sessions = [
      new SavedSession(
        "1", // sessionId
        "testText1", // text id
        "testUser1", // user id
        "Test Text 1", // text title
        "2022-01-01", // date  
        30, // test duration
        Array(6).fill(120), // wpm
        "mode 1", // session type
        "easy", // difficulty
      ), 
      new SavedSession(
        "2", // sessionId
        "testText2", // text id
        "testUser2", // user id
        "Test Text 2", // text title
        "2022-01-02", // date  
        60, // test duration
        Array(12).fill(120), // wpm
        "mode 2", // session type
        "medium", // difficulty
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