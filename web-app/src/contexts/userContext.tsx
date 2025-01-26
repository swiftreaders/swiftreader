import React, { createContext, useContext, useState, useEffect } from "react";
import { userService } from "@/services/userservice";
import { User } from "@/types/user";

interface UserContextType {
  readingGoal: number;
  setReadingGoal: (goal: number, userId: string) => Promise<boolean>;
  retrieveTotalReadingTime: (userId: string) => Promise<number>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [readingGoal, setReadingGoalState] = useState(1000); // Default goal

  const setReadingGoal = async (goal: number, userId: string) => {
    const success = await userService.setReadingGoal(goal, userId);
    if (success) {
      setReadingGoalState(goal);
    }
    return success;
  };

  const retrieveTotalReadingTime = async (userId: string) => {
    return await userService.retrieveReadingAmount(userId);
  };

  return (
    <UserContext.Provider value={{ readingGoal, setReadingGoal, retrieveTotalReadingTime }}>
      {children}
    </UserContext.Provider>
  );
};