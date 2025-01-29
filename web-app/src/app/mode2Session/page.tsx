"use client";

import { useReadingContext, ReadingSessionProvider } from "@/contexts/readingSessionsContext";
import Script from "next/script";
import { useState, useEffect } from "react";
import { Category, Difficulty, Genre } from "@/types/text";
import WebGazerClient from "./WebGazerClient"; // We'll keep a separate file
import Calibration from "./Calibration";
const UserSessionContent = () => {
  const { text, getText } = useReadingContext();
  const [difficulty, setDifficulty] = useState(Difficulty.EASY);
  const [category, setCategory] = useState(Category.NATURE);
  const [genre, setGenre] = useState(Genre.FANTASY);
  const [fiction, setFiction] = useState(false);
  const [length, setLength] = useState(500);
  const [wpm, setWpm] = useState(300);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [outputLine, setOutputLine] = useState<string>("");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculateCharsPerLine = () => {
    const containerWidth = window.innerWidth;
    const fontSize = 32; // Example font size in pixels
    const charWidth = fontSize * 0.6; // Estimate: 0.6x font size
    return Math.floor(containerWidth / charWidth);
  };

  const splitTextIntoLines = (content: string) => {
    content = content.replace(/\n/g, " ");
    const charsPerLine = calculateCharsPerLine();
    const words = content.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
        if ((currentLine + word).length <= charsPerLine) {
            currentLine += (currentLine ? " " : "") + word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
};
  // Assumes a standard word length of 5 characters
  const calculateSleepTime = (line: string): number => {
    const words = line.split(" ");
    let total_chars = 0;
    words.forEach(word => {total_chars += word.length});
    return ((total_chars/5)/wpm) * 60000;
  }
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    const webgazer = (window as any).webgazer;
    if (!webgazer) {
      console.error("WebGazer is not defined on window.");
      return;
    }

    console.log("WebGazer found. Setting up...");
    webgazer
      .begin()
      .then(() => console.log("WebGazer started!"))
      .catch((err: any) => console.error("WebGazer failed to start:", err));

    return () => {
      webgazer.end();
      console.log("WebGazer stopped on unmount.");
    };
  }, []); // ✅ Runs only once when the component mounts

  const handleStartSession = async () => {
    setLoading(true);
    setRequested(true);
    getText(fiction ? genre : category, difficulty, fiction, length, setLoading);
  };

  useEffect(() => {
    if (requested && !loading) {
      console.log(text);
      if (text == null) {
        alert("No texts found with those constraints");
        setRequested(false);
      } else {
        setSessionStarted(true);
        startReadingMode1(text.content);
      }
    }
  }, [requested, loading, text]);

  //Global (or module-level) variable to track the previously active quarter
let previousQuarter = 0;

/**
 * Starts "reading mode" by splitting text into lines
 * and advancing through them each time the user looks
 * at the 4th quarter of the screen.
 */
const startReadingMode1 = (content: string) => {
  // 1. Split content into lines
  const lines = splitTextIntoLines(content);
  let currentLineIndex = 0;

  // 2. Define a helper to show the next line
  const showNextLine = () => {
    if (currentLineIndex < lines.length) {
      setOutputLine(lines[currentLineIndex]);
      currentLineIndex++;
    } else {
      // Optionally handle the end of content here (e.g., stop WebGazer, etc.)
      console.log("All lines have been displayed.");
    }
  };

  // 3. Gaze listener function
  function handleGaze(data: { x: number; y: number } | null) {
    if (!data) return;

    // Calculate which quarter the gaze is in
    const screenWidth = window.innerWidth;
    const quarterWidth = screenWidth / 4;
    let activeQuarter = 0;

    if (data.x < quarterWidth) {
      activeQuarter = 1;
    } else if (data.x < quarterWidth * 2) {
      activeQuarter = 2;
    } else if (data.x < quarterWidth * 3) {
      activeQuarter = 3;
    } else {
      activeQuarter = 4;
    }

    // If the gaze just entered the 4th quarter (from any other quarter),
    // show the next line
    if (activeQuarter === 4 && previousQuarter !== 4) {
      showNextLine();
    }

    // Update the previous quarter for the next reading
    previousQuarter = activeQuarter;
  }

  // 4. Initialize WebGazer & set the gaze listener
  // Make sure WebGazer is loaded on `window` (as in your example).
  (window as any).webgazer.setGazeListener(handleGaze);
};

  return (
    <>
    {/* Load WebGazer before everything else */}
    <Script
      src="https://webgazer.cs.brown.edu/webgazer.js"
      strategy="beforeInteractive" // ensures script is loaded early
      onLoad={() => console.log("WebGazer script loaded (beforeInteractive)!")}
      onError={() => console.error("Failed to load WebGazer script.")}
    />

    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      {/* Progress Circles */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              1
            </div>
            <span className="text-sm mt-2">Read</span>
          </div>
          <div className="h-1 w-12 bg-gray-300"></div>
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              2
            </div>
            <span className="text-sm mt-2">Quiz</span>
          </div>
          <div className="h-1 w-12 bg-gray-300"></div>
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              3
            </div>
            <span className="text-sm mt-2">Stats</span>
          </div>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="flex flex-wrap items-center justify-between w-full bg-white shadow-md p-4 rounded-lg space-y-4 md:space-y-0 md:flex-nowrap">

        {/* Fiction Checkbox */}
        <div className="flex items-center space-x-2">
          <label htmlFor="fictionCheckbox" className="text-sm font-medium text-gray-700">
            Fiction:
          </label>
          <input
            id="fictionCheckbox"
            type="checkbox"
            className="h-5 w-5 text-blue-500 focus:ring focus:ring-blue-300"
            checked={fiction}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFiction(event.target.checked)}
          />
        </div>

        {/* Conditional Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor={fiction ? "genreSelect" : "categorySelect"} className="text-sm font-medium text-gray-700">
            {fiction ? "Genre:" : "Category:"}
          </label>
          {fiction ? (
            <select
              id="genreSelect"
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
              className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              {Object.values(Genre).map((gen) => (
                <option key={gen} value={gen}>
                  {gen}
                </option>
              ))}
            </select>
          ) : (
            <select
              id="categorySelect"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex items-center space-x-2">
          <label htmlFor="difficultySelect" className="text-sm font-medium text-gray-700">
            Difficulty:
          </label>
          <select
            id="difficultySelect"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
          >
            {Object.values(Difficulty).map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>

        {/* Length Input */}
        <div className="flex items-center space-x-2">
          <label htmlFor="lengthInput" className="text-sm font-medium text-gray-700">
            Length in words:
          </label>
          <input
            id="lengthInput"
            type="number"
            className="border border-gray-300 rounded px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 w-24"
            value={length}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLength(parseInt(event.target.value, 10))}
          />
        </div>

        {/* WPM Input */}
        <div className="flex items-center space-x-2">
          <label htmlFor="wpmInput" className="text-sm font-medium text-gray-700">
            WPM:
          </label>
          <input
            id="wpmInput"
            type="number"
            className="border border-gray-300 rounded px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 w-24"
            value={wpm}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWpm(parseInt(event.target.value, 10))}
          />
        </div>
      </div>


      {/* Session Start Box */}
      <div className="w-full flex justify-center">
        {!requested ? (
          <button
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition"
            onClick={handleStartSession}
          >
            Start Session
          </button>
        ) : loading ? (
          <div className="w-full bg-gray-200 p-8 rounded-lg shadow-inner flex justify-center items-center">
            <p className="text-xl text-gray-800">Loading...</p>
          </div>
        ) : sessionStarted ? (
          <div className="w-full bg-gray-200 p-8 rounded-lg shadow-inner">
            <p className="text-4xl text-gray-800 whitespace-pre-wrap text-center leading-relaxed">
              {outputLine}
            </p>
          </div>
        ) : null}
      </div>
    {/* Our separate client file where we can configure WebGazer params */}
    <WebGazerClient />
    </div>
    </>
  );
};
const UserSession = () => {
  return (
    <ReadingSessionProvider>
      <UserSessionContent />
    </ReadingSessionProvider>
  );
};

export default UserSession;
