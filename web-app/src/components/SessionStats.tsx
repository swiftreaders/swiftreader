import React from "react";
import { Session } from "@/types/sessions";
import { SessionChart } from "./SessionChart"; // Ensure proper import

interface SessionStatsProps {
  session: Session;
  onClose?: () => void;
}

export const SessionStats = ({ session, onClose }: SessionStatsProps) => (
  <div className="bg-widget shadow-md rounded-lg p-6 max-w-4xl w-full mx-4">
    {/* Header */}
    <div className="mb-4">
      <h2 className="text-xl font-semibold">{session.title}</h2>
      <p className="text-gray-500 text-sm mt-1">
        {session.startTime.toDate().toLocaleDateString([], { 
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-3 gap-6">
      {/* Chart Section */}
      <div className="col-span-2">
        <SessionChart wpmData={session.wpm} />
      </div>

      {/* Statistics Section */}
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Session Statistics</h4>
          <div className="space-y-3">
            <StatItem label="Average WPM" value={session.average_wpm.toFixed(1)} />
            <StatItem label="Text Average" value={session.text_average_performance.toFixed(1)} />
            <StatItem label="Duration" value={`${Math.floor(session.duration / 60)}m ${Math.round(session.duration % 60)}s`} />
            <StatItem label="Difficulty" value={session.difficulty} />
            <StatItem 
              label="Comprehension" 
              value={`${Math.round(session.getComprehensionScore()).toString()}%`} 
            />
          </div>
        </div>
      </div>
    </div>

    {/* Close Button */}
    {onClose && (
      <button
        onClick={onClose}
        className="mt-6 px-4 py-2 text-secondary font-medium hover:text-purple-700 transition-colors"
      >
        Close Session
      </button>
    )}
  </div>
);

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="text-gray-900 font-medium">{value}</span>
  </div>
);