import React, { createContext, useContext, useState, useEffect } from "react";

// import backend functions to perform CRUD operations on the texts
import { textService } from "@/services/textservice";

// import necessary types
import { Text } from "@/types/text";

interface AdminDashboardContextType {
  texts: Text[];
  addText: (text: Text) => Promise<boolean>;
  updateText: (content: string, id: string) => Promise<boolean>;
  removeText: (id: string) => Promise<boolean>;
  // users: string[];
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

  const updateText = async (content: string, id: string) =>
    textService.updateText(content, id);

  const removeText = async (id: string) => textService.removeText(id);

  return (
    <AdminDashboardContext.Provider
      value={{ texts, addText, updateText, removeText }}
    >
      {children}
    </AdminDashboardContext.Provider>
  );
};
