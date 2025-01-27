"use client";

import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) return;
    router.push(user?.isAdmin ? "/adminDashboard" : "/userDashboard");
  }, [loggedIn, user, router]);

  if (!loggedIn) {
    return (
      <main>
        <p>This is the landing page. You are currently not logged in.</p>
      </main>
    );
  }

  return null; // Prevents unnecessary rendering
}
