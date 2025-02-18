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
import { Session } from "@/types/sessions";
import { Timestamp } from "firebase/firestore";
import UserInfoModal from "@/components/UserInfoAdminModal";
import { userService } from "@/services/userService";
import UserTable from "@/components/UserTable";
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


const AdminDashboardContent = () => {
  const { texts, users, removeUser } = useAdminDashboard();
  const [userMetrics, setUserMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isRemovePopupOpen, setIsRemovePopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<Session[]>([]);
  const [sortBy, setSortBy] = useState({
    readingSessions: false,
    dateJoined: false,
  });
  const router = useRouter();

  useEffect(() => {
    const totalUsers = users.length;
    const newUsers = users.filter(
      (user) => Date.now() - user.joinDate.toMillis() < 2419200000 // 28 days
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
      sessionDate: Timestamp.fromDate(new Date("2025-02-01T14:00:00Z")),
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

  // Mocked data for text genres (will be ranked in a table)
  const textGenresData = [
    { genre: "Fiction", count: 45 },
    { genre: "History", count: 30 },
    { genre: "Science", count: 20 },
    { genre: "Non-fiction", count: 35 },
    { genre: "Fantasy", count: 25 },
  ];

  // Sort text genres in descending order by count
  const sortedTextGenres = [...textGenresData].sort((a, b) => b.count - a.count);

  // Mocked data for peak activity times (kept as bar chart)
  const peakActivityData = [
    { time: "6 AM", count: 10 },
    { time: "9 AM", count: 20 },
    { time: "12 PM", count: 50 },
    { time: "3 PM", count: 40 },
    { time: "6 PM", count: 30 },
    { time: "9 PM", count: 15 },
  ];

  // A helper function to get medal based on rank
  const getMedal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-work-sans">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 py-6 shadow">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-lg text-gray-200">
            Overview and management of user activities
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-6">
        {/* Top Action Bar & Metrics Summary */}
        {/* Top Action Bar & Metrics Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => router.push("adminDashboard/textManagement")}
          >
            Manage Texts
          </button>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <div className="bg-white shadow p-4 rounded-md">
              <h2 className="text-sm text-gray-500">Total Users</h2>
              <p className="text-xl font-semibold">{userMetrics.totalUsers}</p>
            </div>
            <div className="bg-white shadow p-4 rounded-md">
              <h2 className="text-sm text-gray-500">New Users (28d)</h2>
              <p className="text-xl font-semibold">{userMetrics.newUsers}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1: User Growth Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="newUsers" 
                stroke="#4A90E2" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Column 2: Text Genres Table */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Most Popular Text Genres</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTextGenres.map((item, index) => (
                  <tr key={item.genre} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{index + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.genre}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.count}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getMedal(index + 1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 3: Peak Activity Times */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Peak Activity Times</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6384" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

        {/* User Details Table */}
        <UserTable users={users} handleManageClick={handleManageClick} />
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
  return user?.isAdmin ? (
    <AdminDashboardProvider>
      <AdminDashboardContent />
    </AdminDashboardProvider>
  ) : (
    <AccessDenied />
  );
}

export default AdminDashboard;
