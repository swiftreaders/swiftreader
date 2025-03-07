"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import Image from "next/image";
import { logo } from "@/../public/assets";
import { FaUserCircle } from "react-icons/fa";

interface NavItemProps {
  href: string;
  name: string;
  className?: string;
}
const NavItem: React.FC<NavItemProps> = ({ href, name, className }) => {
  return (
    <li>
      <Link
        href={href}
        className={`font-bold text-white hover:text-hovertext transition duration-200 ${className}`}
      >
        {name}
      </Link>
    </li>
  );
};

const Navbar = () => {
  const { user, loggedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${
        scrolled ? "navbarScrolled" : "navbar"
      } px-20 xy-4 flex justify-between items-center text-white`}
    >
      <div>
        {/* Branding */}
        <Link href="/">
          <Image src={logo} alt="Logo" width={120} height={120} />
        </Link>
      </div>

      {/* Navigation Links */}
      <ul className="flex space-x-6 italic items-center">
        <NavItem href="/about" name="about" />
        <NavItem href="/features" name="features" />
        {loggedIn && user && <NavItem href="/userDashboard" name="dashboard" />}
        {loggedIn && user?.isAdmin && (
          <NavItem
            href="/adminDashboard"
            name="Admin Portal"
            className="bg-admin-gradient rounded-full px-4 py-2"
          />
        )}

        {loggedIn && user ? (
          <>
            <li className="font-bold">hey, {user.name}</li>
            <li>
              <div className="relative">
                <button
                  title="dropdown"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="focus:outline-none"
                >
                  <FaUserCircle className="text-3xl text-white cursor-pointer" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-20 bg-sr-gradient rounded-lg shadow-lg py-2 text-right font-bold">
                    <Link
                      href="/profile"
                      className="block pr-2 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block pr-2 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link
                      href="/auth/logout"
                      className="block pr-2 py-2 hover:bg-gray-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Logout
                    </Link>
                  </div>
                )}
              </div>
            </li>
          </>
        ) : (
          <NavItem href="/auth/login" name="Login" />
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
