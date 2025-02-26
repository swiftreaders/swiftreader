"use client";

import { useState, useEffect, use } from "react";
import {
  useAdminDashboard,
  AdminDashboardProvider,
} from "@/contexts/adminDashboardContext";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
import { User } from "@/types/user";
import { Session } from "@/types/sessions";
import { Trophy, Medal } from 'lucide-react';
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
import { UserProvider, useUserContext } from "@/contexts/userContext";
import sessionService from "@/services/sessionService";
import { Category, Genre } from "@/types/text";

interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  userTrendData: { month: string; newUsers: number }[];
}

const numberToMonth = (month: number) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return months[month];
}

const AdminDashboardContent = () => {
  const { texts } = useAdminDashboard();
  const { users } = useUserContext();
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    newUsers: 0,
    userTrendData: [],
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserSessions, setSelectedUserSessions] = useState<Session[]>(
    []
  );
  const [readingSessions, setReadingSessions] = useState<Session[]>([]);
  const [peakActivityData, setPeakActivityData] = useState<{ time: string; count: number }[]>([]);
  
  useEffect(() => {
    const unsubscribe = sessionService.getAllReadingSessions(setReadingSessions);
    return () => unsubscribe();
  }, []);

  // Calculate peak activity times
  useEffect(() => {
    // Initialize an array for 3-hour intervals (8 intervals in 24 hours)
    const intervalCounts = Array.from({ length: 8 }, (_, index) => {
      const startHour = index * 3; // 0, 3, 6, 9, 12, 15, 18, 21
      const endHour = startHour + 3;
      const timeLabel = `${startHour % 12 || 12} ${startHour >= 12 ? 'PM' : 'AM'} - ${endHour % 12 || 12} ${endHour >= 12 ? 'PM' : 'AM'}`;
      return { time: timeLabel, count: 0 };
    });
  
    // Count sessions in each 3-hour interval
    readingSessions.forEach((session) => {
      const startTime = session.startTime.toDate();
      const hour = startTime.getHours();
      const intervalIndex = Math.floor(hour / 3); // Determine which 3-hour interval it belongs to
      intervalCounts[intervalIndex].count++;
    });
  
    // Ensure chronological order and fill in missing intervals
    const sortedData = intervalCounts.map((interval) => ({
      time: interval.time,
      count: interval.count,
    }));
  
    setPeakActivityData(sortedData);
  }, [readingSessions]);

  // Calculate user joining metrics
  useEffect(() => {
    const totalUsers = users.length;
    const newUsers = users.filter(
      (user) => Date.now() - user.joinDate.toMillis() < 2419200000
    ).length;
    
    // Generate monthly new users statistics
    const monthlyJoinData = generateMonthlyJoinStats();

    console.log("Monthly join data:", monthlyJoinData);
    setUserMetrics({ 
      totalUsers, 
      newUsers, 
      userTrendData: monthlyJoinData 
    } as UserMetrics);
  }, [users]);

  const generateMonthlyJoinStats = () => {
    const monthlyStats: { [key: string]: number } = {};

    users.forEach(user => {
      const joinDate = user.joinDate.toDate();
      const monthKey = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey]++;
      } else {
        monthlyStats[monthKey] = 1;
      }
    });

    const monthlyData = Object.keys(monthlyStats)
      .sort() // Sort chronologically
      .map(month => ({
        month: `${month.split('-')[0]}-${numberToMonth(parseInt(month.split('-')[1]) - 1)}`,
        newUsers: monthlyStats[month]
      }));

    return monthlyData;
  };

  const handleManageClick = async (user: User) => {
    setSelectedUser(user);
    setSelectedUserSessions(await userService.getUserReadingSessions(user.id));
    setIsPopupOpen(true);
  };

  const calculateTextGenres = () => {
    const genreMap = new Map(
      [...Object.values(Category), ...Object.values(Genre)].map((genre) => [genre.toString(), 0])
    );

    texts.forEach((text) => {
      const genre = (text.isFiction ? text.genre : text.category) ?? "other";
      genreMap.set(genre, (genreMap.get(genre) ?? 0) + 1);
    });

    // Sort text genres in descending order by count
    return [...genreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({ genre, count }));
  };

  const sortedTextGenres = calculateTextGenres();  

  // A helper function to get medal based on rank
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-gray-400" size={18} />;
      case 3: return <Medal className="text-amber-700" size={18} />;
      default: return <span className="text-gray-600 font-medium w-5 text-center">{rank}</span>;
    }
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#3e0075] text-white p-3 rounded-lg shadow-xl">
          <p className="font-semibold">{label}</p>
          <p>{payload[0].value} Sessions</p>
        </div>
      );
    }
    return null;
  };

  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#3e0075] text-white p-3 rounded-lg shadow-xl">
          <p className="font-semibold">{label}</p>
          <p>{payload[0].value} New Users</p>
        </div>
      );
    }
    return null;
  };

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
          {/* User Growth Trend Box */}
          <div className="bg-widget shadow-md rounded-lg p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">User Growth Trend</h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={userMetrics.userTrendData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                >
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8e1dff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6a0dad" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis
                    dataKey="month"
                    tick={{ 
                      fill: '#6b7280',
                      fontSize: 12,
                      textAnchor: 'end'
                    }}
                    angle={-45}
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    label={{
                      value: 'New Users',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#6b7280',
                      fontSize: 14
                    }}
                  />
                  <Tooltip
                    content={<CustomLineTooltip />}
                    cursor={{ fill: '#f3e8ff', opacity: 0.4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="url(#lineGradient)"
                    strokeWidth={2}
                    dot={{ fill: '#8e1dff', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8 }}
                    animationDuration={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
  
          {/* Popular Text Genres Box */}
          <div className="bg-widget shadow-md rounded-lg p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">
              Most Popular Text Genres
            </h2>
            <div className="flex-1 overflow-y-auto max-h-[300px]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
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
                  </tr>
                </thead>
                <tbody className="bg-widget divide-y divide-gray-200">
                  {sortedTextGenres.map((item, index) => (
                    <tr key={item.genre} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        {getRankIcon(index + 1)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.genre}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {item.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
  
          {/* Peak Activity Times Box */}
          <div className="bg-widget shadow-md rounded-lg p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Peak Reading Activity</h2>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={peakActivityData}
                  margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
                >
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8e1dff" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6a0dad" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis
                    dataKey="time"
                    angle={-45}
                    tick={{ 
                      fill: '#6b7280',
                      fontSize: 12,
                      textAnchor: 'end'
                    }}
                    interval={0}
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    label={{
                      value: 'Reading Sessions',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#6b7280',
                      fontSize: 14
                    }}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: '#f3e8ff', opacity: 0.4 }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#activityGradient)"
                    radius={[6, 6, 0, 0]}
                    animationDuration={400}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
  
        {/* User Management Section */}
        <div className="mt-8 bg-widget shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">User Management</h2>
          <div className="flex flex-wrap gap-8 mb-8">
            <div>
              <h2 className="text-lg font-semibold mb-2">Total Users</h2>
              <p className="text-2xl font-bold">{userMetrics.totalUsers}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">New Users (Last 28 Days)</h2>
              <p className="text-2xl font-bold">{userMetrics.newUsers}</p>
            </div>
          </div>
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
    <UserProvider>
      <AdminDashboardProvider>
        <AdminDashboardContent />
      </AdminDashboardProvider>
    </UserProvider>
  ) : (
    <AccessDenied />
  );
};

export default AdminDashboard;
