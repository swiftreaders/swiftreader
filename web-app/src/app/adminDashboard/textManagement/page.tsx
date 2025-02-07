"use client";

import { useState } from "react";
import {
  useAdminDashboard,
  AdminDashboardProvider,
} from "@/contexts/adminDashboardContext";
import { Category, Difficulty, Text, Genre } from "@/types/text";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/errors/accessDenied";

const AdminDashboardContent = () => {
  const { texts, addText, updateText, removeText } = useAdminDashboard();

  const [newText, setNewText] = useState({
    title: "",
    category: Category.NATURE,
    genre: Genre.FANTASY,
    content: "",
    difficulty: Difficulty.EASY,
    isFiction: false,
  });

  const handleAddText = () => {
    if (!newText.title || !newText.content) {
      alert("Title and content are required!");
      return;
    }

    const text = new Text(
      newText.title,
      newText.content,
      newText.difficulty,
      newText.isFiction,
      newText.isFiction ? newText.genre : newText.category
    );

    addText(text);
    setNewText({
      title: "",
      category: Category.NATURE,
      genre: Genre.FANTASY,
      content: "",
      difficulty: Difficulty.EASY,
      isFiction: false,
    });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-6">
        Manage the texts available to users of Swiftreaders.
      </p>

      {/* Add New Text Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Text</h2>
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
        <label className="block mb-2">
          {newText.isFiction ? "Genre:" : "Category:"}
        </label>
        {newText.isFiction ? (
          <select
            value={newText.genre}
            onChange={(e) =>
              setNewText({ ...newText, genre: e.target.value as Genre })
            }
            className="w-full p-2 mb-4 border rounded-md"
          >
            {Object.values(Genre).map((gen) => (
              <option key={gen} value={gen}>
                {gen.charAt(0).toUpperCase() + gen.slice(1)}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={newText.category}
            onChange={(e) =>
              setNewText({ ...newText, category: e.target.value as Category })
            }
            className="w-full p-2 mb-4 border rounded-md"
          >
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        )}
        <label className="block mb-2">Difficulty:</label>
        <select
          value={newText.difficulty}
          onChange={(e) =>
            setNewText({ ...newText, difficulty: e.target.value as Difficulty })
          }
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
            onChange={(e) =>
              setNewText({ ...newText, isFiction: e.target.checked })
            }
            className="mr-2"
          />
          Is Fiction?
        </label>
        <button
          onClick={handleAddText}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Add Text
        </button>
      </div>
      
      {/* Add New Text Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Text</h2>
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
              <strong>{text.isFiction ? "Genre:" : "Category:"}</strong>{" "}
              {text.isFiction ? text.genre : text.category}
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
                  if (
                    window.confirm(
                      `Are you sure you want to remove "${text.title}"?`
                    )
                  ) {
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
