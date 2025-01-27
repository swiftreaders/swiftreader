"use client"; // Why does this have to be defined as a client-side component?
// Answer: Next.js uses "use client" to indicate that this component should run on the client side,
// allowing hooks like `useState` and `useEffect`, which depend on the browser environment, to work.
// Without "use client," Next.js will treat the component as a server-side component, where hooks are not allowed.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import { app } from "../../../firebase.config";
import { Session } from "@/types/sessions";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/errors/accessDenied";

const UserDashboardContent = () => {
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetching all the categories of the texts currently stored in the database
  // this useEffect will be called whenever the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      const db = getFirestore(app); // Initializes firestore instance

      const textsCollection = collection(db, "Texts");

      const textsSnapshot = await getDocs(textsCollection); // Call made to firebase so we need to wait for it to finish with await

      // Extract unique categories using a set
      const categoriesSet = new Set<string>();
      textsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Only add to the set if there is a category field in the document
        if (data.category) {
          categoriesSet.add(data.category);
        }
      });

      setCategories(Array.from(categoriesSet)); // Convert Set to Array
    };

    fetchCategories();
  }, []);

  // Stub for reading sessions - TODO: Replace this with Firebase call later
  useEffect(() => {
    const sessions = [
      {
        id: 1,
        title: "The Art of War",
        date: "2025-01-12",
        duration: "10 min",
      },
      {
        id: 2,
        title: "A Brief History of Time",
        date: "2025-01-10",
        duration: "15 min",
      },
    ];
    setRecentSessions(sessions);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // The `if` condition is needed to handle the case where the user selects the empty
    // option (`""`). Without the condition, the app would navigate to `/read?category=` when no category
    // is selected, which might not be desirable.
    if (category) {
      router.push(`/read?category=${category}`);
    }
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
              className="flex justify-between items-center border-b last:border-b-0 py-2"
            >
              <span>{session.title}</span>
              <span className="text-gray-500 text-sm">
                {session.date} - {session.duration}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Select a Category</h2>
        <select
          title="category dropdown"
          className="p-2 border rounded-md w-full max-w-md"
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">-- Select a Category --</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  return <div>{user ? <UserDashboardContent /> : <AccessDenied />}</div>;
};

export default UserDashboard;
