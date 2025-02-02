"use client";

import { useReadingContext, ReadingSessionProvider } from "@/contexts/readingSessionsContext";
import { useState, useEffect } from "react";
import { Category, Difficulty, Genre, Text } from "@/types/text";
import { Session } from "@/types/sessions"
import { Timestamp } from "firebase/firestore";

const UserSessionContent = () => {
  const { text, getText } = useReadingContext();
  const [difficulty, setDifficulty] = useState(Difficulty.MEDIUM);
  const [category, setCategory] = useState(Category.NATURE);
  const [genre, setGenre] = useState(Genre.DRAMA);
  const [fiction, setFiction] = useState(true);
  const [length, setLength] = useState(400);
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
  

  const handleStartSession = async () => {
    setLoading(true);
    setRequested(true);
    getText(fiction ? genre : category, difficulty, fiction, length, setLoading);
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    if (requested && !loading) {
      console.log(text);
      if (text == null) {
        alert("No texts found with those constraints");
        setRequested(false);
      } else {
        setSessionStarted(true);
        startReadingMode1(text);
      }
    }
  }, [requested, loading, text]);

  const startReadingMode1 = async (text: Text): Promise<Session> => {
    const lines = splitTextIntoLines(text.content);
    setOutputLine("Reading '" + text.title + "'");
    await sleep(3000);
    setOutputLine("Ready...");
    await sleep(1000);
    setOutputLine("Set...");
    await sleep(1000);
    setOutputLine("Go!");
    await sleep(1000);
    const startTime = Timestamp.fromDate(new Date());
    for (const line of lines) {
      setOutputLine(line);
      const sleepTime = calculateSleepTime(line);
      await sleep(sleepTime);
    }
    const endTime = Timestamp.fromDate(new Date());
    console.log(sessionCompleteMode1(startTime, endTime, text));
    return sessionCompleteMode1(startTime, endTime, text);
  };

  const sessionCompleteMode1 = (startTime: Timestamp, endTime: Timestamp, text: Text): Session => {
    // TODO: Pass in our own userId
    const stubUserId = "Ss4hOp2vmTZkbV2H0w68"
    return new Session(text.id, 
      stubUserId, 
      text.title, 
      startTime, 
      endTime, 
      new Array(Math.floor((endTime.toMillis() - startTime.toMillis()) / 5000)).fill(wpm),
      1,
      text.difficulty)
  }

  return (
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
    </div>
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
