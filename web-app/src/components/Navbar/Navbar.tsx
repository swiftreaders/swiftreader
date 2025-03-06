"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import Image from "next/image";

import { logo } from "@/../public/assets";

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
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
      <ul className="flex space-x-6 italic">
        <NavItem href="/about" name="about" />
        <NavItem href="/features" name="features" />
        {loggedIn && user && <NavItem href="/userDashboard" name="dashboard" />}
        {loggedIn && user && user.isAdmin && (
          <NavItem
            href="/adminDashboard"
            name="admin portal"
            className="bg-admin-gradient rounded-full px-4 py-2"
          />
        )}
        {loggedIn ? (
          <NavItem href="/auth/logout" name="logout" />
        ) : (
          <NavItem href="/auth/login" name="login" />
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
