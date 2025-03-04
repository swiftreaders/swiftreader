import { fetchBookContent, fetchBooks } from '@/services/bookService';
import { fetchGeneratedTexts } from '@/services/generateService';
import textService from '@/services/textService';
import { Category, Difficulty, Genre, NewTextType, Question, Text } from '@/types/text';
import { Timestamp } from 'firebase/firestore';
import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface TextManagementContextProps {
  text: string;
  setText: (text: string) => void;
}

const DEFAULT_NEW_TEXT: NewTextType = {
  title: "",
  content: "",
  difficulty: Difficulty.EASY,
  isFiction: true,
  genre: Genre.FANTASY,
  category: Category.NATURE,
  text_link: "",
  wordLength: 0,
  questions: [],
  isValid: false,
  isAI: false,
}
const DEFAULT_FIND_OPTIONS = {
  genre: Genre.FANTASY, // default to fantasy at the start
  difficulty: Difficulty.EASY,
  minLength: 100,
  maxLength: 500,
};
const DEFAULT_GENERATE_OPTIONS = {
  category: Category.SCIENCE, // Default to a non-fiction category
  difficulty: Difficulty.EASY,
  minLength: 100,
  maxLength: 500,
};

const TextManagementContext = createContext<TextManagementContextProps | undefined>(undefined);

const TextManagementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  // Core State
  const [texts, setTexts] = useState<Text[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"manual" | "find" | "generate">("manual");
  
  // Manual Texts
  const [newManualText, setNewManualText] = useState<NewTextType>(DEFAULT_NEW_TEXT);
  const [manualTextQuestions, setManualTextQuestions] = useState<Question[]>([]);

  // Found Texts
  const [foundTexts, setFoundTexts] = useState<NewTextType[]>([]);
  const [findTextOptions, setFindTextOptions] = useState(DEFAULT_FIND_OPTIONS);
  const [isFinding, setIsFinding] = useState(false);

  // Generated Texts
  const [generatedTexts, setGeneratedTexts] = useState<NewTextType[]>([]);
  const [generateTextOptions, setGenerateTextOptions] = useState(DEFAULT_GENERATE_OPTIONS);
  const [isGenerating, setIsGenerating] = useState(false);

  const getCurrentText = () => {
    switch (activeTab) {
      case "find":
        return foundTexts[currentTextIndex];
      case "generate":
        return generatedTexts[currentTextIndex];
      default:
        return DEFAULT_NEW_TEXT;
    }
  };


  // HOOKS
  useEffect(() => {
    const unsubscribe = textService.getTexts(setTexts);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentTextIndex(0);
  }, [activeTab]);

  // ACTION Helpers

  // QUESTION HELPERS
  const updateQuestions = (
    texts: NewTextType[],
    currentTextIndex: number,
    questionIndex: number,
    field: keyof Question,
    value: string
  ): NewTextType[] => {
    const updated = [...texts];
    const current = updated[currentTextIndex];
    const updatedQuestions = [...(current.questions || [])];
  
    if (field === "choices") {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        choices: value.split(",").map((choice) => choice.trim()),
      };
    } else {
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        [field]: value,
      };
    }
  
    updated[currentTextIndex] = { ...current, questions: updatedQuestions };
    return updated;
  };

  const addQuestionToTexts = (
    texts: NewTextType[],
    currentTextIndex: number
  ): NewTextType[] => {
    const updated = [...texts];
    const current = updated[currentTextIndex];
    const updatedQuestions = [...(current.questions || [])];
  
    // Add a new question with default values
    updatedQuestions.push({
      question: "",
      choices: ["", "", "", ""],
      answer: "",
    });
  
    // Update the current text with the new questions
    updated[currentTextIndex] = { ...current, questions: updatedQuestions };
    return updated;
  };

  const removeQuestionFromTexts = (
    texts: NewTextType[],
    currentTextIndex: number,
    questionIndex: number
  ): NewTextType[] => {
    const updated = [...texts];
    const current = updated[currentTextIndex];
    const updatedQuestions = [...(current.questions || [])];
  
    // Remove the question at the specified index
    updatedQuestions.splice(questionIndex, 1);
  
    // Update the current text with the modified questions
    updated[currentTextIndex] = { ...current, questions: updatedQuestions };
    return updated;
  };

  

  // HANDLERS
  const handleModifyQuestion = (
    questionIndex: number,
    field: keyof Question,
    value: string
  ) => {
    switch (activeTab) {
      case "find":
        return setFoundTexts((prev) => updateQuestions(prev, currentTextIndex, questionIndex, field, value));
      case "generate":
        return setGeneratedTexts((prev) => updateQuestions(prev, currentTextIndex, questionIndex, field, value));
      case "manual":
        return setNewManualText((prev) => updateQuestions([prev], 0, questionIndex, field, value)[0]);
    }
  };

  const handleAddQuestion = () => {
    switch (activeTab) {
      case "find":
        return setFoundTexts((prev) => addQuestionToTexts(prev, currentTextIndex));
      case "generate":
        return setGeneratedTexts((prev) => addQuestionToTexts(prev, currentTextIndex));
      case "manual":
        return setNewManualText((prev) => addQuestionToTexts([prev], 0)[0]);
    }
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    switch (activeTab) {
      case "find":
        return setFoundTexts((prev) => removeQuestionFromTexts(prev, currentTextIndex, questionIndex));
      case "generate":
        return setGeneratedTexts((prev) => removeQuestionFromTexts(prev, currentTextIndex, questionIndex));
      case "manual":
        return setNewManualText((prev) => removeQuestionFromTexts([prev], 0, questionIndex)[0]);
    }
  };


  return (
    <TextManagementContext.Provider value={{ text, setText }}>
      {children}
    </TextManagementContext.Provider>
  );
};

export { TextManagementContext, TextManagementProvider };