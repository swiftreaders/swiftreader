import React from 'react';
import { Genre, Category, Difficulty } from '@/types/text';

import { useTextManagementContext } from '@/contexts/textManagementContext';
import { QuestionCard } from '../QuestionCard';

const ManualTextSection: React.FC = () => {
  const {
    newManualText,
    handleModifyText,
    handleAddQuestion,
    handleRemoveQuestion,
    handleModifyQuestion,
    handleAddText,
  } = useTextManagementContext();

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

export default ManualTextSection;