"use client";

import { useAuth } from "@/contexts/authContext";
import { auth0 } from "@/lib/auth0";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loggedIn } = useAuth();

  if (!user) {
    return (
      <main>
        {loggedIn ? (
          <p>
            This is the landing page. Your user has been blocked. Please contact
            a swiftreader admin.
          </p>
        ) : (
          <p>This is the landing page. You are not logged in.</p>
        )}
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
        <p>You are an admin user</p>
      ) : (
        <p>You are not an admin user</p>
      )}
    </main>
  );
}
