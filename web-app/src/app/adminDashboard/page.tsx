"use client";

import { useState, useEffect } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { Session } from "@/types/sessions"; // Assuming correct import
import { Timestamp } from "firebase/firestore";
import  UserInfoSessionWidget from "@/components/UserInfoSessionWidget"; // Assuming correct import
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminDashboardContent = () => {
  const { texts, users, removeUser } = useAdminDashboard();
  const [userMetrics, setUserMetrics] = useState({ totalUsers: 0, newUsers: 0 });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<Session[]>([]);
  const router = useRouter();

  useEffect(() => {
    const totalUsers = users.length;
    const newUsers = users.filter(user => Date.now() - user.joinDate.toMillis() < 2419200000).length;
    setUserMetrics({ totalUsers, newUsers });
  }, [users]);

  const handleManageClick = (user: User) => {
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

   // Dummy session data
   const dummySessions = [
    {
      id: 1,
      title: "Session 1",
      genre: "Fiction",
      difficulty: "Medium",
      wpm: 72,
      comprehensionScore: 88,
      sessionDate: "01 Feb 2025, 14:00",
    },
    {
      id: 2,
      title: "Session 2",
      genre: "History",
      difficulty: "Hard",
      wpm: 64,
      comprehensionScore: 75,
      sessionDate: "31 Jan 2025, 10:30",
    },
    {
      id: 3,
      title: "Session 3",
      genre: "Science",
      difficulty: "Easy",
      wpm: 85,
      comprehensionScore: 92,
      sessionDate: "30 Jan 2025, 16:15",
    },
  ];

  const userTrendData = [
    { month: "Jan", newUsers: 30 },
    { month: "Feb", newUsers: 50 },
    { month: "Mar", newUsers: 70 },
    { month: "Apr", newUsers: 90 },
    { month: "May", newUsers: 100 },
    { month: "Jun", newUsers: 120 },
  ];

  const performanceData = [
    { name: "User 1", score: 80 },
    { name: "User 2", score: 85 },
    { name: "User 3", score: 70 },
    { name: "User 4", score: 95 },
    { name: "User 5", score: 60 },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => router.push("adminDashboard/textManagement")}
        >
          Manage Texts
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Total Users</h2>
          <p className="text-4xl font-bold">{userMetrics.totalUsers}</p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">New Users (Last 28 days)</h2>
          <p className="text-4xl font-bold">{userMetrics.newUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="newUsers" stroke="#4A90E2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#36A2EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Updated User Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">User Details</h2>
        <table className="min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    onClick={() => handleManageClick(user)}
                  >
                    More Info
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* More Info Popup */}
{isPopupOpen && selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-5xl h-5/6 overflow-y-auto flex flex-col gap-4">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4">Past Sessions for {selectedUser.name}</h2>
      
      <div className="flex gap-6">
        {/* Left: Session Widgets */}
        <div className="w-1/3 flex flex-col gap-4">
          <h3 className="text-md font-medium mb-2">Past Sessions</h3>
          <div className="flex flex-col gap-4">
            {dummySessions.map((session) => (
              <div key={session.id} className="bg-gray-100 shadow rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600 font-medium">Session {session.id}</span>
                  <span className="text-sm text-gray-600">{session.difficulty}</span>
                </div>
                <div className="text-lg font-semibold text-center text-blue-600">{session.wpm} WPM</div>
                <div className="text-center text-gray-700 text-sm">
                  Comprehension Score: {session.comprehensionScore}
                </div>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {session.sessionDate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: WPM Progress Chart */}
        <div className="w-2/3">
          <h3 className="text-md font-medium mb-4">WPM Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dummySessions.map((s, i) => ({ session: `S${i + 1}`, wpm: s.wpm }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="session" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="wpm" stroke="#4A90E2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Close Button */}
      <button
        className="self-end bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        onClick={() => setIsPopupOpen(false)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default () => <AdminDashboardProvider><AdminDashboardContent /></AdminDashboardProvider>;
