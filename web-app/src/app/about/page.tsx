"use client";

import Footer from "@/components/Footer";
import Image from "next/image";
import React from "react";

interface TeamMember {
  name: string;
  course: string;
  imageUrl: string;
}

const teamMembers: TeamMember[] = [
  { name: "Sriharsha", course: "Joint Maths and Computing", imageUrl: "/team/sri.jpeg" },
  { name: "Siddhant", course: "Joint Maths and Computing", imageUrl: "/team/sid.jpeg" },
  { name: "Hardiv", course: "Computing", imageUrl: "/team/hardiv.jpeg" },
  { name: "Vivian", course: "Computing", imageUrl: "/team/vivian.jpeg" },
  { name: "Toan", course: "Joint Maths and Computing", imageUrl: "/team/toan.jpeg" },
  { name: "Kevin", course: "Computing", imageUrl: "/team/kevin.jpeg" },
];

const About: React.FC = () => {
  return (
    <main className="h-sr-screen mt-[7vh] bg-sr-gradient">
      {/* Hero Section */}
      <section className="text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold leading-tight">About SwiftReader</h1>
          <p className="mt-4 text-lg sm:text-xl max-w-3xl mx-auto">
            Innovating the way we read faster and smarter. Join us in changing the way you consume information!
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 text-center text-text">
          <h2 className="text-4xl font-bold mb-8">Our Team</h2>
          <p className="text-lg mb-12">
            We are a group of 6 computing students from Imperial College, united by our passion for innovation and speed reading.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-text text-background p-8 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-semibold">{member.name}</h3>
                <p className="text-lg">{member.course}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supervisor Section */}
      <section className="py-20 bg-sr-gradient">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">Our Supervisor</h2>
          <div className="max-w-xs mx-auto bg-white p-8 rounded-lg shadow-xl">
            <div className="w-32 h-32 rounded-full mx-auto mb-6 overflow-hidden">
              <Image
                src="/team/konstantinos.jpeg"
                alt="Konstantinos"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900">Konstantinos</h3>
            <p className="text-lg text-gray-600">Supervisor</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default About;
