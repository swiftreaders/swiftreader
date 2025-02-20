"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import Button from "@/components/common/Button";
import { darkMockup, lightMockup } from "@/../public/assets";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/outline"; // Importing the chevron icon
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react"; // Import Swiper and SwiperSlide
import "swiper/css"; // Make sure you have Swiper's styles imported
import Hero from "../sections/hero";
import Benefits from "../sections/benefits";
import About from "../sections/about";

interface LandingPageProps {
  loggedIn: boolean;
  user: User | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ loggedIn, user }) => {
  return (
    <>
      {/* Hero Section */}
      <Hero loggedIn={loggedIn} user={user} />

      {/* Benefits Section with Carousel */}
      <Benefits />

      {/* About SwiftReader Section */}
      <About loggedIn={false} user={null} />
    </>
  );
};

export default LandingPage;
