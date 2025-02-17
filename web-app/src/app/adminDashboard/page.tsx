"use client";

import { useState, useEffect } from "react";
import {
  useAdminDashboard,
  AdminDashboardProvider,
} from "@/contexts/adminDashboardContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/errors/accessDenied";
import { User } from "@/types/user";
import { Session } from "@/types/sessions"; // Assuming correct import
import { Timestamp } from "firebase/firestore";
import UserInfoModal from "@/components/UserInfoAdminModal";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { userService } from "@/services/userService";

const AdminDashboardContent = () => {
  const { texts, users, removeUser } = useAdminDashboard();
  const [userMetrics, setUserMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isRemovePopupOpen, setIsRemovePopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<Session[]>(
    []
  );
  const [sortBy, setSortBy] = useState({
    readingSessions: false,
    dateJoined: false,
  });
  const router = useRouter();

  useEffect(() => {
    const totalUsers = users.length;
    const newUsers = users.filter(
      (user) => Date.now() - user.joinDate.toMillis() < 2419200000
    ).length;
    setUserMetrics({ totalUsers, newUsers });
  }, [users]);

  const handleManageClick = async (user: User) => {
    setSelectedUser(user);
    setSelectedUserSessions(await userService.getUserReadingSessions(user.id));
    setIsPopupOpen(true);
  };

  const handleSort = () => {
    setSortBy((prev) => ({ ...prev, dateJoined: !prev.dateJoined }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    return (
      new Date(a.joinDate.toDate()).getTime() - new Date(b.joinDate.toDate()).getTime()
    );
  });

  const handleRemoveUserClick = (user: User) => {
    setSelectedUser(user);
    setIsRemovePopupOpen(true);
  };

  const confirmRemoveUser = () => {
    if (selectedUser) {
      removeUser(selectedUser.id);
      setIsRemovePopupOpen(false);
    }
  };

  const dummySessions = [
    {
      id: 1,
      title: "Session 1",
      genre: "Fiction",
      difficulty: "Medium",
      wpm: 72,
      comprehensionScore: 88,
      sessionDate: Timestamp.fromDate(new Date("2025-02-01T14:00:00Z")), // Firebase Timestamp
    },
    {
      id: 2,
      title: "Session 2",
      genre: "History",
      difficulty: "Hard",
      wpm: 64,
      comprehensionScore: 75,
      sessionDate: Timestamp.fromDate(new Date("2025-01-31T10:30:00Z")),
    },
    {
      id: 3,
      title: "Session 3",
      genre: "Science",
      difficulty: "Easy",
      wpm: 85,
      comprehensionScore: 92,
      sessionDate: Timestamp.fromDate(new Date("2025-01-30T16:15:00Z")),
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
    <div className="min-h-screen bg-gray-100">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">
            Manage users, texts, and performance metrics
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            className="w-full sm:w-auto bg-blue-500 text-white px-6 py-3 rounded-md transition hover:bg-blue-600"
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

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Details</h2>
          <div className="mb-4">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md transition hover:bg-green-600"
              onClick={handleSort}
            >
              Sort by Date Joined
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Username</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">WPM</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Join Date</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{user.wpm}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {user.joinDate.toDate().toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        className="bg-blue-500 text-white px-3 py-1 rounded-md transition hover:bg-blue-600"
                        onClick={() => handleManageClick(user)}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        
      </main>

      {/* More Info Popup */}
      <UserInfoModal
        user={selectedUser}
        sessions={selectedUserSessions}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />;

    </div>
  );
};

function AdminDashboard() {
  const { user } = useAuth();
  return (
    <>
      {user?.isAdmin ? (
        <AdminDashboardProvider>
          <AdminDashboardContent />
        </AdminDashboardProvider>
      ) : (
        <AccessDenied />
      )}
    </>
  );
}

export default AdminDashboard;
