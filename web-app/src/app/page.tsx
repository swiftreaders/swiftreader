"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authContext";
import LandingPage from "@/components/pages/landingPage";
import Footer from "@/components/Footer";

const Home: React.FC = () => {
  const { user, loggedIn } = useAuth();
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    if (loggedIn && !user) {
      const timeout = setTimeout(() => {
        window.location.reload();
      }, 1000); // Wait 1 second and reload

      return () => clearTimeout(timeout);
    } else {
      setCheckingUser(false);
    }
  }, [loggedIn, user]);

  if (loggedIn && !user && !checkingUser) {
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
      <Footer />
    </main>
  );
};

export default Home;
