"use client";

import { useState } from "react";

const UserSession = () => {
  const [isSettingOneEnabled, setIsSettingOneEnabled] = useState(false);
  const [isSettingTwoEnabled, setIsSettingTwoEnabled] = useState(false);

  const handleToggle = (setting: string) => {
    if (setting === "settingOne") {
      setIsSettingOneEnabled(!isSettingOneEnabled);
    } else if (setting === "settingTwo") {
      setIsSettingTwoEnabled(!isSettingTwoEnabled);
    }
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
      <div className="flex items-center justify-between w-full max-w-lg mb-8">
        {/* Circle Settings Button */}
        <button className="h-10 w-10 rounded-full bg-gray-300 hover:bg-gray-400 transition">
          ⚙️
        </button>

        {/* Toggle Buttons */}
        <div className="flex items-center space-x-4">
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
        </div>
      </div>

      {/* Session Start Box */}
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4">Start a New Session</h2>
        <button className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition">
          Start Session
        </button>
      </div>
    </div>
  );
};

export default UserSession;
