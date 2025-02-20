"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@/types/sessions";
import {
  useReadingContext,
  ReadingSessionProvider,
} from "@/contexts/readingSessionsContext";
import { useUserContext, UserProvider } from "@/contexts/userContext";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
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

// Progress Header Component
interface ProgressHeaderProps {
  totalReadingTime: number;
  readingGoal: number;
  progressPercentage: number;
  onSetGoalClick: () => void;
}

const ProgressHeader = ({
  totalReadingTime,
  readingGoal,
  progressPercentage,
  onSetGoalClick,
}: ProgressHeaderProps) => (
  <div className="mt-8 bg-widget shadow-md rounded-lg p-6 w-full">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Your Reading Progress</h2>
      <button
        onClick={onSetGoalClick}
        className="px-4 py-2 bg-sr-gradient text-white font-bold rounded-md transition hover:bg-green-600"
      >
        Set Goal
      </button>
    </div>
    <p>
      Total Reading Time:{" "}
      <span className="font-bold">{totalReadingTime} minutes</span>
    </p>
    <p>
      Goal: <span className="font-bold">{readingGoal} minutes</span>
    </p>
    <div className="w-full bg-gray-200 rounded-full h-4 mt-5">
      <div
        className="bg-secondary h-4 rounded-full"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  </div>
);

// Goal Setting Modal Component
interface GoalSettingModalProps {
  isOpen: boolean;
  newGoal: number;
  setNewGoal: (goal: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const GoalSettingModal = ({
  isOpen,
  newGoal,
  setNewGoal,
  onSubmit,
  onClose,
}: GoalSettingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-widget rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Set Reading Goal</h2>
        <form onSubmit={onSubmit}>
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
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Recent Reading Sessions Component
import { FC } from "react";
import router from "next/router";
import Button from "@/components/common/Button";

interface RecentReadingSessionsProps {
  recentSessions: Session[];
  onSelectSession: (session: Session) => void;
}

const RecentReadingSessions: FC<RecentReadingSessionsProps> = ({
  recentSessions,
  onSelectSession,
}) => (
  <div className="mt-8 bg-widget shadow-md rounded-lg p-4">
    <h2 className="text-xl font-semibold mb-4">Recent Reading Sessions</h2>
    <ul>
      {recentSessions.map((session) => (
        <li
          key={session.id}
          className="flex justify-between items-center border-b last:border-b-0 py-2 cursor-pointer hover:bg-gray-50"
          onClick={() => onSelectSession(session)}
        >
          <span>{session.title}</span>
          <span className="text-gray-500 text-sm">
            {session.startTime.toDate().toLocaleTimeString()} -{" "}
            {session.duration} seconds
          </span>
        </li>
      ))}
    </ul>
  </div>
);

// Reading Chart Component
interface ReadingChartProps {
  readingProgressData: { date: string; wpm: number }[];
}

const ReadingChart = ({ readingProgressData }: ReadingChartProps) => (
  <div className="mt-8 bg-widget shadow-md rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4">
      Reading Performance Over Time
    </h2>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={readingProgressData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="wpm" stroke="#3e0075" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const UserDashboardContent = () => {
  const router = useRouter();
  const { recentSessions } = useReadingContext();
  const { readingGoal, setReadingGoal } = useUserContext();
  const [newGoal, setNewGoal] = useState(readingGoal);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const readingProgressData = [
    { date: "2023-10-01", wpm: 50 },
    { date: "2023-10-05", wpm: 60 },
    { date: "2023-10-10", wpm: 70 },
    { date: "2023-10-15", wpm: 80 },
    { date: "2023-10-20", wpm: 85 },
    { date: "2023-10-25", wpm: 90 },
  ];

  const totalReadingTime = parseFloat((
    recentSessions.reduce((acc, session) => acc + session.duration, 0) / 60
  ).toFixed(2));
  const progressPercentage = Math.min((totalReadingTime / readingGoal) * 100, 100);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReadingGoal(newGoal);
    setIsGoalModalOpen(false);
  };

  return (
    <div className="min-h-screen mt-[7vh] bg-background">
      <header className="bg-sr-gradient py-8 shadow-lg">
        <div className="container px-20 text-left">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">
            Track your reading sessions and progress
          </p>
        </div>
      </header>
      <div className="py-8 px-20">
        <Button displayText="New Session" href="/userSession" />
        <ProgressHeader
          totalReadingTime={totalReadingTime}
          readingGoal={readingGoal}
          progressPercentage={progressPercentage}
          onSetGoalClick={() => setIsGoalModalOpen(true)}
        />
        <GoalSettingModal
          isOpen={isGoalModalOpen}
          newGoal={newGoal}
          setNewGoal={setNewGoal}
          onSubmit={handleGoalSubmit}
          onClose={() => setIsGoalModalOpen(false)}
        />
        <RecentReadingSessions
          recentSessions={recentSessions}
          onSelectSession={(session) => {
            setSelectedSession(session)}
          }
        />

        {/* Session Details Modal */}
        {selectedSession && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setSelectedSession(null)}
          >
            <SessionStats session={selectedSession} onClose={() => setSelectedSession(null)} />
          </div>
        )}
        <ReadingChart readingProgressData={readingProgressData}/>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  return user ? (
    <UserProvider>
      <ReadingSessionProvider>
        <UserDashboardContent />
      </ReadingSessionProvider>
    </UserProvider>
  ) : (
    <AccessDenied />
  );
};

export default UserDashboard;
