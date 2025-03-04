import { fetchBookContent, fetchBooks } from '@/services/bookService';
import { fetchGeneratedTexts } from '@/services/generateService';
import textService from '@/services/textService';
import { Category, Difficulty, Genre, NewTextType, Question, Text } from '@/types/text';
import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface TextManagementContextProps {
  // Core State
  texts: Text[];
  currentTextIndex: number;
  activeTab: "manual" | "find" | "generate";
  setActiveTab: (tab: "manual" | "find" | "generate") => void;

  // Manual Texts
  newManualText: NewTextType;
  setNewManualText: (text: NewTextType) => void;
  manualTextQuestions: Question[];
  setManualTextQuestions: (questions: Question[]) => void;

  // Found Texts
  foundTexts: NewTextType[];
  setFoundTexts: (texts: NewTextType[]) => void;
  findTextOptions: typeof DEFAULT_FIND_OPTIONS;
  setFindTextOptions: (options: typeof DEFAULT_FIND_OPTIONS) => void;
  isFinding: boolean;

  // Generated Texts
  generatedTexts: NewTextType[];
  setGeneratedTexts: (texts: NewTextType[]) => void;
  generateTextOptions: typeof DEFAULT_GENERATE_OPTIONS;
  setGenerateTextOptions: (options: typeof DEFAULT_GENERATE_OPTIONS) => void;
  isGenerating: boolean;

  // Helper Functions
  getCurrentText: () => NewTextType;

  // Handlers
  handleGenerateText: () => Promise<void>;
  handleFindText: () => Promise<void>;
  handleModifyQuestion: (questionIndex: number, field: keyof Question, value: string) => void;
  handleAddQuestion: () => void;
  handleRemoveQuestion: (questionIndex: number) => void;
  handleModifyText: (field: string, value: any) => void;
  handleRejectText: () => void;
  handleNextText: () => void;
  handlePreviousText: () => void;
  handleAddText: () => void;
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
};

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

  // Hooks
  useEffect(() => {
    const unsubscribe = textService.getTexts(setTexts);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentTextIndex(0);
  }, [activeTab]);

  // Helper Functions
  const getCurrentText = () => {
    switch (activeTab) {
      case "find":
        return foundTexts[currentTextIndex];
      case "generate":
        return generatedTexts[currentTextIndex];
      case "manual":
        return newManualText;
      default:
        return DEFAULT_NEW_TEXT;
    }
  };

  // Question Helpers
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

  const updateTextField = (
    texts: NewTextType[],
    currentTextIndex: number,
    field: string,
    value: any
  ): NewTextType[] => {
    const updated = [...texts];
    const current = updated[currentTextIndex];

    // Update the specified field with the new value
    updated[currentTextIndex] = { ...current, [field]: value };
    return updated;
  };

  // Handlers
  const handleGenerateText = async () => {
    try {
      setIsGenerating(true);
      setGeneratedTexts([]);
      const aiGeneratedTexts = await fetchGeneratedTexts(
        generateTextOptions.category,
        generateTextOptions.minLength,
        generateTextOptions.maxLength
      );
      setGeneratedTexts(aiGeneratedTexts);
    } catch (error) {
      console.error("Error generating texts:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFindText = async () => {
    try {
      setIsFinding(true);
      setFoundTexts([]);
      console.log("findTextOptions.genre - ", findTextOptions.genre);
      const knownTitles = texts.map((text) => text.title);
      const booksMetadata = await fetchBooks(
        findTextOptions.genre,
        knownTitles
      );
      console.log("found book subjects - ", booksMetadata[0].genre);
      const processingPromises = booksMetadata.map(async (book) => {
        try {
          const processedBook = await fetchBookContent(
            book,
            findTextOptions.minLength,
            findTextOptions.maxLength
          );

          const isValidText = processedBook.isValid;

          if (isValidText) {
            setFoundTexts((prev) => [...prev, processedBook]);
          }
        } catch (error) {
          console.error("Error processing book:", error);
        }
      });
      await Promise.all(processingPromises);
    } catch (error: any) {
      if (error.message.includes("Network Error")) {
        alert(
          "Network error occurred. Please check your internet connection and try again."
        );
      } else {
        console.error(`Error: ${error.message}`);
      }
    } finally {
      setIsFinding(false);
    }
  };

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
      default:
        return;
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
      default:
        return;
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
      default:
        return;
    }
  };

  const handleModifyText = (field: string, value: any) => {
    switch (activeTab) {
      case "find":
        return setFoundTexts((prev) => updateTextField(prev, currentTextIndex, field, value));
      case "generate":
        return setGeneratedTexts((prev) => updateTextField(prev, currentTextIndex, field, value));
      case "manual":
        return setNewManualText((prev) => updateTextField([prev], 0, field, value)[0]);
      default:
        return;
    }
  };

  // Text Navigation
  const handleRejectText = () => {
    if (!getCurrentText().isAI) {
      setFoundTexts((prev) => prev.filter((_, index) => index !== currentTextIndex));
    } else {
      setGeneratedTexts((prev) => prev.filter((_, index) => index !== currentTextIndex));
    }
    setCurrentTextIndex(0);
  };

  const handleNextText = () => {
    if (!getCurrentText().isAI) {
      setCurrentTextIndex((prev) => (prev + 1) % foundTexts.length);
    } else {
      setCurrentTextIndex((prev) => (prev + 1) % generatedTexts.length);
    }
  };

  const handlePreviousText = () => {
    if (!getCurrentText().isAI) {
      setCurrentTextIndex((prev) => (prev - 1 + foundTexts.length) % foundTexts.length);
    } else {
      setCurrentTextIndex((prev) => (prev - 1 + generatedTexts.length) % generatedTexts.length);
    }
  };

  const handleAddText = () => {
    const currentText = getCurrentText();
    const newText = new Text(
      currentText.title,
      currentText.content,
      currentText.difficulty,
      currentText.isFiction,
      currentText.isFiction ? currentText.genre : currentText.category,
      currentText.questions,
    );
    textService.addText(newText);
    const ind = currentTextIndex;
    switch (activeTab) {
      case "find":
        setFoundTexts((prev) => prev.filter((_, index) => index !== currentTextIndex));
        setCurrentTextIndex((ind - 1) % foundTexts.length);
        break;
      case "generate":
        setGeneratedTexts((prev) => prev.filter((_, index) => index !== currentTextIndex));
        setCurrentTextIndex((ind - 1) % generatedTexts.length);
        break;
      case "manual":
        setNewManualText(DEFAULT_NEW_TEXT);
        break;
      default:
        break;
    }
  };

  return (
    <TextManagementContext.Provider
      value={{
        // Core State
        texts,
        currentTextIndex,
        activeTab,
        setActiveTab,

        // Manual Texts
        newManualText,
        setNewManualText,
        manualTextQuestions,
        setManualTextQuestions,

        // Found Texts
        foundTexts,
        setFoundTexts,
        findTextOptions,
        setFindTextOptions,
        isFinding,

        // Generated Texts
        generatedTexts,
        setGeneratedTexts,
        generateTextOptions,
        setGenerateTextOptions,
        isGenerating,

        // Helper Functions
        getCurrentText,

        // Handlers
        handleGenerateText,
        handleFindText,
        handleModifyQuestion,
        handleAddQuestion,
        handleRemoveQuestion,
        handleModifyText,
        handleRejectText,
        handleNextText,
        handlePreviousText,
        handleAddText,
      }}
    >
      {children}
    </TextManagementContext.Provider>
  );
};

export { TextManagementContext, TextManagementProvider };