import React, { createContext, useContext, useState, useEffect } from "react";


import { textService } from "@/services/textService";
import { Text } from "@/types/text";
import { userService } from "@/services/userService";

interface AdminDashboardContextType {
  texts: Text[];
  addText: (text: Text) => Promise<boolean>;
  updateText: (updatedText: Text) => Promise<boolean>;
  removeText: (id: string) => Promise<boolean>;
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

  useEffect(() => {
    const unsubscribe = textService.getTexts(setTexts);
    return () => unsubscribe();
  }, []);

  const addText = async (text: Text) => textService.addText(text);

  const updateText = async (updatedText: Text) => textService.updateText(updatedText);

  const removeText = async (id: string) => textService.removeText(id);

  const removeUser = async (id: string) => userService.removeUser(id);

  return (
    <AdminDashboardContext.Provider
      value={{ texts, addText, updateText, removeText, removeUser }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
};
