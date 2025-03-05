"use client";

import Footer from "@/components/Footer";
import React from "react";

const Features: React.FC = () => {
  return (
    <main className="h-sr-screen mt-[7vh] bg-sr-gradient">
      {/* Hero Section */}
      <section className="text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold leading-tight">
            Our Features
          </h1>
          <p className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto">
            Experience the future of speed reading with advanced technology and
            adaptive modes.
          </p>
        </div>
      </section>

      {/* WebGazer Integration */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center text-text">
          <h2 className="text-4xl font-bold mb-8">WebGazer Integration</h2>
          <p className="text-lg mb-12">
            Our platform uses WebGazer for real-time eye-tracking in your
            browser, ensuring your reading engagement and pace are accurately
            monitored. Experience a seamless calibration stage to tailor your
            reading sessions for maximum efficiency.
          </p>
        </div>
      </section>

      {/* Reading Modes */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center text-text">
          <h2 className="text-4xl font-bold mb-8">Reading Modes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Mode 1 */}
            <div className="bg-text text-background p-8 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold mb-2">
                Mode 1 - Standard Speed-Reading
              </h3>
              <p className="text-lg">
                Enjoy a fixed words-per-minute (WPM) rate that helps you get
                accustomed to the rhythm of speed reading. Ideal for beginners
                and those looking to build focus.
              </p>
            </div>
            {/* Mode 2 */}
            <div className="bg-text text-background p-8 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold mb-2">
                Mode 2 - Adaptive Speed-Reading
              </h3>
              <p className="text-lg mb-4">
                Utilizing real-time eye-tracking data, this mode dynamically
                adjusts the WPM based on your reading pace. A user-friendly
                control panel allows manual adjustments and provides valuable
                feedback.
              </p>
            </div>
            {/* Mode 3 */}
            <div className="bg-text text-background p-8 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out">
              <h3 className="text-2xl font-semibold mb-2">
                Mode 3 - Summarised Adaptive Speed-Reading 
                <span className="text-sm">(Non-fiction only)</span>
              </h3>
              <p className="text-lg ">
                In addition to adaptive speed adjustments, our advanced AI
                summarizes key sentences or paragraphs, streamlining information
                intake for a more efficient reading experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehension Assessment */}
      <section className="py-20 bg-sr-gradient">
        <div className="container mx-auto px-6 text-center text-white">
          <h2 className="text-4xl font-bold mb-8">Comprehension Assessment</h2>
          <p className="text-lg mb-12">
            After each reading session, test your understanding with engaging
            quizzes. Questions are generated via advanced AI or provided by our
            admins, ensuring high-quality content. Your performance is tracked
            and even gamified by assigning difficulty levels to each text.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Features;
