import React, { createContext, useContext, useState, useEffect } from "react";

// import backend functions to perform CRUD operations on the texts
import { sessionService } from "@/services/sessionservice";

import { Text, Category, Difficulty } from "@/types/text";
import { User } from "@/types/user";
import { userService } from "@/services/userservice";
import { Session } from "@/types/sessions"

interface ReadingSessionsContextType {
    recentSessions: Session[];
    text: Text | undefined;
    getText: (category: Category, difficulty: Difficulty, isFiction: boolean, length: number) => Promise<Text | undefined>;
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

  useEffect(() => {
    const unsubscribe = sessionService.getRecentSessions(setRecentSessions);
    return () => unsubscribe();
  }, []);
    
    const getText = async (
        category: Category, 
        difficulty: Difficulty, 
        isFiction: boolean, 
        length: number): Promise<Text | undefined> => { 
            // Dynamically build constraints based on non-null arguments
            const constraints: { [key: string]: any } = {};

            if (category != null) constraints.category = category;
            if (difficulty != null) constraints.difficulty = difficulty;
            if (isFiction != null) constraints.isFiction = isFiction;
            if (length != null) constraints.wordLength = length;

            const text = sessionService.getText(constraints)
            return undefined

            // TODO: Call sessionService.getText() which finds a random text based on filters given
            // setText to set the state for text property
         };

    return (
        <ReadingSessionContext.Provider
            value = {{ recentSessions, text, getText }}
        >
            {children}  
        </ReadingSessionContext.Provider>
    )

}