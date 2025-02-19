"use client";

import { useState } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { Category, Difficulty, Text, Question, Genre } from "@/types/text";
import { Book, fetchBooks, fetchBookContent } from "@/services/bookService";
import { GenText } from "@/services/generateService";
import { UpdateTextPopup } from "@/components/UpdateTextPopup";
import { ExistingTextCard } from "@/components/ExistingTextCard";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/errors/accessDenied";
import { Timestamp } from "firebase/firestore";
import { QuestionCard } from "@/components/QuestionCard";

// Default text instance for initializing forms
const DEFAULT_TEXT = new Text("", "", Difficulty.EASY, false ,Category.NATURE);

const AdminDashboardContent = () => {
  const { texts, addText, updateText, removeText } = useAdminDashboard();

  // State for new text entries
  const [newManualText, setNewManualText] = useState(DEFAULT_TEXT);
  const [manualTextQuestions, setManualTextQuestions] = useState<Question[]>([]);
  const [newFoundText, setNewFoundText] = useState(DEFAULT_TEXT);
  const [findTextOptions, setFindTextOptions] = useState({
    genre: Genre.FANTASY,  // default to fantasy at the start
    difficulty: Difficulty.EASY,
    minLength: 100,
    maxLength: 500,
  });
  const [newGeneratedText, setNewGeneratedText] = useState(DEFAULT_TEXT);
  const [generateTextOptions, setGenerateTextOptions] = useState<{
    genre?: Genre;
    category?: Category;
    difficulty: Difficulty;
    minLength: number;
    maxLength: number;
  }>({
    genre: Genre.FANTASY, // Default to a fiction genre
    difficulty: Difficulty.EASY,
    minLength: 100,
    maxLength: 500,
  });

  const [activeTab, setActiveTab] = useState<"manual" | "find" | "generate">("manual");
  const [foundTexts, setFoundTexts] = useState<Book[]>([]);
  const [generatedTexts, setGeneratedTexts] = useState<GenText[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const currentText = activeTab === "find" ? foundTexts[currentTextIndex] : generatedTexts[currentTextIndex];
  const [isLoading, setIsLoading] = useState(false);

  // State for update popup
  const [updatePopupOpen, setUpdatePopupOpen] = useState(false);
  const [selectedTextForUpdate, setSelectedTextForUpdate] = useState<Text | null>(null);


  const handleAddText = () => {
    let newText: Text | null = null;
    if (activeTab === "manual") {
      newText = new Text(
        newManualText.title,
        newManualText.content,
        newManualText.difficulty,
        newManualText.isFiction,
        (newManualText.isFiction ? newManualText.genre : newManualText.category) ?? Category.NATURE,
        "", // ID will be generated by Firebase
        Timestamp.fromMillis(Date.now()),
        Timestamp.fromMillis(Date.now()),
        newManualText.content.split(" ").length,
        manualTextQuestions // Include questions
      );
      setNewManualText(DEFAULT_TEXT);
      setManualTextQuestions([]);
    } else {
      newText = newFoundText;
      setNewFoundText(DEFAULT_TEXT);
    }
    if (!newText.title || !newText.content) {
      alert("Title and content are required!");
      return;
    }
    console.log(
      "newText:",
      newText.title,
      newText.content,
      newText.difficulty,
      newText.isFiction,
      newText.isFiction ? newText.genre : newText.category
    );
    addText(newText);
  };

  const handleManualQuestionChange = (
    questionIndex: number,
    field: keyof Question,
    value: string
  ) => {
    setManualTextQuestions((prev) => {
      const updatedQuestions = [...prev];
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
      return updatedQuestions;
    });
  };
  
  const handleAddManualQuestion = () => {
    setManualTextQuestions((prev) => [
      ...prev,
      { question: "", choices: ["", "", "", ""], answer: "" },
    ]);
  };
  
  const handleRemoveManualQuestion = (index: number) => {
    setManualTextQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFindText = async () => {
    try {
      setIsLoading(true);
      setFoundTexts([]);
      console.log("findTextOptions.genre - ", findTextOptions.genre);
      const knownTitles = texts.map((text) => text.title);
      const booksMetadata = await fetchBooks(findTextOptions.genre);
      console.log("found book subjects - ", booksMetadata[0].subject);
      const processingPromises = booksMetadata.map(async (book) => {
        try {
          const processedBook = await fetchBookContent(book, findTextOptions.minLength, findTextOptions.maxLength);

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
        alert("Network error occurred. Please check your internet connection and try again.");
      } else {
        console.error(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveText = () => {
    const currentText = foundTexts[currentTextIndex];
    console.log("currentText subject:", currentText);
    if (currentText) {
      addText(
        new Text(
          currentText.title,
          currentText.content,
          currentText.difficulty,
          true,
          currentText.subject,
          currentText.id,
          Timestamp.fromMillis(Date.now()),
          Timestamp.fromMillis(Date.now()),
          currentText.content.split(" ").length,
          currentText.questions
        )
      );
      setFoundTexts((prev) => prev.filter((_, index) => index !== currentTextIndex));
    }
  };

  const handleRejectText = () => {
    setFoundTexts((prev) => prev.filter((_, index) => index !== currentTextIndex));
  };

  const handleNextText = () => {
    setCurrentTextIndex((prev) => (prev + 1) % foundTexts.length);
  };

  const handlePreviousText = () => {
    setCurrentTextIndex((prev) => (prev - 1 + foundTexts.length) % foundTexts.length);
  };

  const handleQuestionChange = (
    questionIndex: number,
    field: keyof Question,
    value: string
  ) => {
    setFoundTexts((prev) => {
      const updated = [...prev];
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
    });
  };

  const removeQuestion = (questionIndex: number) => {
    setFoundTexts((prev) => {
      const updated = [...prev];
      const current = updated[currentTextIndex];
      const updatedQuestions = [...(current.questions || [])];
      updatedQuestions.splice(questionIndex, 1);
      updated[currentTextIndex] = { ...current, questions: updatedQuestions };
      return updated;
    });
  };

  const addQuestion = () => {
    setFoundTexts((prev) => {
      const updated = [...prev];
      const current = updated[currentTextIndex];
      const updatedQuestions = [...(current.questions || [])];
      updatedQuestions.push({ question: "", choices: ["", "", "", ""], answer: "" });
      updated[currentTextIndex] = { ...current, questions: updatedQuestions };
      return updated;
    });
  };

  const updateFoundText = (field: string, value: any) => {
    setFoundTexts(prev => {
      const updated = [...prev];
      updated[currentTextIndex] = {
        ...updated[currentTextIndex],
        [field]: value
      };
      return updated;
    });
  };


/* ===================== components ===================== */

  const renderManualTextSection = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={newManualText.title}
          onChange={(e) =>
            setNewManualText({ ...newManualText, title: e.target.value } as Text)
          }
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          placeholder="Content"
          value={newManualText.content}
          onChange={(e) =>
            setNewManualText({ ...newManualText, content: e.target.value } as Text)
          }
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={6}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={newManualText.category}
              onChange={(e) =>
                setNewManualText({ ...newManualText, category: e.target.value as Category } as Text)
              }
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={newManualText.difficulty}
              onChange={(e) =>
                setNewManualText({ ...newManualText, difficulty: e.target.value as Difficulty } as Text)
              }
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {Object.values(Difficulty).map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={newManualText.isFiction}
            onChange={(e) =>
              setNewManualText({ ...newManualText, isFiction: e.target.checked } as Text)
            }
            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-gray-700">Is Fiction?</span>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
            <button
              onClick={handleAddManualQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Add Question
            </button>
          </div>

          {manualTextQuestions.length > 0 ? (
            <div className="space-y-2">
              {manualTextQuestions.map((question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  index={index}
                  handleQuestionChange={handleManualQuestionChange}
                  handleRemoveQuestion={handleRemoveManualQuestion}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500">No questions added yet.</p>
            </div>
          )}
        </div>

        <button
          onClick={handleAddText}
          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-md transition-all duration-200 hover:bg-blue-700"
        >
          Add Text
        </button>
      </div>
    );
  };

  const renderNavigateFoundTextsSection = () => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-gray-100">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={handlePreviousText}
              className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600">
              {currentTextIndex + 1} / {foundTexts.length}
            </span>
            <button
              onClick={handleNextText}
              className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              Next →
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApproveText}
              className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            >
              👍 Approve
            </button>
            <button
              onClick={handleRejectText}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              👎 Reject
            </button>
          </div>
        </div>
  
        {/* Text Content Card */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <input
            type="text"
            value={currentText.title}
            onChange={(e) => updateFoundText('title', e.target.value)}
            className="w-full text-2xl font-bold mb-4 bg-transparent focus:outline-none border-b-2 border-transparent focus:border-indigo-500"
          />
          <textarea
            value={currentText.content}
            onChange={(e) => updateFoundText('content', e.target.value)}
            className="w-full h-64 bg-transparent focus:outline-none resize-none font-serif text-gray-700 leading-relaxed"
          />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>📝 {currentText.content.trim().split(/\s+/).length} words</span>
            <div className="flex items-center gap-2">
              <span>Difficulty:</span>
              <select
                value={currentText.difficulty}
                onChange={(e) => updateFoundText('difficulty', e.target.value)}
                className="bg-white px-3 py-1 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(Difficulty).map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
  
        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">📚 Questions</h3>
            <button
              onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add Question
            </button>
          </div>
  
          {currentText.questions?.length > 0 ? (
          <div className="grid gap-2">
            {currentText.questions.map((q, i) => (
              <QuestionCard
                key={i}
                question={q}
                index={i}
                handleQuestionChange={handleQuestionChange}
                handleRemoveQuestion={removeQuestion}/>
            ))}
          </div>
                ) : (
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No questions yet. Add one to get started!</p>
          </div>
        )}
        </div>
      </div>
    );
  };



  const renderTextManagementSection = () => {
    return (
      <section className="bg-white rounded-lg shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Add New Text</h2>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
              activeTab === "manual"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab("find")}
            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
              activeTab === "find"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Find
          </button>
        </div>

        {activeTab === "manual" ? (
          renderManualTextSection()
        ) : (
          <div className="space-y-6">
            <label className="text-gray-600 text-sm">
              This feature enables you to search for books from Gutendex&apos;s open book library, select your preferred genre and specify the desired word count range. Once you click &quot;Find Text&quot;, the system will fetch matching book metadata and process the content so you can review and approve the text.
            </label>
            <div className="flex flex-wrap gap-4">
              {/* Genre Filter */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                <select
                  value={findTextOptions.genre}
                  onChange={(e) =>
                    setFindTextOptions({
                      ...findTextOptions,
                      genre: e.target.value as Genre,
                    })
                  }
                  className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {Object.values(Genre).map((gen) => (
                    <option key={gen} value={gen}>
                      {gen.charAt(0).toUpperCase() + gen.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {/* Word Range Filters */}
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Word Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={findTextOptions.minLength}
                    onChange={(e) =>
                      setFindTextOptions({
                        ...findTextOptions,
                        minLength: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={findTextOptions.maxLength}
                    onChange={(e) =>
                      setFindTextOptions({
                        ...findTextOptions,
                        maxLength: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={handleFindText}
                disabled={isLoading}
                className="w-full py-3 bg-green-600 text-white rounded-md transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Finding...
                  </span>
                ) : (
                  "Find Text"
                )}
              </button>
            </div>

            {/* Found Texts Navigation */}
            {currentText && renderNavigateFoundTextsSection()}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-work-sans">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white">Swiftreaders Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">Manage and fine-tune your texts with ease</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8">
        {renderTextManagementSection()}

        {/* Existing Texts Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Existing Texts</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {texts.map((text) => (
              <ExistingTextCard
                key={text.id}
                text={text}
                onUpdate={() => {
                  setSelectedTextForUpdate(text);
                  setUpdatePopupOpen(true);
                }}
                onRemove={() => {
                  if (window.confirm(`Are you sure you want to remove "${text.title}"?`))
                    removeText(text.id);
                }}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Update Text Popup */}
      {updatePopupOpen && selectedTextForUpdate && (
        <UpdateTextPopup
          text={selectedTextForUpdate}
          onClose={() => {
            setUpdatePopupOpen(false);
            setSelectedTextForUpdate(null);
          }}
          onSave={(updatedText) => {
            updateText(updatedText);  
            setUpdatePopupOpen(false);
            setSelectedTextForUpdate(null);
          }}
        />
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      {user?.isAdmin ? (
        <AdminDashboardProvider>
          <AdminDashboardContent />
        </AdminDashboardProvider>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
};

export default AdminDashboard;
