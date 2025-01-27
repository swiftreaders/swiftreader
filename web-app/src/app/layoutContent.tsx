"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/authContext";

export default function Content({ children }: { children: React.ReactNode }) {
  const { user, loggedIn } = useAuth();
  return (
    <div>
      <nav className="navbar">
        <ul>
          {loggedIn ? (
            <>
              <li>
                <Link
                  href={user?.isAdmin ? "/adminDashboard" : "/userDashboard"}
                >
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
      {children}
    </div>
  );
}
