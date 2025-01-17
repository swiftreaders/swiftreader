"use client";

import { useState, useContext, createContext } from "react";
import { TextService } from "@/services/textservice";
import { DocumentData } from "firebase/firestore/lite";

import { Category } from "@/types/text";

const AdminDashboardContext = createContext<DocumentData[]>([]);

const DisplayTexts = () => {
  const texts = useContext(AdminDashboardContext);

  return (
    <div>
      {texts.map((text) => (
        <div key={text.id}>
          <h2>{text.title}</h2>
          <p>{text.content}</p>
        </div>
      ))}
    </div>
  );
};

export default async function AdminDashboard() {
  const textService = new TextService();
  const texts = await textService.getTextsByCategory(Category.NATURE);

  return (
    <AdminDashboardContext.Provider value={texts}>
      <div>
        <h1>Admin Dashboard</h1>
        <DisplayTexts />
      </div>
    </AdminDashboardContext.Provider>
  );
}
