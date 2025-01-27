"use client";

import { useReadingContext, ReadingSessionProvider } from "@/contexts/readingSessionsContext";
import { useState, useEffect } from "react";
import { Category, Difficulty } from "@/types/text";

const UserSessionContent = () => {
  const { text, getText } = useReadingContext();
  const [isSettingOneEnabled, setIsSettingOneEnabled] = useState(false);
  const [isSettingTwoEnabled, setIsSettingTwoEnabled] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [outputText, setOutputText] = useState("");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = (setting: string) => {
    if (setting === "settingOne") {
      setIsSettingOneEnabled(!isSettingOneEnabled);
    } else if (setting === "settingTwo") {
      setIsSettingTwoEnabled(!isSettingTwoEnabled);
    }
  };

  const handleWpmChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      setWpm(value);
    }
  };

  const handleStartSession = async () => {
    setLoading(true);
    setRequested(true);
    // TODO: Make this read the settings
    getText(Category.NATURE, Difficulty.MEDIUM, true, 200, setLoading);
  };

  useEffect(() => {
    if (requested && !loading) {
      if (text == null) {
        alert("No texts found with those constraints");
        setRequested(false);
      } else {
        setSessionStarted(true);
        startReading(text.content);
      }
    }
  }, [requested, loading, text]);

  const startReading = (content: string) => {
    // TODO: make this output line by line
    setOutputText(content);
  };

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
      <div className="flex items-center justify-between w-full max-w-lg mb-8 space-x-4">
        {/* Circle Settings Button */}
        <button className="h-10 w-10 rounded-full bg-gray-300 hover:bg-gray-400 transition">
          ⚙️
        </button>

        {/* Toggle Buttons */}
        <button
          className={`px-4 py-2 rounded ${
            isSettingOneEnabled ? "bg-blue-500 text-white" : "bg-gray-300"
          } hover:bg-blue-600 transition`}
          onClick={() => handleToggle("settingOne")}
        >
          Setting 1
        </button>
        <button
          className={`px-4 py-2 rounded ${
            isSettingTwoEnabled ? "bg-blue-500 text-white" : "bg-gray-300"
          } hover:bg-blue-600 transition`}
          onClick={() => handleToggle("settingTwo")}
        >
          Setting 2
        </button>

        {/* WPM Input */}
        <div className="flex items-center space-x-2">
          <label htmlFor="wpmInput" className="text-sm font-medium">
            WPM:
          </label>
          <input
            id="wpmInput"
            type="number"
            className="border rounded px-2 py-1 w-20 text-center"
            value={wpm}
            onChange={handleWpmChange}
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
            <p className="text-xl text-gray-800 whitespace-pre-wrap text-center">{outputText}</p>
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
