"use client";

import { useState } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { Category, Difficulty, Text } from "@/types/text";

const AdminDashboardContent = () => {
  const { texts, addText, updateText, removeText } = useAdminDashboard();

  const [newText, setNewText] = useState({
    title: "",
    category: Category.NATURE,
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
      crypto.randomUUID(), // Generate a unique ID
      newText.title,
      newText.category,
      newText.content,
      newText.difficulty,
      newText.isFiction
    );

    addText(text); // Add the text to the context or Firestore
    setNewText({
      title: "",
      category: Category.NATURE,
      content: "",
      difficulty: Difficulty.EASY,
      isFiction: false,
    });
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Manage the content displayed on your website here.</p>

      {/* Add New Text Form */}
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "20px" }}>
        <h2>Add New Text</h2>
        <input
          type="text"
          placeholder="Title"
          value={newText.title}
          onChange={(e) => setNewText({ ...newText, title: e.target.value })}
          style={{ display: "block", marginBottom: "10px" }}
        />
        <textarea
          placeholder="Content"
          value={newText.content}
          onChange={(e) => setNewText({ ...newText, content: e.target.value })}
          style={{ display: "block", marginBottom: "10px", width: "100%", height: "80px" }}
        />
        <label>Category:</label>
        <select
          value={newText.category}
          onChange={(e) => setNewText({ ...newText, category: e.target.value as Category })}
          style={{ display: "block", marginBottom: "10px" }}
        >
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <label>Difficulty:</label>
        <select
          value={newText.difficulty}
          onChange={(e) => setNewText({ ...newText, difficulty: e.target.value as Difficulty })}
          style={{ display: "block", marginBottom: "10px" }}
        >
          {Object.values(Difficulty).map((diff) => (
            <option key={diff} value={diff}>
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            checked={newText.isFiction}
            onChange={(e) => setNewText({ ...newText, isFiction: e.target.checked })}
          />
          Is Fiction?
        </label>
        <button onClick={handleAddText} style={{ marginTop: "10px" }}>
          Add Text
        </button>
      </div>

      {/* Existing Texts */}
      <div>
        {texts.map((text) => (
          <div
            key={text.id}
            style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}
          >
            <h2>{text.title}</h2>
            <p>{text.content}</p>
            <p>
              <strong>Category:</strong> {text.category}
            </p>
            <p>
              <strong>Difficulty:</strong> {text.difficulty}
            </p>
            <p>
              <strong>Fiction:</strong> {text.isFiction ? "Yes" : "No"}
            </p>
            <p>
              <strong>Word Count:</strong> {text.wordLength.toString()}
            </p>

            <div style={{ marginTop: "10px" }}>
              <button
                onClick={() => {
                  const newContent = prompt("Enter new content:", text.content);
                  if (newContent) updateText(newContent, text.id);
                }}
                style={{ marginRight: "10px" }}
              >
                Update Text
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to remove "${text.title}"?`)) {
                    removeText(text.id);
                  }
                }}
                style={{ color: "red" }}
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
