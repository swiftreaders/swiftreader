"use client";
import { useState } from "react";
import { Session } from "@/types/sessions";
import {
  useReadingContext,
  ReadingSessionProvider,
} from "@/contexts/readingSessionsContext";
import { useUserContext, UserProvider } from "@/contexts/userContext";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
import { SessionStats } from "@/components/SessionStats";
import Button from "@/components/common/Button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { RecentReadingSessions } from "@/components/userDashboard/RecentSessionsTable";
import { ProgressHeader } from "@/components/userDashboard/ProgressHeader";
import LeaderboardComponent from "@/components/userDashboard/Leaderboard";

// Dashboard Summary Component
interface DashboardSummaryProps {
  totalReadingTime: number;
  averageWPM: number;
  sessionsCount: number;
  comprehensionRate: number;
}

const DashboardSummary = ({
  totalReadingTime,
  averageWPM,
  sessionsCount,
  comprehensionRate,
}: DashboardSummaryProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <div className="bg-widget shadow-md rounded-lg p-6">
      <h3 className="text-gray-500 text-sm font-medium">Total Reading Time</h3>
      <p className="text-3xl font-bold mt-2">{totalReadingTime} min</p>
    </div>
    <div className="bg-widget shadow-md rounded-lg p-6">
      <h3 className="text-gray-500 text-sm font-medium">Average Speed</h3>
      <p className="text-3xl font-bold mt-2">{averageWPM} WPM</p>
    </div>
    <div className="bg-widget shadow-md rounded-lg p-6">
      <h3 className="text-gray-500 text-sm font-medium">Sessions Completed</h3>
      <p className="text-3xl font-bold mt-2">{sessionsCount}</p>
    </div>
    <div className="bg-widget shadow-md rounded-lg p-6">
      <h3 className="text-gray-500 text-sm font-medium">Comprehension Rate</h3>
      <p className="text-3xl font-bold mt-2">{comprehensionRate}%</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-widget rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-semibold mb-4">Set Monthly Reading Goal</h2>
        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Reading Time (minutes)
            </label>
            <input
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter your reading goal (in minutes)"
              min="1"
            />
            <p className="text-sm text-gray-500 mt-2">
              This equals approximately {Math.round(newGoal / 30)} minutes per day
            </p>
          </div>
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


const UserDashboardContent = () => {
  const { user } = useAuth();
  const { recentSessions } = useReadingContext();
  const { readingGoal, setReadingGoal } = useUserContext();
  const [newGoal, setNewGoal] = useState(readingGoal);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const totalReadingTime = parseFloat(
    (recentSessions.reduce((acc, session) => acc + session.duration, 0) / 60).toFixed(2)
  );

  const weeklyProgress = 145; // Sample weekly progress in minutes
  const progressPercentage = Math.min((totalReadingTime / readingGoal) * 100, 100);
  const averageWPM = user?.wpm || 200; // Sample average WPM
  const comprehensionRate = recentSessions.reduce
    ((acc, session) => {
      return acc + (session.getComprehensionScore() ?? 0) 
    }, 0) / recentSessions.length ;

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReadingGoal(newGoal);
    setIsGoalModalOpen(false);
  };

  return (
    <div className="min-h-screen mt-[7vh] bg-gray-50">
      <header className="bg-sr-gradient py-8 shadow-lg">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Reading Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">
            Track your progress and improve your reading skills
          </p>
        </div>
      </header>
      
      <div className="container mx-auto py-8 px-4 md:px-8 lg:px-20 -mt-6">
        <div className="bg-gray-50 rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Overview</h2>
            <Button displayText="Start New Session" href="/userSession" />
          </div>
          
          <DashboardSummary
            totalReadingTime={totalReadingTime}
            averageWPM={Math.round(averageWPM)}
            sessionsCount={recentSessions.length}
            comprehensionRate={Math.round(comprehensionRate)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <ProgressHeader
              totalReadingTime={totalReadingTime}
              readingGoal={readingGoal}
              progressPercentage={progressPercentage}
              onSetGoalClick={() => setIsGoalModalOpen(true)}
              weeklyProgress={weeklyProgress}
            />
            
            <RecentReadingSessions
              recentSessions={recentSessions}
              onSelectSession={(session) => setSelectedSession(session)}
            />
          </div>
          
          <div className="md:col-span-4">
            <LeaderboardComponent />
          </div>
        </div>
        
        <GoalSettingModal
          isOpen={isGoalModalOpen}
          newGoal={newGoal}
          setNewGoal={setNewGoal}
          onSubmit={handleGoalSubmit}
          onClose={() => setIsGoalModalOpen(false)}
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