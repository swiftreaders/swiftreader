// components/SessionStats.tsx
"use client";

import { Session } from "@/types/sessions";
import { SessionChart } from "./SessionChart";

interface SessionStatsProps {
  session: Session;
  onClose?: () => void;
}

export const SessionStats = ({ session, onClose }: SessionStatsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold">{session.title}</h3>
        <p className="text-gray-600">{session.startTime.toDate().toLocaleDateString()}</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="col-span-2">
          <SessionChart wpmData={session.wpm} />
        </div>

        {/* Statistics Section */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Session Statistics</h4>
            <div className="space-y-2">
              <StatItem label="Average WPM" value={session.average_wpm.toFixed(1)} />
              <StatItem label="Text Average" value={session.text_average_performance.toFixed(1)} />
              <StatItem label="Duration" value={`${session.duration} seconds`} />
              <StatItem label="Difficulty" value={session.difficulty} />
              <StatItem label="Comprehension" value={session.getComprehensionPercentage()} />
            </div>
          </div>
        </div>
      </div>

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
        >
          Close
        </button>
      )}
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <p>
    <span className="font-medium">{label}:</span>
    <br />
    {value}
  </p>
);
