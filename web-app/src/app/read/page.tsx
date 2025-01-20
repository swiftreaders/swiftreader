"use client";   // Component is client side as it needs useEffect, useState and useRouter hooks

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types/text";
import textService from "@/services/textservice";

const Read = () => {
  const [text, setText] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");    // Retrieves the value of ?category=... to get what category is set

  useEffect(() => {
    if (!category) {
      router.push("/userDashboard");    // Redirect to dashboard if no category is selected
      return;
    }

    // Fetch random text by category (async because it uses the await keyword for fetching text)
    const fetchRandomText = async () => {
        // Cast the category string to an enum
        const validCategory = category as Category;

        // Simulate fetching random text from Firebase
        const randomText = await textService.getTextsByCategory(validCategory); 

        // This sets the first text's content or a fallback message if the category has no texts.
        setText(randomText[0]?.content || "No text found for this category.");
    };

    fetchRandomText();
  }, [category, router]);   // If category or router change, this useEffect hook is called

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Category: {category}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-lg leading-8">{text}</p>
      </div>
      <button
        onClick={() => router.push("/userDashboard")}
        className="mt-6 p-2 bg-blue-500 text-white rounded-md"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

// Wrapper used as Suspense needs to wrap a compnent when using search parameters
const ReadPageWrapper = () => (
<Suspense fallback={<div>Loading...</div>}>
    <Read />
</Suspense>
);

export default ReadPageWrapper;