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
import { useAuth } from "@/contexts/authContext";
import { UserProvider } from "@/contexts/userContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
import InfoPopup from "@/components/infoPopup"
import { useRouter } from "next/navigation";
import { summariseText } from "@/services/generateService";
import { AccessibilitySettings, 
  AccessibilitySettingsPanel,
  defaultAccessibilitySettings } from "@/components/AccessibilitySettingsPanel";
import WebGazerDisclaimer from "@/components/WebGazerDisclaimer";
import FeatureItem from "./FeatureItem";
import transformText from "./TransformText";
import QuickStartGuide from './QuickStartGuide';
import ProgressCircles from './ProgressCircles';
import AccessibilitySettingsButton from './AccessibilitySettingsButton';


const UserSessionContent = () => {
    const router = useRouter();
    const { text, getText, setText } = useReadingContext();
    const { user } = useAuth();
    const [textId, setTextId] = useState("");
    const [mode, setMode] = useState(1);
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [genre, setGenre] = useState<Genre | null>(null);
    const [fiction, setFiction] = useState(true);
    const [length, setLength] = useState<number | null>(null);
    const [wpm, setWpm] = useState(user?.wpm ? Math.round(user.wpm) : 300);
    const [inputValue, setInputValue] = useState(wpm.toString() ?? "300");
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
    const [paused, setPaused] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [webgazerInitialized, setWebgazerInitialized] = useState(false);
    const [isCalibrating, setIsCalibrating] = useState(false);
    const wpmRef = useRef(wpm);
    const pausedRef = useRef(paused);
    const cancelledRef = useRef(cancelled);
    const abortControllerRef = useRef<AbortController | null>(null);
  
    // Keep the ref in sync with the state
    useEffect(() => {
      pausedRef.current = paused;
    }, [paused]);
  
    useEffect(() => {
      setCurrentLineIndex(0);
      setTotalLines(100);
    }, [text]);
  
    const stopWebGazer = () => {
      (window as any).webgazer.clearGazeListener();
      const videoElem = document.querySelector("video");
          if (videoElem && videoElem.srcObject) {
            const stream = videoElem.srcObject as MediaStream;
            stream.getTracks().forEach((track) => track.stop());
            videoElem.srcObject = null;
          }
      (window as any).webgazer.end();
      setWebgazerInitialized(false);
    };
  
    // Added: Create a ref for the Calibration component
    const calibrationRef = useRef<CalibrationRef>(null);
  
    // Accessibility settings state and panel toggle
    const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(
      defaultAccessibilitySettings
    );
    const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  
    const calculateCharsPerLine = () => {
      const containerWidth = window.innerWidth;
      const fontSize = accessibilitySettings.fontSize;
      const fontFamily = accessibilitySettings.fontFamily;
      console.log("fontfamily = ", fontFamily);
    
      // Adjust charWidth based on font family
      let charWidthFactor;
      switch (fontFamily) {
        case 'monospace':
          charWidthFactor = 0.8; // Monospace fonts have fixed-width characters
          break;
        case 'serif':
          charWidthFactor = 0.55; // Serif fonts tend to have slightly wider characters
          break;
        case 'openDyslexic':
          charWidthFactor = 1; // OpenDyslexic has wider characters
          break;
        case 'sans-serif':
        case 'arial':
        case 'verdana':
        default:
          charWidthFactor = 0.6; // Default factor for sans-serif fonts
          break;
      } 
      console.log("charWidthFactor = ", charWidthFactor);
    
      const charWidth = fontSize * charWidthFactor; // Adjust charWidth based on font
      const charsperline =  Math.floor(containerWidth / charWidth);
      console.log(charsperline);
      return charsperline;
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
  
    const handleCancelSession = () => {    
      if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Immediate cancellation
      }
    
      // Reset all states
      setSessionStarted(false);
      setReadingDone(false);
      setCurrentLineIndex(0);
      setTotalLines(0);
      setPaused(true);
      setRequested(false);
      setLoading(false);
      setProgressStage(1);
      setText(null);
      setOutputLine("");
    
      // Reset WebGazer if not in mode 2
      if (mode === 1) {
        const webgazer = (window as any).webgazer;
        if (webgazer) {
          webgazer.clearGazeListener();
          webgazer.end();
          const videoElem = document.querySelector("video");
          if (videoElem?.srcObject) {
            (videoElem.srcObject as MediaStream).getTracks().forEach(track => track.stop());
          }
          // Remove WebGazer DOM elements
          const overlay = document.getElementById("webgazerVideoContainer");
          if (overlay) overlay.remove();
        }
        setWebgazerInitialized(false);
      }
    
      // Reset mode 3 state
      if (mode === 3) {
        setGenerating(false);
      }
    
      // Reset WPM
      const initialWpm = user?.wpm ? Math.round(user.wpm) : 300;
      setWpm(initialWpm);
      setInputValue(initialWpm.toString());
      wpmRef.current = initialWpm;
    };
  
    // const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  
    useEffect(() => {
      if (requested && !loading) {
        if (text == null) {
          alert("No texts found with those constraints");
          setRequested(false);
        } else {
          setCancelled(false);
          setTextId(text.id);
          setCurrentLineIndex(0);
          setTotalLines(splitTextIntoLines(text.content).length);
          setOutputLine("");
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
      if (mode === 3) {
        setFiction(false);
      }
      if ((mode === 2 || mode === 3) && progressStage === 1) {
        const initializeWebGazer = async () => {
          if (typeof window === "undefined") return;
    
          const webgazer = (window as any).webgazer;
          if (!webgazer) {
            console.error("WebGazer is not defined on window.");
            return;
          }
    
          // Clear existing video elements
          const existingVideo = document.getElementById("webgazerVideoFeed");
          if (existingVideo) existingVideo.remove();
    
          try {
            await webgazer
              .showVideoPreview(false)
              // .showPredictionPoints(false)
              .begin();
            console.log("WebGazer started!");
            setWebgazerInitialized(true);
          } catch (err) {
            console.error("WebGazer failed to start:", err);
            setWebgazerInitialized(false);
          }
        };
    
        initializeWebGazer();
    
        return () => {
          stopWebGazer();
          console.log("WebGazer stopped!");
        };
      }
    }, [mode, progressStage]);
  
    useEffect(() => {
      wpmRef.current = wpm;
    }, [wpm]);
  
    const handleRecalibrate = () => {
      setPaused(true);
      if (calibrationRef.current && !calibrationRef.current.calibrating) {
        calibrationRef.current.startCalibration();
      }
    }
  
    const sleep = (ms: number, signal?: AbortSignal) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    };
    
    const preRead = async (text: Text, signal: AbortSignal) => {
      const steps = [
        { text: `Reading '${text.title}'`, delay: 3000 },
        { text: "Ready...", delay: 1000 },
        { text: "Set...", delay: 1000 },
        { text: "Go!", delay: 1000 }
      ];
    
      for (const step of steps) {
        if (signal.aborted) return;
        setOutputLine(step.text);
        await sleep(step.delay, signal);
      }
    };
  
    const startReadingMode1 = async (text: Text) => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
    
      try {
        const lines = splitTextIntoLines(text.content);
        
        // Reset state
        setTotalLines(lines.length);
        setCurrentLineIndex(0);
        setOutputLine("");
    
        // Pre-read with cancellation support
        await preRead(text, signal);
        if (signal.aborted) return;
    
        const startTime = Timestamp.fromDate(new Date());
        const wpmReadings: number[] = [];
        let elapsedPausedTime = 0;
    
        // Set up interval with cleanup
        const intervalId = setInterval(() => {
          if (!signal.aborted && !pausedRef.current) {
            wpmReadings.push(wpmRef.current);
          }
        }, 5000);
    
        signal.addEventListener('abort', () => clearInterval(intervalId));
    
        // Main reading loop
        for (const line of lines) {
          if (signal.aborted) break;
    
          // Handle pauses with cancellation
          while (pausedRef.current && !signal.aborted) {
            await sleep(100, signal);
            elapsedPausedTime += 100;
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
    
          if (signal.aborted) break;
    
          // Update display
          setOutputLine(line);
          setCurrentLineIndex(prev => prev + 1);
    
          // Process line with cancellation
          try {
            const sleepTime = calculateSleepTime(line);
            await sleep(sleepTime, signal);
          } catch (err: any) {
            if (err.name === 'AbortError') break;
            throw err;
          }
        }
    
        if (!signal.aborted) {
          const endTime = Timestamp.fromDate(new Date());
          setReadingDone(true);
          setOutputLine("Reading complete!");
          finishReading(text, startTime, endTime, wpmReadings);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') throw err;
      } finally {
        // Cleanup if cancelled
        if (signal.aborted) {
          setOutputLine("");
          setCurrentLineIndex(0);
          setTotalLines(0);
        }
        abortControllerRef.current = null;
      }
    };
  
    const startReadingMode2 = async (text: Text) => {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      // Initialize boundary change variables.
      // currBoundaryChange: current line’s boundary range (max - min).
      // prevBoundaryChange: previous line’s boundary range.
      let currBoundaryChange = 0;
      let prevBoundaryChange = 0;  
      // Variables to track the minimum and maximum quarter values seen during the current line.
      let currentLineMinQuarter = Infinity;
      let currentLineMaxQuarter = -Infinity;
      
      try {
        const lines = splitTextIntoLines(text.content);
        
        // Initialize WebGazer and abort listening
        const webgazer = (window as any).webgazer;
        webgazer.setGazeListener(handleGaze);
        signal.addEventListener('abort', () => {});
    
        // Reset state
        setTotalLines(lines.length);
        setCurrentLineIndex(0);
        setOutputLine("");
    
        // Pre-read with cancellation support - aborts if abort signal is triggered
        // during the pre read 
        await preRead(text, signal);
        if (signal.aborted) return;
    
        const startTime = Timestamp.fromDate(new Date());
        const wpmReadings: number[] = [];
        let elapsedPausedTime = 0;
    
        // Set up interval with cleanup
        const intervalId = setInterval(() => {
          if (!signal.aborted) {
            wpmReadings.push(wpmRef.current);
          }
        }, 5000);
    
        signal.addEventListener('abort', () => clearInterval(intervalId));
    
        // Main reading loop
        for (const line of lines) {
          if (signal.aborted) break;
    
          // Before starting a new line, reset the current line's min/max and boundary change count.
          currentLineMinQuarter = Infinity;
          currentLineMaxQuarter = -Infinity;
          currBoundaryChange = 0;
    
          // Handle pauses with cancellation
          while (pausedRef.current && !signal.aborted) {
            await sleep(100, signal); // Pass signal to sleep
            elapsedPausedTime += 100;
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
    
          if (signal.aborted) break;
    
          // Update display
          setOutputLine(line);
          setCurrentLineIndex(prev => prev + 1);
    
          // Process line with cancellation
          try {
            await sleep(calculateSleepTime(line), signal);
          } catch (err: any) {
            if (err.name === 'AbortError') break;
            throw err;
          }
    
          // WPM adjustment logic:
          // Calculate newWpm based on the difference in boundary changes between the previous line and the current line.
          //   - If the boundary change is the same as before, keep the WPM consistent.
          //   - If there are more boundary changes, speed up by 10 per additional unit.
          //   - If there are fewer boundary changes, slow down by 10 per missing unit.
          // New rules added:
          //   - After applying the above diff logic, if the current line has no boundary change (0) subtract an additional 5.
          //   - If it has 3 boundary changes, add an additional 5.
          const newWpm = calculateNewWpm(prevBoundaryChange, currBoundaryChange);
          if (!signal.aborted) {
            setWpm(newWpm);
            setInputValue(newWpm.toString());
            wpmRef.current = newWpm;
          }
    
          // Save the current boundary change count for comparison on the next line.
          prevBoundaryChange = currBoundaryChange;
        }
    
        if (!signal.aborted) {
          const endTime = Timestamp.fromDate(new Date());
          setReadingDone(true);
          setOutputLine("Reading complete!");
          finishReading(text, startTime, endTime, wpmReadings);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') throw err;
      } finally {
        abortControllerRef.current = null;
      }
    
      // Updated handleGaze function records min and max quarters per line.
      function handleGaze(data: { x: number; y: number } | null) {
        if (!data || signal.aborted) return;
    
        const screenWidth = window.innerWidth;
        const quarterWidth = screenWidth / 4;
        const activeQuarter = Math.floor(data.x / quarterWidth) + 1;
    
        // Update current line minimum and maximum active quarters.
        currentLineMinQuarter = Math.min(currentLineMinQuarter, activeQuarter);
        currentLineMaxQuarter = Math.max(currentLineMaxQuarter, activeQuarter);
        // Calculate the current line's boundary change as the range of quarters encountered.
        // This effectively only counts positive (left-to-right) changes.
        currBoundaryChange = currentLineMaxQuarter - currentLineMinQuarter;
      }
    };
    
    // Updated helper function for WPM calculation based on boundary change differences.
    // The function first applies the diff logic (adjust by 10 per unit difference),
    // then applies the additional rules: if curr is 0, subtract an extra 5; if curr is 3, add an extra 5.
    const calculateNewWpm = (prev: number, curr: number) => {
      const diff = curr - prev;
      let newWpm = wpmRef.current;
      
      // Apply diff logic.
      if (diff === 0) {
        newWpm = wpmRef.current;
      } else if (diff > 0) {
        newWpm = Math.min(wpmRef.current + 20 * diff, 1000);
      } else if (diff < 0) {
        newWpm = Math.max(wpmRef.current - 20 * Math.abs(diff), 50);
      }
      
      // Additional rules: adjust by 5 if current boundary change is 0 or 3.
      if (curr === 0) {
        newWpm = Math.max(newWpm - 10, 50);
      } else if (curr === 3) {
        newWpm = Math.min(newWpm + 10, 1000);
      }
      
      return newWpm;
    };
    
    
  
    const startReadingMode3 = async (text: Text) => {
      cancelledRef.current = false;
      try {
        setGenerating(true);
        const summary = await summariseText(text.content, text.title);
        
        if (!cancelledRef.current) {
          setGenerating(false);
          text.content = summary;
          await startReadingMode2(text);
        }
      } catch (error) {
        if (!cancelledRef.current) {
          setGenerating(false);
        }
      } finally {
        if (cancelledRef.current) {
          setGenerating(false);
        }
      }
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
          {(mode === 2 || mode === 3) && progressStage === 1 && (
            <button
              onClick={handleRecalibrate}
              disabled={sessionStarted && !paused}
              className={`absolute top-6 right-6 bg-secondary text-white px-4 py-2 rounded transition ${
                sessionStarted && !paused ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
              }`}
            >
              Recalibrate
            </button>
          )}

          <AccessibilitySettingsButton sessionStarted={sessionStarted} />

          <ProgressCircles progressStage={progressStage} />

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
          {!sessionStarted && !generating && !loading && (
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
                <QuickStartGuide mode={mode} />

              </div>
            </div>
          )}
            {progressStage === 1 ? (
              // Session Start Box
              <>
                {!requested ? (
                  <div className="relative">
                    <br></br>
                    <button
                      className={`bg-secondary text-white px-6 py-3 rounded transition ${
                        (((mode === 2 || mode === 3) && !webgazerInitialized) ||
                          loading ||
                          generating ||
                          isCalibrating)
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-blue-600"
                      }`}
                      onClick={handleStartSession}
                      disabled={
                        ((mode === 2 || mode === 3) && !webgazerInitialized) ||
                        loading ||
                        generating ||
                        isCalibrating
                      }
                    >
                      {loading ? "Starting..." : "Start Session"}
                    </button>
                    {/* Tooltip for disabled state */}
                    {((mode === 2 || mode === 3) && !webgazerInitialized) && (
                      <div className="absolute top-full mt-2 mb-2 text-sm text-red-500">
                        Please allow camera access and recalibrate to start.
                      </div>
                    )}
                    <br></br>
                  </div>
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
                      <div className="absolute inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-10 flex-col gap-4">
                        <div className="text-4xl text-gray-700 font-bold">PAUSED</div>
                        <button
                          onClick={handleCancelSession}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        >
                          Cancel Session
                        </button>
                        <button
                          onClick={() => setPaused(!paused)}
                          disabled={isCalibrating}
                          className={`bg-green-500 text-white px-4 py-2 rounded transition ${
                            isCalibrating ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
                          }`}
                        >
                          Resume Session
                        </button>
                      </div>
                    )}
                    
                    <p
                      className="whitespace-pre-wrap text-center leading-relaxed relative z-0"
                      style={{
                        padding: `${accessibilitySettings.readingBoxPadding}px`,
                        backgroundColor: accessibilitySettings.readingBoxBackground,
                        border: accessibilitySettings.readingBoxBorder,
                        fontFamily: accessibilitySettings.fontFamily,
                        lineHeight: accessibilitySettings.lineHeight,
                        color: accessibilitySettings.textColor,
                        fontSize: `${accessibilitySettings.fontSize}px`
                      }}
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
  
                      <button
                        onClick={handleCancelSession}
                        className="text-red-500 hover:text-red-600 transition-colors"
                        title="Cancel Session"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
                        </svg>
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
            <Calibration ref={calibrationRef} onCalibratingChange={setIsCalibrating} />
          </div>
  
          {(mode === 2 || mode === 3) && (
            <div className="mt-4 w-full max-w-3xl">
              <WebGazerDisclaimer />
            </div>
          )}
        </div>
      </>
    );
  };

export default UserSessionContent;