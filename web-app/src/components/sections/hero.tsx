import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { darkMockup, lightMockup } from "../../../public/assets";
import Button from "../common/Button";
import Image from "next/image";

interface HeroProps {
  loggedIn: boolean;
  user: any; // Replace 'any' with the appropriate type if known
  onClick: () => void;
}

function Hero({ loggedIn, user, onClick }: HeroProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [position, setPosition] = useState(0); // State to hold the Y-position of the image
  const [arrowPosition, setArrowPosition] = useState(0); // State for the arrow's Y-position

  useEffect(() => {
    // Check if dark mode is enabled in system preferences
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Set initial mode
    setIsDarkMode(mediaQuery.matches);

    // Listen for changes in system color scheme
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    // Clean up listener
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    // Function to update position based on a sinusoidal wave for image
    const animateImage = () => {
      const now = Date.now();
      const newPos = Math.sin(now / 1000) * 20; // Control the amplitude (e.g., 20px)
      setPosition(newPos);
      setArrowPosition(newPos); // Sync the arrow's movement with the image
      requestAnimationFrame(animateImage);
    };

    animateImage(); // Start the animation

    return () => {
      // Clean up the animation if needed
    };
  }, []);

  return (
    <>
      <section className="mt-[7vh] text-white h-sr-screen px-5 md:px-20 font-bold flex italic lowercase">
        {/* Left half */}
        <div className="flex flex-col justify-center items-start w-full md:w-1/2">
          <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-8xl">
            Read Faster,
          </h1>
          <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-8xl text-[#3e0075]">
            Learn More
          </h1>
          <h3 className="text-l md:text-xl lg:text-2xl xl:text-3xl mt-5 pb-20">
            Unlock the secrets of speed-reading and boost your productivity
          </h3>
          {loggedIn && user ? (
            <Button
              displayText="Go To Dashboard"
              href="/userDashboard"
              className="bg-primary"
            />
          ) : (
            <Button
              displayText="Get Started"
              href="/auth/login"
              className="bg-primary"
            />
          )}
        </div>

        {/* Right half */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2">
          {/* Image changes based on system dark/light mode */}
          <Image
            src={isDarkMode ? darkMockup : lightMockup}
            alt="Mockup"
            width={2000}
            height={2000}
            style={{
              transform: `translateY(${position}px)`, // Apply sinusoidal motion
              transition: "transform 0.1s ease", // Smooth transition for each position update
            }}
          />
        </div>
      </section>

      {/* Chevron Arrow at the bottom */}
      <div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
        style={{
          transform: `translateY(${arrowPosition / 2}px)`, // Apply sinusoidal motion to the arrow
          transition: "transform 0.1s ease", // Smooth transition for each position update
        }}
      >
        <ChevronDown className="w-10 h-10 text-white" onClick={onClick} />
      </div>
    </>
  );
}

export default Hero;
