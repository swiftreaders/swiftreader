"use client";

import { useState, useEffect } from "react";
import {
  useAdminDashboard,
  AdminDashboardProvider,
} from "@/contexts/adminDashboardContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
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
import Button from "@/components/common/Button";

const AdminDashboardContent = () => {
  const { users, removeUser } = useAdminDashboard();
  const [userMetrics, setUserMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<Session[]>(
    []
  );
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

  const userTrendData = [
    { month: "Jan", newUsers: 30 },
    { month: "Feb", newUsers: 50 },
    { month: "Mar", newUsers: 70 },
    { month: "Apr", newUsers: 90 },
  ];

  return (
    <div className="min-h-screen mt-[7vh] bg-background">
      <header className="bg-sr-gradient py-8 shadow-lg">
        <div className="container px-20 text-left">
          <h1 className="text-4xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-lg text-gray-200">
            Manage users and track platform performance
          </p>
        </div>
      </header>
      <div className="py-8 px-20">
        <Button
          displayText="Manage Texts"
          href="/adminDashboard/textManagement"
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-widget shadow-md rounded-lg p-6">
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
                  stroke="#3e0075"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-widget shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Total Users</h2>
            <p className="text-2xl font-bold">{userMetrics.totalUsers}</p>
          </div>
          <div className="bg-widget shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              New Users (Last 28 Days)
            </h2>
            <p className="text-2xl font-bold">{userMetrics.newUsers}</p>
          </div>
        </div>
        <div className="mt-8 bg-widget shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Management</h2>
          <UserTable users={users} handleManageClick={handleManageClick} />
        </div>
      </div>
      <UserInfoModal
        user={selectedUser}
        sessions={selectedUserSessions}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  return user?.isAdmin ? (
    <AdminDashboardProvider>
      <AdminDashboardContent />
    </AdminDashboardProvider>
  ) : (
    <AccessDenied />
  );
};

export default AdminDashboard;
