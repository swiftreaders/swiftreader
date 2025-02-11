import { useState } from "react";
import { Category, Difficulty, Text, Question, Genre } from "@/types/text";

interface UpdateTextPopupProps {
  text: Text;
  onClose: () => void;
  onSave: (updatedText: Text) => void;
}

export const UpdateTextPopup = ({
  text,
  onClose,
  onSave,
}: UpdateTextPopupProps) => {
  const [title, setTitle] = useState(text.title);
  const [content, setContent] = useState(text.content);
  const [category, setCategory] = useState<Category | undefined>(text.category);
  const [genre, setGenre] = useState<Genre | undefined>(text.genre);
  const [difficulty, setDifficulty] = useState(text.difficulty);
  const [isFiction, setIsFiction] = useState(text.isFiction);
  const [questions, setQuestions] = useState(text.questions || []);

  // Handle changes for individual question fields
  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const updatedQuestions = [...questions];
    if (field === "choices") {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        choices: value.split(",").map((choice) => choice.trim()),
      };
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
    }
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", choices: ["", "", "", ""], answer: "" }]);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    // Create an updated Text instance – make sure to preserve the text id.
    const updatedText = new Text(title, content, difficulty, isFiction, genre ?? category ?? Category.NATURE);  // 
    updatedText.questions = questions;
    updatedText.id = text.id; // Preserve the original id
    onSave(updatedText);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Container with fixed max height and flex layout */}
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Scrollable content area */}
        <div className="overflow-y-auto p-6 flex-1">
          <h2 className="text-2xl font-bold mb-4">Update Text</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.values(Difficulty).map((diff) => (
                  <option key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="block text-sm font-medium text-gray-700 mr-2">Fiction</label>
              <input
                type="checkbox"
                checked={isFiction}
                onChange={(e) => setIsFiction(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 h-48"
            />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Questions</h3>
            {questions.length > 0 ? (
              questions.map((q, index) => (
                <div key={index} className="mb-4 p-4 border rounded-md bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question:</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) =>
                      handleQuestionChange(index, "question", e.target.value)
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1">Choices (comma-separated):</label>
                  <input
                    type="text"
                    value={q.choices.join(", ")}
                    onChange={(e) =>
                      handleQuestionChange(index, "choices", e.target.value)
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-2"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                  <input
                    type="text"
                    value={q.answer}
                    onChange={(e) =>
                      handleQuestionChange(index, "answer", e.target.value)
                    }
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => removeQuestion(index)}
                    className="mt-2 text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No questions available.</p>
            )}
            <button
              onClick={addQuestion}
              className="mt-2 py-2 px-4 bg-blue-600 text-white rounded-md transition-all duration-200 hover:bg-blue-700"
            >
              Add Question
            </button>
          </div>
        </div>
        {/* Fixed button area */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md transition hover:bg-gray-600 mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md transition hover:bg-green-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
