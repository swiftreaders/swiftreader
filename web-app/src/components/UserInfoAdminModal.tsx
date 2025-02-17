import React, { useState } from "react";
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
    console.log(`Making ${user.name} an admin...`);
    user.isAdmin = !user.isAdmin;
    userService.toggleAdmin(user.id, user.isAdmin);
};

const onRemoveUser = (user: User, onClose: () => void) => {
    if (confirm(`Are you sure you want to remove ${user.name}?`)) {
        userService.removeUser(user.id);
        onClose();
    }
};

const UserInfoModal: React.FC<Props> = ({ user, sessions, isOpen, onClose }) => {
    const [selectedSession, setSelectedSession] = useState<number[] | null>(null);

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl h-5/6 overflow-y-auto flex flex-col">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">User Details</h2>

                {/* User Info */}
                <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
                    <p className="text-lg font-semibold">{user.name} {user.isAdmin && <span className="text-green-600">(Admin)</span>}</p>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-500">Joined: {user.joinDate.toDate().toLocaleDateString()}</p>
                    <p className="text-gray-700 font-medium">Current WPM: {user.wpm}</p>
                </div>

                {/* Past Sessions & Chart */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Past Sessions */}
                    <div className="col-span-1">
                        <h3 className="text-lg font-medium mb-3">Past Sessions</h3>
                        <div className="space-y-3">
                            {sessions.length > 0 ? (
                                sessions.map((session, index) => (
                                    <div
                                        key={session.id}
                                        className={`cursor-pointer bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:bg-blue-100 transition`}
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
                                            Comprehension: {session.getComprehensionScore()}
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

                    {/* WPM Progress Chart */}
                    <div className="col-span-2 flex justify-center items-center">
                        {selectedSession ? (
                            <SessionChart wpmData={selectedSession} />
                        ) : (
                            <p className="text-gray-500">Click on a session to view its chart.</p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-6">
                    <button
                        className={`px-4 py-2 rounded transition ${
                            user.isAdmin ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                        onClick={() => onToggleAdmin(user)}
                    >
                        {user.isAdmin ? "Revoke Admin" : "Make Admin"}
                    </button>

                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                        onClick={() => onRemoveUser(user, onClose)}
                    >
                        Remove User
                    </button>

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
