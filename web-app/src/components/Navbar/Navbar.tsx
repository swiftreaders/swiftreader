"use client";

import { useAuth } from "@/contexts/authContext";
import Link from "next/link";

export default function Navbar() {
  const { user, loggedIn } = useAuth();

  return (
    <nav className="bg-gray-500 p-4 flex justify-between items-center">
      {/* Left Side - Branding */}
      <div className="text-white text-lg font-bold">
        <Link href="/">SwiftReader</Link>
      </div>

      {/* Right Side - Navigation Links */}
      <ul className="flex space-x-4">
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
