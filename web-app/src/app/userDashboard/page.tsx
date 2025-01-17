"use client"; // Why does this have to be defined as a client-side component?
// Answer: Next.js uses "use client" to indicate that this component should run on the client side,
// allowing hooks like `useState` and `useEffect`, which depend on the browser environment, to work.
// Without "use client," Next.js will treat the component as a server-side component, where hooks are not allowed.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import { app } from "@/firebaseConfig";

const Dashboard = () => {
  const router = useRouter();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetching all the categories of the texts currently stored in the database
  // this useEffect will be called whenever the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      const db = getFirestore(app); // Why is getFirestore needed and what does it do?
      // Answer: `getFirestore` initializes the Firestore instance for your Firebase app.
      // It connects your app (via `app`) to the Firestore database and allows you to perform
      // database operations like reading, writing, and querying.

      const textsCollection = collection(db, "Texts"); // Why is await not needed here?
      // Answer: `collection` is a synchronous function. It simply creates a reference to the "Texts"
      // collection in Firestore and does not involve a network call or any asynchronous operations.

      const textsSnapshot = await getDocs(textsCollection); // Why is await needed here?
      // Answer: `getDocs` performs an asynchronous network request to fetch all documents
      // in the "Texts" collection. `await` is needed to wait for the promise to resolve
      // before continuing to process the fetched data.

      // Extract unique categories using a set
      const categoriesSet = new Set<string>();
      textsSnapshot.forEach((doc) => {
        const data = doc.data();
        // Only add to the set if there is a category field in the document
        if (data.category) {
          categoriesSet.add(data.category);
        }
      });

      // Why do you need to convert set to array?
      // Answer: A Set is an unordered collection of unique values, but it doesn't have array-like methods
      // (e.g., `map`, `filter`). Converting the Set to an Array makes it easier to render the categories
      // as a list in your JSX or perform other operations.

      setCategories(Array.from(categoriesSet)); // Convert Set to Array
    };

    fetchCategories();
  }, []);

  // Will both useEffects be called since there is one defined above as well?
  // Answer: Yes, both `useEffect` hooks will be called, as they are independent of each other.
  // React processes each `useEffect` separately. The one fetching categories runs on mount, and
  // the one setting `recentSessions` also runs on mount.

  // If it works, is this good practice to separate them?
  // Answer: Yes, it's a good practice to separate concerns into different `useEffect` hooks.
  // It improves readability and makes debugging easier. Keeping side effects logically grouped
  // (e.g., one for fetching categories, one for setting sessions) is a recommended approach.

  // Stub for reading sessions - TODO: Replace this with Firebase call later
  useEffect(() => {
    const sessions = [
      { id: 1, title: "The Art of War", date: "2025-01-12", duration: "10 min" },
      { id: 2, title: "A Brief History of Time", date: "2025-01-10", duration: "15 min" },
    ];
    setRecentSessions(sessions);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Surely if you set the category, you don't need to have the if condition below
    // as it will always be true?
    // Answer: The `if` condition is needed to handle the case where the user selects the empty
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
              <span className="text-gray-500 text-sm">{session.date} - {session.duration}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Select a Category</h2>
        <select
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

export default Dashboard;
