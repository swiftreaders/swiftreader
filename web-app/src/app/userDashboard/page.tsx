"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@/types/sessions";
import { useReadingContext, ReadingSessionProvider } from "@/contexts/readingSessionsContext";
import { useUserContext, UserProvider } from "@/contexts/userContext";
import { SessionStats } from "@/components/SessionStats";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DashboardContent = () => {
  const { recentSessions } = useReadingContext();
  const { readingGoal, setReadingGoal, retrieveTotalReadingTime } = useUserContext();

  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState(readingGoal);

  // Mock data for the chart (replace with real data from your context)
  const readingProgressData = [
    { date: "2023-10-01", wpm: 50 },
    { date: "2023-10-05", wpm: 60 },
    { date: "2023-10-10", wpm: 70 },
    { date: "2023-10-15", wpm: 80 },
    { date: "2023-10-20", wpm: 85 },
    { date: "2023-10-25", wpm: 90 },
  ];

  // Calculate total reading time (in minutes)
  const totalReadingTime = 90; //TODO: replace with actual user id once authentication is implemented

  // Calculate progress percentage
  const progressPercentage = (totalReadingTime / readingGoal) * 100;

  const handleNewSessionClick = () => {
    router.push(`/read?category=nature`);
  };

  const handleSetGoalClick = () => {
    setIsGoalModalOpen(true);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stock_userid = "AyYtqKV2YHoWAKjpvAxL";  //TODO: replace with actual user id once authentication is implemented
    setReadingGoal(newGoal, stock_userid);
    setIsGoalModalOpen(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Welcome to the Dashboard</h1>
      <div>
        <button 
          onClick={handleNewSessionClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Set Goal
          </button>
        </div>
        <div className="mb-4">
          <p className="text-gray-700">
            Total Reading Time: <span className="font-bold">{totalReadingTime} minutes</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Set Reading Goal</h2>
            <form onSubmit={handleGoalSubmit}>
              <input
                type="number"
                value={newGoal}
                onChange={(e) => setNewGoal(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Enter your reading goal (in minutes)"
                min="1"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
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
              <span className="text-gray-500 text-sm">{session.date} - {session.duration} minutes</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedSession(null)}>
          <SessionStats 
            session={selectedSession} 
            onClose={() => setSelectedSession(null)}
          />
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  return (
    <UserProvider>
      <ReadingSessionProvider>
        <DashboardContent />
      </ReadingSessionProvider>
    </UserProvider>
  );
};

export default Dashboard;