"use client";

import { useState } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { Category, Difficulty, Text } from "@/types/text";
import { getTexts, Book } from "@/services/bookService"; // Import your bookService function here

const AdminDashboardContent = () => {
  const { texts, addText, updateText, removeText } = useAdminDashboard();

  const [newText, setNewText] = useState({
    title: "",
    category: Category.NATURE,
    content: "",
    difficulty: Difficulty.EASY,
    isFiction: false,
  });

  const [generateTextOptions, setGenerateTextOptions] = useState({
    category: Category.NATURE,
    difficulty: Difficulty.EASY,
    minLength: 100,
    maxLength: 500,
  });

  const [bookServiceResponse, setBookServiceResponse] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"manual" | "generate">("manual");

  const handleAddText = () => {
    if (!newText.title || !newText.content) {
      alert("Title and content are required!");
      return;
    }

    const text = new Text(
      newText.title,
      newText.category,
      newText.content,
      newText.difficulty,
      newText.isFiction
    );

    addText(text);
    setNewText({
      title: "",
      category: Category.NATURE,
      content: "",
      difficulty: Difficulty.EASY,
      isFiction: false,
    });
  };

  const handleGenerateText = async () => {
    try {
      const response = await getTexts(generateTextOptions.category, {
        difficulty: generateTextOptions.difficulty,
        wordCount: {
          min: generateTextOptions.minLength,
          max: generateTextOptions.maxLength,
        },
      }) as Book[];

      
      setNewText({
        ...newText,
        content: "No content generated.",
      });
      setBookServiceResponse(JSON.stringify(response, null, 2));
    } catch (error: any) {
      setBookServiceResponse(`Error: ${error.message}`);
    }
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
              value={newText.title}
              onChange={(e) => setNewText({ ...newText, title: e.target.value })}
              className="w-full p-2 mb-4 border rounded-md"
            />
            <textarea
              placeholder="Content"
              value={newText.content}
              onChange={(e) => setNewText({ ...newText, content: e.target.value })}
              className="w-full p-2 mb-4 border rounded-md"
            />
            <label className="block mb-2">Category:</label>
            <select
              value={newText.category}
              onChange={(e) => setNewText({ ...newText, category: e.target.value as Category })}
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
              value={newText.difficulty}
              onChange={(e) => setNewText({ ...newText, difficulty: e.target.value as Difficulty })}
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
                checked={newText.isFiction}
                onChange={(e) => setNewText({ ...newText, isFiction: e.target.checked })}
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
            <label className="block mb-2">Category:</label>
            <select
              value={generateTextOptions.category}
              onChange={(e) =>
                setGenerateTextOptions({
                  ...generateTextOptions,
                  category: e.target.value as Category,
                })
              }
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
              value={generateTextOptions.difficulty}
              onChange={(e) =>
                setGenerateTextOptions({
                  ...generateTextOptions,
                  difficulty: e.target.value as Difficulty,
                })
              }
              className="w-full p-2 mb-4 border rounded-md"
            >
              {Object.values(Difficulty).map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
            <label className="block mb-2">Minimum Length:</label>
            <input
              type="number"
              value={generateTextOptions.minLength}
              onChange={(e) =>
                setGenerateTextOptions({
                  ...generateTextOptions,
                  minLength: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-2 mb-4 border rounded-md"
            />
            <label className="block mb-2">Maximum Length:</label>
            <input
              type="number"
              value={generateTextOptions.maxLength}
              onChange={(e) =>
                setGenerateTextOptions({
                  ...generateTextOptions,
                  maxLength: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-2 mb-4 border rounded-md"
            />
            <button
              onClick={handleGenerateText}
              className="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Generate Text
            </button>
            {bookServiceResponse && (
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-auto max-h-40">
              {bookServiceResponse}
            </pre>
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