"use client";

import { useAuth } from "@/contexts/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loggedIn } = useAuth();

  if (!user) {
    return (
      <main>
        <p>This is the landing page. You are currently not logged in.</p>
      </main>
    );
  }

  return (
    <main>
      <p>
        This is the landing page. You are logged in. You can use the navbar at
        the top.
      </p>
      <p>Your id is: {user.id}</p>
      <p>Your email is: {user.email}</p>
      {user.isAdmin ? (
        <p>You are an admin</p>
      ) : (
        <p>You are not an admin user</p>
      )}
    </main>
  );
}
