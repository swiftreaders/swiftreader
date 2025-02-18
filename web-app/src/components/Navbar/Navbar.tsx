"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";

const Navbar: React.FC = () => {
  const { user, loggedIn } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      {/* Branding */}
      <div className="text-blue-600 text-2xl font-bold">
        <Link href="/">SwiftReader</Link>
      </div>

      {/* Navigation Links */}
      <ul className="flex space-x-6">
        <li>
          <Link href="/about" className="text-gray-700 hover:text-blue-600 transition duration-200">
            About
          </Link>
        </li>
        <li>
          <Link href="/features" className="text-gray-700 hover:text-blue-600 transition duration-200">
            Features
          </Link>
        </li>
        {loggedIn && user && (
          <li>
            <Link
              href="/userDashboard"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              User Dashboard
            </Link>
          </li>
        )}
        {loggedIn && user && user.isAdmin && (
          <li>
            <Link
              href="/adminDashboard"
              className="text-gray-700 hover:text-blue-600 transition duration-200"
            >
              Admin Dashboard
            </Link>
          </li>
        )}
        <li>
          {loggedIn ? (
            <Link href="/auth/logout" className="text-gray-700 hover:text-blue-600 transition duration-200">
              Logout
            </Link>
          ) : (
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition duration-200">
              Login
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
