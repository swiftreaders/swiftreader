"use client";

import { useState } from "react";
import {
  useAdminDashboard,
  AdminDashboardProvider,
} from "@/contexts/adminDashboardContext";
import { Category, Difficulty, Text, Question, Genre, NewTextType } from "@/types/text";
import { UpdateTextPopup } from "@/components/UpdateTextPopup";
import { ExistingTextCard } from "@/components/ExistingTextCard";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
import { QuestionCard } from "@/components/QuestionCard";
import { TextManagementProvider, useTextManagementContext } from "@/contexts/textManagementContext";

const AdminDashboardContent = () => {
  const { removeText, updateText } = useAdminDashboard();
  const {
    texts,
    newManualText,
    findTextOptions,
    setFindTextOptions,
    generateTextOptions,
    setGenerateTextOptions,
    activeTab,
    setActiveTab,
    isFinding,
    isGenerating,
    currentTextIndex,
    foundTexts,
    generatedTexts,
    handleFindText,
    handleGenerateText,
    handlePreviousText,
    handleNextText,
    handleRejectText,
    getCurrentText,
    handleAddQuestion,
    handleAddText,
    handleModifyQuestion,
    handleRemoveQuestion,
    handleModifyText
  } = useTextManagementContext();

  const [selectedTextForUpdate, setSelectedTextForUpdate] = useState<Text | null>(null);
  const [updatePopupOpen, setUpdatePopupOpen] = useState(false);

  /* ===================== components ===================== */

  const renderGenerateTextSection = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-600 text-sm">
          This feature generates AI-created non-fiction passages for reading comprehension. 
          Select the category and word range, then generate new texts.
        </p>
        <div className="flex flex-wrap gap-4">
          {/* Category Selection */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={generateTextOptions.category}
              onChange={(e) =>
                setGenerateTextOptions({
                  ...generateTextOptions,
                  category: e.target.value as Category,
                })
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
          {/* Word Range Selection */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Word Range
            </label>
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
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleGenerateText}
          disabled={isGenerating}
          className="w-full py-3 bg-green-600 text-white rounded-md transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generating..." : "Generate Texts"}
        </button>
  
        {getCurrentText() && renderNavigateFoundTextsSection()}
      </div>
    );
  };
  
  const renderManualTextSection = () => {
    return (
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={newManualText.title}
          onChange={(e) =>
            handleModifyText("title", e.target.value)
          }
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <textarea
          placeholder="Content"
          value={newManualText.content}
          onChange={(e) =>
            handleModifyText("content", e.target.value)
          }
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          rows={6}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Conditional Dropdown for Category/Genre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {newManualText.isFiction ? "Genre" : "Category"}
            </label>
            <select
              value={
                newManualText.isFiction
                  ? newManualText.genre
                  : newManualText.category
              }
              onChange={(e) => {
                handleModifyText(
                  newManualText.isFiction ? "genre" : "category",
                  e.target.value);
              }}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {(newManualText.isFiction
                ? Object.values(Genre)
                : Object.values(Category)
              ).map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              value={newManualText.difficulty}
              onChange={(e) =>
                handleModifyText("difficulty", e.target.value)
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
              handleModifyText("isFiction", e.target.checked)
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
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              + Add Question
            </button>
          </div>

          {newManualText.questions.length > 0 ? (
            <div className="space-y-2">
              {newManualText.questions.map((question, index) => (
                <QuestionCard
                  key={index}
                  question={question}
                  index={index}
                  handleQuestionChange={handleModifyQuestion}
                  handleRemoveQuestion={handleRemoveQuestion}
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
          className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-md transition-all duration-200 hover:bg-indigo-700"
        >
          Add Text
        </button>
      </div>
    );
  };

  const renderFindTextSection = () => {
    return (
      <div className="space-y-6">
        <label className="text-gray-600 text-sm">
          This feature enables you to search for books from Gutendex&apos;s
          open book library, select your preferred genre and specify the
          desired word count range. Once you click &quot;Find Text&quot;,
          the system will fetch matching book metadata and process the
          content so you can review and approve the text.
        </label>
        <div className="flex flex-wrap gap-4">
          {/* Genre Filter */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Word Range
            </label>
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
            disabled={isFinding}
            className="w-full py-3 bg-green-600 text-white rounded-md transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFinding ? (
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
        {getCurrentText() && renderNavigateFoundTextsSection()}
      </div>
    )
  }

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
              {currentTextIndex + 1} / {activeTab === "find" ? foundTexts.length : generatedTexts.length}
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
              onClick={handleAddText}
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
            value={getCurrentText().title}
            onChange={(e) => handleModifyText("title", e.target.value)}
            className="w-full text-2xl font-bold mb-4 bg-transparent focus:outline-none border-b-2 border-transparent focus:border-indigo-500"
          />
          <textarea
            value={getCurrentText().content}
            onChange={(e) => handleModifyText("content", e.target.value)}
            className="w-full h-64 bg-transparent focus:outline-none resize-none font-serif text-gray-700 leading-relaxed"
          />
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>
              📝 {getCurrentText().content.trim().split(/\s+/).length} words
            </span>
            <div className="flex items-center gap-2">
              <span>Difficulty:</span>
              <select
                value={getCurrentText().difficulty}
                onChange={(e) => handleModifyText("difficulty", e.target.value)}
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
              onClick={handleAddQuestion}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              + Add Question
            </button>
          </div>

          {getCurrentText().questions?.length > 0 ? (
            <div className="grid gap-2">
              {getCurrentText().questions.map((q, i) => (
                <QuestionCard
                  key={i}
                  question={q}
                  index={i}
                  handleQuestionChange={handleModifyQuestion}
                  handleRemoveQuestion={handleRemoveQuestion}
                />
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">
                No questions yet. Add one to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTextManagementSection = () => {
    return (
      <section className="bg-white rounded-lg shadow-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Add New Text
        </h2>
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
              activeTab === "manual"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setActiveTab("find")}
            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
              activeTab === "find"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Find
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`flex-1 py-2 rounded-md transition-all duration-200 ${
              activeTab === "generate"
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Generate
          </button>
        </div>


        {activeTab === "manual" ? (
          renderManualTextSection()
        ) : activeTab === "find" ? (
          renderFindTextSection()
        ) : (
          renderGenerateTextSection()
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen mt-[7vh] bg-background">
      {/* Hero Header */}
      <header className="bg-sr-gradient py-8 shadow-lg">
        <div className="container mx-auto px-4 text-left">
          <h1 className="text-4xl font-bold text-white">Text Management</h1>
          <p className="mt-2 text-lg text-gray-200">
            Manage and fine-tune your texts with ease
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8">
        {renderTextManagementSection()}

        {/* Existing Texts Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Existing Texts
          </h2>
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
                  if (
                    window.confirm(
                      `Are you sure you want to remove "${text.title}"?`
                    )
                  )
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

const TextManagement = () => {
  const { user } = useAuth();
  return (
    <div>
      {user?.isAdmin ? (
        <AdminDashboardProvider>
          <TextManagementProvider>
            <AdminDashboardContent />
          </TextManagementProvider>
        </AdminDashboardProvider>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
};

export default TextManagement;


/*

FirebaseError: Function addDoc() called with invalid data. Unsupported field value: undefined (found in field category in document Texts/Kezl3O3jFwIFq0DCRCMz)
*/
