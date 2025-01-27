import React, { createContext, useContext, useState, useEffect } from "react";
import { Text } from "@/types/text";
import { testService } from "@/services/exampleService";

interface TestDashboardContextType {
  texts: Text[];
  addText: (text: Text) => Promise<boolean>;
  updateText: (content: string, id: string) => Promise<boolean>;
  removeText: (id: string) => Promise<boolean>;
}

const TestDashboardContext = createContext<
  TestDashboardContextType | undefined
>(undefined);

export const useTestDashboard = () => {
  const context = useContext(TestDashboardContext);
  if (!context) {
    throw new Error(
      "useTestDashboard must be used within a TestDashboardProvider"
    );
  }
  return context;
};

export const TestDashboardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [texts, setTexts] = useState<Text[]>([]);

  useEffect(() => {
    const unsubscribe = testService.getTexts(setTexts);
    return () => unsubscribe();
  }, []);

  const addText = async (text: Text) => testService.addText(text);

  const updateText = async (content: string, id: string) =>
    testService.updateText(content, id);

  const removeText = async (id: string) => testService.removeText(id);

  return (
    <TestDashboardContext.Provider
      value={{ texts, addText, updateText, removeText }}
    >
      {children}
    </TestDashboardContext.Provider>
  );
};
