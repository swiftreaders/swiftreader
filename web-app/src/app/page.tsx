"use client"; // If you want to keep it super-simple

import Image from "next/image";
import WebGazerClient from "./WebGazerClient";
import Calibration from "./Calibration";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* The green highlight circle */}
      <div
        id="highlight"
        className="absolute w-10 h-10 rounded-full pointer-events-none bg-green-500 opacity-50"
      />

      {/* Load/Initialize WebGazer */}
      <WebGazerClient />

      <main>
        <Image src="/next.svg" alt="Next.js logo" width={180} height={38} />
        <p>Hi from page.tsx</p>
      </main>

      {/* Show Calibration UI */}
      <Calibration />
    </div>
  );
}
