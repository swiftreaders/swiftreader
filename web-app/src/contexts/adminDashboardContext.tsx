import React, { createContext, useContext, useState, useEffect } from "react";

// import backend functions to perform CRUD operations on the texts
import { textService } from "@/services/textservice";

// import necessary types
import { Text, User } from "@/types/text";
import { userService } from "@/services/userservice";

interface AdminDashboardContextType {
  texts: Text[];
  addText: (text: Text) => Promise<boolean>;
  updateText: (content: string, id: string) => Promise<boolean>;
  removeText: (id: string) => Promise<boolean>;
  users: User[];
  removeUser: (id: string) => Promise<boolean>;
}

const AdminDashboardContext = createContext<
  AdminDashboardContextType | undefined
>(undefined);

export const useAdminDashboard = () => {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error(
      "useAdminDashboard must be used within a AdminDashboardProvider"
    );
  }
  return context;
};

export const AdminDashboardProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [texts, setTexts] = useState<Text[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = textService.getTexts(setTexts);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = userService.getUsers(setUsers);
    return () => unsubscribe();
  }, []);

  const addText = async (text: Text) => textService.addText(text);

  const updateText = async (content: string, id: string) =>
    textService.updateText(content, id);

  const removeText = async (id: string) => textService.removeText(id);

  const removeUser = async (id: string) => userService.removeUser(id);

  return (
    <AdminDashboardContext.Provider
      value={{ texts, addText, updateText, removeText, users, removeUser }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
};
