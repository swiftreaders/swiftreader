"use client";

import React from "react";

interface TeamMember {
  name: string;
}

const teamMembers: TeamMember[] = [
  { name: "Sriharsha" },
  { name: "Siddhant" },
  { name: "Hardiv" },
  { name: "Vivian" },
  { name: "Toan" },
  { name: "Kevin" },
];

const About: React.FC = () => {
  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">About SwiftReader</h1>
          <p className="mt-4 text-xl">
            Innovating the way we read faster and smarter.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
          <p className="text-center text-lg text-gray-700 mb-8">
            We are a group of 6 computing students from Imperial College, united by our passion for innovation and speed reading.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white p-6 rounded shadow text-center">
                {/* Placeholder for team member photo */}
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500">Photo</span>
                </div>
                <h3 className="text-2xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">Computing Student</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supervisor Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Our Supervisor</h2>
          <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
            {/* Placeholder for supervisor photo */}
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-500">Photo</span>
            </div>
            <h3 className="text-2xl font-semibold">Konstantinos</h3>
            <p className="text-gray-600">Supervisor</p>
          </div>
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

export default About;
