import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { userService } from "@/services/userService";
import { useAuth } from "./authContext";
import { User } from "@/types/user";
import sessionService from "@/services/sessionService";
import { Session } from "@/types/sessions";

interface UserContextType {
  users: User[];
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
  const [users, setUsers] = useState<User[]>([]);
  const sessionUnsubscribers = useRef<Record<string, () => void>>({});

  useEffect(() => {
    const unsubscribeUsers = userService.getUsers((firestoreUsers) => {
      // Convert Firestore users to User class instances
      const initializedUsers = firestoreUsers.map(fu => 
        new User(
          fu.id,
          fu.name,
          fu.email,
          fu.isAdmin,
          fu.wpm || 0,  // Use existing wpm if available, else 0
          fu.joinDate,
          fu.readingGoal || 1000
        )
      );
      console.log("fetched users", initializedUsers.length);
      setUsers(initializedUsers);

      // Manage session subscriptions for each user
      initializedUsers.forEach(user => {
        if (!sessionUnsubscribers.current[user.id]) {
          sessionUnsubscribers.current[user.id] = sessionService.getRecentSessions(
            (sessions) => updateUserWpm(user.id, sessions, user.wpm),
            user.id
          );
        }
      });

      console.log("users and their wpms", initializedUsers.map(u => ({ id: u.id, wpm: u.wpm })));

      // Cleanup unused subscriptions
      const currentIds = initializedUsers.map(u => u.id);
      Object.keys(sessionUnsubscribers.current).forEach(id => {
        if (!currentIds.includes(id)) {
          sessionUnsubscribers.current[id]?.();
          delete sessionUnsubscribers.current[id];
        }
      });
    });

    return () => {
      unsubscribeUsers();
      Object.values(sessionUnsubscribers.current).forEach(unsub => unsub());
      sessionUnsubscribers.current = {};
    };
  }, []);

  const updateUserWpm = (userId: string, sessions: Session[], previousWPM: number) => {
    if (userId === user?.id) {
      console.log("processing trolling", sessions);
    }
    const validSessions = sessions.filter(s => s.average_wpm > 0 && s.getComprehensionScore() > 49);
    console.log("valid sessions", validSessions.length);
    const averageWpm = validSessions.length > 0 
      ? validSessions.reduce((sum, s) => sum + s.average_wpm, 0) / (validSessions.length)
      : 0;
    console.log("average wpm", averageWpm);

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return new User(
          u.id,
          u.name,
          u.email,
          u.isAdmin,
          Number(averageWpm.toFixed(1)),
          u.joinDate,
          u.readingGoal
        );
      }
      return u;
    }));

    if (userId === user?.id) {
      user!.wpm = averageWpm;
    }

    if (averageWpm != previousWPM) {
      userService.updateUser(userId, "wpm", averageWpm);
    }

  };

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
      value={{ users, readingGoal, setReadingGoal, retrieveTotalReadingTime }}
    >
      {children}
    </UserContext.Provider>
  );
};
