import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useAuth } from '@/contexts/authContext';
import { useUserContext } from '@/contexts/userContext';

export const LeaderboardComponent = () => {
  const { user: currentUser } = useAuth();
  const { users } = useUserContext();

  // Create a safe sorted copy of users
  const sortedUsers = [...users].sort((a, b) => (b.wpm ?? 0) - (a.wpm ?? 0));
  const userRank = sortedUsers.findIndex((u) => u.id === currentUser?.id) + 1;

  // Rank icon rendering function
  const getRankIcon = (rank: number) => {
    switch(rank) {
      case 1: return <Trophy className="text-yellow-500" size={20} />;
      case 2: return <Medal className="text-gray-400" size={18} />;
      case 3: return <Medal className="text-amber-700" size={18} />;
      default: return <span className="text-gray-600 font-medium w-5 text-center">{rank}</span>;
    }
  };

  return (
    <div className="mt-8 bg-widget shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Leaderboard</h2>
        <span className="text-sm text-secondary font-medium">Global Ranking</span>
      </div>

      {/* Scrollable Table Container */}
      <div className="overflow-y-auto max-h-96"> {/* Added max height and vertical scroll */}
        <table className="min-w-full">
          <thead className="bg-gray-50 sticky top-0"> {/* Sticky header */}
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reader</th>
              <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">WPM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedUsers.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.id === currentUser?.id;
              
              return (
                <tr 
                  key={user.id} // Use actual user ID as key
                  className={`${isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <td className="py-3 px-4 text-sm w-12">
                    <div className="flex items-center justify-center">
                      {getRankIcon(rank)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600">(You)</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 text-right">
                    <span className="font-bold text-gray-800">
                      {Math.round(user.wpm ?? 0)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">WPM</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Current User Ranking */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center bg-blue-50 p-3 rounded-md"> {/* Matching highlight */}
          <div className="flex items-center">
            <span className="bg-sr-gradient text-white font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs mr-3">
              {userRank}
            </span>
            <div className="flex items-center">
              <span className="font-medium">{currentUser?.name}</span>
            </div>
          </div>
          <div className="flex items-center">
            <span className="font-bold text-gray-800">
              {Math.round(currentUser?.wpm ?? 0)}
            </span>
            <span className="text-xs text-gray-500 ml-1">WPM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardComponent;