"use client";

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
// import HelpPopup from "@/components/helpPopup"
import { useAuth } from "@/contexts/authContext";
// import InfoPopup from "@/components/infoPopup"

const UserSessionContent = () => {
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
  const [progressStage, setProgressStage] = useState(1);
  const [outputLine, setOutputLine] = useState<string>("");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readingDone, setReadingDone] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  // const [popupVisible, setPopupVisible] = useState(false);
  const wpmRef = useRef(wpm);

  // Added: Create a ref for the Calibration component
  const calibrationRef = useRef<CalibrationRef>(null);

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
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Modified: Added an eslint disable comment to ignore missing dependencies warning
  useEffect(() => {
    if (requested && !loading) {
      if (text == null) {
        alert("No texts found with those constraints");
        setRequested(false);
      } else {
        setTextId(text.id);
        setSessionStarted(true);
        if (mode == 1) {
          startReadingMode1(text);
        } else if (mode == 2) {
          startReadingMode2(text);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requested, loading, text]);

  useEffect(() => {
    if (mode == 2) {
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
    }
  }, [mode]); // Runs when mode updates

  useEffect(() => {
    wpmRef.current = wpm;
  }, [wpm]);

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
    const wpmReadings: Array<number> = [];
    const intervalId = setInterval(() => {
      wpmReadings.push(wpmRef.current);
    }, 5000);
    for (const line of lines) {
      setOutputLine(line);
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

    // let currentLineIndex = 0;

    // 2. Define a helper to show the next line
    // setOutputLine(lines[currentLineIndex]);
    // const showNextLine = () => {
    //   if (currentLineIndex < lines.length) {
    //     setOutputLine(lines[currentLineIndex]);
    //     currentLineIndex++;
    //   } else {
    //     // Optionally handle the end of content here (e.g., stop WebGazer, etc.)
    //     console.log("All lines have been displayed.");
    //   }
    // };

    // Initialize WebGazer & set the gaze listener
    // Make sure WebGazer is loaded on `window` (as in your example).
    (window as any).webgazer.setGazeListener(handleGaze);
    const wpmReadings: Array<number> = [];
    const intervalId = setInterval(() => {
      wpmReadings.push(wpmRef.current);
    }, 5000);
    const startTime = Timestamp.fromDate(new Date());
    for (const line of lines) {
      setOutputLine(line);
      currBoundaryChange = 2;
      const sleepTime = calculateSleepTime(line);
      await sleep(sleepTime);

      // Adusts wpm based on previous two boundary changes
      let newWpm = wpmRef.current;
      switch (prevBoundaryChange + currBoundaryChange) {
        case 6:
          newWpm = wpmRef.current + 20;
          break;
        case 5:
          newWpm = wpmRef.current + 10;
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
    // (window as any).webgazer.stop();
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

  const finishReading = (
    text: Text,
    startTime: Timestamp,
    endTime: Timestamp,
    wpm: Array<number>
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

  // Handle keypresses to alter WPM using arrow keys
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      let newWpm = wpmRef.current;
      switch (event.key.toLowerCase()) {
        case "w":
          newWpm = wpmRef.current + 1;
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
          newWpm = wpmRef.current + 10;
          setWpm(newWpm);
          setInputValue(newWpm.toString());
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

  // useEffect(() => {console.log(wpmRef.current, inputValue)}, [wpm, inputValue]);

  return (
    <>
      <Script
        src="https://webgazer.cs.brown.edu/webgazer.js"
        strategy="beforeInteractive" // ensures script is loaded early
        onLoad={() =>
          console.log("WebGazer script loaded (beforeInteractive)!")
        }
        onError={() => console.error("Failed to load WebGazer script.")}
      />
      <div className="min-h-screen mt-[7vh] bg-background flex flex-col items-center p-8 relative">
        {/* Added: Recalibrate Button in the top right */}
        {mode === 2 && (
          <button
            onClick={() =>
              calibrationRef.current &&
              calibrationRef.current.startCalibration()
            }
            className="absolute top-6 right-6 bg-secondary text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Recalibrate
          </button>
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
              {/* Select Mode Dropdown*/}
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
                  checked={fiction}
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
                  Length in words:
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
                  className="ml-2"
                />
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
        <div className="w-full flex justify-center flex-col items-center">
          {!sessionStarted ? (
            <div className="w-full bg-gray-200 p-8 rounded-lg shadow-lg">
              <p className="text-3xl text-gray-800 whitespace-pre-wrap text-center leading-relaxed font-semibold">
                {"Mode " + mode + " Reading"}
              </p>

              {mode === 1 && (
                <>
                  <p className="text-sm text-gray-600 mt-4 text-center font-semibold">
                    Read at a fixed speed
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 list-inside text-center mx-auto max-w-lg">
                    <li> - Use the settings bar to choose your starting WPM</li>
                    <li> - Manually adjust your WPM using WASD</li>
                  </ul>
                </>
              )}

              {mode === 2 && (
                <>
                  <p className="text-sm text-gray-600 mt-4 text-center font-semibold">
                    Use eye tracking software to dynamically adjust reading
                    speed
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 list-inside text-center mx-auto max-w-lg">
                    <li>
                      {" "}
                      - Your reading speed will automatically adjust by tracking
                      the position of your eyes
                    </li>
                    <li>
                      {" "}
                      - Ensure your browser can access a webcam, then click
                      Recalibrate before you begin
                    </li>
                    <li> - Manually adjust your WPM using WASD</li>
                  </ul>
                </>
              )}

              {mode === 3 && (
                <>
                  <p className="text-sm text-gray-600 mt-4 text-center font-semibold">
                    Summarise the text for even faster comprehension
                    (Non-fiction only)
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 list-inside text-center mx-auto max-w-lg">
                    <li> - Use the settings bar to choose your starting WPM</li>
                    <li> - Manually adjust your WPM using WASD</li>
                    <li>
                      {" "}
                      - Non-fiction texts will be summarised to help you learn
                      faster
                    </li>
                  </ul>
                </>
              )}
            </div>
          ) : null}

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
              ) : sessionStarted ? (
                <div className="w-full bg-gray-200 p-8 rounded-lg shadow-inner">
                  <p className="text-4xl text-gray-800 whitespace-pre-wrap text-center leading-relaxed">
                    {outputLine}
                  </p>
                </div>
              ) : null}
            </>
          ) : progressStage === 2 && session != null ? (
            <Quiz
              textId={textId}
              session={session}
              onContinue={() => setProgressStage(3)}
            />
          ) : (
            // Optionally handle other progressStage values if necessary
            <div className="w-full flex justify-center">
              <p className="text-xl text-gray-800">Stats page goes here</p>
            </div>
          )}

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

        <WebGazerClient />
        {/* Pass the ref to the Calibration component */}
        <Calibration ref={calibrationRef} />
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
