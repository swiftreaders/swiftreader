"use client";

import React from "react";
import {
  useReadingContext,
  ReadingSessionProvider,
} from "@/contexts/readingSessionsContext";
import Quiz from "@/components/Quiz";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Category, Difficulty, Genre, Text } from "@/types/text";
import { Session } from "@/types/sessions";
import { Timestamp } from "firebase/firestore";
import WebGazerClient from "./WebGazerClient"; // We'll keep a separate file
import Calibration, { CalibrationRef } from "./Calibration"; // Modified import to include ref type
import { SessionStats } from "@/components/SessionStats";
// import HelpPopup from "@/components/helpPopup" 
import { useAuth } from "@/contexts/authContext";
import { useUserContext, UserProvider } from "@/contexts/userContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
// import InfoPopup from "@/components/infoPopup"
import { useRouter } from "next/navigation";
import webgazer from "webgazer";
import { summariseText } from "@/services/generateService";
import { AccessibilitySettings, 
  AccessibilitySettingsPanel,
  defaultAccessibilitySettings } from "@/components/AccessibilitySettingsPanel";
import { Bold } from "lucide-react";

const transformText = (
  text: string,
  settings: AccessibilitySettings
): React.ReactElement[] => {
  if (!text) return [];
  // Split text by spaces to get individual words.
  const words = text.split(" ");
  return words.map((word, index) => {
    if (word === "") return <span key={index}> </span>;
    // Bold first and/or last letter as per settings.
    const first = word.charAt(0);
    const middle = word.slice(1, word.length - 1);
    const last = word.length > 1 ? word.charAt(word.length - 1) : "";
    return (
      <span key={index}>
        {settings.boldFirst ? (
          <span style={{ fontWeight: "bold" }}>{first}</span>
        ) : (
          first
        )}
        {middle}
        {word.length > 1 && settings.boldLast ? (
          <span style={{ fontWeight: "bold" }}>{last}</span>
        ) : (
          last
        )}
        {index < words.length - 1 ? " " : ""}
      </span>
    );
  });
};

const FeatureItem = ({ icon, title, children }: { 
  icon: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3">
    <span className="text-2xl">{icon}</span>
    <div>
      <h4 className="font-medium text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600 mt-1">{children}</p>
    </div>
  </div>
);

// -------------------------
// Main UserSessionContent
// -------------------------

const UserSessionContent = () => {
  const router = useRouter();
  const { text, getText } = useReadingContext();
  const { user } = useAuth();
  const [textId, setTextId] = useState("");
  const [mode, setMode] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [genre, setGenre] = useState<Genre | null>(null);
  const [fiction, setFiction] = useState(true);
  const [length, setLength] = useState<number | null>(null);
  const [wpm, setWpm] = useState(300);
  const [inputValue, setInputValue] = useState("300");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState(1);
  const [outputLine, setOutputLine] = useState<string>("");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [totalLines, setTotalLines] = useState(100);
  // const [popupVisible, setPopupVisible] = useState(false);
  const wpmRef = useRef(wpm);
  
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  // Keep the ref in sync with the state
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    setCurrentLineIndex(0);
    setTotalLines(100);
  }, [text]);

  // Added: Create a ref for the Calibration component
  const calibrationRef = useRef<CalibrationRef>(null);

  // Accessibility settings state and panel toggle
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(
    defaultAccessibilitySettings
  );
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

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
    words.forEach((word) => {
      total_chars += word.length;
    });
    return (total_chars / 5 / wpmRef.current) * 60000;
  };

  const handleStartSession = async () => {
    setLoading(true);
    setRequested(true);
    getText(
      fiction ? genre : category,
      difficulty,
      fiction,
      length,
      setLoading
    );
    setPaused(false);
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    if (requested && !loading) {
      if (text == null) {
        alert("No texts found with those constraints");
        setRequested(false);
      } else {
        setTextId(text.id);
        setSessionStarted(true);
        if (mode === 1) {
          startReadingMode1(text);
        } else if (mode === 2) {
          startReadingMode2(text);
        } else {
          startReadingMode3(text);
        }
      }
    }
  }, [requested, loading, text]);

  useEffect(() => {
    if (mode === 2 && progressStage === 1) {
      if (typeof window === "undefined") return;

      const webgazer = (window as any).webgazer;
      if (!webgazer) {
        console.error("WebGazer is not defined on window.");
        return;
      }

      console.log("WebGazer found. Setting up...");
      webgazer
        .showVideoPreview(false)
        .begin()
        .then(() => console.log("WebGazer started!"))
        .catch((err: any) => console.error("WebGazer failed to start:", err));

      return () => {
        const videoElem = document.querySelector("video");
        if (videoElem && videoElem.srcObject) {
          const stream = videoElem.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoElem.srcObject = null;
        }
        webgazer.end();

        console.log("WebGazer stopped and all video streams released.");

      };
    }
    if (mode === 3) {
      setFiction(false);
    }
  }, [mode, progressStage]);

  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);

  const handleRecalibrate = () => {
    setPaused(true);
    if (calibrationRef.current) {
      calibrationRef.current.startCalibration();
    }
  }

  const preRead = async (text: Text) => {
    setOutputLine("Reading '" + text.title + "'");
    await sleep(3000);
    setOutputLine("Ready...");
    await sleep(1000);
    setOutputLine("Set...");
    await sleep(1000);
    setOutputLine("Go!");
    await sleep(1000);
  };

  const startReadingMode1 = async (text: Text) => {
    const lines = splitTextIntoLines(text.content);
    await preRead(text);
    const startTime = Timestamp.fromDate(new Date());
    const wpmReadings: number[] = [];
    let elapsedPausedTime = 0;
    setTotalLines(lines.length); // Store total lines
    setCurrentLineIndex(0); 
  
    // Record WPM readings only when not paused.
    const intervalId = setInterval(() => {
      if (!pausedRef.current) {
        wpmReadings.push(wpmRef.current);
      }
    }, 5000);
  
    // Process each line and pause if needed
    for (const line of lines) {
      // Wait until paused is false
      while (pausedRef.current) {
        await sleep(100); // Check every 100ms
        elapsedPausedTime += 100; 
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      setOutputLine(line);
      setCurrentLineIndex((prev) => prev + 1);
      const sleepTime = calculateSleepTime(line);
      await sleep(sleepTime);
    }

  
    clearInterval(intervalId); // Stop measuring WPM once the loop finishes
    const endTime = Timestamp.fromDate(new Date());
    setReadingDone(true);
    setOutputLine("Reading complete!");
    finishReading(text, startTime, endTime, wpmReadings);
  };

  let previousQuarter = 0;

  const startReadingMode2 = async (text: Text) => {
    // Removed: Automatic calibration call has been removed.
    // Instead, calibration will be triggered by a recalibrate button in the UI.

    // tracking line changes
    let currBoundaryChange = 2;
    let prevBoundaryChange = 2; // lineChange = [1|2|3], 1 means quadrant 1 to 2, 2 means 2 to 3, 3 means 3 to 4.

    // 1. Split content into lines
    const lines = splitTextIntoLines(text.content);
    await preRead(text);
    let elapsedPausedTime = 0;
    setTotalLines(lines.length); // Store total lines
    setCurrentLineIndex(0); // Reset current line index

    // Initialize WebGazer & set the gaze listener
    // Make sure WebGazer is loaded on `window` (as in your example).
    (window as any).webgazer.setGazeListener(handleGaze);
    const wpmReadings: number[] = [];
    const intervalId = setInterval(() => {
      wpmReadings.push(wpmRef.current);
    }, 5000);
    const startTime = Timestamp.fromDate(new Date());
    for (const line of lines) {
      while (pausedRef.current) {
        await sleep(100); // Check every 100ms
        elapsedPausedTime += 100; 
        await new Promise(resolve => requestAnimationFrame(resolve));
      }

      setOutputLine(line);
      setCurrentLineIndex((prev) => prev + 1);
      currBoundaryChange = 2;
      const sleepTime = calculateSleepTime(line);
      await sleep(sleepTime);

      // Adjusts wpm based on previous two boundary changes
      let newWpm = wpmRef.current;
      switch (prevBoundaryChange + currBoundaryChange) {
        case 6:
          newWpm = Math.min(wpmRef.current + 20, 1000);
          break;
        case 5:
          newWpm = Math.min(wpmRef.current + 10, 1000);
          break;
        case 4:
          break;
        case 3:
          newWpm = Math.max(wpmRef.current - 20, 50);
          break;
        case 2:
          newWpm = Math.max(wpmRef.current - 30, 50);
          break;
      }
      setWpm(newWpm);
      setInputValue(newWpm.toString());

      // Update the previous boundary change for the next reading
      prevBoundaryChange = currBoundaryChange;
    }
    clearInterval(intervalId); // Stop measuring WPM once the loop finishes
    const endTime = Timestamp.fromDate(new Date());
    // Stop Webgazer
    (window as any).webgazer.clearGazeListener();
    const videoElem = document.querySelector("video");
        if (videoElem && videoElem.srcObject) {
          const stream = videoElem.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          videoElem.srcObject = null;
        }
    (window as any).webgazer.end();
    // GO TO Quiz
    setReadingDone(true);
    setOutputLine("Reading complete!");
    finishReading(text, startTime, endTime, wpmReadings);

    // 3. Gaze listener function
    function handleGaze(data: { x: number; y: number } | null) {
      if (!data) return;

      let activeQuarter = 0;

      // Calculate which quarter the gaze is in
      const screenWidth = window.innerWidth;
      const quarterWidth = screenWidth / 4;
      if (data.x < quarterWidth) {
        activeQuarter = 1;
      } else if (data.x < quarterWidth * 2) {
        activeQuarter = 2;
      } else if (data.x < quarterWidth * 3) {
        activeQuarter = 3;
      } else {
        activeQuarter = 4;
      }

      // If the gaze just changed quadrant, record the boundary change
      if (activeQuarter === 4 && previousQuarter !== 4) {
        currBoundaryChange = Math.max(currBoundaryChange, 3);
      } else if (activeQuarter === 3 && previousQuarter !== 3) {
        currBoundaryChange = Math.max(currBoundaryChange, 2);
      } else if (activeQuarter === 2 && previousQuarter !== 2) {
        currBoundaryChange = 1;
      }

      // Update the previous quarter for the next reading
      previousQuarter = activeQuarter;
    }
  };

  const startReadingMode3 = async (text: Text) => {
    setGenerating(true);
    const summary = await summariseText(text.content, text.title);
    setGenerating(false);
    text.content = summary;
    startReadingMode1(text);
  };

  const finishReading = (
    text: Text,
    startTime: Timestamp,
    endTime: Timestamp,
    wpm: number[],
  ) => {
    console.log(user);
    const session = new Session(
      text.id,
      user ? user.id : "",
      text.title,
      startTime,
      endTime,
      wpm,
      mode,
      text.difficulty
    );
    setSession(session);
    console.log(session);
  };

  // Handle keypresses to alter WPM using arrow keys (WASD keys)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      let newWpm = wpmRef.current;
      switch (event.key.toLowerCase()) {
        case "w":
          newWpm = Math.min(wpmRef.current + 1, 1000);
          setWpm(newWpm);
          setInputValue(newWpm.toString());
          break;
        case "s":
          newWpm = Math.max(wpmRef.current - 1, 50);
          setWpm(newWpm);
          setInputValue(newWpm.toString());
          break;
        case "a":
          newWpm = Math.max(wpmRef.current - 10, 50);
          setWpm(newWpm);
          setInputValue(newWpm.toString());
          break;
        case "d":
          newWpm = Math.min(wpmRef.current + 10, 1000);
          setWpm(newWpm);
          setInputValue(newWpm.toString());
          break;
        case " ":
          event.preventDefault();
          setPaused(prev => !prev); // Toggle pause
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <>
      <Script
        src="https://webgazer.cs.brown.edu/webgazer.js"
        //strategy="beforeInteractive" // ensures script is loaded early
        onLoad={() =>
          console.log("WebGazer script loaded (beforeInteractive)!")
        }
        onError={() => console.error("Failed to load WebGazer script.")}
      />
      <div className="min-h-screen mt-[7vh] bg-background flex flex-col items-center p-8 relative">
        {/* Recalibrate Button (only for mode 2) */}
        {mode === 2 && progressStage === 1 && (
          <button
            onClick={ handleRecalibrate }
            className="absolute top-6 right-6 bg-secondary text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Recalibrate
          </button>
        )}
        {/* Accessibility Settings Button */}
        <button
          onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
          className="absolute top-6 left-6 bg-secondary text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Accessibility Settings
        </button>
        {showAccessibilityPanel && (
          <AccessibilitySettingsPanel
            settings={accessibilitySettings}
            setSettings={setAccessibilitySettings}
            onClose={() => setShowAccessibilityPanel(false)}
          />
        )}
        {/* Progress Circles */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  progressStage >= 1 ? "bg-secondary text-white" : "bg-gray-300"
                }`}
              >
                1
              </div>
              <span className="text-sm mt-2">Read</span>
            </div>
            <div className="h-1 w-12 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  progressStage >= 2 ? "bg-secondary text-white" : "bg-gray-300"
                }`}
              >
                2
              </div>
              <span className="text-sm mt-2">Quiz</span>
            </div>
            <div className="h-1 w-12 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  progressStage >= 3 ? "bg-secondary text-white" : "bg-gray-300"
                }`}
              >
                3
              </div>
              <span className="text-sm mt-2">Stats</span>
            </div>
          </div>
        </div>
        {progressStage === 1 ? (
          <>
            {/* Settings Bar */}
            <div className="flex flex-wrap items-center justify-between w-full bg-white shadow-md p-4 rounded-lg space-y-4 md:space-y-0 md:flex-nowrap">
              {/* Select Mode Dropdown */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="modeSelect"
                  className="text-sm font-medium text-gray-700"
                >
                  Mode:
                </label>
                <select
                  id="modeSelect"
                  value={mode}
                  onChange={(e) => setMode(parseInt(e.target.value, 10))}
                  disabled={sessionStarted}
                  className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  {[1, 2, 3].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                {/* <HelpPopup message="Mode 1: Read at a fixed WPM \n
            Mode 2: Use eye-tracking software to dynamically adjust reading speed \n
            Mode 3 (Non-fiction only): Summarise the text for even faster comprehension" /> */}
              </div>

              {/* WPM Input */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="wpmInput"
                  className="text-sm font-medium text-gray-700"
                >
                  WPM:
                </label>
                <input
                  id="wpmInput"
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 w-24"
                  value={inputValue}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setInputValue(event.target.value); // Allow typing freely
                  }}
                  onBlur={() => {
                    const numericValue = parseInt(inputValue, 10);
                    if (isNaN(numericValue) || numericValue < 50) {
                      setWpm(50);
                      setInputValue("50"); // Reset input if it's below 50
                    } else if (numericValue > 1000) {
                      setWpm(1000);
                      setInputValue("1000");
                    } else {
                      setWpm(numericValue);
                    }
                  }}
                />
                {/* <HelpPopup message="Use the WASD keys to tune your reading speed during the session" /> */}
              </div>

              {/* Fiction Checkbox */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="fictionCheckbox"
                  className="text-sm font-medium text-gray-700"
                >
                  Fiction:
                </label>
                <input
                  id="fictionCheckbox"
                  type="checkbox"
                  className="h-5 w-5 text-blue-500 focus:ring focus:ring-blue-300"
                  checked={mode === 3 ? false : fiction}
                  disabled={mode === 3 || sessionStarted}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setFiction(event.target.checked)
                  }
                />
              </div>

              {/* Conditional Dropdown */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor={fiction ? "genreSelect" : "categorySelect"}
                  className="text-sm font-medium text-gray-700"
                >
                  {fiction ? "Genre:" : "Category:"}
                </label>
                {fiction ? (
                  <select
                    id="genreSelect"
                    value={genre ?? ""}
                    onChange={(e) =>
                      setGenre(
                        e.target.value === "" ? null : (e.target.value as Genre)
                      )
                    }
                    disabled={sessionStarted}
                    className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    <option value="">Any</option> {/* Option for "Any" */}
                    {Object.values(Genre).map((gen) => (
                      <option key={gen} value={gen}>
                        {gen}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    id="categorySelect"
                    value={category ?? ""}
                    onChange={(e) =>
                      setCategory(
                        e.target.value === ""
                          ? null
                          : (e.target.value as Category)
                      )
                    }
                    disabled={sessionStarted}
                    className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                  >
                    <option value="">Any</option> {/* Option for "Any" */}
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
                <label
                  htmlFor="difficultySelect"
                  className="text-sm font-medium text-gray-700"
                >
                  Difficulty:
                </label>
                <select
                  id="difficultySelect"
                  value={difficulty ?? ""}
                  onChange={(e) =>
                    setDifficulty(
                      e.target.value === ""
                        ? null
                        : (e.target.value as Difficulty)
                    )
                  }
                  disabled={sessionStarted}
                  className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="">Any</option> {/* Option for "Any" */}
                  {Object.values(Difficulty).map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </select>
              </div>

              {/* Length Input */}
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="lengthInput"
                  className="text-sm font-medium text-gray-700"
                >
                  Text length:
                </label>
                <input
                  id="lengthInput"
                  type="number"
                  className="border border-gray-300 rounded px-3 py-2 text-center text-gray-700 focus:outline-none focus:ring focus:ring-blue-300 w-24"
                  value={length ?? ""}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setLength(
                      event.target.value === ""
                        ? null
                        : parseInt(event.target.value, 10)
                    )
                  }
                  disabled={sessionStarted}
                />
                {/* Checkbox for "Any" */}
                <label htmlFor="anyLength" className="text-sm text-gray-500">
                  Any
                </label>
                <input
                  id="anyLength"
                  type="checkbox"
                  checked={length === null}
                  onChange={(e) => setLength(e.target.checked ? null : 300)}
                  disabled={sessionStarted}
                  className="ml-2"
                />
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        <div className="w-full flex justify-center flex-col items-center">
        {!sessionStarted && !generating && (
          <div className="w-full bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl shadow-xl border border-purple-100">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-sm">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Mode {mode} Ready
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {/* Keyboard Controls Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-purple-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18H18V20H6zM12 16.04L8.04 20L6 17.96L12 12L18 17.96L15.96 20L12 16.04zM12 4L15.96 8.04L18 6L12 0L6 6L8.04 8.04L12 4z"/>
                  </svg>
                  Keyboard Controls
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <kbd className="key">W</kbd>
                      <kbd className="key">S</kbd>
                    </div>
                    <span className="text-sm text-gray-600">Adjust WPM ±1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <kbd className="key">A</kbd>
                      <kbd className="key">D</kbd>
                    </div>
                    <span className="text-sm text-gray-600">Adjust WPM ±10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="key">SPACE</kbd>
                    <span className="text-sm text-gray-600">Play/Pause</span>
                  </div>
                </div>
              </div>

              {/* Mode-specific Features */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-600">
                  {mode === 1 ? "📖 Fixed Speed" : mode === 2 ? "👁 Eye Tracking" : "📚 Summary Mode"}
                </h3>
                <div className="space-y-4">
                  {mode === 1 && (
                    <>
                      <FeatureItem icon="🚀" title="Set Your Pace">
                        Choose starting WPM and fine-tune with keyboard
                      </FeatureItem>
                      <FeatureItem icon="⚡" title="Instant Adjustments">
                        Real-time speed changes without interruptions
                      </FeatureItem>
                    </>
                  )}
                  {mode === 2 && (
                    <>
                      <FeatureItem icon="👁️" title="Smart Adaptation">
                        Dynamic speed adjustment based on eye movement
                      </FeatureItem>
                      <FeatureItem icon="📷" title="Webcam Setup">
                        Requires camera access for optimal calibration
                      </FeatureItem>
                    </>
                  )}
                  {mode === 3 && (
                    <>
                      <FeatureItem icon="✍️" title="Smart Summarization">
                        Key points extraction for faster comprehension
                      </FeatureItem>
                      <FeatureItem icon="📈" title="Efficiency Focused">
                        Maintain understanding at higher speeds
                      </FeatureItem>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Start Guide */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  Quick Start
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                {mode === 2 ? (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      1. Ensure a stable webcam setup and click Recalibrate
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      2. Configure your chosen text above
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      3. Click &quot;Start Session&quot;
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      4. Use keyboard controls during reading
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      1. Configure your chosen text above
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      2. Click &quot;Start Session&quot;
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      3. Use keyboard controls during reading
                    </li>
                  </>
                )}
              </ul>
              </div>
            </div>
          </div>
        )}
          {progressStage === 1 ? (
            // Session Start Box
            <>
              {!requested ? (
                <button
                  className="bg-secondary text-white px-6 py-3 rounded hover:bg-blue-600 transition"
                  onClick={handleStartSession}
                >
                  Start Session
                </button>
              ) : loading ? (
                <div className="w-full bg-gray-200 p-8 rounded-lg shadow-inner flex justify-center items-center">
                  <p className="text-xl text-gray-800">Loading...</p>
                </div>
              ) : generating ? (
                <div className="w-full bg-gray-200 p-8 rounded-lg shadow-inner flex justify-center items-center">
                  <p className="text-xl text-gray-800">Generating summary...</p>
                </div>
              ) : sessionStarted ? (
                <div className="w-full bg-gray-200 p-8 rounded-lg shadow-inner relative">
                  {/* Pause overlay */}
                  {paused && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="text-4xl text-gray-700 font-bold">PAUSED</div>
                    </div>
                  )}
                  
                  <p
                    className="whitespace-pre-wrap text-center leading-relaxed relative z-0"
                    style={{ fontSize: accessibilitySettings.fontSize }}
                  >
                    {transformText(outputLine, accessibilitySettings)}
                  </p>
              
                  {/* Progress controls */}
                  <div className="mt-4 flex items-center gap-4">
                    <button
                      onClick={() => setPaused(!paused)}
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                      aria-label={paused ? "Play" : "Pause"}
                    >
                      {paused ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </button>
                    
                    <div className="flex-1 bg-gray-300 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-secondary h-full transition-all duration-300"
                        style={{
                          width: `${((currentLineIndex + 1) / totalLines) * 100}%`
                        }}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {Math.round(((currentLineIndex) / totalLines) * 100)}% Complete
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : progressStage === 2 && session != null ? (
            <Quiz
              textId={textId}
              session={session}
              onContinue={() => setProgressStage(3)}
            />
          ) : session != null ? (
            // Optionally handle other progressStage values if necessary
            <div className="w-full flex justify-center">
              {/* <p className="text-xl text-gray-800">Stats page goes here</p> */}
              <SessionStats session={session} onClose={() => {router.push(`/userDashboard`)}} />
            </div>
          ) : null}
          <div className="mt-4">
            {readingDone ? (
              <button
                className="bg-secondary text-white px-6 py-3 rounded hover:bg-blue-600 transition"
                onClick={() => {
                  setReadingDone(false);
                  setProgressStage(2);
                }}
              >
                Proceed
              </button>
            ) : null}
          </div>
        </div>

        <div className="z-20">
          <WebGazerClient />
          {/* Pass the ref to the Calibration component */}
          <Calibration ref={calibrationRef} />
        </div>
      </div>
    </>
  );
};

const UserSession = () => {
  const { user } = useAuth();
  return (
    <div>
      {user ? (
        <UserProvider>
          <ReadingSessionProvider>
            <UserSessionContent />
          </ReadingSessionProvider>
        </UserProvider>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
};

export default UserSession;
