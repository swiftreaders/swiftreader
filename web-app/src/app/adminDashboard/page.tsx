"use client";

import { useState, useEffect } from "react";
import { useAdminDashboard, AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { useRouter } from "next/navigation";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
// import {  } from "@/services/textservice";

const AdminDashboardContent = () => {
  const { texts, users, removeUser } = useAdminDashboard(); 
  const [userMetrics, setUserMetrics] = useState({ totalUsers: 0, newUsers: 0 });
  const router = useRouter();

  useEffect(() => {
    const totalUsers = users.length;
    const newUsers = users.filter(user => Date.now() - user.joinDate.toMillis() < 2419200000).length;
    setUserMetrics({ totalUsers, newUsers });
  }, [users]);

  // Mock data for charts
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

      {/* Button to Manage Texts */}
      <div className="mb-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          onClick={() => router.push("adminDashboard/textManagement")}
        >
          Manage Texts
        </button>
      </div>

      {/* Metrics */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth Trend */}
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

        {/* User Performance */}
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

      {/* User Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">User Details</h2>
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
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.wpm}</td>
                <td className="border border-gray-300 px-4 py-2">{user.joinDate.toDate().toLocaleDateString()}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                    onClick={() => removeUser(user.id)} // Assuming removeUser takes the user ID
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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