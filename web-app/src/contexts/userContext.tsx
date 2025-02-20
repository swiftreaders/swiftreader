import React, { createContext, useContext, useState, useEffect } from "react";
import { userService } from "@/services/userService";
import { useAuth } from "./authContext";

interface UserContextType {
  readingGoal: number;
  setReadingGoal: (goal: number) => Promise<boolean>;
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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [readingGoal, setReadingGoalState] = useState(1000); // Default goal

  useEffect(() => {
    if (user) {
      console.log("Getting user reading goal");
      userService.getReadingGoal(user.id).then((goal) => {
        if (goal) {
          setReadingGoalState(goal);
        }
      });
    }
  }, [user]);

  const setReadingGoal = async (goal: number) => {
    if (user){
      const success = await userService.setReadingGoal(goal, user.id);
      if (success) {
        setReadingGoalState(goal);
      }
      return success;
    } else {
      return false;
    }
  };

  const retrieveTotalReadingTime = async (userId: string) => {
    return await userService.retrieveReadingAmount(userId);
  };

  return (
    <UserContext.Provider
      value={{ readingGoal, setReadingGoal, retrieveTotalReadingTime }}
    >
      {children}
    </UserContext.Provider>
  );
};
