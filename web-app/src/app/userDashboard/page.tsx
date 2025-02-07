"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@/types/sessions";
import {
  useReadingContext,
  ReadingSessionProvider,
} from "@/contexts/readingSessionsContext";
import { useUserContext, UserProvider } from "@/contexts/userContext";
import { SessionStats } from "@/components/SessionStats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/errors/accessDenied";


const UserDashboardContent = () => {

  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const { recentSessions } = useReadingContext();
  const { readingGoal, setReadingGoal, retrieveTotalReadingTime } =
    useUserContext();
  const [newGoal, setNewGoal] = useState(readingGoal);

  // Mock chart data (replace with real data as needed)
  const readingProgressData = [
    { date: "2023-10-01", wpm: 50 },
    { date: "2023-10-05", wpm: 60 },
    { date: "2023-10-10", wpm: 70 },
    { date: "2023-10-15", wpm: 80 },
    { date: "2023-10-20", wpm: 85 },
    { date: "2023-10-25", wpm: 90 },
  ];

  // Replace with actual total reading time
  const totalReadingTime = 90;
  const progressPercentage = (totalReadingTime / readingGoal) * 100;

  const handleNewSessionClick = () => {
    router.push(`/userSession`);
  };

  const handleSetGoalClick = () => {
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stock_userid = "AyYtqKV2YHoWAKjpvAxL"; //TODO: replace with actual user id once authentication is implemented
    setReadingGoal(newGoal, stock_userid);
    setIsGoalModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-green-500 to-teal-500 py-8 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white">User Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">
            Track your reading sessions and progress
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={handleNewSessionClick}
            className="px-4 py-2 bg-blue-500 text-white rounded-md transition hover:bg-blue-600"
          >
            New Session
          </button>
        </div>

      {/* Progress Header */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Reading Progress</h2>
          <button
            onClick={handleSetGoalClick}
            className="px-4 py-2 bg-green-500 text-white rounded-md transition hover:bg-green-600"
          >
            Set Goal
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-700">
            Total Reading Time:{" "}
            <span className="font-bold">{totalReadingTime} minutes</span>
          </p>
          <p className="text-gray-700">
            Goal: <span className="font-bold">{readingGoal} minutes</span>
          </p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

        {/* Goal Setting Modal */}
        {isGoalModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-xl font-semibold mb-4">Set Reading Goal</h2>
              <form onSubmit={handleGoalSubmit}>
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Enter your reading goal (in minutes)"
                  min="1"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsGoalModalOpen(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md transition hover:bg-gray-600 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md transition hover:bg-green-600"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recent Reading Sessions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Reading Sessions</h2>
          <ul className="bg-white shadow-md rounded-lg p-4">
            {recentSessions.map((session) => (
              <li
                key={session.id}
                className="flex justify-between items-center border-b last:border-b-0 py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedSession(session)}
              >
                <span>{session.title}</span>
                <span className="text-gray-500 text-sm">
                  {session.startTime.toDate().toLocaleTimeString()} - {session.duration}{" "}
                  minutes
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chart */}
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Reading Performance Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={readingProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="wpm" stroke="#4A90E2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Session Details Modal */}
        {selectedSession && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedSession(null)}
          >
            <SessionStats session={selectedSession} onClose={() => setSelectedSession(null)} />
          </div>
        )}
      </main>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      {user ? (
        <UserProvider>
          <ReadingSessionProvider>
            <UserDashboardContent />
          </ReadingSessionProvider>
        </UserProvider>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
};

export default UserDashboard;
