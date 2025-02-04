"use client";

import { useAuth } from "@/contexts/authContext";
import Link from "next/link";

export default function Navbar() {
  const { user, loggedIn } = useAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4 justify-end">
        {loggedIn ? (
          <>
            <li>
              <Link
                href={user?.isAdmin ? "/adminDashboard" : "/userDashboard"}
                className="text-white hover:text-gray-300"
              >
                Dashboard
              </Link>
            </li>

            <li>
              <Link
                href="/auth/logout"
                className="text-white hover:text-gray-300"
              >
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/auth/login"
                className="text-white hover:text-gray-300"
              >
                Login
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
