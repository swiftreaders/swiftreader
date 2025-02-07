import React, { createContext, useContext, useState, useCallback } from "react";

// import backend functions to perform CRUD operations on the texts

// import necessary type wrappers

interface textContextType {
  selectedTextID: string | null;
  setSelectedTextID: (text: string | null) => void;
}
