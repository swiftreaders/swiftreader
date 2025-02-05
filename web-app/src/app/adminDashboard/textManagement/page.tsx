"use client";

import { useState } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { Category, Difficulty, Text } from "@/types/text";
import { getTexts, Book, fetchBooks, fetchBookContent } from "@/services/bookService"; // Import your bookService function here



const DEFAULT_TEXT = new Text("", Category.NATURE, "", Difficulty.EASY, false); 

const AdminDashboardContent = () => {
  const { texts, addText, updateText, removeText } = useAdminDashboard();

  // State variables
  const [newManualText, setNewManualText] = useState(DEFAULT_TEXT);
  const [newGeneratedText, setNewGeneratedText] = useState(DEFAULT_TEXT);
  const [generateTextOptions, setGenerateTextOptions] = useState({
    category: Category.NATURE,
    difficulty: Difficulty.EASY,
    minLength: 100,
    maxLength: 500,
  });
  const [activeTab, setActiveTab] = useState<"manual" | "generate">("manual");
  const [generatedTexts, setGeneratedTexts] = useState<Book[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentText = generatedTexts[currentIndex];
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleAddText = () => {
    let newText: Text | null = null;
    if (activeTab == "manual") {
      newText = newManualText;
      setNewManualText(DEFAULT_TEXT);
    } else {
      newText = newGeneratedText;
      setNewGeneratedText(DEFAULT_TEXT);
    }
    if (!newText.title || !newText.content) {
      alert("Title and content are required!");
      return;
    }

    // print each field in newText:
    console.log("newText:", newText.title, newText.category, newText.content, newText.difficulty, newText.isFiction);

    addText(newText);
  };


  // To paralellize the processing of each book, we gonna do all the processing here in the state 
  const handleGenerateText = async () => {
    try {
      setIsLoading(true);
      setGeneratedTexts([]); 
  
      // Fetch book metadata
      const booksMetadata = await fetchBooks(generateTextOptions.category);
  
      const processingPromises = booksMetadata.map(async (book) => {
        try {
          const processedBook = await fetchBookContent(book, generateTextOptions.maxLength);
  
          // Check filters
          const meetsDifficulty = processedBook.difficulty === generateTextOptions.difficulty;
          const wordCount = processedBook.content.split(/\s+/).length;
          const meetsWordCount = wordCount >= generateTextOptions.minLength;
  
          if (meetsDifficulty && meetsWordCount) {
            setGeneratedTexts((prev) => [...prev, processedBook]);
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
    const currentText = generatedTexts[currentIndex];

    if (currentText) {
      addText(new Text(currentText.title, 
        currentText.subject, 
        currentText.content, 
        currentText.difficulty, 
        true));
      setGeneratedTexts((prev) => prev.filter((_, index) => index !== currentIndex));
    }

  };

  const handleRejectText = () => {
    setGeneratedTexts((prev) => prev.filter((_, index) => index !== currentIndex));
  };

  const handleNextText = () => {
    setCurrentIndex((prev) => (prev + 1) % generatedTexts.length);
  };

  const handlePreviousText = () => {
    setCurrentIndex((prev) => (prev - 1 + generatedTexts.length) % generatedTexts.length);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-6">Manage the texts available to users of Swiftreaders.</p>

      {/* Add New Text Form with Tabs */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Text</h2>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "manual"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "generate"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Generate
          </button>
        </div>

        {activeTab === "manual" ? (
          // Manual Text Entry Form
          <>
            <input
              type="text"
              placeholder="Title"
              value={newManualText.title}
              onChange={(e) => setNewManualText({ ...newManualText, title: e.target.value } as Text)}
              className="w-full p-2 mb-4 border rounded-md"
            />
            <textarea
              placeholder="Content"
              value={newManualText.content}
              onChange={(e) => setNewManualText({ ...newManualText, content: e.target.value } as Text)}
              className="w-full p-2 mb-4 border rounded-md"
            />
            <label className="block mb-2">Category:</label>
            <select
              value={newManualText.category}
              onChange={(e) => setNewManualText({ ...newManualText, category: e.target.value as Category } as Text)}
              className="w-full p-2 mb-4 border rounded-md"
            >
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <label className="block mb-2">Difficulty:</label>
            <select
              value={newManualText.difficulty}
              onChange={(e) => setNewManualText({ ...newManualText, difficulty: e.target.value as Difficulty } as Text)}
              className="w-full p-2 mb-4 border rounded-md"
            >
              {Object.values(Difficulty).map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
            <label className="block mb-4">
              <input
                type="checkbox"
                checked={newManualText.isFiction}
                onChange={(e) => setNewManualText({ ...newManualText, isFiction: e.target.checked } as Text)}
                className="mr-2"
              />
              Is Fiction?
            </label>
            <button onClick={handleAddText} className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Add Text
            </button>
          </>
        ) : (
          // Generate Text Form
          <>
            {/* Filters in horizontal line */}
            <div className="flex gap-4 items-end">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">Category</label>
                <select
                  value={generateTextOptions.category}
                  onChange={(e) =>
                    setGenerateTextOptions({
                      ...generateTextOptions,
                      category: e.target.value as Category,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">Difficulty</label>
                <select
                  value={generateTextOptions.difficulty}
                  onChange={(e) =>
                    setGenerateTextOptions({
                      ...generateTextOptions,
                      difficulty: e.target.value as Difficulty,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  {Object.values(Difficulty).map((diff) => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Word Length Filters */}
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium">Word Range</label>
                <div className="flex gap-2">
                  <input
                  type="number"
                  placeholder="Min"
                  value={generateTextOptions.minLength}
                  onChange={(e) =>
                    setGenerateTextOptions({
                    ...generateTextOptions,
                    minLength: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  />
                  <input
                  type="number"
                  placeholder="Max"
                  value={generateTextOptions.maxLength}
                  onChange={(e) =>
                    setGenerateTextOptions({
                    ...generateTextOptions,
                    maxLength: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  />
                </div>
                </div>
              </div>

              {/* Generate Text Button */}
              <div className="mt-4">
                <button
                onClick={handleGenerateText}
                disabled={isLoading}
                className="bg-green-500 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isLoading ? (
                  <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                  </span>
                ) : (
                  'Generate Text'
                )}
                </button>
              </div>


            {/* Generated Texts Navigation */}
            {currentText && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-8">

                <input
                  type="text"
                  value={currentText.title}
                  onChange={(e) =>
                    setGeneratedTexts((prev) => {
                      const updated = [...prev];
                      updated[currentIndex] = {
                        ...updated[currentIndex],
                        title: e.target.value,
                      };
                      return updated;
                    })
                    }
                    className="w-full p-2 mb-4 border rounded-md"
                  />
                  <textarea
                    value={currentText.content}
                    onChange={(e) =>
                    setGeneratedTexts((prev) => {
                      const updated = [...prev];
                      updated[currentIndex] = {
                      ...updated[currentIndex],
                      content: e.target.value,
                      };
                      return updated;
                    })
                    }
                    className="w-full p-2 mb-4 border rounded-md h-64"
                  />
                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousText}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Previous
                  </button>
                  <div className="space-x-4">
                    <button
                      onClick={handleApproveText}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                      Approve
                    </button>
                    <button
                      onClick={handleRejectText}
                      className="bg-red-500 text-white px-4 py-2 rounded-md"
                    >
                      Reject
                    </button>
                  </div>
                  <button
                    onClick={handleNextText}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Existing Texts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Existing Texts</h2>
        {texts.map((text) => (
          <div
            key={text.id}
            className="bg-white shadow-md rounded-lg p-6 mb-4 border"
          >
            <h3 className="text-lg font-semibold mb-2">{text.title}</h3>
            <p className="mb-2">{text.content}</p>
            <p className="text-sm text-gray-500">
              <strong>Category:</strong> {text.category}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Difficulty:</strong> {text.difficulty}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Fiction:</strong> {text.isFiction ? "Yes" : "No"}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Word Count:</strong> {text.wordLength.toString()}
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => {
                  const newContent = prompt("Enter new content:", text.content);
                  if (newContent) updateText(newContent, text.id);
                }}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md"
              >
                Update Text
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove "${text.title}"?`)) {
                    removeText(text.id);
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Remove Text
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <AdminDashboardProvider>
      <AdminDashboardContent />
    </AdminDashboardProvider>
  );
};

export default AdminDashboard;
