import React, { useState, useEffect } from "react";
import { SessionChart } from "./SessionChart";
import { Session } from "../types/sessions";
import { User } from "../types/user";
import { userService } from "@/services/userService";

interface Props {
  user: User | null;
  sessions: Session[];
  isOpen: boolean;
  onClose: () => void;
}

const onToggleAdmin = (user: User) => {
  if (!user.isAdmin) {
    console.log(`Making ${user.name} an admin...`);
    user.isAdmin = true;
    userService.toggleAdmin(user.id, true);
  }
};

const onRemoveUser = (user: User, onClose: () => void) => {
  if (confirm(`Are you sure you want to remove ${user.name}?`)) {
    userService.removeUser(user.id);
    onClose();
  }
};

const UserInfoModal: React.FC<Props> = ({ user, sessions, isOpen, onClose }) => {
  const [selectedSession, setSelectedSession] = useState<number[] | null>(null);

  useEffect(() => {
    setSelectedSession(null);
  }, [user?.id]); 

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl h-5/6 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="text-lg font-semibold">
              {user.name} {user.isAdmin && <span className="text-green-600">(Admin)</span>}
            </p>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-500">
              Joined: {user.joinDate.toDate().toLocaleDateString()}
            </p>
            <p className="text-gray-700 font-medium">Current WPM: {user.wpm}</p>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Fixed Section (Graph) */}
          <div className="w-2/3 p-6 border-r border-gray-200 flex flex-col">
            <div className="flex-1 flex justify-center items-center">
              {selectedSession ? (
                <SessionChart wpmData={selectedSession} />
              ) : (
                <p className="text-gray-500">Click on a session to view its chart.</p>
              )}
            </div>
          </div>

          {/* Scrollable Section (Past Sessions) */}
          <div className="w-1/3 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium mb-3">Past Sessions</h3>
            <div className="space-y-3">
              {sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <div
                    key={session.id}
                    className="cursor-pointer bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:bg-blue-100 transition"
                    onClick={() => setSelectedSession(session.wpm)}
                  >
                    <div className="flex justify-between">
                      <span className="text-gray-700 font-medium">Session {index + 1}</span>
                      <span className="text-gray-500">{session.difficulty}</span>
                    </div>
                    <div className="text-lg font-bold text-blue-600 text-center mt-2">
                      {session.getAverageWpm().toFixed(1)} WPM
                    </div>
                    <div className="text-center text-gray-600 text-sm">
                      Comprehension: {session.getComprehensionScore()}%
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-2">
                      {session.startTime.toDate().toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No past sessions available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Pinned Action Buttons at Bottom */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          
          {/* Admin Button */}
          {user.isAdmin ? (
            <button
              className="px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed"
              disabled
            >
              Add Admin
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition"
              onClick={() => onToggleAdmin(user)}
            >
              Make Admin
            </button>
          )}

          {/* Remove User Button */}
          {user.isAdmin ? (
            <button
              className="px-4 py-2 rounded bg-gray-400 text-white cursor-not-allowed"
              disabled
            >
              Remove Admin
            </button>
          ) : (
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              onClick={() => onRemoveUser(user, onClose)}
            >
              Remove User
            </button>
          )}

          {/* Close Button */}
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoModal;
