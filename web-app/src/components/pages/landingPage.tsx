"use client";

import { User } from "@/types/user";
import "swiper/css";
import Hero from "../sections/hero";
import Benefits from "../sections/benefits";
import About from "../sections/about";

interface LandingPageProps {
  loggedIn: boolean;
  user: User | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ loggedIn, user }) => {
  return (
    <div className="lowercase italic">
      {/* Hero Section */}
      <Hero loggedIn={loggedIn} user={user} />

      {/* Benefits Section with Carousel */}
      <Benefits />

      {/* About SwiftReader Section */}
      <About loggedIn={false} user={null} />
    </div>
  );
};

export default LandingPage;
