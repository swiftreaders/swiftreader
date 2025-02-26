import React from 'react';
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardUser {
  id: number;
  name: string;
  wpm: number;
  avatar: string;
}

interface LeaderboardComponentProps {
  currentUserRank?: number;
  currentUserWpm?: number;
}

export const LeaderboardComponent = ({ 
  currentUserRank = 24, 
  currentUserWpm = 398 
}: LeaderboardComponentProps) => {
  // Sample leaderboard data
  const leaderboardData: LeaderboardUser[] = [
    { id: 1, name: "Sarah Johnson", wpm: 642, avatar: "/api/placeholder/32/32" },
    { id: 2, name: "Alex Chen", wpm: 598, avatar: "/api/placeholder/32/32" },
    { id: 3, name: "Miguel Sanchez", wpm: 576, avatar: "/api/placeholder/32/32" },
    { id: 4, name: "Emma Wilson", wpm: 542, avatar: "/api/placeholder/32/32" },
    { id: 5, name: "David Kim", wpm: 530, avatar: "/api/placeholder/32/32" },
  ];
  
  // Functions to determine medal/trophy icons
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1:
        return <Trophy className="text-yellow-500" size={20} />;
      case 2:
        return <Medal className="text-gray-400" size={18} />;
      case 3:
        return <Medal className="text-amber-700" size={18} />;
      default:
        return <span className="text-gray-600 font-medium w-5 text-center">{rank}</span>;
    }
  };
  
  return (
    <div className="mt-8 bg-widget shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Top Speed Readers</h2>
        <span className="text-sm text-secondary font-medium">Global Ranking</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reader</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">WPM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leaderboardData.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 text-sm w-12">
                  <div className="flex items-center justify-center">
                    {getRankIcon(user.id)}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm">
                  <div className="flex items-center">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500 text-right">
                  <span className="font-bold text-gray-800">{user.wpm}</span>
                  <span className="text-xs text-gray-500 ml-1">WPM</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
          <div className="flex items-center">
            <span className="bg-sr-gradient text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">{currentUserRank}</span>
            <div className="flex items-center">
              <img 
                src="/api/placeholder/32/32" 
                alt="Your profile" 
                className="w-8 h-8 rounded-full mr-3"
              />
              <span className="font-medium">Your Ranking</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-800">{currentUserWpm}</span>
            <span className="text-xs text-gray-500 ml-1">WPM</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-secondary hover:text-purple-700 font-medium">
          View Full Rankings
        </button>
      </div>
    </div>
  );
};

export default LeaderboardComponent;