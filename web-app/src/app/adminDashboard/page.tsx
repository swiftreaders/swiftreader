"use client";

import { useState, useEffect } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
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
  const [userMetrics, setUserMetrics] = useState({ totalUsers: 0, newUsers: 0 });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [sortBy, setSortBy] = useState({ readingSessions: false, dateJoined: false });
  const router = useRouter();

  useEffect(() => {
    const totalUsers = users.length;
    const newUsers = users.filter(
      (user) => Date.now() - user.joinDate.toMillis() < 2419200000
    ).length;
    setUserMetrics({ totalUsers, newUsers });
  }, [users]);

  const handleManageClick = (user: User) => {
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  const handleSort = () => {
    setSortBy((prev) => ({ ...prev, dateJoined: !prev.dateJoined }));
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy.dateJoined) {
      return (
        new Date(a.joinDate.toDate()).getTime() - new Date(b.joinDate.toDate()).getTime()
      );
    }
    return 0;
  });

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

        {isPopupOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h2 className="text-lg font-semibold mb-4">
                Manage User: {selectedUser.name}
              </h2>
              <p className="mb-2">WPM: {selectedUser.wpm}</p>
              <p className="mb-4">
                Join Date: {selectedUser.joinDate.toDate().toLocaleDateString()}
              </p>
              <div className="flex justify-end">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md transition hover:bg-red-600"
                  onClick={() => {
                    removeUser(selectedUser.id);
                    setIsPopupOpen(false);
                  }}
                >
                  Remove User
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-md transition hover:bg-gray-600 ml-2"
                  onClick={() => setIsPopupOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <AdminDashboardProvider>
      <AdminDashboardContent />
    </AdminDashboardProvider>
  );
};

export default AdminDashboard;
