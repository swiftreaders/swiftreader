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
    <div className="">
      {/* Hero Section */}
      <Hero loggedIn={loggedIn} user={user} 
        onClick={() => {document.getElementById("benefits")?.scrollIntoView({ behavior: "smooth" })}}
      />

      {/* Benefits Section with Carousel */}
      <section id="benefits" className="mt-[-2rem]">
        <Benefits />
      </section>

      {/* About SwiftReader Section */}
      <div className="mt-[-15rem]">
        <About loggedIn={loggedIn} user={user} />
      </div>
    </div>
  );
};

export default LandingPage;
