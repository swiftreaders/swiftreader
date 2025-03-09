import React from "react";
import { Session } from "@/types/sessions";

// Recent Reading Sessions Component
interface RecentReadingSessionsProps {
    recentSessions: Session[];
    onSelectSession: (session: Session) => void;
  }
  
export const RecentReadingSessions = ({
    recentSessions,
    onSelectSession,
    }: RecentReadingSessionsProps) => (
    <div className="mt-8 bg-widget shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Reading Sessions</h2>
        <button className="text-sm text-secondary font-medium">View All</button>
        </div>
        {recentSessions.length > 0 ? (
        <div className="overflow-x-auto">
            <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-black">
                <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WPM</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {recentSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{session.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                    {session.startTime.toDate().toLocaleDateString()}
                    {session.startTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                    {Math.floor(session.duration / 60)}m {(session.duration % 60).toFixed(0)}s
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                    {session.average_wpm.toFixed(1) || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-sm">
                    <button 
                        onClick={() => onSelectSession(session)}
                        className="text-secondary hover:text-purple-700 font-medium"
                    >
                        View Details
                    </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        ) : (
        <p className="text-gray-500 py-4 text-center">No reading sessions yet. Start your first session now!</p>
        )}
    </div>
    );

// export default RecentReadingSessions;