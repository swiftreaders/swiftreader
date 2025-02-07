import React from "react";

type SessionWidgetProps = {
  sessionNumber: number;
  title: string;
  genre: string;
  difficulty: string;
  wpm: number;
  comprehensionScore: number;
  sessionDate: string; // Example: "01 Feb 2025, 14:00"
};

const SessionWidget: React.FC<SessionWidgetProps> = ({
  sessionNumber,
  title,
  genre,
  difficulty,
  wpm,
  comprehensionScore,
  sessionDate,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-md border">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-gray-500">Session {sessionNumber}</span>
        <span className="text-lg font-bold">{title}</span>
      </div>

      {/* Genre and Difficulty */}
      <div className="flex justify-between mb-6">
        <div className="text-sm font-medium text-gray-600">
          <span className="block">Genre:</span>
          <span className="text-gray-800">{genre}</span>
        </div>
        <div className="text-sm font-medium text-gray-600">
          <span className="block">Difficulty:</span>
          <span className="text-gray-800">{difficulty}</span>
        </div>
      </div>

      {/* Main Content: WPM and Comprehension Score */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-3xl font-bold text-blue-600 mb-2">{wpm} WPM</div>
        <div className="text-lg font-semibold text-gray-700">Comprehension Score: {comprehensionScore}</div>
      </div>

      {/* Footer: Date and Time */}
      <div className="text-sm text-gray-500 border-t pt-2">
        <span>{sessionDate}</span>
      </div>
    </div>
  );
};

export default SessionWidget;
