"use client";

import { useAuth } from "@/contexts/authContext";
import Link from "next/link";

export default function Navbar() {
  const { user, loggedIn } = useAuth();

  return (
    <nav className="navbar">
      <ul>
        {loggedIn ? (
          <>
            <li>
              <Link href={user?.isAdmin ? "/adminDashboard" : "/userDashboard"}>
                Dashboard
              </Link>
            </li>

            <li>
              <Link href="/auth/logout">Logout</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/auth/login">Login</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
