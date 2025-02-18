"use client";

import React from "react";

const Features: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">Our Innovative Features</h1>
          <p className="mt-4 text-xl">
            Experience the future of speed reading with advanced technology and adaptive modes.
          </p>
        </div>
      </section>

      {/* WebGazer Integration */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">WebGazer Integration</h2>
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
            Our platform uses WebGazer for real-time eye-tracking in your browser, ensuring your reading engagement and pace are accurately monitored.
            Experience a seamless calibration stage to tailor your reading sessions for maximum efficiency.
          </p>
        </div>
      </section>

      {/* Reading Modes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Reading Modes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Mode 1 */}
            <div className="bg-gray-100 p-6 rounded shadow">
              <h3 className="text-2xl font-semibold mb-2">Mode 1 - Standard Speed-Reading</h3>
              <p className="text-gray-700">
                Enjoy a fixed words-per-minute (WPM) rate that helps you get accustomed to the rhythm of speed reading.
                Ideal for beginners and those looking to build focus.
              </p>
            </div>
            {/* Mode 2 */}
            <div className="bg-gray-100 p-6 rounded shadow">
              <h3 className="text-2xl font-semibold mb-2">Mode 2 - Adaptive Speed-Reading</h3>
              <p className="text-gray-700 mb-4">
                Utilizing real-time eye-tracking data, this mode dynamically adjusts the WPM based on your reading pace.
                A user-friendly control panel allows manual adjustments and provides valuable feedback.
              </p>
            </div>
            {/* Mode 3 */}
            <div className="bg-gray-100 p-6 rounded shadow">
              <h3 className="text-2xl font-semibold mb-2">
                Mode 3 - Summarised Adaptive Speed-Reading <span className="text-sm">(Non-fiction only)</span>
              </h3>
              <p className="text-gray-700">
                In addition to adaptive speed adjustments, our advanced AI summarizes key sentences or paragraphs,
                streamlining information intake for a more efficient reading experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehension Assessment */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Comprehension Assessment</h2>
          <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
            After each reading session, test your understanding with engaging quizzes.
            Questions are generated via advanced AI or provided by our admins, ensuring high-quality content.
            Your performance is tracked and even gamified by assigning difficulty levels to each text.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-500">&copy; {new Date().getFullYear()} SwiftReader. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default Features;
