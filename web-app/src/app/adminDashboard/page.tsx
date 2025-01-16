"use client";

import { useState, useContext, createContext } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { Category } from "@/types/text";


// const AdminDashboardContent = () => {
//   const { texts, updateText, removeText } = useAdminDashboard();
//   return (
//       <div>
//         <h1>Admin Dashboard</h1>
//       </div>
//   );
// }

const AdminDashboardContent = () => {
  const { texts, updateText, removeText } = useAdminDashboard();

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Manage the content displayed on your website here.</p>

      <div>
        {texts.map((text) => (
          <div key={text.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
            <h2>{text.title}</h2>
            <p>{text.content}</p>

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
}

export default AdminDashboard