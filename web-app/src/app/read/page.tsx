"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TextService from "@/services/textService";

const Read = () => {
  const [text, setText] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");

  useEffect(() => {
    if (!category) {
      router.push("/userDashboard"); // Redirect to dashboard if no category is selected
      return;
    }

    // TODO: Make this use the text service correctly
    // Fetch random text by category (stubbed for now)
    const fetchRandomText = async () => {
      // Simulate fetching random text from Firebase
      const randomText = await TextService.getTextsByCategory(category); // Stub Firebase method
      setText(randomText[0]?.content || "No text found for this category.");
    };

    fetchRandomText();
  }, [category, router]);

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

export default Read;
