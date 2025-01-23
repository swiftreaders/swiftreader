"use client"; // Why does this have to be defined as a client-side component?
// Answer: Next.js uses "use client" to indicate that this component should run on the client side,
// allowing hooks like `useState` and `useEffect`, which depend on the browser environment, to work.
// Without "use client," Next.js will treat the component as a server-side component, where hooks are not allowed.

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SavedSession } from "@/types/sessions";
import { useReadingContext, ReadingSessionProvider } from "@/contexts/readingSessionsContext";
import { Category, Difficulty } from "@/types/text";
import { SessionStats } from "@/components/SessionStats";


const DashboardContent = () => {
  const { recentSessions, text, getText } = useReadingContext();
  const router = useRouter();
  const [selectedSession, setSelectedSession] = useState<SavedSession | null>(null); // Add state for selected session

  const handleNewSessionClick = () => {
    router.push(`/read?category=nature`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Welcome to the Dashboard</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reading Sessions</h2>
        <ul className="bg-white shadow-md rounded-lg p-4">
          {recentSessions.map((session) => (
            <li
              key={session.id}
              className="flex justify-between items-center border-b last:border-b-0 py-2 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedSession(session)} // Add click handler
            >
              <span>{session.title}</span>
              <span className="text-gray-500 text-sm">{session.date} - {session.duration}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedSession(null)}>
          <SessionStats 
            session={selectedSession} 
            onClose={() => setSelectedSession(null)}
          />
        </div>
      )}

      <div>
        <button 
          onClick={handleNewSessionClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          New Session
        </button>
      </div>
    </div>
  );
};


const Dashboard = () => {
  return (
  <ReadingSessionProvider>
    <DashboardContent/>
  </ReadingSessionProvider>
  );
};

export default Dashboard;
