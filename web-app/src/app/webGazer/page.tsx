"use client";

import { useEffect } from "react";
import Script from "next/script";
import Image from "next/image";
import WebGazerClient from "./WebGazerClient"; // We'll keep a separate file
import Calibration from "./Calibration";

export default function Home() {
  useEffect(() => {
    // By now, the script has loaded with "beforeInteractive".
    const webgazer = (window as any).webgazer;
    if (!webgazer) {
      console.error("WebGazer is not defined on window.");
      return;
    }
    console.log("WebGazer found. Setting up...");

    // Example gaze callback
    function updateHighlight(data: { x: number; y: number } | null) {
      if (!data) return;
      console.log("Gaze data:", data);

      // Quarter-highlighting logic
      const screenWidth = window.innerWidth;
      const quarterWidth = screenWidth / 4;
      let activeQuarter = 0;
      if (data.x < quarterWidth) activeQuarter = 1;
      else if (data.x < quarterWidth * 2) activeQuarter = 2;
      else if (data.x < quarterWidth * 3) activeQuarter = 3;
      else activeQuarter = 4;

      for (let i = 1; i <= 4; i++) {
        const quarter = document.getElementById(`quarter-${i}`);
        if (quarter) {
          quarter.style.opacity = i === activeQuarter ? "0.5" : "0";
        }
      }

      // Move our custom highlight dot
      const highlight = document.getElementById("highlight");
      if (highlight) {
        highlight.style.left = `${data.x}px`;
        highlight.style.top  = `${data.y}px`;
      }
    }

    // Begin the WebGazer pipeline & set the listener
    webgazer
      .setGazeListener(updateHighlight)
      .begin()
      .then(() => console.log("WebGazer has started successfully!"))
      .catch((err: any) => console.error("WebGazer failed to start:", err));

    // Cleanup on unmount
    return () => {
      webgazer.clearGazeListener();
      console.log("WebGazer listener cleared.");
    };
  }, []);

  return (
    <>
      {/* Load WebGazer before everything else */}
      <Script
        src="https://webgazer.cs.brown.edu/webgazer.js"
        strategy="beforeInteractive" // ensures script is loaded early
        onLoad={() => console.log("WebGazer script loaded (beforeInteractive)!")}
        onError={() => console.error("Failed to load WebGazer script.")}
      />

      {/* Main UI */}
      <div className="relative min-h-screen">
        {/* Our own highlight dot (second red dot, distinct from the built-in one) */}
        <div
          id="highlight"
          style={{
            position: "absolute",
            width: "20px",
            height: "20px",
            background: "red",
            borderRadius: "50%",
            pointerEvents: "none",
            top: 0,
            left: 0,
            transform: "translate(-50%, -50%)",
            transition: "top 0.1s ease, left 0.1s ease",
            zIndex: 1000,
          }}
        />

        {/* The four quarters */}
        <div
          id="quarter-1"
          className="absolute top-0 left-0 h-full w-1/4 bg-green-500 opacity-0 pointer-events-none"
        />
        <div
          id="quarter-2"
          className="absolute top-0 left-1/4 h-full w-1/4 bg-green-500 opacity-0 pointer-events-none"
        />
        <div
          id="quarter-3"
          className="absolute top-0 left-1/2 h-full w-1/4 bg-green-500 opacity-0 pointer-events-none"
        />
        <div
          id="quarter-4"
          className="absolute top-0 left-3/4 h-full w-1/4 bg-green-500 opacity-0 pointer-events-none"
        />

        {/* Our separate client file where we can configure WebGazer params */}
        <WebGazerClient />

        <main>
          <Image src="/next.svg" alt="Next.js logo" width={180} height={38} />
          <p>Hi from page.tsx</p>
        </main>

        {/* Optional calibration */}
        <Calibration />
      </div>
    </>
  );
}
