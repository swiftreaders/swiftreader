"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/authContext";
import LandingPage from "@/components/pages/landingPage";
import Footer from "@/components/Footer";

const Home: React.FC = () => {
  const { user, loggedIn } = useAuth();

  // If logged in but user is null, display a blocked message
  if (loggedIn && !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-red-100">
        <p className="text-red-600 font-bold">
          Your account has been blocked. Please contact a SwiftReader admin.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sr-gradient font-sans">
      {/* Hero Section */}
      <LandingPage loggedIn={loggedIn} user={user} />
      {/* <Footer /> */}
    </main>
  );
};

export default Home;
