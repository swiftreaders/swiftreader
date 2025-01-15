import React, { createContext, useContext, useState, useCallback } from "react";

// import backend functions to perform CRUD operations on the texts

// import necessary types
import { Text } from "@/types/text";

interface adminDashboardContextType {
  texts: Text[];
  addText: (text: Text) => Promise<boolean>;
  updateText: (content: string, id: string) => Promise<boolean>;
  removeText: (id: string) => Promise<boolean>;
  users: string[];
}
