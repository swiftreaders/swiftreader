import React from 'react';

import { useTextManagementContext } from '@/contexts/textManagementContext';
import { QuestionCard } from '../QuestionCard';
import { Difficulty } from '@/types/text';

const NavigateFoundTextsSection: React.FC = () => {
  const {
    currentTextIndex,
    activeTab,
    foundTexts,
    generatedTexts,
    handlePreviousText,
    handleNextText,
    handleAddText,
    handleRejectText,
    getCurrentText,
    handleModifyText,
    handleAddQuestion,
    handleModifyQuestion,
    handleRemoveQuestion,
  } = useTextManagementContext();

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

export default NavigateFoundTextsSection;